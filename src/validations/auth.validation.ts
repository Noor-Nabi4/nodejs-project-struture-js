import { z } from "zod";

export const signupSchema = z.object({
  firstName: z.string().trim().min(1, "First name is required"),
  lastName: z.string().trim().min(1, "Last name is required"),
  username: z.string().trim().min(3, "Username must be at least 3 characters"),
  email: z
    .string()
    .trim()
    .min(1, "Email is required")
    .email("Valid email is required"),
  phoneNumber: z.string().trim().min(1, "Phone number is required"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const signinSchema = z.object({
  email: z.string().trim().min(1, "Email or username is required"),
  password: z.string().min(1, "Password is required"),
});

export const forgotPasswordSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, "Email is required")
    .email("Valid email is required"),
});

export const resetPasswordBodySchema = z
  .object({
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string().min(1, "Password is required"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const resetPasswordParamsSchema = z.object({
  token: z.string().min(1, "Reset token is required"),
});

export const resetPasswordSchema = {
  body: resetPasswordBodySchema,
  params: resetPasswordParamsSchema,
};

export const changePasswordSchema = z.object({
  oldPassword: z.string().min(1, "Current password is required"),
  password: z.string().min(6, "New password must be at least 6 characters"),
});

export type SignupInput = z.infer<typeof signupSchema>;
export type SigninInput = z.infer<typeof signinSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordBodyInput = z.infer<typeof resetPasswordBodySchema>;
export type ResetPasswordParamsInput = z.infer<
  typeof resetPasswordParamsSchema
>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
