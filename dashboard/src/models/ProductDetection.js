import mongoose from "mongoose";

const ProductDetectionSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  accountId: { type: mongoose.Schema.Types.ObjectId, ref: "InstagramAccount" },
  reelMediaId: { type: String },
  reelPermalink: { type: String },
  reelOwnerUsername: { type: String },
  senderUsername: { type: String },
  frameUrl: { type: String },
  aiProvider: { type: String },
  aiModel: { type: String },
  aiResponse: { type: mongoose.Schema.Types.Mixed },
  detectedProducts: [{
    name: { type: String },
    category: { type: String },
    brand: { type: String },
    confidence: { type: Number },
    searchQuery: { type: String },
    purchaseUrl: { type: String },
    trackedLinkId: { type: mongoose.Schema.Types.ObjectId, ref: "TrackedLink" },
  }],
  processingTimeMs: { type: Number },
  status: {
    type: String,
    enum: ["success", "failed", "no_product_found", "api_error"],
    default: "failed",
  },
  errorMessage: { type: String },
  createdAt: { type: Date, default: Date.now },
});

ProductDetectionSchema.index({ userId: 1, createdAt: -1 });
ProductDetectionSchema.index({ accountId: 1, createdAt: -1 });

export default mongoose.models.ProductDetection ||
  mongoose.model("ProductDetection", ProductDetectionSchema);
