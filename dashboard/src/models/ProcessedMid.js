import mongoose from 'mongoose';

// Tracks processed Instagram message IDs (mid) to prevent duplicate replies
// when multiple webhook subscriptions fire for the same message simultaneously.
// TTL index auto-deletes entries after 24 hours to keep the collection lean.
const ProcessedMidSchema = new mongoose.Schema({
    mid: { type: String, required: true, unique: true },
    createdAt: { type: Date, default: Date.now, expires: 86400 } // 24h TTL
});

export default mongoose.models.ProcessedMid || mongoose.model('ProcessedMid', ProcessedMidSchema);
