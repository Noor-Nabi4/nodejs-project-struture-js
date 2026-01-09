/**
 * Environment variables validation and configuration
 */

import dotenv from "dotenv";

// Load environment variables
dotenv.config();

/**
 * Validate required environment variables
 */
const validateEnv = () => {
  const required = [
    "PORT",
    "DATABASE_URL",
    "JWT_SECRET",
    "JWT_EXPIRE",
    "COOKIE_EXPIRE",
  ];

  const missing = required.filter((key) => !process.env[key]);

  if (missing.length > 0) {
    console.error(
      `Missing required environment variables: ${missing.join(", ")}`
    );
    console.error("Please check your .env file");
    process.exit(1);
  }
};

// Validate on module load
validateEnv();

/**
 * Export validated environment configuration
 */
export const env = {
  // Server
  NODE_ENV: process.env.NODE_ENV || "development",
  PORT: parseInt(process.env.PORT) || 5000,

  // Database
  DATABASE_URL: process.env.DATABASE_URL,

  // JWT
  JWT_SECRET: process.env.JWT_SECRET,
  JWT_EXPIRE: process.env.JWT_EXPIRE || "24h",
  COOKIE_EXPIRE: parseInt(process.env.COOKIE_EXPIRE) || 1,

  // Email (SMTP)
  SMTP_HOST: process.env.SMTP_HOST,
  SMTP_PORT: parseInt(process.env.SMTP_PORT) || 587,
  SMTP_USER: process.env.SMTP_USER,
  SMTP_PASSWORD: process.env.SMTP_PASSWORD,
  SMTP_MAIL: process.env.SMTP_MAIL,

  // reCAPTCHA (optional)
  RECAPTCHA_SECRET_KEY: process.env.RECAPTCHA_SECRET_KEY,

  // CORS
  FRONTEND_URL: process.env.FRONTEND_URL || "http://localhost:3000",

  // File Upload
  MAX_FILE_SIZE: parseInt(process.env.MAX_FILE_SIZE) || 5 * 1024 * 1024, // 5MB

  // Rate Limiting
  MAX_API_RATE_LIMIT: parseInt(process.env.MAX_API_RATE_LIMIT) || 100,
  RATE_LIMIT_WINDOW_MS:
    parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
};

export default env;

