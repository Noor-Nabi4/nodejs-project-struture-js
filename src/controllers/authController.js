import catchAsyncErrors from "../middlewares/catchAsyncErrors.js";
import User from "../models/userModel.js";
import ErrorHandler from "../utils/errorHandler.js";
import sendToken from "../utils/jWTToken.js";
import sendEmail from "../utils/sendEmail.js";
import crypto from "crypto";

export const checkAuth = catchAsyncErrors(async (req, res, next) => {
  if (req.user) {
    res.json(req.user);
  } else {
    res.sendStatus(401);
  }
});

export const createUser = catchAsyncErrors(async (req, res, next) => {
  const user = new User(req.body);
  const saved = await user.save();

  res.json({ success: true, message: "User Created", data: saved });
});

export const signin = catchAsyncErrors(async (req, res, next) => {
  const { password, email } = req.body;
  if (!email || !password) {
    return next(
      new ErrorHandler("Please enter email or username and password", 400)
    );
  }
  const user = await User.findOne({
    $or: [{ email: email }, { username: email }],
  }).select("+password");
  if (!user) {
    return next(new ErrorHandler("Invalid Credentials", 401));
  }
  const isPasswordMatched = await user.comparePassword(password);
  if (!isPasswordMatched) {
    return next(new ErrorHandler("Invalid Credentials", 401));
  }
  sendToken(user, 200, res);
});

export const signout = catchAsyncErrors(async (req, res, next) => {
  res.cookie("token", null, {
    expires: new Date(Date.now()),
    httpOnly: true,
  });
  res.json({
    success: true,
    message: "Signed Out Successfully",
  });
});

export const forgotPassword = catchAsyncErrors(async (req, res, next) => {
  const captchaResult = await verifyCaptcha(req.body.recaptchaToken);
  if (!captchaResult) {
    return next(new ErrorHandler("Something went wrong Please try again", 401));
  }
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return next(new ErrorHandler("User not found", 404));
  }
  const resetToken = user.setResetPasswordToken();
  const resetPasswordUrl = `${req.protocol}://${req.get(
    "host"
  )}/auth/password/reset/${resetToken}`;
  await user.save({ validateBeforeSave: false });
  try {
    await sendEmail({
      email: user.email,
      subject: "Forgot Password",
      message: resetPasswordUrl,
    });
    res.json({
      success: true,
      message: "SUCCESS",
    });
  } catch (error) {
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save({ validateBeforeSave: false });
    return next(new ErrorHandler(error.message, 500));
  }
});

export const resetPassword = catchAsyncErrors(async (req, res, next) => {
  const captchaResult = await verifyCaptcha(req.body.recaptchaToken);
  if (!captchaResult) {
    return next(new ErrorHandler("Something went wrong Please try again", 401));
  }
  const { password, confirmPassword } = req.body;
  const resetPasswordToken = crypto
    .createHash("sha256")
    .update(req.params.token)
    .digest("hex");
  const user = await User.findOne({
    resetPasswordToken,
    resetPasswordExpire: { $gt: Date.now() },
  });
  if (!user) {
    return next(
      new ErrorHandler("Reset password token is invalid or has expired", 400)
    );
  }
  if (password !== confirmPassword) {
    return next(
      new ErrorHandler("Password does not match with confirm password", 400)
    );
  }
  user.password = password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;
  await user.save();
  res.json({
    success: true,
    message: "Reset Password Successfully",
  });
});

export const changePassword = catchAsyncErrors(async (req, res, next) => {
  const { id } = req?.user || {};
  const { oldPassword, password } = req.body || {};

  const user = await User.findById(id).select("+password");

  if (!user) {
    return next(
      new ErrorHandler("User not found. Please login and try again.", 400)
    );
  }

  const isMatched = await user.comparePassword(oldPassword);

  if (!isMatched) {
    return next(
      new ErrorHandler("Please enter correct old password and try again.", 400)
    );
  }

  user.password = password;
  await user.save();

  res.json({
    success: true,
    message: "Password Changed Successfully",
  });
});
