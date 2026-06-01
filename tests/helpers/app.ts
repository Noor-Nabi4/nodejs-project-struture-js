import type { Application } from "express";

let cachedApp: Application | null = null;

export const getTestApp = async (): Promise<Application> => {
  if (!cachedApp) {
    const module = await import("../../src/app.js");
    cachedApp = module.default;
  }
  return cachedApp;
};

export const resetTestAppCache = (): void => {
  cachedApp = null;
};
