import express from "express";
import { isAuthenticatedUser, authorizeRole } from "../middlewares/auth.js";
import { updateProfile, getProfile } from "../controllers/userController.js";
import { validateProfileUpdate } from "../validators/userValidator.js";

const router = express.Router();

router
  .get("/profile", isAuthenticatedUser, getProfile)
  .put(
    "/profile",
    isAuthenticatedUser,
    validateProfileUpdate,
    updateProfile
  );

export default router;
