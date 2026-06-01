export interface ValidationFieldError {
  field: string;
  message: string;
}

export interface MongooseValidationError extends Error {
  name: "ValidationError";
  errors: Record<string, { message: string }>;
}

export interface MongoDuplicateKeyError extends Error {
  code: 11000;
  keyValue?: Record<string, unknown>;
}

export interface MongooseCastError extends Error {
  name: "CastError";
  path?: string;
}
