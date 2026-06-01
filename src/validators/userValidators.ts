import Joi from "joi";

export const updateProfileSchema = Joi.object({
  firstName: Joi.string()
    .trim()
    .min(1)
    .optional()
    .messages({ "string.min": "First name cannot be empty" }),
  lastName: Joi.string()
    .trim()
    .min(1)
    .optional()
    .messages({ "string.min": "Last name cannot be empty" }),
  username: Joi.string()
    .trim()
    .min(3)
    .optional()
    .messages({ "string.min": "Username must be at least 3 characters" }),
  email: Joi.string()
    .trim()
    .email()
    .optional()
    .messages({ "string.email": "Valid email required" }),
  phoneNumber: Joi.string().trim().optional(),
}).min(1);
