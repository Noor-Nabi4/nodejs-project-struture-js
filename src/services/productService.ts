import type { FilterQuery, SortOrder } from "mongoose";
import { Types } from "mongoose";
import Product, { type IProduct } from "../models/productModel.js";
import type { ProductListQuery } from "../validations/product.validation.js";
import type { PaginatedResult } from "../types/pagination.types.js";
import {
  buildPagination,
  executePaginatedQuery,
} from "../utils/pagination/index.js";

export const buildProductFilter = (
  query: ProductListQuery
): FilterQuery<IProduct> => {
  const filter: FilterQuery<IProduct> = {};

  if (query.category && Types.ObjectId.isValid(query.category)) {
    filter.category = new Types.ObjectId(query.category);
  }
  if (query.subCategory && Types.ObjectId.isValid(query.subCategory)) {
    filter.subCategory = new Types.ObjectId(query.subCategory);
  }
  if (query.brand) {
    filter.brand = new RegExp(query.brand, "i");
  }
  if (query.minPrice != null || query.maxPrice != null) {
    filter.price = {};
    if (query.minPrice != null) filter.price.$gte = query.minPrice;
    if (query.maxPrice != null) filter.price.$lte = query.maxPrice;
  }
  if (query.isFeatured != null) {
    filter.isFeatured = query.isFeatured;
  }
  if (query.isActive != null) {
    filter.isActive = query.isActive;
  }
  if (query.tags) {
    const tagList = query.tags
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);
    if (tagList.length) filter.tags = { $in: tagList };
  }
  if (query.stockStatus === "in_stock") {
    filter.isActive = true;
  }
  if (query.stockStatus === "out_of_stock") {
    filter.isActive = false;
  }
  if (query.search) {
    filter.$text = { $search: query.search };
  }

  return filter;
};

export const buildProductSort = (
  sort?: ProductListQuery["sort"]
): Record<string, SortOrder> => {
  switch (sort) {
    case "price_asc":
      return { price: 1, createdAt: -1, _id: -1 };
    case "price_desc":
      return { price: -1, createdAt: -1, _id: -1 };
    case "oldest":
      return { createdAt: 1, _id: 1 };
    case "newest":
    default:
      return { createdAt: -1, _id: -1 };
  }
};

export const listProducts = async (
  query: ProductListQuery
): Promise<PaginatedResult<IProduct>> => {
  const baseFilter = buildProductFilter(query);
  const sort = buildProductSort(query.sort);
  const pagination = buildPagination(query, { sort });

  return executePaginatedQuery<IProduct>({
    model: Product,
    baseFilter,
    pagination,
  });
};
