import express from "express";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import mongoSanitize from "express-mongo-sanitize";
import corsMiddleware from "./config/cors.js";
import morganMiddleware from "./config/morgan.js";
import swaggerUi from "swagger-ui-express";
import config from "./config/index.js";
import { swaggerSpec } from "./config/swagger.js";
import errorMiddleware from "./middlewares/defaultError.js";
import routes from "./routes/index.js";
import { HTTP_STATUS } from "./config/constants.js";

const app = express();

app.use(helmet());
app.use(morganMiddleware);
app.use(express.json({ limit: "10kb" }));
app.use(cookieParser());
app.use(corsMiddleware);
app.use(mongoSanitize());

const limiter = rateLimit({
  max: config.rateLimit.max,
  windowMs: config.rateLimit.windowMs,
  message: { success: false, message: "Too many requests. Try again later." },
});
app.use("/api/", limiter);

app.get("/health", (_req, res) => {
  res.status(HTTP_STATUS.OK).json({ success: true, message: "OK" });
});

const BASE_ROUTE = "/api/v1";
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use(BASE_ROUTE, routes);

app.use((_req, res) => {
  res
    .status(HTTP_STATUS.NOT_FOUND)
    .json({ success: false, message: "Route not found" });
});

app.use(errorMiddleware);

export default app;
