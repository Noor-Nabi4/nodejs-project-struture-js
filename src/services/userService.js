import User from "../models/userModel.js";
import ErrorHandler from "../utils/errorHandler.js";
import { HTTP_STATUS } from "../config/constants.js";

const ALLOWED_PROFILE_FIELDS = [
  "firstName",
  "lastName",
  "username",
  "email",
  "phoneNumber",
];

export async function getById(id) {
  const user = await User.findById(id);
  if (!user) throw new ErrorHandler("User not found", HTTP_STATUS.NOT_FOUND);
  return user;
}

export async function updateProfile(userId, payload) {
  const filtered = {};
  for (const key of ALLOWED_PROFILE_FIELDS) {
    if (payload[key] !== undefined) filtered[key] = payload[key];
  }
  const user = await User.findByIdAndUpdate(userId, filtered, {
    new: true,
    runValidators: true,
  });
  if (!user) throw new ErrorHandler("User not found", HTTP_STATUS.NOT_FOUND);
  return user;
}
