type LogLevel = "error" | "warn" | "info" | "debug";

const LOG_LEVELS: Record<LogLevel, number> = {
  error: 0,
  warn: 1,
  info: 2,
  debug: 3,
};

const envLevel = process.env.LOG_LEVEL as LogLevel | undefined;
const level = envLevel && envLevel in LOG_LEVELS ? LOG_LEVELS[envLevel] : LOG_LEVELS.info;

function log(levelName: LogLevel, ...args: unknown[]): void {
  if (LOG_LEVELS[levelName] > level) return;
  const timestamp = new Date().toISOString();
  const prefix = `[${timestamp}] [${levelName.toUpperCase()}]`;
  if (levelName === "error") {
    console.error(prefix, ...args);
  } else {
    console.log(prefix, ...args);
  }
}

const logger = {
  error: (...args: unknown[]) => log("error", ...args),
  warn: (...args: unknown[]) => log("warn", ...args),
  info: (...args: unknown[]) => log("info", ...args),
  debug: (...args: unknown[]) => log("debug", ...args),
};

export default logger;
