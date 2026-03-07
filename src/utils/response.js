import { HTTP_STATUS } from "../config/constants.js";

/**
 * Send a standardized success response.
 * @param {object} res - Express response object
 * @param {number} statusCode - HTTP status code
 * @param {string} message - Response message
 * @param {*} data - Optional payload
 */
export const success = (
  res,
  statusCode = HTTP_STATUS.OK,
  message = "Success",
  data = null
) => {
  const payload = { success: true, message };
  if (data != null) payload.data = data;
  return res.status(statusCode).json(payload);
};

/**
 * Send a standardized error response (used by error middleware; kept for programmatic use).
 * @param {object} res - Express response object
 * @param {number} statusCode - HTTP status code
 * @param {string} message - Error message
 * @param {*} errors - Optional validation or detail errors
 */
export const error = (
  res,
  statusCode = HTTP_STATUS.INTERNAL_SERVER_ERROR,
  message = "Internal Server Error",
  errors = null
) => {
  const body = { success: false, message };
  if (errors !== null && errors !== undefined) {
    body.errors = errors;
  }
  return res.status(statusCode).json(body);
};
