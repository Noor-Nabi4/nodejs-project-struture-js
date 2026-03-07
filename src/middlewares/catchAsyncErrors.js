import { safelyDeleteFile } from "../utils/fileSystem.js";

export default (theFunc) => async (req, res, next) => {
  try {
    await theFunc(req, res, next);
  } catch (err) {
    try {
      const filesToDelete = [];

      if (req.file?.path) {
        filesToDelete.push(req.file.path);
      }

      if (req.files) {
        if (Array.isArray(req.files)) {
          req.files.forEach((f) => f?.path && filesToDelete.push(f.path));
        } else {
          Object.values(req.files)
            .flat()
            .forEach((f) => {
              if (f?.path) filesToDelete.push(f.path);
            });
        }
      }

      await Promise.all(
        filesToDelete.map(async (filePath) => {
          await safelyDeleteFile(filePath);
        })
      );
    } catch (cleanupErr) {}

    next(err);
  }
};
