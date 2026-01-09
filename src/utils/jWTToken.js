import jwt from "jsonwebtoken";
import { env } from "../config/env.js";

/**
 * Generate JWT token for a user
 * @param {string} userId - User ID
 * @returns {string} - JWT token
 */
export const generateJWTToken = (userId) => {
  return jwt.sign({ id: userId }, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRE,
  });
};

/**
 * Send token response with cookie
 * @param {Object} user - User object
 * @param {number} statusCode - HTTP status code
 * @param {Object} res - Express response object
 */
const sendToken = (user, statusCode, res) => {
  const token = generateJWTToken(user.id);

  // Cookie options
  const options = {
    expires: new Date(
      Date.now() + env.COOKIE_EXPIRE * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
    secure: env.NODE_ENV === "production",
    sameSite: "strict",
  };

  // Remove password from user object before sending
  const { password: _, ...userWithoutPassword } = user;

  res.status(statusCode).cookie("authToken", token, options).json({
    success: true,
    user: userWithoutPassword,
    token,
  });
};

export default sendToken;
export { generateJWTToken };
