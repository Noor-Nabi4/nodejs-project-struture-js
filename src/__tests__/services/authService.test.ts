/**
 * Auth service unit tests.
 * For full integration tests with DB, use supertest against the API.
 */
import { hashResetToken } from "../../utils/token.js";

describe("authService dependencies", () => {
  describe("hashResetToken", () => {
    it("returns a 64-character hex string", () => {
      const token = "abc123";
      const hashed = hashResetToken(token);
      expect(hashed).toMatch(/^[a-f0-9]{64}$/);
    });

    it("returns same hash for same input", () => {
      const token = "same";
      expect(hashResetToken(token)).toBe(hashResetToken(token));
    });

    it("returns different hash for different input", () => {
      expect(hashResetToken("a")).not.toBe(hashResetToken("b"));
    });
  });
});
