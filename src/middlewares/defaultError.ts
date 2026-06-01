import type { NextFunction, Request, Response } from "express";
import ErrorHandler from "../utils/errorHandler.js";
import logger from "../utils/logger.js";
import { HTTP_STATUS } from "../config/constants.js";
import type {
  MongoDuplicateKeyError,
  MongooseCastError,
  MongooseValidationError,
} from "../types/errors.types.js";

interface AppError extends Error {
  statusCode?: number;
  errors?: ErrorHandler["errors"] | Record<string, string>;
  code?: number;
  keyValue?: Record<string, unknown>;
  path?: string;
}

const defaultError = (
  err: AppError,
  _req: Request,
  res: Response,
  _next: NextFunction
): Response | void => {
  let error: AppError = { ...err };
  error.statusCode = error.statusCode || HTTP_STATUS.INTERNAL_SERVER_ERROR;
  error.message = error.message || "Internal Server Error";

  if (error.name === "CastError") {
    const castErr = error as MongooseCastError;
    error = new ErrorHandler(
      `Resource not found. Invalid: ${castErr.path}`,
      HTTP_STATUS.NOT_FOUND
    );
  }

  if (error.code === 11000) {
    const dupErr = error as MongoDuplicateKeyError;
    const field = Object.keys(dupErr.keyValue || {})[0] || "field";
    error = new ErrorHandler(`${field} already exists.`, HTTP_STATUS.CONFLICT);
  }

  if (error.name === "JSONWebTokenError") {
    error = new ErrorHandler(
      "Invalid token. Please sign in again.",
      HTTP_STATUS.UNAUTHORIZED
    );
  }

  if (error.name === "TokenExpiredError") {
    error = new ErrorHandler(
      "Token has expired. Please sign in again.",
      HTTP_STATUS.UNAUTHORIZED
    );
  }

  if (error.message === "Not allowed by CORS") {
    error.statusCode = HTTP_STATUS.FORBIDDEN;
  }

  if (
    error.name === "ValidationError" &&
    error.errors &&
    !Array.isArray(error.errors)
  ) {
    const validationErr = error as unknown as MongooseValidationError;
    const messages: Record<string, string> = {};
    for (const key in validationErr.errors) {
      messages[key] = validationErr.errors[key].message;
    }
    return res.status(HTTP_STATUS.BAD_REQUEST).json({
      success: false,
      message: "Validation failed.",
      errors: messages,
    });
  }

  if ((error.statusCode ?? 0) >= 500) {
    logger.error(error.message, error.stack);
  }

  const body: {
    success: false;
    message: string;
    errors?: ErrorHandler["errors"] | Record<string, string>;
  } = { success: false, message: error.message };
  if (error.errors) body.errors = error.errors;
  return res.status(error.statusCode ?? HTTP_STATUS.INTERNAL_SERVER_ERROR).json(body);
};

export default defaultError;
