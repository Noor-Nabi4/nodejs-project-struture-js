import Product, { type IProduct } from "../../../src/models/productModel.js";

let sequence = 0;

export const buildProductPayload = (
  overrides: Partial<IProduct> = {}
): Omit<IProduct, "createdAt" | "updatedAt"> => {
  sequence += 1;
  return {
    title: `Product ${sequence}`,
    description: "Test product",
    brand: "TestBrand",
    price: 1000 + sequence,
    tags: ["test"],
    isFeatured: false,
    isActive: true,
    ...overrides,
  };
};

export const createProductInDb = async (overrides: Partial<IProduct> = {}) => {
  const product = new Product(buildProductPayload(overrides));
  return product.save();
};

export const createProductsInDb = async (
  count: number,
  overrides: Partial<IProduct> = {}
) => {
  const products = [];
  for (let i = 0; i < count; i++) {
    const product = await createProductInDb({
      ...overrides,
      title: `Product batch ${sequence}-${i}`,
      price: (overrides.price ?? 1000) + i,
    });
    await Product.findByIdAndUpdate(product._id, {
      createdAt: new Date(Date.now() - i * 1000),
    });
    products.push(product);
  }
  return products;
};
