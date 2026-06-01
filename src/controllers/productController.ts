import type { Response } from "express";
import catchAsyncErrors from "../middlewares/catchAsyncErrors.js";
import * as productService from "../services/productService.js";
import { paginatedSuccess } from "../utils/response.js";
import { HTTP_STATUS } from "../config/constants.js";
import type { TypedRequestQuery } from "../types/request.types.js";
import type { ProductListQuery } from "../validations/product.validation.js";

export const listProducts = catchAsyncErrors(
  async (req: TypedRequestQuery<ProductListQuery>, res: Response) => {
    const result = await productService.listProducts(req.query);
    return paginatedSuccess(
      res,
      result.data,
      result.pagination,
      HTTP_STATUS.OK
    );
  }
);
