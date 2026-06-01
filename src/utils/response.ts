import type { Response } from "express";
import { HTTP_STATUS } from "../config/constants.js";
import type { ValidationFieldError } from "../types/errors.types.js";

/**
 * Send a standardized success response.
 */
export const success = <TData>(
  res: Response,
  statusCode: number = HTTP_STATUS.OK,
  message = "Success",
  data: TData | null = null
): Response => {
  const payload: { success: true; message: string; data?: TData } = {
    success: true,
    message,
  };
  if (data != null) payload.data = data;
  return res.status(statusCode).json(payload);
};

/**
 * Send a standardized error response (used by error middleware; kept for programmatic use).
 */
export const error = (
  res: Response,
  statusCode: number = HTTP_STATUS.INTERNAL_SERVER_ERROR,
  message = "Internal Server Error",
  errors: ValidationFieldError[] | Record<string, string> | null = null
): Response => {
  const body: {
    success: false;
    message: string;
    errors?: ValidationFieldError[] | Record<string, string>;
  } = { success: false, message };
  if (errors !== null && errors !== undefined) {
    body.errors = errors;
  }
  return res.status(statusCode).json(body);
};
