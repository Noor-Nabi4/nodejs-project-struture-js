import * as productService from "../../../src/services/productService.js";
import { createProductInDb } from "../../helpers/factories/product.factory.js";

describe("productService", () => {
  describe("buildProductFilter", () => {
    it("builds price range and brand filters", () => {
      const filter = productService.buildProductFilter({
        brand: "Dulux",
        minPrice: 500,
        maxPrice: 2000,
      });
      expect(filter.brand).toBeInstanceOf(RegExp);
      expect(filter.price).toEqual({ $gte: 500, $lte: 2000 });
    });

    it("returns empty filter for empty query", () => {
      expect(productService.buildProductFilter({})).toEqual({});
    });
  });

  describe("listProducts", () => {
    it("combines filters with page pagination", async () => {
      await createProductInDb({
        brand: "Combo",
        price: 1500,
        isFeatured: true,
      });
      await createProductInDb({
        brand: "Combo",
        price: 2500,
        isFeatured: false,
      });

      const result = await productService.listProducts({
        brand: "Combo",
        minPrice: 1000,
        maxPrice: 2000,
        page: 1,
        limit: 10,
      });

      expect(result.pagination.type).toBe("page");
      expect(result.data).toHaveLength(1);
      expect(result.data[0].price).toBe(1500);
    });
  });
});
