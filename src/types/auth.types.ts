import type { Request } from "express";
import type { IUserDocument } from "./user.types.js";

export type AuthRequest = Request & {
  user: IUserDocument;
};
