import User from "../models/userModel.js";
import ErrorHandler from "../utils/errorHandler.js";
import { HTTP_STATUS } from "../config/constants.js";
import type {
  CreateUserPayload,
  IUserDocument,
  UserId,
} from "../types/user.types.js";

export async function findUserByEmailOrUsername(
  emailOrUsername: string
): Promise<IUserDocument | null> {
  return User.findOne({
    $or: [{ email: emailOrUsername }, { username: emailOrUsername }],
  }).select("+password") as Promise<IUserDocument | null>;
}

export async function findUserById(
  id: UserId,
  selectPassword = false
): Promise<IUserDocument | null> {
  const query = User.findById(id);
  if (selectPassword) {
    return query.select("+password") as Promise<IUserDocument | null>;
  }
  return query as Promise<IUserDocument | null>;
}

export async function findUserByEmail(
  email: string
): Promise<IUserDocument | null> {
  return User.findOne({ email });
}

export async function findUserByResetToken(
  hashedToken: string
): Promise<IUserDocument | null> {
  return User.findOne({
    resetPasswordToken: hashedToken,
    resetPasswordExpire: { $gt: Date.now() },
  });
}

export async function createUser(
  payload: CreateUserPayload
): Promise<IUserDocument> {
  const user = new User(payload);
  return user.save();
}

export async function setUserPassword(
  user: IUserDocument,
  newPassword: string
): Promise<IUserDocument> {
  user.password = newPassword;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;
  return user.save();
}

export async function clearResetToken(
  user: IUserDocument
): Promise<IUserDocument> {
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;
  return user.save({ validateBeforeSave: false });
}

export async function validateCredentials(
  emailOrUsername: string,
  password: string
): Promise<IUserDocument> {
  const user = await findUserByEmailOrUsername(emailOrUsername);
  if (!user)
    throw new ErrorHandler("Invalid credentials", HTTP_STATUS.UNAUTHORIZED);
  const matched = await user.comparePassword(password);
  if (!matched)
    throw new ErrorHandler("Invalid credentials", HTTP_STATUS.UNAUTHORIZED);
  return user;
}

export async function changePasswordForUser(
  userId: UserId,
  oldPassword: string,
  newPassword: string
): Promise<IUserDocument> {
  const user = await findUserById(userId, true);
  if (!user) throw new ErrorHandler("User not found", HTTP_STATUS.BAD_REQUEST);
  const matched = await user.comparePassword(oldPassword);
  if (!matched)
    throw new ErrorHandler(
      "Incorrect current password",
      HTTP_STATUS.BAD_REQUEST
    );
  user.password = newPassword;
  await user.save();
  return user;
}
