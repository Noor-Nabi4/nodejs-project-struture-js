import type { NextFunction, Request, Response, RequestHandler } from "express";
import { safelyDeleteFile } from "../utils/fileSystem.js";

type AsyncRequestHandler<TReq extends Request = Request> = (
  req: TReq,
  res: Response,
  next: NextFunction
) => Promise<void | Response | undefined>;

const catchAsyncErrors = <TReq extends Request = Request>(
  theFunc: AsyncRequestHandler<TReq>
): RequestHandler => {
  return async (req, res, next) => {
    try {
      await theFunc(req as TReq, res, next);
    } catch (err) {
      try {
        const filesToDelete: string[] = [];

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
      } catch {
        // ignore cleanup errors
      }

      next(err);
    }
  };
};

export default catchAsyncErrors;
