import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";

let mongoServer: MongoMemoryServer | null = null;

export async function connectTestDb(): Promise<void> {
  if (mongoose.connection.readyState === 1) return;

  if (!mongoServer) {
    mongoServer = await MongoMemoryServer.create();
  }

  await mongoose.connect(mongoServer.getUri());
}

export async function clearTestDb(): Promise<void> {
  if (mongoose.connection.readyState !== 1) return;
  const { collections } = mongoose.connection;
  await Promise.all(
    Object.values(collections).map((collection) => collection.deleteMany({}))
  );
}

export async function disconnectTestDb(): Promise<void> {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }
  if (mongoServer) {
    await mongoServer.stop();
    mongoServer = null;
  }
}
