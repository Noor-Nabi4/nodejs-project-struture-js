import crypto from "crypto";
import * as authService from "../../../src/services/authService.js";
import ErrorHandler from "../../../src/utils/errorHandler.js";
import { HTTP_STATUS } from "../../../src/config/constants.js";
import { hashResetToken } from "../../../src/utils/token.js";
import {
  buildSignupPayload,
  createUserInDb,
} from "../../helpers/factories/user.factory.js";

describe("authService", () => {
  describe("hashResetToken", () => {
    it("returns a 64-character hex string", () => {
      const hashed = hashResetToken("abc123");
      expect(hashed).toMatch(/^[a-f0-9]{64}$/);
    });
  });

  describe("createUser", () => {
    it("creates a user with hashed password", async () => {
      const payload = buildSignupPayload();
      const user = await authService.createUser(payload);

      expect(user.email).toBe(payload.email);
      expect(user.password).not.toBe(payload.password);
    });
  });

  describe("validateCredentials", () => {
    it("returns user for valid email and password", async () => {
      const payload = buildSignupPayload();
      await authService.createUser(payload);

      const user = await authService.validateCredentials(
        payload.email,
        payload.password
      );

      expect(user.email).toBe(payload.email);
    });

    it("returns user when signing in with username", async () => {
      const payload = buildSignupPayload();
      await authService.createUser(payload);

      const user = await authService.validateCredentials(
        payload.username,
        payload.password
      );

      expect(user.username).toBe(payload.username);
    });

    it("throws 401 for invalid credentials", async () => {
      const payload = buildSignupPayload();
      await authService.createUser(payload);

      await expect(
        authService.validateCredentials(payload.email, "wrong-password")
      ).rejects.toMatchObject({
        statusCode: HTTP_STATUS.UNAUTHORIZED,
        message: "Invalid credentials",
      });
    });

    it("throws 401 when user does not exist", async () => {
      await expect(
        authService.validateCredentials("missing@example.com", "password123")
      ).rejects.toBeInstanceOf(ErrorHandler);
    });
  });

  describe("findUserByResetToken", () => {
    it("returns user when token is valid and not expired", async () => {
      const user = await createUserInDb();
      const rawToken = user.setResetPasswordToken();
      await user.save({ validateBeforeSave: false });

      const found = await authService.findUserByResetToken(
        hashResetToken(rawToken)
      );

      expect(found?.id).toBe(user.id);
    });

    it("returns null for expired reset token", async () => {
      const user = await createUserInDb();
      const rawToken = crypto.randomBytes(20).toString("hex");
      user.resetPasswordToken = crypto
        .createHash("sha256")
        .update(rawToken)
        .digest("hex");
      user.resetPasswordExpire = new Date(Date.now() - 1000);
      await user.save({ validateBeforeSave: false });

      const found = await authService.findUserByResetToken(
        hashResetToken(rawToken)
      );

      expect(found).toBeNull();
    });
  });

  describe("changePasswordForUser", () => {
    it("updates password when old password matches", async () => {
      const payload = buildSignupPayload();
      const user = await authService.createUser(payload);

      await authService.changePasswordForUser(
        user.id,
        payload.password,
        "newpassword123"
      );

      const updated = await authService.validateCredentials(
        payload.email,
        "newpassword123"
      );
      expect(updated.id).toBe(user.id);
    });

    it("throws 400 when old password is incorrect", async () => {
      const user = await createUserInDb();

      await expect(
        authService.changePasswordForUser(user.id, "wrong", "newpassword123")
      ).rejects.toMatchObject({
        statusCode: HTTP_STATUS.BAD_REQUEST,
        message: "Incorrect current password",
      });
    });
  });

  describe("clearResetToken", () => {
    it("clears reset token fields", async () => {
      const user = await createUserInDb();
      user.setResetPasswordToken();
      await user.save({ validateBeforeSave: false });

      await authService.clearResetToken(user);

      expect(user.resetPasswordToken).toBeUndefined();
      expect(user.resetPasswordExpire).toBeUndefined();
    });
  });
});
