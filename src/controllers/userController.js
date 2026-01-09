import catchAsyncErrors from "../middlewares/catchAsyncErrors.js";
import * as userService from "../services/userService.js";

export const updateProfile = catchAsyncErrors(async (req, res, next) => {
  const userId = req.user.id;
  const user = await userService.updateUserProfile(userId, req.body);

  res.status(200).json({
    success: true,
    message: "Profile updated successfully",
    data: user,
  });
});

export const getProfile = catchAsyncErrors(async (req, res, next) => {
  const userId = req.user.id;
  const user = await userService.getUserById(userId);

  res.status(200).json({
    success: true,
    data: user,
  });
});
