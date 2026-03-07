import ErrorHandler from "../utils/errorHandler.js";
import { HTTP_STATUS } from "../config/constants.js";

/**
 * Validate request using Joi schema(s).
 * @param {Object|import("joi").Schema} schemaOrSchemas - A single Joi schema (validates body) or { body, params, query } with Joi schemas
 */
export const validate = (schemaOrSchemas) => {
  if (!schemaOrSchemas) {
    throw new Error("validate(): schema or schemas object is required");
  }
  return async (req, res, next) => {
    try {
      const isMulti =
        schemaOrSchemas?.body != null ||
        schemaOrSchemas?.params != null ||
        schemaOrSchemas?.query != null;
      const schemas = isMulti ? schemaOrSchemas : { body: schemaOrSchemas };

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
      if (err.name === "ValidationError") {
        const errors =
          err.details?.map((d) => ({
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
