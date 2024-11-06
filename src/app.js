import express from "express";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import helmet from "helmet"; // Security middleware
import rateLimit from "express-rate-limit"; // Rate limiting middleware
import morgan from "morgan";
import path from "path";
import cors from "cors";
import errorMiddleware from "./middlewares/defaultError.js";

const app = express();

app.use(express.json());
app.use(helmet()); // Use helmet for security headers
app.use(bodyParser.json());
app.use(cookieParser());
app.use(cors());

// Route Imports
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";

const BASE_ROUTE = "/api/v1";

app.use(`${BASE_ROUTE}/auth`, authRoutes);
app.use(`${BASE_ROUTE}/user`, userRoutes);


// Error Middleware
app.use(errorMiddleware);

export default app;
