import express from "express";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import cors from "cors";
import { env } from "./config/env.js";
import errorMiddleware from "./middlewares/defaultError.js";
import morganMiddleware from "./middlewares/morganLogger.js";
import rateLimiter from "./middlewares/rateLimiter.js";

// Route Imports
import routes from "./routes/index.js";

const app = express();

// Security Middleware
app.use(helmet());

// CORS Configuration
const corsOptions = {
  origin: env.FRONTEND_URL,
  credentials: true,
  optionsSuccessStatus: 200,
};
app.use(cors(corsOptions));

// Body Parser Middleware
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(cookieParser());

// Logging Middleware - Morgan with colored output
// Place morgan after basic middleware but before routes for accurate logging
// Colors: Green (2xx), Cyan (3xx), Yellow (4xx), Red (5xx)
app.use(morganMiddleware);

// Rate Limiting
app.use("/api/v1", rateLimiter);

// Health Check Route
app.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Server is running",
    timestamp: new Date().toISOString(),
  });
});

// API Routes
app.use("/api",routes);

// 404 Handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`,
  });
});

// Error Middleware (must be last)
app.use(errorMiddleware);

export default app;
