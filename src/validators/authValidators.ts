import Joi from "joi";

export const signupSchema = Joi.object({
  firstName: Joi.string()
    .trim()
    .required()
    .messages({ "string.empty": "First name is required" }),
  lastName: Joi.string()
    .trim()
    .required()
    .messages({ "string.empty": "Last name is required" }),
  username: Joi.string().trim().min(3).required().messages({
    "string.empty": "Username is required",
    "string.min": "Username must be at least 3 characters",
  }),
  email: Joi.string().trim().email().required().messages({
    "string.empty": "Email is required",
    "string.email": "Valid email is required",
  }),
  phoneNumber: Joi.string()
    .trim()
    .required()
    .messages({ "string.empty": "Phone number is required" }),
  password: Joi.string().min(6).required().messages({
    "string.empty": "Password is required",
    "string.min": "Password must be at least 6 characters",
  }),
});

export const signinSchema = Joi.object({
  email: Joi.string()
    .trim()
    .required()
    .messages({ "string.empty": "Email or username is required" }),
  password: Joi.string()
    .required()
    .messages({ "string.empty": "Password is required" }),
});

export const forgotPasswordSchema = Joi.object({
  email: Joi.string().trim().email().required().messages({
    "string.empty": "Email is required",
    "string.email": "Valid email is required",
  }),
});

const resetPasswordBodySchema = Joi.object({
  password: Joi.string().min(6).required().messages({
    "string.empty": "Password is required",
    "string.min": "Password must be at least 6 characters",
  }),
  confirmPassword: Joi.string().valid(Joi.ref("password")).required().messages({
    "any.only": "Passwords do not match",
  }),
});

const resetPasswordParamsSchema = Joi.object({
  token: Joi.string()
    .required()
    .messages({ "string.empty": "Reset token is required" }),
});

export const resetPasswordSchemas = {
  body: resetPasswordBodySchema,
  params: resetPasswordParamsSchema,
};

export const changePasswordSchema = Joi.object({
  oldPassword: Joi.string()
    .required()
    .messages({ "string.empty": "Current password is required" }),
  password: Joi.string().min(6).required().messages({
    "string.empty": "New password is required",
    "string.min": "New password must be at least 6 characters",
  }),
});
