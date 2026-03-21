import mongoose from "mongoose";

const ShopifyProductSchema = new mongoose.Schema({
  storeId: { type: mongoose.Schema.Types.ObjectId, ref: "ShopifyStore", required: true },
  userId: { type: String, required: true, index: true },
  shopifyProductId: { type: String, required: true },
  title: { type: String },
  description: { type: String },
  vendor: { type: String },
  productType: { type: String },
  tags: { type: [String], default: [] },
  handle: { type: String },
  status: { type: String, enum: ["active", "draft", "archived"], default: "active" },
  variants: [{
    variantId: { type: String },
    title: { type: String },
    price: { type: String },
    compareAtPrice: { type: String },
    sku: { type: String },
    inventoryQuantity: { type: Number },
    available: { type: Boolean, default: true },
  }],
  images: [{
    src: { type: String },
    alt: { type: String },
  }],
  primaryImageUrl: { type: String },
  productUrl: { type: String },
  priceRange: {
    min: { type: Number },
    max: { type: Number },
  },
  searchText: { type: String },
  embedding: { type: [Number], select: false },
  lastSyncedAt: { type: Date, default: Date.now },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

ShopifyProductSchema.index({ storeId: 1, shopifyProductId: 1 }, { unique: true });
ShopifyProductSchema.index({ searchText: "text" });

export default mongoose.models.ShopifyProduct ||
  mongoose.model("ShopifyProduct", ShopifyProductSchema);
