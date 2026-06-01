import morgan from "morgan";
import chalk from "chalk";
import type { Request, Response } from "express";

const colorByStatus = (status: number, message: string): string => {
  if (status >= 500) return chalk.red(message);
  if (status >= 400) return chalk.yellow(message);
  if (status >= 300) return chalk.cyan(message);
  if (status >= 200) return chalk.green(message);
  return chalk.white(message);
};

const morganMiddleware = morgan((tokens, req: Request, res: Response) => {
  const method = tokens.method(req, res);
  const url = tokens.url(req, res);
  const status = Number(tokens.status(req, res));
  const responseTime = tokens["response-time"](req, res);

  const rawMessage = `${method} ${url} ${status} - ${responseTime} ms`;
  return colorByStatus(status, rawMessage);
});

export default morganMiddleware;
