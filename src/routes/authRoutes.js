import express from "express";
import {
  createUser,
  signin,
  signout,
  forgotPassword,
  resetPassword,
  checkAuth,
  changePassword,
} from "../controllers/authController.js";
import { isAuthenticatedUser, authorizeRole } from "../middlewares/auth.js";
import {
  validateSignup,
  validateSignin,
  validateForgotPassword,
  validateResetPassword,
  validateChangePassword,
} from "../validators/authValidator.js";

const router = express.Router();

router
  .post("/signup", validateSignup, createUser)
  .post("/signin", validateSignin, signin)
  .get("/signout", signout)
  .get("/check", isAuthenticatedUser, checkAuth)
  .post("/password/forgot", validateForgotPassword, forgotPassword)
  .put("/password/reset/:token", validateResetPassword, resetPassword)
  .patch(
    "/password/change",
    isAuthenticatedUser,
    validateChangePassword,
    changePassword
  );

export default router;
