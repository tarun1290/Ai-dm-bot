import mongoose from "mongoose";

const ShopifyStoreSchema = new mongoose.Schema({
  userId: { type: String, required: true, index: true },
  accountId: { type: mongoose.Schema.Types.ObjectId, ref: "InstagramAccount" },
  shopDomain: { type: String, required: true },
  accessToken: { type: String },
  storeName: { type: String },
  storeEmail: { type: String },
  storeCurrency: { type: String, default: "INR" },
  scopes: { type: [String], default: [] },
  syncStatus: {
    lastSyncAt: { type: Date },
    lastSyncStatus: { type: String, enum: ["success", "failed", "in_progress"], default: "success" },
    productCount: { type: Number, default: 0 },
    lastError: { type: String },
  },
  isConnected: { type: Boolean, default: true },
  connectedAt: { type: Date, default: Date.now },
  disconnectedAt: { type: Date },
  webhookId: { type: String },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

ShopifyStoreSchema.index({ shopDomain: 1 }, { unique: true });

ShopifyStoreSchema.pre("save", function () {
  this.updatedAt = new Date();
});

export default mongoose.models.ShopifyStore ||
  mongoose.model("ShopifyStore", ShopifyStoreSchema);
