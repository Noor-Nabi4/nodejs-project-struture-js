const LOG_LEVELS = { error: 0, warn: 1, info: 2, debug: 3 };
const level = LOG_LEVELS[process.env.LOG_LEVEL] ?? LOG_LEVELS.info;

function log(levelName, ...args) {
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
  error: (...args) => log("error", ...args),
  warn: (...args) => log("warn", ...args),
  info: (...args) => log("info", ...args),
  debug: (...args) => log("debug", ...args),
};

export default logger;
