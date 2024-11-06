import dotenv from "dotenv";
import app from "./app.js";
import connectDB from "./config/db.js";

// Handling uncaught exception
process.on("uncaughtException", (err) => {
  console.error(`Uncaught Exception: ${err.message}`);
  console.log("Shutting down server due to Uncaught Exception...");
  process.exit(1); // Exit process with failure code
});

// Configuring dotenv
dotenv.config();

// Connecting to the database before starting the server
const startServer = async () => {
  try {
    // Connect to the database
    await connectDB();

    // Starting the server after the database connection is established
    const server = app.listen(process.env.PORT, () => {
      console.log(`Server is running on port: ${process.env.PORT}`);
    });

    // Handling unhandled promise rejection
    process.on("unhandledRejection", (err) => {
      console.error(`Unhandled Rejection: ${err.message}`);
      console.log("Shutting down server due to Unhandled Rejection...");
      server.close(() => {
        process.exit(1);
      });
    });
  } catch (error) {
    console.error("Error starting the server:", error);
    process.exit(1); // Exit process with failure code
  }
};

startServer();
