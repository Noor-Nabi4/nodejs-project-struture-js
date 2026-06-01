import { productListQuerySchema } from "../../../src/validations/product.validation.js";

describe("productListQuerySchema", () => {
  it("parses combined filters for unified product list API", () => {
    const result = productListQuerySchema.safeParse({
      category: "paint",
      minPrice: "1000",
      maxPrice: "5000",
      search: "primer",
      sort: "price_asc",
      page: "1",
      limit: "20",
      isFeatured: "true",
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toMatchObject({
        category: "paint",
        minPrice: 1000,
        maxPrice: 5000,
        search: "primer",
        sort: "price_asc",
        page: 1,
        limit: 20,
        isFeatured: true,
      });
    }
  });

  it("accepts cursor pagination params", () => {
    const result = productListQuerySchema.safeParse({
      cursor: "Y3Vyc29yX3Rva2Vu",
      limit: "20",
    });
    expect(result.success).toBe(true);
  });

  it("accepts empty query object", () => {
    const result = productListQuerySchema.safeParse({});
    expect(result.success).toBe(true);
  });

  it("rejects invalid sort value", () => {
    const result = productListQuerySchema.safeParse({ sort: "invalid_sort" });
    expect(result.success).toBe(false);
  });

  it("rejects negative minPrice", () => {
    const result = productListQuerySchema.safeParse({ minPrice: "-5" });
    expect(result.success).toBe(false);
  });
});
