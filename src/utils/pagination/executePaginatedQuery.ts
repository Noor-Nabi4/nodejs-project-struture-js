import type { FilterQuery } from "mongoose";
import type {
  CursorPaginationMeta,
  ExecutePaginatedQueryOptions,
  PagePaginationMeta,
  PaginatedResult,
} from "../../types/pagination.types.js";
import { encodeCursor } from "./cursor.js";

type LeanDoc = {
  createdAt?: Date;
  _id: { toString(): string };
};

export const executePaginatedQuery = async <T>({
  model,
  baseFilter = {},
  pagination,
}: ExecutePaginatedQueryOptions<T>): Promise<PaginatedResult<T>> => {
  const filter: FilterQuery<T> = {
    ...baseFilter,
    ...(pagination.cursorFilter as FilterQuery<T> | undefined),
  };

  if (pagination.mode === "cursor") {
    const docs = (await model
      .find(filter)
      .sort(pagination.sort)
      .limit(pagination.limit + 1)
      .lean()) as unknown as LeanDoc[];

    const hasMore = docs.length > pagination.limit;
    const pageDocs = hasMore ? docs.slice(0, pagination.limit) : docs;
    const last = pageDocs[pageDocs.length - 1];

    const meta: CursorPaginationMeta = {
      type: "cursor",
      nextCursor:
        hasMore && last?.createdAt
          ? encodeCursor({
              createdAt: last.createdAt,
              _id: last._id,
            })
          : null,
      hasMore,
      limit: pagination.limit,
    };

    return { data: pageDocs as T[], pagination: meta };
  }

  const page = pagination.page ?? 1;
  const [docs, total] = await Promise.all([
    model
      .find(filter)
      .sort(pagination.sort)
      .skip(pagination.skip ?? 0)
      .limit(pagination.limit)
      .lean(),
    model.countDocuments(filter),
  ]);

  const meta: PagePaginationMeta = {
    type: "page",
    page,
    limit: pagination.limit,
    total,
    pages: total === 0 ? 0 : Math.ceil(total / pagination.limit),
  };

  return { data: docs as T[], pagination: meta };
};
