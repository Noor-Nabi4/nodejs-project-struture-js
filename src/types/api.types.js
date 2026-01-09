/**
 * API Response Types and Interfaces
 * This file provides type documentation for API responses and request bodies
 * Note: This is documentation only - actual runtime validation should use validators
 */

/**
 * Standard API Response Structure
 * @typedef {Object} ApiResponse
 * @property {boolean} success - Whether the request was successful
 * @property {string} message - Response message
 * @property {*} data - Response data (optional)
 * @property {*} errors - Error details (optional, only on error)
 */

/**
 * Pagination Metadata
 * @typedef {Object} PaginationMeta
 * @property {number} page - Current page number
 * @property {number} limit - Items per page
 * @property {number} total - Total number of items
 * @property {number} pages - Total number of pages
 */

/**
 * Paginated API Response
 * @typedef {Object} PaginatedResponse
 * @property {boolean} success - Whether the request was successful
 * @property {string} message - Response message
 * @property {Array} data - Array of items
 * @property {PaginationMeta} pagination - Pagination metadata
 */

/**
 * User Object
 * @typedef {Object} User
 * @property {string} id - User ID
 * @property {string} firstName - User's first name
 * @property {string} lastName - User's last name
 * @property {string} username - Unique username
 * @property {string} email - User's email address
 * @property {string} phoneNumber - User's phone number
 * @property {string} role - User role (USER, ADMIN)
 * @property {boolean} isActive - Whether the user account is active
 * @property {Date} createdAt - Account creation date
 * @property {Date} updatedAt - Last update date
 */

/**
 * Signup Request Body
 * @typedef {Object} SignupRequest
 * @property {string} firstName - User's first name (required, min 2 chars)
 * @property {string} lastName - User's last name (required, min 2 chars)
 * @property {string} username - Unique username (required, min 3 chars)
 * @property {string} email - User's email (required, valid email format)
 * @property {string} password - User's password (required, min 8 chars, must contain uppercase, lowercase, and number)
 * @property {string} phoneNumber - User's phone number (required, min 10 chars)
 */

/**
 * Signin Request Body
 * @typedef {Object} SigninRequest
 * @property {string} email - User's email or username (required)
 * @property {string} password - User's password (required)
 */

/**
 * Auth Response
 * @typedef {Object} AuthResponse
 * @property {boolean} success - Whether the request was successful
 * @property {User} user - Authenticated user object
 * @property {string} token - JWT token
 */

/**
 * Password Reset Request
 * @typedef {Object} PasswordResetRequest
 * @property {string} email - User's email address (required, valid email)
 */

/**
 * Password Change Request
 * @typedef {Object} PasswordChangeRequest
 * @property {string} oldPassword - Current password (required)
 * @property {string} password - New password (required, min 8 chars, must contain uppercase, lowercase, and number)
 * @property {string} confirmPassword - Password confirmation (required, must match password)
 */

/**
 * Profile Update Request
 * @typedef {Object} ProfileUpdateRequest
 * @property {string} [firstName] - User's first name (optional, min 2 chars)
 * @property {string} [lastName] - User's last name (optional, min 2 chars)
 * @property {string} [username] - Username (optional, min 3 chars)
 * @property {string} [email] - Email address (optional, valid email format)
 * @property {string} [phoneNumber] - Phone number (optional)
 */

/**
 * Error Response
 * @typedef {Object} ErrorResponse
 * @property {boolean} success - Always false for errors
 * @property {string} message - Error message
 * @property {Array<string>} [errors] - Detailed validation errors (optional)
 */

// Export types for documentation purposes
export default {
  ApiResponse: "See typedef above",
  PaginatedResponse: "See typedef above",
  User: "See typedef above",
  SignupRequest: "See typedef above",
  SigninRequest: "See typedef above",
  AuthResponse: "See typedef above",
  PasswordResetRequest: "See typedef above",
  PasswordChangeRequest: "See typedef above",
  ProfileUpdateRequest: "See typedef above",
  ErrorResponse: "See typedef above",
};

