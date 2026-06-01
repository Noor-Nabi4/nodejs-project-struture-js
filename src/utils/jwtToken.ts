import type { Response } from "express";
import config from "../config/index.js";
import { COOKIE_NAMES } from "../config/constants.js";
import { success } from "./response.js";
import type { IUserDocument } from "../types/user.types.js";

const sendToken = (
  user: IUserDocument,
  statusCode: number,
  res: Response
): Response => {
  const token = user.getJWTToken();

  const options = {
    expires: new Date(
      Date.now() + config.jwt.cookieExpireDays * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
    secure: config.isProduction,
    sameSite: "lax" as const,
  };

  res.cookie(COOKIE_NAMES.AUTH_TOKEN, token, options);

  return success(res, statusCode, "Signed in successfully", { user, token });
};

export default sendToken;
