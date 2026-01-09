import { prisma } from "../config/db.js";
import ErrorHandler from "../utils/errorHandler.js";
import sendEmail from "../utils/sendEmail.js";
import { hashPassword, comparePassword } from "../utils/password.js";
import crypto from "crypto";

/**
 * Create a new user
 */
export const createUser = async (userData) => {
  const { password, ...rest } = userData;

  // Hash password
  const hashedPassword = await hashPassword(password);

  // Check if user with email or username already exists
  const existingUser = await prisma.user.findFirst({
    where: {
      OR: [
        { email: userData.email.toLowerCase() },
        { username: userData.username.toLowerCase() },
      ],
    },
  });

  if (existingUser) {
    if (existingUser.email === userData.email.toLowerCase()) {
      throw new ErrorHandler("Email already exists", 409);
    }
    if (existingUser.username === userData.username.toLowerCase()) {
      throw new ErrorHandler("Username already exists", 409);
    }
  }

  const user = await prisma.user.create({
    data: {
      ...rest,
      email: userData.email.toLowerCase(),
      username: userData.username.toLowerCase(),
      password: hashedPassword,
    },
  });

  // Remove password from response
  const { password: _, ...userWithoutPassword } = user;
  return userWithoutPassword;
};

/**
 * Authenticate user and return user object
 */
export const authenticateUser = async (email, password) => {
  const user = await prisma.user.findFirst({
    where: {
      OR: [
        { email: email.toLowerCase() },
        { username: email.toLowerCase() },
      ],
    },
  });

  if (!user) {
    throw new ErrorHandler("Invalid Credentials", 401);
  }

  const isPasswordMatched = await comparePassword(password, user.password);
  if (!isPasswordMatched) {
    throw new ErrorHandler("Invalid Credentials", 401);
  }

  // Remove password from response
  const { password: _, ...userWithoutPassword } = user;
  return userWithoutPassword;
};

/**
 * Find user by email
 */
export const findUserByEmail = async (email) => {
  const user = await prisma.user.findUnique({
    where: { email: email.toLowerCase() },
  });

  if (!user) {
    throw new ErrorHandler("User not found", 404);
  }

  return user;
};

/**
 * Generate and save reset password token
 */
export const generateResetPasswordToken = async (user) => {
  const resetToken = crypto.randomBytes(20).toString("hex");
  const resetPasswordToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");
  const resetPasswordExpire = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

  await prisma.user.update({
    where: { id: user.id },
    data: {
      resetPasswordToken,
      resetPasswordExpire,
    },
  });

  return resetToken;
};

/**
 * Send password reset email
 */
export const sendPasswordResetEmail = async (user, resetToken, protocol, host) => {
  const resetPasswordUrl = `${protocol}://${host}/api/v1/auth/password/reset/${resetToken}`;

  try {
    await sendEmail({
      email: user.email,
      subject: "Password Reset Request",
      templatePath: process.env.PASSWORD_RESET_TEMPLATE_PATH,
      templateData: {
        resetPasswordUrl,
        userName: user.firstName || user.username,
      },
    });
  } catch (error) {
    // Clear reset token if email fails
    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetPasswordToken: null,
        resetPasswordExpire: null,
      },
    });
    throw new ErrorHandler(error.message, 500);
  }
};

/**
 * Reset password using token
 */
export const resetPasswordWithToken = async (token, password) => {
  const resetPasswordToken = crypto
    .createHash("sha256")
    .update(token)
    .digest("hex");

  const user = await prisma.user.findFirst({
    where: {
      resetPasswordToken,
      resetPasswordExpire: {
        gt: new Date(),
      },
    },
  });

  if (!user) {
    throw new ErrorHandler(
      "Reset password token is invalid or has expired",
      400
    );
  }

  // Hash new password
  const hashedPassword = await hashPassword(password);

  const updatedUser = await prisma.user.update({
    where: { id: user.id },
    data: {
      password: hashedPassword,
      resetPasswordToken: null,
      resetPasswordExpire: null,
    },
  });

  // Remove password from response
  const { password: _, ...userWithoutPassword } = updatedUser;
  return userWithoutPassword;
};

/**
 * Change user password
 */
export const changeUserPassword = async (userId, oldPassword, newPassword) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw new ErrorHandler(
      "User not found. Please login and try again.",
      400
    );
  }

  const isMatched = await comparePassword(oldPassword, user.password);
  if (!isMatched) {
    throw new ErrorHandler(
      "Please enter correct old password and try again.",
      400
    );
  }

  // Hash new password
  const hashedPassword = await hashPassword(newPassword);

  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: {
      password: hashedPassword,
    },
  });

  // Remove password from response
  const { password: _, ...userWithoutPassword } = updatedUser;
  return userWithoutPassword;
};

/**
 * Find user by ID
 */
export const findUserById = async (userId) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw new ErrorHandler("User not found", 404);
  }

  // Remove password from response
  const { password: _, ...userWithoutPassword } = user;
  return userWithoutPassword;
};
