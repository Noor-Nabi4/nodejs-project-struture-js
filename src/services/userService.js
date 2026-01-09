import { prisma } from "../config/db.js";
import ErrorHandler from "../utils/errorHandler.js";

/**
 * Update user profile
 */
export const updateUserProfile = async (userId, updateData) => {
  // Remove password if it exists (password should be changed via changePassword)
  const { password, ...safeUpdateData } = updateData;

  // Lowercase email and username if provided
  if (safeUpdateData.email) {
    safeUpdateData.email = safeUpdateData.email.toLowerCase();
  }
  if (safeUpdateData.username) {
    safeUpdateData.username = safeUpdateData.username.toLowerCase();
  }

  // Check for duplicate email or username
  if (safeUpdateData.email || safeUpdateData.username) {
    const existingUser = await prisma.user.findFirst({
      where: {
        AND: [
          { id: { not: userId } },
          {
            OR: [
              safeUpdateData.email ? { email: safeUpdateData.email } : {},
              safeUpdateData.username ? { username: safeUpdateData.username } : {},
            ],
          },
        ],
      },
    });

    if (existingUser) {
      if (existingUser.email === safeUpdateData.email) {
        throw new ErrorHandler("Email already exists", 409);
      }
      if (existingUser.username === safeUpdateData.username) {
        throw new ErrorHandler("Username already exists", 409);
      }
    }
  }

  const user = await prisma.user.update({
    where: { id: userId },
    data: safeUpdateData,
  });

  if (!user) {
    throw new ErrorHandler("User not found", 404);
  }

  // Remove password from response
  const { password: _, ...userWithoutPassword } = user;
  return userWithoutPassword;
};

/**
 * Get user by ID
 */
export const getUserById = async (userId) => {
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

/**
 * Get all users with optional filters
 */
export const getAllUsers = async (filters = {}, options = {}) => {
  const { page = 1, limit = 10, sortBy = "createdAt", sortOrder = "desc" } = options;
  const skip = (page - 1) * limit;

  // Build where clause
  const where = {};
  if (filters.role) {
    where.role = filters.role;
  }
  if (filters.isActive !== undefined) {
    where.isActive = filters.isActive;
  }
  if (filters.search) {
    where.OR = [
      { email: { contains: filters.search, mode: "insensitive" } },
      { username: { contains: filters.search, mode: "insensitive" } },
      { firstName: { contains: filters.search, mode: "insensitive" } },
      { lastName: { contains: filters.search, mode: "insensitive" } },
    ];
  }

  // Build orderBy
  const orderBy = {};
  orderBy[sortBy] = sortOrder;

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      skip,
      take: limit,
      orderBy,
      select: {
        id: true,
        firstName: true,
        lastName: true,
        username: true,
        email: true,
        phoneNumber: true,
        isActive: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    }),
    prisma.user.count({ where }),
  ]);

  return {
    users,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  };
};

/**
 * Delete user by ID
 */
export const deleteUserById = async (userId) => {
  const user = await prisma.user.delete({
    where: { id: userId },
  });

  if (!user) {
    throw new ErrorHandler("User not found", 404);
  }

  // Remove password from response
  const { password: _, ...userWithoutPassword } = user;
  return userWithoutPassword;
};
