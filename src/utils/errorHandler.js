class ErrorHandler extends Error {
  /**
   * @param {string} message
   * @param {number} statusCode
   * @param {*} errors - Optional validation/details
   */
  constructor(message, statusCode = 500, errors = null) {
    super(message);
    this.statusCode = statusCode;
    this.errors = errors;
    Error.captureStackTrace(this, this.constructor);
  }
}

export default ErrorHandler;
