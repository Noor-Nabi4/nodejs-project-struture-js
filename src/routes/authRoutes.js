import express from "express";
import {
  me,
  createUser,
  signin,
  signout,
  forgotPassword,
  resetPassword,
  changePassword,
} from "../controllers/authController.js";
import { isAuthenticatedUser } from "../middlewares/auth.js";
import { validate } from "../middlewares/validate.js";
import {
  signupSchema,
  signinSchema,
  forgotPasswordSchema,
  resetPasswordSchemas,
  changePasswordSchema,
} from "../validators/authValidators.js";

const router = express.Router();

// Current user (requires auth)
router.get("/me", isAuthenticatedUser, me);

// Registration & login
router.post("/signup", validate(signupSchema), createUser);
router.post("/signin", validate(signinSchema), signin);
router.get("/signout", signout);

// Password
router.post("/password/forgot", validate(forgotPasswordSchema), forgotPassword);
router.put(
  "/password/reset/:token",
  validate(resetPasswordSchemas),
  resetPassword
);
router.patch(
  "/password/change",
  isAuthenticatedUser,
  validate(changePasswordSchema),
  changePassword
);

export default router;
