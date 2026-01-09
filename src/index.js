import app from "./app.js";
import connectDB, { disconnectDB } from "./config/db.js";
import { env } from "./config/env.js";

// Load environment configuration (this will validate required env vars)
// The env.js file handles dotenv.config() internally

// Handle uncaught exceptions (synchronous errors)
process.on("uncaughtException", (err) => {
  console.error("❌ Uncaught Exception:", err.message);
  console.error(err.stack);
  console.log("Shutting down server due to Uncaught Exception...");
  process.exit(1);
});

// Start server function
const startServer = async () => {
  try {
    // Connect to the database
    await connectDB();

    // Start the server
    const server = app.listen(env.PORT, () => {
      console.log(`🚀 Server is running on port: ${env.PORT}`);
      console.log(`📝 Environment: ${env.NODE_ENV}`);
      console.log(`🌐 API Base URL: http://localhost:${env.PORT}/api/v1`);
    });

    // Handle unhandled promise rejections (asynchronous errors)
    process.on("unhandledRejection", (err) => {
      console.error("❌ Unhandled Rejection:", err.message);
      console.error(err.stack);
      console.log("Shutting down server due to Unhandled Rejection...");
      server.close(() => {
        process.exit(1);
      });
    });

    // Graceful shutdown on SIGTERM
    process.on("SIGTERM", async () => {
      console.log("⚠️  SIGTERM signal received: closing HTTP server");
      server.close(async () => {
        console.log("HTTP server closed");
        await disconnectDB();
      });
    });
  } catch (error) {
    console.error("❌ Error starting the server:", error);
    process.exit(1);
  }
};

// Start the server
startServer();
