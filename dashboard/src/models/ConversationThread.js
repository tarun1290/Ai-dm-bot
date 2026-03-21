import mongoose from "mongoose";

const ConversationThreadSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  accountId: { type: mongoose.Schema.Types.ObjectId, ref: "InstagramAccount" },
  senderIgId: { type: String, required: true },
  senderUsername: { type: String },
  messages: [{
    role: { type: String, enum: ["user", "assistant"], required: true },
    content: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
    metadata: {
      retrievedChunks: [{ type: mongoose.Schema.Types.ObjectId, ref: "KnowledgeChunk" }],
      shopifyProducts: [{ type: mongoose.Schema.Types.ObjectId, ref: "ShopifyProduct" }],
      confidence: { type: Number },
      aiModel: { type: String },
    },
  }],
  context: {
    lastRetrievedChunks: { type: [String], default: [] },
    lastReferencedProducts: [{
      title: { type: String },
      price: { type: String },
      url: { type: String },
    }],
    conversationSummary: { type: String },
  },
  status: { type: String, enum: ["active", "handed_off", "closed"], default: "active" },
  handedOffAt: { type: Date },
  handedOffReason: { type: String },
  messageCount: { type: Number, default: 0 },
  lastMessageAt: { type: Date, default: Date.now },
  expiresAt: { type: Date },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

ConversationThreadSchema.index({ accountId: 1, senderIgId: 1 });
ConversationThreadSchema.index({ expiresAt: 1 });
ConversationThreadSchema.index({ userId: 1, status: 1 });

export default mongoose.models.ConversationThread ||
  mongoose.model("ConversationThread", ConversationThreadSchema);
