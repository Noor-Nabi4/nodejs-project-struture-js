import { z } from "zod";
import { PAGINATION } from "../config/constants.js";

export const paginationQuerySchema = z.object({
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce
    .number()
    .int()
    .positive()
    .max(PAGINATION.MAX_LIMIT)
    .optional(),
  cursor: z.string().trim().min(1, "Cursor cannot be empty").optional(),
});

export type PaginationQuery = z.infer<typeof paginationQuerySchema>;
