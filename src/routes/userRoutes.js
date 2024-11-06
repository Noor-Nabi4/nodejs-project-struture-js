import express from "express";
import { isAuthenticatedUser, authorizeRole } from "../middlewares/auth.js";
import {
  updateProfile,
} from "../controllers/userController.js";

const router = express.Router();

router.put("/update/profile", isAuthenticatedUser, updateProfile);
export default router;
