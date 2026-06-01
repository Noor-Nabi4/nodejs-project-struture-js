import { jest } from "@jest/globals";
import type { Response } from "express";
import { success, error } from "../../utils/response.js";

type MockResponse = Pick<Response, "status" | "json"> & {
  status: jest.MockedFunction<Response["status"]>;
  json: jest.MockedFunction<Response["json"]>;
};

describe("response utils", () => {
  describe("success", () => {
    it("sends JSON with success true, message, and optional data", () => {
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      } as unknown as MockResponse;
      success(res as unknown as Response, 200, "OK", { id: 1 });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: "OK",
        data: { id: 1 },
      });
    });

    it("omits data when null", () => {
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      } as unknown as MockResponse;
      success(res as unknown as Response, 204, "No content");
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: "No content",
      });
    });
  });

  describe("error", () => {
    it("sends JSON with success false and message", () => {
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      } as unknown as MockResponse;
      error(res as unknown as Response, 400, "Bad request");
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Bad request",
      });
    });
  });
});
