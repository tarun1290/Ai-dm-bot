import mongoose from "mongoose";

const KnowledgeDocumentSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  accountId: { type: mongoose.Schema.Types.ObjectId, ref: "InstagramAccount" },
  fileName: { type: String },
  fileType: { type: String, enum: ["pdf", "url"], required: true },
  fileUrl: { type: String },
  fileSize: { type: Number },
  status: { type: String, enum: ["processing", "ready", "failed"], default: "processing" },
  processingError: { type: String },
  chunkCount: { type: Number, default: 0 },
  totalTokens: { type: Number, default: 0 },
  metadata: {
    pageCount: { type: Number },
    title: { type: String },
    domain: { type: String },
    lastScrapedAt: { type: Date },
  },
  uploadedAt: { type: Date, default: Date.now },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

KnowledgeDocumentSchema.index({ userId: 1, accountId: 1 });
KnowledgeDocumentSchema.index({ status: 1 });

export default mongoose.models.KnowledgeDocument ||
  mongoose.model("KnowledgeDocument", KnowledgeDocumentSchema);
