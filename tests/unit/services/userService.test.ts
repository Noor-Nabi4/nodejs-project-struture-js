import * as userService from "../../../src/services/userService.js";
import ErrorHandler from "../../../src/utils/errorHandler.js";
import { HTTP_STATUS } from "../../../src/config/constants.js";
import { createUserInDb } from "../../helpers/factories/user.factory.js";

describe("userService", () => {
  describe("getById", () => {
    it("returns user when found", async () => {
      const user = await createUserInDb();
      const found = await userService.getById(user.id);
      expect(found.id).toBe(user.id);
    });

    it("throws 404 when user does not exist", async () => {
      await expect(
        userService.getById("507f1f77bcf86cd799439011")
      ).rejects.toMatchObject({
        statusCode: HTTP_STATUS.NOT_FOUND,
        message: "User not found",
      });
    });
  });

  describe("updateProfile", () => {
    it("updates only allowed profile fields", async () => {
      const user = await createUserInDb({
        firstName: "Original",
        email: `original_${Date.now()}@example.com`,
      });

      const updated = await userService.updateProfile(user.id, {
        firstName: "Updated",
        phoneNumber: "9999999999",
      });

      expect(updated.firstName).toBe("Updated");
      expect(updated.phoneNumber).toBe("9999999999");
    });

    it("ignores disallowed fields in payload", async () => {
      const user = await createUserInDb();

      const updated = await userService.updateProfile(user.id, {
        firstName: "SafeUpdate",
        role: "ADMIN" as never,
      });

      expect(updated.firstName).toBe("SafeUpdate");
      expect(updated.role).toBe(user.role);
    });

    it("throws 404 when user does not exist", async () => {
      await expect(
        userService.updateProfile("507f1f77bcf86cd799439011", {
          firstName: "Ghost",
        })
      ).rejects.toBeInstanceOf(ErrorHandler);
    });

    it("handles empty filter object when no allowed keys provided", async () => {
      const user = await createUserInDb();
      const updated = await userService.updateProfile(user.id, {});
      expect(updated.id).toBe(user.id);
    });
  });
});
