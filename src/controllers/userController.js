import catchAsyncErrors from "../middlewares/catchAsyncErrors.js";
import * as userService from "../services/userService.js";
import { success } from "../utils/response.js";
import { HTTP_STATUS } from "../config/constants.js";

export const getProfile = catchAsyncErrors(async (req, res) => {
  return success(res, HTTP_STATUS.OK, "Success", req.user);
});

export const updateProfile = catchAsyncErrors(async (req, res) => {
  const user = await userService.updateProfile(req.user.id, req.body);
  return success(res, HTTP_STATUS.OK, "Profile updated successfully", user);
});
