import type { NextFunction, Request, Response, RequestHandler } from "express";
import jwt from "jsonwebtoken";
import User from "../models/userModel.js";
import ErrorHandler from "../utils/errorHandler.js";
import catchAsyncErrors from "./catchAsyncErrors.js";
import config from "../config/index.js";
import { COOKIE_NAMES, HTTP_STATUS } from "../config/constants.js";
import type { UserRole } from "../config/constants.js";

interface JwtPayload {
  id: string;
}

export const isAuthenticatedUser = catchAsyncErrors(
  async (req: Request, _res: Response, next: NextFunction) => {
    const authToken = req.cookies[COOKIE_NAMES.AUTH_TOKEN] as string | undefined;
    if (!authToken) {
      return next(
        new ErrorHandler(
          "Please sign in to access this resource.",
          HTTP_STATUS.UNAUTHORIZED
        )
      );
    }

    if (!config.jwt.secret) {
      return next(
        new ErrorHandler(
          "Authentication is not configured.",
          HTTP_STATUS.INTERNAL_SERVER_ERROR
        )
      );
    }

    const decoded = jwt.verify(authToken, config.jwt.secret) as JwtPayload;
    const user = await User.findById(decoded.id);
    if (!user) {
      return next(
        new ErrorHandler(
          "Please sign in to access this resource.",
          HTTP_STATUS.UNAUTHORIZED
        )
      );
    }
    req.user = user;
    next();
  }
);

export const authorizeRole =
  (...roles: UserRole[]): RequestHandler =>
  (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return next(
        new ErrorHandler(
          "You do not have permission to access this resource.",
          HTTP_STATUS.FORBIDDEN
        )
      );
    }
    next();
  };
