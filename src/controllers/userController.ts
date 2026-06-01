import catchAsyncErrors from "../middlewares/catchAsyncErrors.js";
import * as userService from "../services/userService.js";
import { success } from "../utils/response.js";
import { HTTP_STATUS } from "../config/constants.js";
import type { AuthRequest } from "../types/auth.types.js";
import type { TypedRequestBody } from "../types/request.types.js";
import type { UpdateProfilePayload } from "../types/user.types.js";

export const getProfile = catchAsyncErrors<AuthRequest>(async (req, res) => {
  return success(res, HTTP_STATUS.OK, "Success", req.user);
});

export const updateProfile = catchAsyncErrors<
  AuthRequest & TypedRequestBody<UpdateProfilePayload>
>(async (req, res) => {
  const user = await userService.updateProfile(req.user.id, req.body);
  return success(res, HTTP_STATUS.OK, "Profile updated successfully", user);
});
