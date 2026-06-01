import type { NextFunction, Request, Response, RequestHandler } from "express";
import { z, type ZodTypeAny } from "zod";
import ErrorHandler from "../utils/errorHandler.js";
import { HTTP_STATUS } from "../config/constants.js";
import type { ValidationFieldError } from "../types/errors.types.js";

export interface RequestValidationSchema {
  body?: ZodTypeAny;
  params?: ZodTypeAny;
  query?: ZodTypeAny;
}

const isRequestValidationSchema = (
  schema: ZodTypeAny | RequestValidationSchema
): schema is RequestValidationSchema =>
  typeof schema === "object" &&
  schema !== null &&
  ("body" in schema || "params" in schema || "query" in schema);

export const formatZodErrors = (error: z.ZodError): ValidationFieldError[] =>
  error.issues.map((issue) => ({
    field: issue.path.join(".") || "body",
    message: issue.message,
  }));

/**
 * Validate req.body, req.params, and/or req.query with Zod schemas.
 */
export const validateRequest = (
  schema: ZodTypeAny | RequestValidationSchema
): RequestHandler => {
  if (!schema) {
    throw new Error("validateRequest(): schema is required");
  }

  return (req: Request, _res: Response, next: NextFunction) => {
    try {
      const schemas: RequestValidationSchema = isRequestValidationSchema(schema)
        ? schema
        : { body: schema };

      if (schemas.body) {
        req.body = schemas.body.parse(req.body);
      }
      if (schemas.params) {
        req.params = schemas.params.parse(req.params) as Request["params"];
      }
      if (schemas.query) {
        req.query = schemas.query.parse(req.query) as Request["query"];
      }

      next();
    } catch (err) {
      if (err instanceof z.ZodError) {
        return next(
          new ErrorHandler(
            "Validation failed",
            HTTP_STATUS.BAD_REQUEST,
            formatZodErrors(err)
          )
        );
      }
      next(err);
    }
  };
};
