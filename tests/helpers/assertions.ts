export interface ApiSuccessBody {
  success: true;
  message: string;
  data?: unknown;
  meta?: Record<string, unknown>;
}

export interface ApiErrorBody {
  success: false;
  message: string;
  errors?: unknown;
}

export const expectSuccessResponse = (
  body: unknown,
  options?: { hasData?: boolean; hasMeta?: boolean }
): void => {
  expect(body).toMatchObject({ success: true });
  expect(body).toHaveProperty("message");
  expect(typeof (body as ApiSuccessBody).message).toBe("string");

  if (options?.hasData) {
    expect((body as ApiSuccessBody).data).toBeDefined();
  }
  if (options?.hasMeta) {
    expect((body as ApiSuccessBody).meta).toBeDefined();
  }
};

export const expectErrorResponse = (
  body: unknown,
  message?: string | RegExp
): void => {
  expect(body).toMatchObject({ success: false });
  expect(body).toHaveProperty("message");
  if (message) {
    expect((body as ApiErrorBody).message).toEqual(message);
  }
};

export const expectValidationErrors = (body: unknown): void => {
  expectErrorResponse(body, "Validation failed");
  expect((body as ApiErrorBody).errors).toEqual(
    expect.arrayContaining([
      expect.objectContaining({
        field: expect.any(String),
        message: expect.any(String),
      }),
    ])
  );
};

export const expectPagePagination = (body: unknown): void => {
  expect(body).toMatchObject({
    success: true,
    data: expect.any(Array),
    pagination: {
      type: "page",
      page: expect.any(Number),
      limit: expect.any(Number),
      total: expect.any(Number),
      pages: expect.any(Number),
    },
  });
};

export const expectCursorPagination = (body: unknown): void => {
  expect(body).toMatchObject({
    success: true,
    data: expect.any(Array),
    pagination: {
      type: "cursor",
      hasMore: expect.any(Boolean),
      limit: expect.any(Number),
    },
  });
};
