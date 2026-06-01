import mongoose from "mongoose";

export interface IProduct {
  title: string;
  description?: string;
  category?: mongoose.Types.ObjectId;
  subCategory?: mongoose.Types.ObjectId;
  brand?: string;
  price: number;
  tags: string[];
  isFeatured: boolean;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

const productSchema = new mongoose.Schema<IProduct>(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    category: { type: mongoose.Schema.Types.ObjectId, ref: "Category" },
    subCategory: { type: mongoose.Schema.Types.ObjectId, ref: "Category" },
    brand: { type: String, trim: true, index: true },
    price: { type: Number, required: true, min: 0, index: true },
    tags: { type: [String], default: [] },
    isFeatured: { type: Boolean, default: false, index: true },
    isActive: { type: Boolean, default: true, index: true },
  },
  { timestamps: true }
);

productSchema.index({
  title: "text",
  description: "text",
  tags: "text",
  brand: "text",
});
productSchema.index({ category: 1 });
productSchema.index({ createdAt: -1, _id: -1 });

const Product = mongoose.model<IProduct>("Product", productSchema);

export default Product;
