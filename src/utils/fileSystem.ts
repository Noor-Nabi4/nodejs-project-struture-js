import { unlink } from "fs/promises";
import logger from "./logger.js";

/**
 * Delete a file at path. Ignores errors (e.g. already deleted, missing).
 * Use for cleanup of uploaded files on request error.
 */
export async function safelyDeleteFile(filePath: string): Promise<void> {
  if (!filePath || typeof filePath !== "string") return;
  try {
    await unlink(filePath);
  } catch (err) {
    const code =
      err && typeof err === "object" && "code" in err
        ? (err as NodeJS.ErrnoException).code
        : undefined;
    if (code !== "ENOENT") {
      const message = err instanceof Error ? err.message : String(err);
      logger.warn("File cleanup failed:", filePath, message);
    }
  }
}
