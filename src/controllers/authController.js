import catchAsyncErrors from "../middlewares/catchAsyncErrors.js";
import ErrorHandler from "../utils/errorHandler.js";
import sendToken from "../utils/jWTToken.js";
import * as authService from "../services/authService.js";

export const checkAuth = catchAsyncErrors(async (req, res, next) => {
  res.status(200).json({
    success: true,
    data: req.user,
  });
});

export const createUser = catchAsyncErrors(async (req, res, next) => {
  const user = await authService.createUser(req.body);
  res.status(201).json({
    success: true,
    message: "User Created",
    data: user,
  });
});

export const signin = catchAsyncErrors(async (req, res, next) => {
  const { password, email } = req.body;
  const user = await authService.authenticateUser(email, password);
  sendToken(user, 200, res);
});

export const signout = catchAsyncErrors(async (req, res, next) => {
  res.cookie("authToken", null, {
    expires: new Date(Date.now()),
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
  });
  res.status(200).json({
    success: true,
    message: "Signed Out Successfully",
  });
});

export const forgotPassword = catchAsyncErrors(async (req, res, next) => {
  const user = await authService.findUserByEmail(req.body.email);
  const resetToken = await authService.generateResetPasswordToken(user);

  await authService.sendPasswordResetEmail(
    user,
    resetToken,
    req.protocol,
    req.get("host")
  );

  res.status(200).json({
    success: true,
    message: "Password reset email sent successfully",
  });
});

export const resetPassword = catchAsyncErrors(async (req, res, next) => {
  const { password, confirmPassword } = req.body;
  if (password !== confirmPassword) {
    return next(
      new ErrorHandler("Password does not match with confirm password", 400)
    );
  }

  await authService.resetPasswordWithToken(req.params.token, password);

  res.status(200).json({
    success: true,
    message: "Password reset successfully",
  });
});

export const changePassword = catchAsyncErrors(async (req, res, next) => {
  const { id } = req.user;
  const { oldPassword, password } = req.body;

  await authService.changeUserPassword(id, oldPassword, password);

  res.status(200).json({
    success: true,
    message: "Password changed successfully",
  });
});
