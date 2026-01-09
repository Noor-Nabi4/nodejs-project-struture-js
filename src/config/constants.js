/**
 * Application constants
 * Note: Sensitive values should be stored in environment variables
 */

const Constants = {
  // API Rate Limiting
  MAX_API_RATE_LIMIT: parseInt(process.env.MAX_API_RATE_LIMIT) || 100,
  WINDOW_MS: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes

  // User Roles
  USER_ROLES: {
    ADMIN: "ADMIN",
    USER: "USER",
  },

  // JWT Configuration (values from env or defaults)
  JWT: {
    SECRET_KEY: process.env.JWT_SECRET || "your-secret-key",
    EXPIRATION_TIME: process.env.JWT_EXPIRE || "24h",
    COOKIE_EXPIRE: parseInt(process.env.COOKIE_EXPIRE) || 1, // days
  },

  // Pagination defaults
  PAGINATION: {
    DEFAULT_PAGE: 1,
    DEFAULT_LIMIT: 10,
    MAX_LIMIT: 100,
  },

  // Password reset token expiration (in milliseconds)
  PASSWORD_RESET_TOKEN_EXPIRE: 15 * 60 * 1000, // 15 minutes

  // File upload limits
  FILE_UPLOAD: {
    MAX_SIZE: 5 * 1024 * 1024, // 5MB
    ALLOWED_TYPES: ["image/jpeg", "image/png", "image/jpg"],
  },
};

export default Constants;
