import mongoose from "mongoose";

const KnowledgeChunkSchema = new mongoose.Schema({
  documentId: { type: mongoose.Schema.Types.ObjectId, ref: "KnowledgeDocument", required: true },
  userId: { type: String, required: true },
  accountId: { type: mongoose.Schema.Types.ObjectId, ref: "InstagramAccount" },
  content: { type: String, required: true },
  embedding: { type: [Number], select: false },
  chunkIndex: { type: Number, default: 0 },
  metadata: {
    pageNumber: { type: Number },
    sectionHeading: { type: String },
    sourceUrl: { type: String },
  },
  tokenCount: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
});

KnowledgeChunkSchema.index({ documentId: 1, chunkIndex: 1 });
KnowledgeChunkSchema.index({ userId: 1, accountId: 1 });

export default mongoose.models.KnowledgeChunk ||
  mongoose.model("KnowledgeChunk", KnowledgeChunkSchema);
