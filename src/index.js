import dotenv from "dotenv";
dotenv.config();

import mongoose from "mongoose";
import app from "./app.js";
import connectDB from "./config/db.js";
import config from "./config/index.js";
import logger from "./utils/logger.js";

process.on("uncaughtException", (err) => {
  logger.error("Uncaught Exception:", err.message);
  logger.info("Shutting down due to uncaught exception...");
  process.exit(1);
});

const SHUTDOWN_TIMEOUT_MS = 10000;

const shutdown = (server, signal) => {
  logger.info(`${signal} received. Shutting down gracefully.`);
  const forceExit = () => {
    logger.warn("Forcing exit after timeout.");
    process.exit(1);
  };
  const t = setTimeout(forceExit, SHUTDOWN_TIMEOUT_MS);

  server.close(() => {
    mongoose.connection
      ?.close()
      .then(() => {
        clearTimeout(t);
        logger.info("Closed DB connection.");
        process.exit(0);
      })
      .catch((err) => {
        clearTimeout(t);
        logger.error("Error closing DB:", err?.message);
        process.exit(1);
      });
  });
};

const startServer = async () => {
  try {
    await connectDB();

    const server = app.listen(config.port, () => {
      logger.info(`Server running on port ${config.port}`);
    });

    process.on("unhandledRejection", (err) => {
      logger.error("Unhandled Rejection:", err?.message);
      logger.info("Shutting down due to unhandled rejection...");
      server.close(() => process.exit(1));
    });

    process.on("SIGTERM", () => shutdown(server, "SIGTERM"));
    process.on("SIGINT", () => shutdown(server, "SIGINT"));
  } catch (error) {
    logger.error("Error starting server:", error?.message);
    process.exit(1);
  }
};

startServer();
