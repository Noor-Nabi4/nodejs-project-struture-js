import mongoose from "mongoose";
import config from "./index.js";
import logger from "../utils/logger.js";

const connectDB = async (): Promise<void> => {
  try {
    const conn = await mongoose.connect(config.mongoUri, {
      maxPoolSize: 10,
    });
    logger.info(`MongoDB Connected: ${conn.connection.name}`);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    logger.error("MongoDB connection error:", message);
    process.exit(1);
  }
};

export default connectDB;
