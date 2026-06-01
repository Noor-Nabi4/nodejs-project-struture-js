import type { FilterQuery, Model, SortOrder } from "mongoose";

export type PaginationMode = "page" | "cursor";

export interface PaginationQueryInput {
  page?: number | string;
  limit?: number | string;
  cursor?: string;
}

export interface DecodedCursor {
  createdAt: Date;
  id: string;
}

export interface PaginationBuildResult {
  mode: PaginationMode;
  limit: number;
  sort: Record<string, SortOrder>;
  page?: number;
  skip?: number;
  cursorFilter?: FilterQuery<unknown>;
}

export interface PagePaginationMeta {
  type: "page";
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export interface CursorPaginationMeta {
  type: "cursor";
  nextCursor: string | null;
  hasMore: boolean;
  limit: number;
}

export type PaginationMeta = PagePaginationMeta | CursorPaginationMeta;

export interface PaginatedResult<T> {
  data: T[];
  pagination: PaginationMeta;
}

export interface ExecutePaginatedQueryOptions<T> {
  model: Model<T>;
  baseFilter?: FilterQuery<T>;
  pagination: PaginationBuildResult;
}

export interface CursorSource {
  createdAt: Date;
  _id: { toString(): string };
}
