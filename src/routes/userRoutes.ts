import express from "express";
import { isAuthenticatedUser } from "../middlewares/auth.js";
import { getProfile, updateProfile } from "../controllers/userController.js";
import { validateRequest } from "../middlewares/validateRequest.js";
import { updateProfileSchema } from "../validations/user.validation.js";

const router = express.Router();

router
  .route("/profile")
  .get(isAuthenticatedUser, getProfile)
  .put(
    isAuthenticatedUser,
    validateRequest(updateProfileSchema),
    updateProfile
  );

export default router;
