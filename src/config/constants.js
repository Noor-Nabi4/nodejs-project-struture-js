const Constants = {
  MAX_API_RATE_LIMIT: 10,
  USER_ROLES: {
    ADMIN: "ADMIN",
    USER: "USER",
  },
  JWT: {
    SECRET_KEY: "your-secret-key",
    EXPIRATION_TIME: "1h", // 1 hour
    COOKIE_EXPIRE: 1,
  },
};
export default Constants;
