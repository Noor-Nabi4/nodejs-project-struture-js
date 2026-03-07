import User from "../models/userModel.js";
import ErrorHandler from "../utils/errorHandler.js";
import { HTTP_STATUS } from "../config/constants.js";

export async function findUserByEmailOrUsername(emailOrUsername) {
  return User.findOne({
    $or: [{ email: emailOrUsername }, { username: emailOrUsername }],
  }).select("+password");
}

export async function findUserById(id, selectPassword = false) {
  const query = User.findById(id);
  if (selectPassword) return query.select("+password");
  return query;
}

export async function findUserByEmail(email) {
  return User.findOne({ email });
}

export async function findUserByResetToken(hashedToken) {
  return User.findOne({
    resetPasswordToken: hashedToken,
    resetPasswordExpire: { $gt: Date.now() },
  });
}

export async function createUser(payload) {
  const user = new User(payload);
  return user.save();
}

export async function setUserPassword(user, newPassword) {
  user.password = newPassword;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;
  return user.save();
}

export async function clearResetToken(user) {
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;
  return user.save({ validateBeforeSave: false });
}

export async function validateCredentials(emailOrUsername, password) {
  const user = await findUserByEmailOrUsername(emailOrUsername);
  if (!user)
    throw new ErrorHandler("Invalid credentials", HTTP_STATUS.UNAUTHORIZED);
  const matched = await user.comparePassword(password);
  if (!matched)
    throw new ErrorHandler("Invalid credentials", HTTP_STATUS.UNAUTHORIZED);
  return user;
}

export async function changePasswordForUser(userId, oldPassword, newPassword) {
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
