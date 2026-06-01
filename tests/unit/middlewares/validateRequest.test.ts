import { jest } from "@jest/globals";
import type { NextFunction, Request, Response } from "express";
import { z } from "zod";
import { validateRequest } from "../../../src/middlewares/validateRequest.js";
import ErrorHandler from "../../../src/utils/errorHandler.js";
import { HTTP_STATUS } from "../../../src/config/constants.js";

const createMockRes = (): Response => ({}) as Response;

describe("validateRequest middleware", () => {
  it("parses and assigns validated body", () => {
    const schema = z.object({ email: z.string().email() });
    const middleware = validateRequest(schema);
    const req = { body: { email: "a@b.com", extra: "x" } } as Request;
    const next = jest.fn() as NextFunction;

    middleware(req, createMockRes(), next);

    expect(req.body).toEqual({ email: "a@b.com" });
    expect(next).toHaveBeenCalledWith();
  });

  it("passes Zod validation errors to next as ErrorHandler", () => {
    const schema = z.object({ email: z.string().email() });
    const middleware = validateRequest(schema);
    const req = { body: { email: "bad" } } as Request;
    const next = jest.fn() as NextFunction;

    middleware(req, createMockRes(), next);

    expect(next).toHaveBeenCalledWith(expect.any(ErrorHandler));
    const err = (next as jest.Mock).mock.calls[0][0] as ErrorHandler;
    expect(err.statusCode).toBe(HTTP_STATUS.BAD_REQUEST);
    expect(err.message).toBe("Validation failed");
    expect(err.errors).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ field: expect.any(String) }),
      ])
    );
  });
});
