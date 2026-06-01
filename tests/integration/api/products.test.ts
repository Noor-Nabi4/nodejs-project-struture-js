import request from "supertest";
import { getTestApp } from "../../helpers/app.js";
import { API_PREFIX } from "../../helpers/auth.js";
import {
  createProductInDb,
  createProductsInDb,
} from "../../helpers/factories/product.factory.js";

describe("Products API — dual pagination", () => {
  describe("GET /products", () => {
    it("returns page-based pagination shape", async () => {
      const app = await getTestApp();
      await createProductsInDb(3, { brand: "PaginatePage" });

      const res = await request(app)
        .get(`${API_PREFIX}/products`)
        .query({ brand: "PaginatePage", page: 1, limit: 2 });

      expect(res.status).toBe(200);
      expect(res.body).toMatchObject({
        success: true,
        pagination: {
          type: "page",
          page: 1,
          limit: 2,
          total: 3,
          pages: 2,
        },
      });
      expect(res.body.data).toHaveLength(2);
    });

    it("returns cursor-based pagination shape with nextCursor", async () => {
      const app = await getTestApp();
      await createProductsInDb(4, { brand: "PaginateCursor" });

      const first = await request(app)
        .get(`${API_PREFIX}/products`)
        .query({ brand: "PaginateCursor", limit: 2 });

      expect(first.body.pagination).toMatchObject({
        type: "cursor",
        hasMore: true,
        limit: 2,
      });
      expect(first.body.pagination.nextCursor).toBeTruthy();

      const second = await request(app).get(`${API_PREFIX}/products`).query({
        brand: "PaginateCursor",
        limit: 2,
        cursor: first.body.pagination.nextCursor,
      });

      expect(second.body.pagination.type).toBe("cursor");
      expect(second.body.data).toHaveLength(2);
    });

    it("prefers cursor over page when both query params are sent", async () => {
      const app = await getTestApp();
      await createProductsInDb(3, { brand: "PaginatePriority" });

      const cursorRes = await request(app)
        .get(`${API_PREFIX}/products`)
        .query({ brand: "PaginatePriority", limit: 1 });

      const res = await request(app).get(`${API_PREFIX}/products`).query({
        brand: "PaginatePriority",
        limit: 1,
        page: 99,
        cursor: cursorRes.body.pagination.nextCursor,
      });

      expect(res.body.pagination.type).toBe("cursor");
      expect(res.body.pagination).not.toHaveProperty("page");
    });

    it("applies filters with cursor pagination", async () => {
      const app = await getTestApp();
      await createProductInDb({
        brand: "FilterCursor",
        price: 1200,
        title: "Paint A",
      });
      await createProductInDb({
        brand: "FilterCursor",
        price: 3000,
        title: "Paint B",
      });

      const res = await request(app).get(`${API_PREFIX}/products`).query({
        brand: "FilterCursor",
        minPrice: 1000,
        maxPrice: 2000,
        limit: 10,
      });

      expect(res.status).toBe(200);
      expect(res.body.data).toHaveLength(1);
      expect(res.body.data[0].title).toBe("Paint A");
    });

    it("returns 400 for invalid cursor", async () => {
      const app = await getTestApp();
      const res = await request(app)
        .get(`${API_PREFIX}/products`)
        .query({ cursor: "invalid-cursor" });

      expect(res.status).toBe(400);
      expect(res.body).toMatchObject({
        success: false,
        message: "Invalid pagination cursor",
      });
    });
  });
});
