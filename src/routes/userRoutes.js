import express from "express";
import { isAuthenticatedUser } from "../middlewares/auth.js";
import { getProfile, updateProfile } from "../controllers/userController.js";
import { validate } from "../middlewares/validate.js";
import { updateProfileSchema } from "../validators/userValidators.js";

const router = express.Router();

router
  .route("/profile")
  .get(isAuthenticatedUser, getProfile)
  .put(isAuthenticatedUser, validate(updateProfileSchema), updateProfile);

export default router;
