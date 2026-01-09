import { PrismaClient } from "@prisma/client";
import { env } from "./env.js";

/**
 * Prisma Client instance
 * Singleton pattern to prevent multiple instances
 */
const globalForPrisma = globalThis;

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log:
      env.NODE_ENV === "development"
        ? ["query", "error", "warn"]
        : ["error"],
  });

if (env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

/**
 * Connect to PostgreSQL database
 */
const connectDB = async () => {
  try {
    await prisma.$connect();
    console.log("✅ PostgreSQL Connected via Prisma");
    console.log(`   Database: ${new URL(env.DATABASE_URL).pathname.slice(1)}`);
  } catch (error) {
    console.error("❌ PostgreSQL connection error:", error.message);
    process.exit(1);
  }
};

/**
 * Disconnect from database
 */
export const disconnectDB = async () => {
  try {
    await prisma.$disconnect();
    console.log("PostgreSQL disconnected");
  } catch (error) {
    console.error("Error disconnecting from database:", error);
  }
};

// Handle graceful shutdown
process.on("SIGINT", async () => {
  await disconnectDB();
  process.exit(0);
});

process.on("SIGTERM", async () => {
  await disconnectDB();
  process.exit(0);
});

export default connectDB;
