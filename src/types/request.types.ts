import type { Request } from "express";

export type TypedRequestBody<TBody> = Request & {
  body: TBody;
};

export type TypedRequestQuery<TQuery> = Request & {
  query: TQuery;
};

export type TypedRequestParams<TParams> = Request & {
  params: TParams;
};
