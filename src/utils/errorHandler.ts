import type { ValidationFieldError } from "../types/errors.types.js";

class ErrorHandler extends Error {
  statusCode: number;
  errors: ValidationFieldError[] | Record<string, string> | null;

  constructor(
    message: string,
    statusCode = 500,
    errors: ValidationFieldError[] | Record<string, string> | null = null
  ) {
    super(message);
    this.statusCode = statusCode;
    this.errors = errors;
    Error.captureStackTrace(this, this.constructor);
  }
}

export default ErrorHandler;
