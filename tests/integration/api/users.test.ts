import request from "supertest";
import { getTestApp } from "../../helpers/app.js";
import {
  API_PREFIX,
  expiredAuthCookieForUser,
  invalidAuthCookie,
  signupAndSignin,
} from "../../helpers/auth.js";
import {
  expectErrorResponse,
  expectSuccessResponse,
  expectValidationErrors,
} from "../../helpers/assertions.js";
import { HTTP_STATUS } from "../../../src/config/constants.js";
import { createUserInDb } from "../../helpers/factories/user.factory.js";

describe("Users API", () => {
  describe("GET /users/profile", () => {
    it("returns 401 without token", async () => {
      const app = await getTestApp();
      const res = await request(app).get(`${API_PREFIX}/users/profile`);

      expect(res.status).toBe(HTTP_STATUS.UNAUTHORIZED);
      expectErrorResponse(res.body);
    });

    it("returns 401 with invalid token", async () => {
      const app = await getTestApp();
      const res = await request(app)
        .get(`${API_PREFIX}/users/profile`)
        .set("Cookie", invalidAuthCookie());

      expect(res.status).toBe(HTTP_STATUS.UNAUTHORIZED);
    });

    it("returns 401 with expired token", async () => {
      const app = await getTestApp();
      const user = await createUserInDb();
      const res = await request(app)
        .get(`${API_PREFIX}/users/profile`)
        .set("Cookie", expiredAuthCookieForUser(user));

      expect(res.status).toBe(HTTP_STATUS.UNAUTHORIZED);
    });

    it("returns 200 with profile for authenticated user", async () => {
      const app = await getTestApp();
      const { agent, payload } = await signupAndSignin(app);

      const res = await agent.get(`${API_PREFIX}/users/profile`);

      expect(res.status).toBe(HTTP_STATUS.OK);
      expectSuccessResponse(res.body, { hasData: true });
      expect(res.body.data.email).toBe(payload.email);
    });
  });

  describe("PUT /users/profile", () => {
    it("returns 401 without token", async () => {
      const app = await getTestApp();
      const res = await request(app)
        .put(`${API_PREFIX}/users/profile`)
        .send({ firstName: "Updated" });

      expect(res.status).toBe(HTTP_STATUS.UNAUTHORIZED);
    });

    it("updates profile with 200 for authenticated user", async () => {
      const app = await getTestApp();
      const { agent } = await signupAndSignin(app);

      const res = await agent
        .put(`${API_PREFIX}/users/profile`)
        .send({ firstName: "UpdatedName", phoneNumber: "5555555555" });

      expect(res.status).toBe(HTTP_STATUS.OK);
      expectSuccessResponse(res.body, { hasData: true });
      expect(res.body.data.firstName).toBe("UpdatedName");
      expect(res.body.data.phoneNumber).toBe("5555555555");
    });

    it("returns 400 when no profile fields are provided", async () => {
      const app = await getTestApp();
      const { agent } = await signupAndSignin(app);

      const res = await agent.put(`${API_PREFIX}/users/profile`).send({});

      expect(res.status).toBe(HTTP_STATUS.BAD_REQUEST);
      expectValidationErrors(res.body);
    });

    it("returns 400 for invalid email format", async () => {
      const app = await getTestApp();
      const { agent } = await signupAndSignin(app);

      const res = await agent
        .put(`${API_PREFIX}/users/profile`)
        .send({ email: "not-an-email" });

      expect(res.status).toBe(HTTP_STATUS.BAD_REQUEST);
      expectValidationErrors(res.body);
    });
  });
});
