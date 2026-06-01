import mongoose, { type Model } from "mongoose";
import bcrypt from "bcrypt";
import crypto from "crypto";
import jwt, { type SignOptions } from "jsonwebtoken";
import config from "../config/index.js";
import { USER_ROLES } from "../config/constants.js";
import type { IUser, IUserMethods } from "../types/user.types.js";

type UserModel = Model<IUser, Record<string, never>, IUserMethods>;

const userSchema = new mongoose.Schema<IUser, UserModel, IUserMethods>(
  {
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    username: {
      type: String,
      required: [true, "Username is required."],
      unique: true,
      lowercase: true,
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required."],
      unique: true,
      trim: true,
      lowercase: true,
    },
    phoneNumber: {
      type: String,
      required: [true, "Phone Number is required."],
    },
    password: {
      type: String,
      required: [true, "Password is required."],
      select: false,
    },
    isActive: { type: Boolean, default: true },
    role: {
      type: String,
      enum: Object.values(USER_ROLES),
      default: USER_ROLES.USER,
    },
    resetPasswordToken: String,
    resetPasswordExpire: Date,
  },
  { timestamps: true }
);

userSchema.virtual("id").get(function () {
  return this._id.toHexString();
});

userSchema.set("toJSON", {
  virtuals: true,
  versionKey: false,
  transform(_doc, ret) {
    Reflect.deleteProperty(ret, "_id");
    return ret;
  },
});

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    return next();
  } catch (error) {
    return next(error as Error);
  }
});

userSchema.methods.comparePassword = async function (
  candidatePassword: string
): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.getJWTToken = function (): string {
  if (!config.jwt.secret) {
    throw new Error("JWT secret is not configured");
  }
  const signOptions: SignOptions = {
    expiresIn: config.jwt.expire as SignOptions["expiresIn"],
  };
  return jwt.sign({ id: this._id.toHexString() }, config.jwt.secret, signOptions);
};

userSchema.methods.setResetPasswordToken = function (): string {
  const resetToken = crypto.randomBytes(20).toString("hex");
  this.resetPasswordToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");
  this.resetPasswordExpire = new Date(Date.now() + 15 * 60 * 1000);
  return resetToken;
};

userSchema.index({ email: 1 });
userSchema.index({ username: 1 });
userSchema.index({ resetPasswordToken: 1, resetPasswordExpire: 1 });

const User = mongoose.model<IUser, UserModel>("User", userSchema);

export default User;
