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
import { validateRequest } from "../middlewares/validateRequest.js";
import {
  signupSchema,
  signinSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  changePasswordSchema,
} from "../validations/auth.validation.js";

const router = express.Router();

router.get("/me", isAuthenticatedUser, me);

router.post("/signup", validateRequest(signupSchema), createUser);
router.post("/signin", validateRequest(signinSchema), signin);
router.get("/signout", signout);

router.post(
  "/password/forgot",
  validateRequest(forgotPasswordSchema),
  forgotPassword
);
router.put(
  "/password/reset/:token",
  validateRequest(resetPasswordSchema),
  resetPassword
);
router.patch(
  "/password/change",
  isAuthenticatedUser,
  validateRequest(changePasswordSchema),
  changePassword
);

export default router;
