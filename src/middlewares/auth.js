import { prisma } from "../config/db.js";
import ErrorHandler from "../utils/errorHandler.js";
import catchAsyncErrors from "./catchAsyncErrors.js";
import jwt from "jsonwebtoken";
import { env } from "../config/env.js";

export const isAuthenticatedUser = catchAsyncErrors(async (req, res, next) => {
  const { authToken } = req.cookies;
  if (!authToken) {
    return next(new ErrorHandler("Please login to access this resource.", 401));
  }

  const decodedData = jwt.verify(authToken, env.JWT_SECRET);
  
  const user = await prisma.user.findUnique({
    where: { id: decodedData.id },
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
  });

  if (!user) {
    return next(new ErrorHandler("Please login to access this resource.", 401));
  }

  if (!user.isActive) {
    return next(new ErrorHandler("Your account has been deactivated.", 403));
  }

  req.user = user;

  next();
});

export const authorizeRole = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new ErrorHandler(
          `Role ${req?.user?.role} is not allowed to access this resource.`,
          403
        )
      );
    }
    next();
  };
};
