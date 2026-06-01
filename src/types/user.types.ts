import type { HydratedDocument, Types } from "mongoose";
import type { UserRole } from "../config/constants.js";

export interface IUser {
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  phoneNumber: string;
  password: string;
  isActive: boolean;
  role: UserRole;
  resetPasswordToken?: string;
  resetPasswordExpire?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IUserMethods {
  comparePassword(candidatePassword: string): Promise<boolean>;
  getJWTToken(): string;
  setResetPasswordToken(): string;
}

export type IUserDocument = HydratedDocument<IUser, IUserMethods>;

export type { SignupInput as CreateUserPayload } from "../validations/auth.validation.js";
export type { UpdateProfileInput as UpdateProfilePayload } from "../validations/user.validation.js";

export type UserId = Types.ObjectId | string;
