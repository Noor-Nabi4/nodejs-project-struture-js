const env = process.env.NODE_ENV || "development";
const isProduction = env === "production";

const config = {
  env,
  isProduction,
  port: parseInt(process.env.PORT ?? "", 10) || 8000,
  mongoUri: process.env.MONGO_URI || "mongodb://127.0.0.1:27017/inventory",
  recordsPerPage: parseInt(process.env.RECORDS_PER_PAGE ?? "", 10) || 10,
  jwt: {
    secret:
      process.env.JWT_SECRET ||
      (isProduction ? null : "dev-secret-change-in-production"),
    expire: process.env.JWT_EXPIRE || "1d",
    cookieExpireDays: parseInt(process.env.COOKIE_EXPIRE ?? "", 10) || 1,
  },
  rateLimit: {
    max: parseInt(process.env.MAX_API_RATE_LIMIT ?? "", 10) || 100,
    windowMs: 15 * 60 * 1000,
  },
  smtp: {
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT ?? "", 10),
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
    mail: process.env.SMTP_MAIL,
  },
} as const;

if (isProduction && !config.jwt.secret) {
  throw new Error("JWT_SECRET is required in production");
}

export default config;
