import type { SortOrder } from "mongoose";
import { PAGINATION } from "../../config/constants.js";
import type {
  PaginationBuildResult,
  PaginationQueryInput,
} from "../../types/pagination.types.js";
import { buildCursorRangeFilter, decodeCursor } from "./cursor.js";

export const DEFAULT_CURSOR_SORT: Record<string, SortOrder> = {
  createdAt: -1,
  _id: -1,
};

const parseLimit = (raw?: number | string): number => {
  const parsed = raw != null ? Number(raw) : NaN;
  const limit =
    Number.isFinite(parsed) && parsed > 0 ? parsed : PAGINATION.DEFAULT_LIMIT;
  return Math.min(Math.max(limit, 1), PAGINATION.MAX_LIMIT);
};

const parsePage = (raw?: number | string): number => {
  const parsed = raw != null ? Number(raw) : NaN;
  return Number.isFinite(parsed) && parsed > 0
    ? Math.floor(parsed)
    : PAGINATION.DEFAULT_PAGE;
};

export interface BuildPaginationOptions {
  /** Sort for page mode (cursor mode always uses createdAt + _id). */
  sort?: Record<string, SortOrder>;
}

const hasPageParam = (query: PaginationQueryInput): boolean =>
  query.page !== undefined && query.page !== "";

/**
 * Detect pagination mode from query params.
 * - `cursor` present → cursor mode (cursor wins if page is also sent)
 * - `page` present (no cursor) → page mode (skip + limit)
 * - otherwise → cursor mode first page (limit only; for infinite scroll)
 */
export const buildPagination = (
  query: PaginationQueryInput,
  options: BuildPaginationOptions = {}
): PaginationBuildResult => {
  const limit = parseLimit(query.limit);
  const pageSort = options.sort ?? DEFAULT_CURSOR_SORT;

  if (query.cursor) {
    const decoded = decodeCursor(query.cursor);
    return {
      mode: "cursor",
      limit,
      sort: DEFAULT_CURSOR_SORT,
      cursorFilter: buildCursorRangeFilter(decoded),
    };
  }

  if (hasPageParam(query)) {
    const page = parsePage(query.page);
    return {
      mode: "page",
      limit,
      page,
      skip: (page - 1) * limit,
      sort: pageSort,
    };
  }

  return {
    mode: "cursor",
    limit,
    sort: DEFAULT_CURSOR_SORT,
  };
};
