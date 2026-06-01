import { Types } from "mongoose";
import {
  buildPagination,
  decodeCursor,
  encodeCursor,
  executePaginatedQuery,
} from "../../../src/utils/pagination/index.js";
import Product from "../../../src/models/productModel.js";
import { createProductsInDb } from "../../helpers/factories/product.factory.js";
import ErrorHandler from "../../../src/utils/errorHandler.js";

describe("pagination utils", () => {
  describe("cursor codec", () => {
    it("encodes and decodes createdAt + _id", () => {
      const createdAt = new Date("2024-01-15T10:00:00.000Z");
      const id = new Types.ObjectId().toHexString();
      const cursor = encodeCursor({ createdAt, _id: { toString: () => id } });
      const decoded = decodeCursor(cursor);
      expect(decoded.createdAt.toISOString()).toBe(createdAt.toISOString());
      expect(decoded.id).toBe(id);
    });

    it("throws 400 for invalid cursor", () => {
      expect(() => decodeCursor("not-valid")).toThrow(ErrorHandler);
    });
  });

  describe("buildPagination", () => {
    it("uses page mode only when page param is provided", () => {
      const plan = buildPagination({ page: 2, limit: 10 });
      expect(plan.mode).toBe("page");
      expect(plan.skip).toBe(10);
      expect(plan.limit).toBe(10);
      expect(plan.page).toBe(2);
    });

    it("defaults to cursor mode when only limit is provided", () => {
      const plan = buildPagination({ limit: 10 });
      expect(plan.mode).toBe("cursor");
      expect(plan.cursorFilter).toBeUndefined();
    });

    it("prefers cursor mode when cursor and page are both provided", () => {
      const createdAt = new Date();
      const id = new Types.ObjectId();
      const cursor = encodeCursor({ createdAt, _id: id });
      const plan = buildPagination({ cursor, page: 3, limit: 5 });
      expect(plan.mode).toBe("cursor");
      expect(plan.cursorFilter).toBeDefined();
      expect(plan.skip).toBeUndefined();
    });
  });

  describe("executePaginatedQuery", () => {
    it("returns page pagination metadata with total and pages", async () => {
      await createProductsInDb(5, { brand: "PageBrand" });
      const pagination = buildPagination({ page: 1, limit: 2 });
      const result = await executePaginatedQuery({
        model: Product,
        baseFilter: { brand: "PageBrand" },
        pagination,
      });

      expect(result.pagination).toMatchObject({
        type: "page",
        page: 1,
        limit: 2,
        total: 5,
        pages: 3,
      });
      expect(result.data).toHaveLength(2);
    });

    it("returns cursor pagination without using skip", async () => {
      await createProductsInDb(5, { brand: "CursorBrand" });
      const first = await executePaginatedQuery({
        model: Product,
        baseFilter: { brand: "CursorBrand" },
        pagination: buildPagination({ limit: 2 }),
      });

      expect(first.pagination.type).toBe("cursor");
      if (first.pagination.type !== "cursor") return;

      expect(first.pagination.hasMore).toBe(true);
      expect(first.pagination.nextCursor).toBeTruthy();

      const second = await executePaginatedQuery({
        model: Product,
        baseFilter: { brand: "CursorBrand" },
        pagination: buildPagination({
          cursor: first.pagination.nextCursor!,
          limit: 2,
        }),
      });

      expect(second.data).toHaveLength(2);
      const firstIds = first.data.map((p) =>
        String((p as { _id: unknown })._id)
      );
      const overlap = second.data.filter((p) =>
        firstIds.includes(String((p as { _id: unknown })._id))
      );
      expect(overlap).toHaveLength(0);
    });
  });
});
