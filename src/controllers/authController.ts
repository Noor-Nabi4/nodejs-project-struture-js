import type { Response, NextFunction } from "express";
import catchAsyncErrors from "../middlewares/catchAsyncErrors.js";
import * as authService from "../services/authService.js";
import {
  sendEmail,
  getPasswordResetTemplatePath,
} from "../services/emailService.js";
import { hashResetToken } from "../utils/token.js";
import sendToken from "../utils/jwtToken.js";
import { success } from "../utils/response.js";
import ErrorHandler from "../utils/errorHandler.js";
import config from "../config/index.js";
import { HTTP_STATUS, COOKIE_NAMES } from "../config/constants.js";
import type { AuthRequest } from "../types/auth.types.js";
import type { TypedRequestBody } from "../types/request.types.js";
import type {
  SignupInput,
  SigninInput,
  ForgotPasswordInput,
  ResetPasswordBodyInput,
  ResetPasswordParamsInput,
  ChangePasswordInput,
} from "../validations/auth.validation.js";

export const me = catchAsyncErrors<AuthRequest>(async (req, res) => {
  return success(res, HTTP_STATUS.OK, "Success", req.user);
});

export const createUser = catchAsyncErrors(
  async (req: TypedRequestBody<SignupInput>, res: Response) => {
    const user = await authService.createUser(req.body);
    return success(res, HTTP_STATUS.CREATED, "User created successfully", user);
  }
);

export const signin = catchAsyncErrors(
  async (req: TypedRequestBody<SigninInput>, res: Response) => {
    const { email, password } = req.body;
    const user = await authService.validateCredentials(email, password);
    sendToken(user, HTTP_STATUS.OK, res);
  }
);

export const signout = catchAsyncErrors(async (_req, res: Response) => {
  res.cookie(COOKIE_NAMES.AUTH_TOKEN, "", {
    expires: new Date(0),
    httpOnly: true,
    secure: config.isProduction,
    sameSite: "lax",
  });
  return success(res, HTTP_STATUS.OK, "Signed out successfully");
});

export const forgotPassword = catchAsyncErrors(
  async (req: TypedRequestBody<ForgotPasswordInput>, res: Response) => {
    const user = await authService.findUserByEmail(req.body.email);
    if (!user) {
      return success(
        res,
        HTTP_STATUS.OK,
        "If the email exists, a reset link has been sent."
      );
    }
    const resetToken = user.setResetPasswordToken();
    await user.save({ validateBeforeSave: false });
    const resetPasswordUrl = `${req.protocol}://${req.get("host")}/api/v1/auth/password/reset/${resetToken}`;
    try {
      await sendEmail({
        email: user.email,
        subject: "Password reset",
        templatePath: getPasswordResetTemplatePath(),
        templateData: { resetUrl: resetPasswordUrl },
      });
    } catch (err) {
      await authService.clearResetToken(user);
      throw err;
    }
    return success(
      res,
      HTTP_STATUS.OK,
      "If the email exists, a reset link has been sent."
    );
  }
);

export const resetPassword = catchAsyncErrors(
  async (
    req: TypedRequestBody<ResetPasswordBodyInput> & {
      params: ResetPasswordParamsInput;
    },
    res: Response,
    next: NextFunction
  ) => {
    const hashedToken = hashResetToken(req.params.token);
    const user = await authService.findUserByResetToken(hashedToken);
    if (!user) {
      return next(
        new ErrorHandler(
          "Reset token is invalid or has expired",
          HTTP_STATUS.BAD_REQUEST
        )
      );
    }
    await authService.setUserPassword(user, req.body.password);
    return success(res, HTTP_STATUS.OK, "Password reset successfully");
  }
);

export const changePassword = catchAsyncErrors<
  AuthRequest & TypedRequestBody<ChangePasswordInput>
>(async (req, res) => {
  const { oldPassword, password } = req.body;
  await authService.changePasswordForUser(req.user.id, oldPassword, password);
  return success(res, HTTP_STATUS.OK, "Password changed successfully");
});
