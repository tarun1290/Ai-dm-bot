import mongoose from "mongoose";

const ClickEventSchema = new mongoose.Schema({
  trackedLinkId: { type: mongoose.Schema.Types.ObjectId, ref: "TrackedLink", required: true },
  shortCode: { type: String, required: true },
  userId: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  ip: { type: String },
  userAgent: { type: String },
  referer: { type: String },
  country: { type: String },
  city: { type: String },
  device: { type: String, enum: ["mobile", "desktop", "tablet", "unknown"] },
  browser: { type: String },
  isUnique: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

ClickEventSchema.index({ trackedLinkId: 1, timestamp: -1 });
ClickEventSchema.index({ userId: 1, timestamp: -1 });
ClickEventSchema.index({ shortCode: 1 });

export default mongoose.models.ClickEvent ||
  mongoose.model("ClickEvent", ClickEventSchema);
