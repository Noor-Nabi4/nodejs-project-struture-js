import type { NextFunction, Request, Response, RequestHandler } from "express";
import type { Schema, ValidationError } from "joi";
import ErrorHandler from "../utils/errorHandler.js";
import { HTTP_STATUS } from "../config/constants.js";
import type { ValidationFieldError } from "../types/errors.types.js";

export interface ValidationSchemas {
  body?: Schema;
  params?: Schema;
  query?: Schema;
}

/**
 * Validate request using Joi schema(s).
 */
export const validate = (
  schemaOrSchemas: Schema | ValidationSchemas
): RequestHandler => {
  if (!schemaOrSchemas) {
    throw new Error("validate(): schema or schemas object is required");
  }
  return async (req: Request, _res: Response, next: NextFunction) => {
    try {
      const isMulti =
        "body" in schemaOrSchemas ||
        "params" in schemaOrSchemas ||
        "query" in schemaOrSchemas;
      const schemas: ValidationSchemas = isMulti
        ? (schemaOrSchemas as ValidationSchemas)
        : { body: schemaOrSchemas as Schema };

      if (schemas.body) {
        req.body = await schemas.body.validateAsync(req.body, {
          stripUnknown: true,
        });
      }
      if (schemas.params) {
        req.params = await schemas.params.validateAsync(req.params, {
          stripUnknown: true,
        });
      }
      if (schemas.query) {
        req.query = await schemas.query.validateAsync(req.query, {
          stripUnknown: true,
        });
      }

      next();
    } catch (err) {
      const validationErr = err as ValidationError;
      if (validationErr.name === "ValidationError") {
        const errors: ValidationFieldError[] =
          validationErr.details?.map((d) => ({
            field: d.path.join("."),
            message: d.message,
          })) || [];
        return next(
          new ErrorHandler("Validation failed", HTTP_STATUS.BAD_REQUEST, errors)
        );
      }
      next(err);
    }
  };
};
