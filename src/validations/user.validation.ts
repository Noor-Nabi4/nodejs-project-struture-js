import { z } from "zod";

export const updateProfileSchema = z
  .object({
    firstName: z
      .string()
      .trim()
      .min(1, "First name cannot be empty")
      .optional(),
    lastName: z.string().trim().min(1, "Last name cannot be empty").optional(),
    username: z
      .string()
      .trim()
      .min(3, "Username must be at least 3 characters")
      .optional(),
    email: z.string().trim().email("Valid email required").optional(),
    phoneNumber: z.string().trim().optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field is required",
  });

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
