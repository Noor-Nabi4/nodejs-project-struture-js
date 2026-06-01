import User from "../models/userModel.js";
import ErrorHandler from "../utils/errorHandler.js";
import { HTTP_STATUS } from "../config/constants.js";
import type {
  IUserDocument,
  UpdateProfilePayload,
  UserId,
} from "../types/user.types.js";

const ALLOWED_PROFILE_FIELDS = [
  "firstName",
  "lastName",
  "username",
  "email",
  "phoneNumber",
] as const satisfies readonly (keyof UpdateProfilePayload)[];

export async function getById(id: UserId): Promise<IUserDocument> {
  const user = await User.findById(id);
  if (!user) throw new ErrorHandler("User not found", HTTP_STATUS.NOT_FOUND);
  return user;
}

export async function updateProfile(
  userId: UserId,
  payload: UpdateProfilePayload
): Promise<IUserDocument> {
  const filtered: UpdateProfilePayload = {};
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
