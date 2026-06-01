import dotenv from "dotenv";
dotenv.config();

import mongoose from "mongoose";
import type { Server } from "http";
import app from "./app.js";
import connectDB from "./config/db.js";
import config from "./config/index.js";
import logger from "./utils/logger.js";

process.on("uncaughtException", (err: Error) => {
  logger.error("Uncaught Exception:", err.message);
  logger.info("Shutting down due to uncaught exception...");
  process.exit(1);
});

const SHUTDOWN_TIMEOUT_MS = 10000;

const shutdown = (server: Server, signal: string): void => {
  logger.info(`${signal} received. Shutting down gracefully.`);
  const forceExit = (): void => {
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
      .catch((err: Error) => {
        clearTimeout(t);
        logger.error("Error closing DB:", err?.message);
        process.exit(1);
      });
  });
};

const startServer = async (): Promise<void> => {
  try {
    await connectDB();

    const server = app.listen(config.port, () => {
      logger.info(`Server running on port ${config.port}`);
    });

    process.on("unhandledRejection", (err: unknown) => {
      const message = err instanceof Error ? err.message : String(err);
      logger.error("Unhandled Rejection:", message);
      logger.info("Shutting down due to unhandled rejection...");
      server.close(() => process.exit(1));
    });

    process.on("SIGTERM", () => shutdown(server, "SIGTERM"));
    process.on("SIGINT", () => shutdown(server, "SIGINT"));
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    logger.error("Error starting server:", message);
    process.exit(1);
  }
};

void startServer();
