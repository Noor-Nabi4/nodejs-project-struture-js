import { env } from "./src/config/env.js";

export default {
  datasource: {
    url: env.DATABASE_URL,
  },
};

