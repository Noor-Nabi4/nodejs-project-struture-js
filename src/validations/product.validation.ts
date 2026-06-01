import { z } from "zod";
import { paginationQuerySchema } from "./pagination.validation.js";

const sortValues = ["price_asc", "price_desc", "newest", "oldest"] as const;

/**
 * Unified GET /api/v1/products query (filters + dual pagination).
 * Cursor param takes priority over page when both are sent.
 */
export const productListQuerySchema = paginationQuerySchema.extend({
  category: z.string().optional(),
  subCategory: z.string().optional(),
  brand: z.string().optional(),
  minPrice: z.coerce.number().nonnegative().optional(),
  maxPrice: z.coerce.number().nonnegative().optional(),
  search: z.string().trim().optional(),
  tags: z.string().optional(),
  isFeatured: z
    .enum(["true", "false"])
    .transform((v) => v === "true")
    .optional(),
  isActive: z
    .enum(["true", "false"])
    .transform((v) => v === "true")
    .optional(),
  stockStatus: z.string().optional(),
  sort: z.enum(sortValues).optional(),
});

export type ProductListQuery = z.infer<typeof productListQuerySchema>;
