import { unlink } from "fs/promises";
import logger from "./logger.js";

/**
 * Delete a file at path. Ignores errors (e.g. already deleted, missing).
 * Use for cleanup of uploaded files on request error.
 */
export async function safelyDeleteFile(filePath) {
  if (!filePath || typeof filePath !== "string") return;
  try {
    await unlink(filePath);
  } catch (err) {
    if (err.code !== "ENOENT") {
      logger.warn("File cleanup failed:", filePath, err.message);
    }
  }
}
