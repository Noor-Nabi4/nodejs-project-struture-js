import {
  signupSchema,
  signinSchema,
  forgotPasswordSchema,
  resetPasswordBodySchema,
  changePasswordSchema,
} from "../../../src/validations/auth.validation.js";

describe("auth.validation", () => {
  describe("signupSchema", () => {
    it("parses valid signup payload", () => {
      const result = signupSchema.safeParse({
        firstName: "Jane",
        lastName: "Doe",
        username: "janedoe",
        email: "jane@example.com",
        phoneNumber: "1234567890",
        password: "secret12",
      });
      expect(result.success).toBe(true);
    });

    it("rejects missing required fields", () => {
      const result = signupSchema.safeParse({ email: "jane@example.com" });
      expect(result.success).toBe(false);
    });

    it("rejects short password", () => {
      const result = signupSchema.safeParse({
        firstName: "Jane",
        lastName: "Doe",
        username: "janedoe",
        email: "jane@example.com",
        phoneNumber: "1234567890",
        password: "123",
      });
      expect(result.success).toBe(false);
    });
  });

  describe("signinSchema", () => {
    it("accepts email or username in email field", () => {
      const result = signinSchema.safeParse({
        email: "janedoe",
        password: "secret12",
      });
      expect(result.success).toBe(true);
    });
  });

  describe("forgotPasswordSchema", () => {
    it("rejects invalid email", () => {
      const result = forgotPasswordSchema.safeParse({ email: "not-an-email" });
      expect(result.success).toBe(false);
    });
  });

  describe("resetPasswordBodySchema", () => {
    it("rejects mismatched passwords", () => {
      const result = resetPasswordBodySchema.safeParse({
        password: "secret12",
        confirmPassword: "different",
      });
      expect(result.success).toBe(false);
    });
  });

  describe("changePasswordSchema", () => {
    it("requires old and new password", () => {
      const result = changePasswordSchema.safeParse({ oldPassword: "old123" });
      expect(result.success).toBe(false);
    });
  });
});
