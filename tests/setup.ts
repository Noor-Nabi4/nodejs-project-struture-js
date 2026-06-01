process.env.NODE_ENV = "test";
process.env.JWT_SECRET = "test-jwt-secret-for-api-tests";
process.env.JWT_EXPIRE = "1d";
process.env.MAX_API_RATE_LIMIT = "10000";

import { beforeAll, afterAll, afterEach } from "@jest/globals";
import { connectTestDb, clearTestDb, disconnectTestDb } from "./helpers/db.js";

beforeAll(async () => {
  await connectTestDb();
});

afterEach(async () => {
  await clearTestDb();
});

afterAll(async () => {
  await disconnectTestDb();
});
