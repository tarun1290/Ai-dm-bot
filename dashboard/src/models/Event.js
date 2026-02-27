import mongoose from 'mongoose';

const EventSchema = new mongoose.Schema({
    type: {
        type: String,
        enum: ['comment', 'mention', 'dm', 'reel_share', 'reaction', 'bot_restart', 'postback'],
        required: true
    },
    from: {
        id: String,
        username: String,
        name: String
    },
    content: {
        commentId: String,
        mediaId: String,
        text: String,
        url: String
    },
    reply: {
        publicReply: String,
        privateDM: String,
        status: {
            type: String,
            enum: ['sent', 'failed', 'skipped', 'fallback'],
            default: 'skipped'
        }
    },
    raw: mongoose.Schema.Types.Mixed,
    createdAt: {
        type: Date,
        default: Date.now
    }
});

export default mongoose.models.Event || mongoose.model('Event', EventSchema);
