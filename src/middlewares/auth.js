import User from "../models/userModel.js";
import ErrorHandler from "../utils/errorHandler.js";
import catchAsyncErrors from "./catchAsyncErrors.js";
import jwt from "jsonwebtoken";

export const isAuthenticatedUser = catchAsyncErrors(async (req, res, next) => {
  const { authToken } = req.cookies;
  if (!authToken) {
    return next(new ErrorHandler("Please login to access this resource.", 401));
  }

  const decodedData = jwt.verify(authToken, process.env.JWT_SECRET);
  const userFound = await User.findById(decodedData.id);
  if (!userFound) {
    return next(new ErrorHandler("Please login to access this resource.", 401));
  }
  req.user = userFound;

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
