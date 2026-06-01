import { jest } from "@jest/globals";
import type { NextFunction, Request, Response } from "express";
import {
  authorizeRole,
  isAuthenticatedUser,
} from "../../../src/middlewares/auth.js";
import ErrorHandler from "../../../src/utils/errorHandler.js";
import {
  HTTP_STATUS,
  USER_ROLES,
  COOKIE_NAMES,
} from "../../../src/config/constants.js";
import { createUserInDb } from "../../helpers/factories/user.factory.js";

const mockRes = {} as Response;
const runMiddleware = async (
  handler: (req: Request, res: Response, next: NextFunction) => unknown,
  req: Request
): Promise<{ error?: unknown }> => {
  return new Promise((resolve) => {
    const next: NextFunction = (err?: unknown) => resolve({ error: err });
    void Promise.resolve(handler(req, mockRes, next)).catch((err) =>
      resolve({ error: err })
    );
  });
};

describe("auth middleware", () => {
  describe("isAuthenticatedUser", () => {
    it("returns 401 when no token cookie is present", async () => {
      const { error } = await runMiddleware(isAuthenticatedUser, {
        cookies: {},
      } as Request);

      expect(error).toBeInstanceOf(ErrorHandler);
      expect((error as ErrorHandler).statusCode).toBe(HTTP_STATUS.UNAUTHORIZED);
    });

    it("rejects invalid token via JWT error", async () => {
      const { error } = await runMiddleware(isAuthenticatedUser, {
        cookies: { [COOKIE_NAMES.AUTH_TOKEN]: "not.a.valid.jwt" },
      } as Request);

      expect(error).toBeDefined();
      expect((error as Error).name).toBe("JsonWebTokenError");
    });

    it("attaches user and calls next for valid token", async () => {
      const user = await createUserInDb();
      const token = user.getJWTToken();
      const req = {
        cookies: { [COOKIE_NAMES.AUTH_TOKEN]: token },
      } as Request;

      const { error } = await runMiddleware(isAuthenticatedUser, req);

      expect(error).toBeUndefined();
      expect(req.user?.id).toBe(user.id);
    });
  });

  describe("authorizeRole", () => {
    it("returns 403 when user role is not allowed", async () => {
      const user = await createUserInDb({ role: USER_ROLES.USER });
      const middleware = authorizeRole(USER_ROLES.ADMIN);
      const req = { user } as Request;

      const { error } = await runMiddleware(middleware, req);

      expect(error).toBeInstanceOf(ErrorHandler);
      expect((error as ErrorHandler).statusCode).toBe(HTTP_STATUS.FORBIDDEN);
    });

    it("calls next when user has allowed role", async () => {
      const user = await createUserInDb({ role: USER_ROLES.ADMIN });
      const middleware = authorizeRole(USER_ROLES.ADMIN);
      const req = { user } as Request;

      const { error } = await runMiddleware(middleware, req);

      expect(error).toBeUndefined();
    });

    it("returns 403 when user is missing on request", async () => {
      const middleware = authorizeRole(USER_ROLES.ADMIN);
      const { error } = await runMiddleware(middleware, {} as Request);

      expect(error).toBeInstanceOf(ErrorHandler);
      expect((error as ErrorHandler).statusCode).toBe(HTTP_STATUS.FORBIDDEN);
    });
  });
});
