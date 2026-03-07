import crypto from "crypto";

/** Hash reset token to match value stored in DB (User.setResetPasswordToken). */
export const hashResetToken = (token) =>
  crypto.createHash("sha256").update(token).digest("hex");
