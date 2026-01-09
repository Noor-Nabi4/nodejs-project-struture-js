import express from "express";
import authRoutes from "./authRoutes.js";
import userRoutes from "./userRoutes.js";

const router = express.Router();

// API Routes
const BASE_ROUTE = "/v1";

router.use(`${BASE_ROUTE}/auth`, authRoutes);
router.use(`${BASE_ROUTE}/user`, userRoutes);

export default router;

