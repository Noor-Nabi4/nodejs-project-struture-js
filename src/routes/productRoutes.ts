import express from "express";
import { listProducts } from "../controllers/productController.js";
import { validateRequest } from "../middlewares/validateRequest.js";
import { productListQuerySchema } from "../validations/product.validation.js";

const router = express.Router();

router.get(
  "/",
  validateRequest({ query: productListQuerySchema }),
  listProducts
);

export default router;
