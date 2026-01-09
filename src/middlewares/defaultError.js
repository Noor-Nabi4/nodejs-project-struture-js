import ErrorHandler from "../utils/errorHandler.js";
import { env } from "../config/env.js";

export default (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.message = err.message || "Internal Server Error";

  // Prisma errors
  if (err.code === "P2002") {
    // Unique constraint violation
    const field = err.meta?.target?.[0] || "field";
    const message = `${field} already exists. Please use a different value.`;
    err = new ErrorHandler(message, 409);
  }

  if (err.code === "P2025") {
    // Record not found
    const message = "Resource not found";
    err = new ErrorHandler(message, 404);
  }

  // Prisma validation errors
  if (err.name === "PrismaClientValidationError") {
    const message = "Invalid data provided. Please check your input.";
    err = new ErrorHandler(message, 400);
  }

  // Wrong JWT Token error
  if (err.name === "JSONWebTokenError") {
    const message = "JSON Web Token is invalid. Please login again.";
    err = new ErrorHandler(message, 401);
  }

  // JWT Expire error
  if (err.name === "TokenExpiredError") {
    const message = "JSON Web Token has expired. Please login again.";
    err = new ErrorHandler(message, 401);
  }

  // Prisma connection errors
  if (err.code === "P1001" || err.code === "P1002") {
    const message = "Database connection error. Please try again later.";
    err = new ErrorHandler(message, 503);
  }

  // Log error in development
  if (env.NODE_ENV === "development") {
    console.error("Error Details:", {
      name: err.name,
      message: err.message,
      stack: err.stack,
      path: req.originalUrl,
      method: req.method,
    });
  }

  // Send error response
  const errorResponse = {
    success: false,
    message: err.message,
  };

  // Include error details in development
  if (env.NODE_ENV === "development" && err.stack) {
    errorResponse.stack = err.stack;
  }

  res.status(err.statusCode).json(errorResponse);
};
