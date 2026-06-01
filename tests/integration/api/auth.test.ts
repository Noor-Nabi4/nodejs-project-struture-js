import request from "supertest";
import crypto from "crypto";
import { getTestApp } from "../../helpers/app.js";
import {
  API_PREFIX,
  createAgent,
  expiredAuthCookieForUser,
  invalidAuthCookie,
  signinUser,
  signupAndSignin,
  signupUser,
} from "../../helpers/auth.js";
import {
  expectErrorResponse,
  expectSuccessResponse,
  expectValidationErrors,
} from "../../helpers/assertions.js";
import { HTTP_STATUS } from "../../../src/config/constants.js";
import { hashResetToken } from "../../../src/utils/token.js";
import { createUserInDb } from "../../helpers/factories/user.factory.js";

describe("Auth API", () => {
  describe("POST /auth/signup", () => {
    it("creates user with 201 and standard response", async () => {
      const app = await getTestApp();
      const { response, payload } = await signupUser(createAgent(app));

      expect(response.status).toBe(HTTP_STATUS.CREATED);
      expectSuccessResponse(response.body, { hasData: true });
      expect(response.body.data.email).toBe(payload.email);
    });

    it("returns 400 for invalid payload", async () => {
      const app = await getTestApp();
      const res = await request(app)
        .post(`${API_PREFIX}/auth/signup`)
        .send({ email: "bad-email" });

      expect(res.status).toBe(HTTP_STATUS.BAD_REQUEST);
      expectValidationErrors(res.body);
    });

    it("returns 409 when email already exists", async () => {
      const app = await getTestApp();
      const agent = createAgent(app);
      const { payload } = await signupUser(agent);

      const duplicate = await agent.post(`${API_PREFIX}/auth/signup`).send({
        ...payload,
        username: `dup_${Date.now()}`,
      });

      expect(duplicate.status).toBe(HTTP_STATUS.CONFLICT);
      expectErrorResponse(duplicate.body);
    });
  });

  describe("POST /auth/signin", () => {
    it("signs in with 200, sets auth cookie, returns user and token", async () => {
      const app = await getTestApp();
      const { agent, payload, signinRes } = await signupAndSignin(app);

      expect(signinRes.status).toBe(HTTP_STATUS.OK);
      expectSuccessResponse(signinRes.body, { hasData: true });
      expect(signinRes.body.data.token).toBeDefined();
      expect(signinRes.headers["set-cookie"]?.join("")).toContain("authToken=");
      expect(agent).toBeDefined();
      expect(payload.email).toBeDefined();
    });

    it("returns 401 for invalid credentials", async () => {
      const app = await getTestApp();
      const { payload } = await signupUser(createAgent(app));

      const res = await request(app)
        .post(`${API_PREFIX}/auth/signin`)
        .send({ email: payload.email, password: "wrong-password" });

      expect(res.status).toBe(HTTP_STATUS.UNAUTHORIZED);
      expectErrorResponse(res.body, "Invalid credentials");
    });

    it("returns 400 for missing password", async () => {
      const app = await getTestApp();
      const res = await request(app)
        .post(`${API_PREFIX}/auth/signin`)
        .send({ email: "someone@example.com" });

      expect(res.status).toBe(HTTP_STATUS.BAD_REQUEST);
      expectValidationErrors(res.body);
    });
  });

  describe("GET /auth/signout", () => {
    it("returns 200 and clears auth cookie", async () => {
      const app = await getTestApp();
      const { agent } = await signupAndSignin(app);

      const res = await agent.get(`${API_PREFIX}/auth/signout`);

      expect(res.status).toBe(HTTP_STATUS.OK);
      expectSuccessResponse(res.body);
      expect(res.headers["set-cookie"]?.join("")).toMatch(/authToken=;/);
    });
  });

  describe("GET /auth/me", () => {
    it("returns 401 without token", async () => {
      const app = await getTestApp();
      const res = await request(app).get(`${API_PREFIX}/auth/me`);

      expect(res.status).toBe(HTTP_STATUS.UNAUTHORIZED);
      expectErrorResponse(res.body);
    });

    it("returns 401 with invalid token", async () => {
      const app = await getTestApp();
      const res = await request(app)
        .get(`${API_PREFIX}/auth/me`)
        .set("Cookie", invalidAuthCookie());

      expect(res.status).toBe(HTTP_STATUS.UNAUTHORIZED);
      expectErrorResponse(res.body);
    });

    it("returns 401 with expired token", async () => {
      const app = await getTestApp();
      const user = await createUserInDb();
      const res = await request(app)
        .get(`${API_PREFIX}/auth/me`)
        .set("Cookie", expiredAuthCookieForUser(user));

      expect(res.status).toBe(HTTP_STATUS.UNAUTHORIZED);
      expectErrorResponse(res.body);
    });

    it("returns 200 with current user when authenticated", async () => {
      const app = await getTestApp();
      const { agent, payload } = await signupAndSignin(app);

      const res = await agent.get(`${API_PREFIX}/auth/me`);

      expect(res.status).toBe(HTTP_STATUS.OK);
      expectSuccessResponse(res.body, { hasData: true });
      expect(res.body.data.email).toBe(payload.email);
    });
  });

  describe("POST /auth/password/forgot", () => {
    it("returns 200 even when email is unknown", async () => {
      const app = await getTestApp();
      const res = await request(app)
        .post(`${API_PREFIX}/auth/password/forgot`)
        .send({ email: "unknown@example.com" });

      expect(res.status).toBe(HTTP_STATUS.OK);
      expectSuccessResponse(res.body);
    });

    it("returns 200 when email exists (SMTP optional in test)", async () => {
      const app = await getTestApp();
      const user = await createUserInDb();

      const res = await request(app)
        .post(`${API_PREFIX}/auth/password/forgot`)
        .send({ email: user.email });

      expect(res.status).toBe(HTTP_STATUS.OK);
      expectSuccessResponse(res.body);
    });

    it("returns 400 for invalid email", async () => {
      const app = await getTestApp();
      const res = await request(app)
        .post(`${API_PREFIX}/auth/password/forgot`)
        .send({ email: "not-valid" });

      expect(res.status).toBe(HTTP_STATUS.BAD_REQUEST);
      expectValidationErrors(res.body);
    });
  });

  describe("PUT /auth/password/reset/:token", () => {
    it("resets password with valid token", async () => {
      const app = await getTestApp();
      const user = await createUserInDb();
      const rawToken = user.setResetPasswordToken();
      await user.save({ validateBeforeSave: false });

      const res = await request(app)
        .put(`${API_PREFIX}/auth/password/reset/${rawToken}`)
        .send({ password: "newpass123", confirmPassword: "newpass123" });

      expect(res.status).toBe(HTTP_STATUS.OK);
      expectSuccessResponse(res.body);

      const signinRes = await signinUser(createAgent(app), {
        email: user.email,
        password: "newpass123",
      });
      expect(signinRes.status).toBe(HTTP_STATUS.OK);
    });

    it("returns 400 for invalid or expired token", async () => {
      const app = await getTestApp();
      const res = await request(app)
        .put(`${API_PREFIX}/auth/password/reset/not-a-real-token`)
        .send({ password: "newpass123", confirmPassword: "newpass123" });

      expect(res.status).toBe(HTTP_STATUS.BAD_REQUEST);
      expectErrorResponse(res.body, "Reset token is invalid or has expired");
    });

    it("returns 400 when passwords do not match", async () => {
      const app = await getTestApp();
      const user = await createUserInDb();
      const rawToken = user.setResetPasswordToken();
      await user.save({ validateBeforeSave: false });

      const res = await request(app)
        .put(`${API_PREFIX}/auth/password/reset/${rawToken}`)
        .send({ password: "newpass123", confirmPassword: "different" });

      expect(res.status).toBe(HTTP_STATUS.BAD_REQUEST);
      expectValidationErrors(res.body);
    });

    it("returns 400 for expired stored token", async () => {
      const app = await getTestApp();
      const user = await createUserInDb();
      const rawToken = crypto.randomBytes(20).toString("hex");
      user.resetPasswordToken = hashResetToken(rawToken);
      user.resetPasswordExpire = new Date(Date.now() - 1000);
      await user.save({ validateBeforeSave: false });

      const res = await request(app)
        .put(`${API_PREFIX}/auth/password/reset/${rawToken}`)
        .send({ password: "newpass123", confirmPassword: "newpass123" });

      expect(res.status).toBe(HTTP_STATUS.BAD_REQUEST);
      expectErrorResponse(res.body);
    });
  });

  describe("PATCH /auth/password/change", () => {
    it("returns 401 without authentication", async () => {
      const app = await getTestApp();
      const res = await request(app)
        .patch(`${API_PREFIX}/auth/password/change`)
        .send({ oldPassword: "password123", password: "newpass123" });

      expect(res.status).toBe(HTTP_STATUS.UNAUTHORIZED);
    });

    it("changes password when authenticated", async () => {
      const app = await getTestApp();
      const { agent, payload } = await signupAndSignin(app);

      const res = await agent.patch(`${API_PREFIX}/auth/password/change`).send({
        oldPassword: payload.password,
        password: "changedpass123",
      });

      expect(res.status).toBe(HTTP_STATUS.OK);
      expectSuccessResponse(res.body);

      const signinRes = await signinUser(createAgent(app), {
        email: payload.email,
        password: "changedpass123",
      });
      expect(signinRes.status).toBe(HTTP_STATUS.OK);
    });

    it("returns 400 for wrong current password", async () => {
      const app = await getTestApp();
      const { agent } = await signupAndSignin(app);

      const res = await agent
        .patch(`${API_PREFIX}/auth/password/change`)
        .send({ oldPassword: "wrong", password: "newpass123" });

      expect(res.status).toBe(HTTP_STATUS.BAD_REQUEST);
      expectErrorResponse(res.body, "Incorrect current password");
    });
  });

  describe("unknown route", () => {
    it("returns 404 for non-existent API path", async () => {
      const app = await getTestApp();
      const res = await request(app).get(`${API_PREFIX}/does-not-exist`);

      expect(res.status).toBe(HTTP_STATUS.NOT_FOUND);
      expectErrorResponse(res.body, "Route not found");
    });
  });
});
