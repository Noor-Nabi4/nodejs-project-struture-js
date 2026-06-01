import request from "supertest";
import { getTestApp } from "../../helpers/app.js";
import { expectSuccessResponse } from "../../helpers/assertions.js";
import { HTTP_STATUS } from "../../../src/config/constants.js";

describe("GET /health", () => {
  it("returns 200 with success response shape", async () => {
    const app = await getTestApp();
    const res = await request(app).get("/health");

    expect(res.status).toBe(HTTP_STATUS.OK);
    expectSuccessResponse(res.body);
    expect(res.body.message).toBe("OK");
  });
});
