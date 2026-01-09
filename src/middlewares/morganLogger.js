import morgan from "morgan";
import chalk from "chalk";

const colorByStatus = (status, message) => {
  if (status >= 500) return chalk.red(message); // Server error
  if (status >= 400) return chalk.yellow(message); // Client error
  if (status >= 300) return chalk.cyan(message); // Redirection
  if (status >= 200) return chalk.green(message); // Success
  return chalk.white(message); // Info / Others
};

const morganMiddleware = morgan((tokens, req, res) => {
  const method = tokens.method(req, res);
  const url = tokens.url(req, res);
  const status = Number(tokens.status(req, res));
  const responseTime = tokens["response-time"](req, res);

  const rawMessage = `${method} ${url} ${status} - ${responseTime} ms`;
  return colorByStatus(status, rawMessage);
});

export default morganMiddleware;

