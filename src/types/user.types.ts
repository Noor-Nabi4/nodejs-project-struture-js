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

export type CreateUserPayload = Pick<
  IUser,
  "firstName" | "lastName" | "username" | "email" | "phoneNumber" | "password"
>;

export type UpdateProfilePayload = Partial<
  Pick<IUser, "firstName" | "lastName" | "username" | "email" | "phoneNumber">
>;

export type UserId = Types.ObjectId | string;
