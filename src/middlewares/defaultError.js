import ErrorHandler from "../utils/errorHandler.js";
import logger from "../utils/logger.js";
import { HTTP_STATUS } from "../config/constants.js";

export default (err, req, res, next) => {
  err.statusCode = err.statusCode || HTTP_STATUS.INTERNAL_SERVER_ERROR;
  err.message = err.message || "Internal Server Error";

  if (err.name === "CastError") {
    err = new ErrorHandler(
      `Resource not found. Invalid: ${err.path}`,
      HTTP_STATUS.NOT_FOUND
    );
  }

  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0] || "field";
    err = new ErrorHandler(`${field} already exists.`, HTTP_STATUS.CONFLICT);
  }

  if (err.name === "JSONWebTokenError") {
    err = new ErrorHandler(
      "Invalid token. Please sign in again.",
      HTTP_STATUS.UNAUTHORIZED
    );
  }

  if (err.name === "TokenExpiredError") {
    err = new ErrorHandler(
      "Token has expired. Please sign in again.",
      HTTP_STATUS.UNAUTHORIZED
    );
  }

  if (err.message === "Not allowed by CORS") {
    err.statusCode = HTTP_STATUS.FORBIDDEN;
  }

  if (
    err.name === "ValidationError" &&
    err.errors &&
    !Array.isArray(err.errors)
  ) {
    const messages = {};
    for (const key in err.errors) {
      messages[key] = err.errors[key].message;
    }
    return res.status(HTTP_STATUS.BAD_REQUEST).json({
      success: false,
      message: "Validation failed.",
      errors: messages,
    });
  }

  if (err.statusCode >= 500) {
    logger.error(err.message, err.stack);
  }

  const body = { success: false, message: err.message };
  if (err.errors) body.errors = err.errors;
  res.status(err.statusCode).json(body);
};
