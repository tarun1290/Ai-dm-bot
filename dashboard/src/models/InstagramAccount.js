import mongoose from "mongoose";

const InstagramAccountSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  instagramUserId: { type: String, required: true },
  instagramPageScopedId: { type: String, default: null },
  instagramUsername: { type: String },
  instagramProfilePic: { type: String },
  accessToken: { type: String },
  tokenExpiresAt: { type: Date },
  tokenExpired: { type: Boolean, default: false },
  isConnected: { type: Boolean, default: true },
  isPrimary: { type: Boolean, default: false },

  automation: {
    postTrigger: { type: String, default: "any" },
    selectedPostId: { type: String },
    commentTrigger: { type: String, default: "any" },
    keywords: { type: [String], default: [] },
    replyEnabled: { type: Boolean, default: true },
    replyMessages: { type: [String], default: ["Check your DM! 📩"] },
    dmContent: { type: String },
    buttonText: { type: String },
    linkUrl: { type: String },
    deliveryMessage: { type: String },
    deliveryButtonText: { type: String },
    isActive: { type: Boolean, default: false },
    requireFollow: { type: Boolean, default: false },
    followPromptPublicReply: { type: String },
    followPromptDM: { type: String },
    followButtonText: { type: String, default: "I'm following now! ✓" },
    followerGate: {
      enabled: { type: Boolean, default: false },
      appliesTo: {
        commentToDm: { type: Boolean, default: true },
        reelShareReply: { type: Boolean, default: true },
        mentionReply: { type: Boolean, default: true },
      },
      nonFollowerMessage: {
        title: { type: String, default: "Follow us to unlock! 🔓" },
        subtitle: { type: String, default: "Follow @{username} to get access to this content. Once you follow, tap the button below!" },
        visitProfileLabel: { type: String, default: "Visit Profile" },
        confirmFollowLabel: { type: String, default: "I'm following now! ✔️" },
      },
      verificationFailedMessage: {
        title: { type: String, default: "Hmm, I can't see your follow yet 🤔" },
        subtitle: { type: String, default: "Please make sure you've followed @{username} and try again!" },
      },
      maxRetries: { type: Number, default: 3 },
      successMessage: {
        enabled: { type: Boolean, default: false },
        title: { type: String, default: "Thanks for following! 🎉" },
        subtitle: { type: String, default: "Here's your content:" },
      },
      skipForReturningUsers: { type: Boolean, default: false },
      skipForVerifiedFollowers: { type: Boolean, default: true },
    },
    mentionsEnabled: { type: Boolean, default: false },
    mentionReplyMessage: { type: String, default: "Thanks for the mention! 🙌" },
    reelShareEnabled: { type: Boolean, default: false },
    reelShareMessage: { type: String, default: "Hey! 👋 Thanks for sharing!" },
    reelShareLinkUrl: { type: String },
    reelShareButtonText: { type: String, default: "Check it out 🚀" },

    // Smart Reel Replies — category-based auto-reply rules
    reelCategories: {
      type: [{
        name: { type: String, required: true },
        enabled: { type: Boolean, default: true },
        priority: { type: Number, default: 0 },
        detection: {
          keywords: { type: [String], default: [] },
          hashtags: { type: [String], default: [] },
          accountUsernames: { type: [String], default: [] },
          specificReelIds: { type: [String], default: [] },
        },
        matchMode: { type: String, enum: ["any", "all"], default: "any" },
        reply: {
          message: { type: String, default: "" },
          linkUrl: { type: String, default: "" },
          buttonText: { type: String, default: "Check it out 🚀" },
        },
        stats: {
          totalMatches: { type: Number, default: 0 },
          totalRepliesSent: { type: Number, default: 0 },
          lastMatchedAt: { type: Date },
        },
        createdAt: { type: Date, default: Date.now },
      }],
      default: [],
      validate: [arr => arr.length <= 5, "Maximum 5 reel categories allowed"],
    },
    reelShareDefaultReply: {
      enabled: { type: Boolean, default: true },
      message: { type: String, default: "" },
      linkUrl: { type: String, default: "" },
      buttonText: { type: String, default: "Check it out 🚀" },
    },

    // Smart Reply config (admin-gated, hidden feature)
    smartReplyConfig: {
      enabled: { type: Boolean, default: false },
      tone: { type: String, enum: ["friendly", "professional", "casual"], default: "friendly" },
      businessDescription: { type: String },
      autoReplyToAllDMs: { type: Boolean, default: false },
      excludeKeywords: { type: [String], default: [] },
      maxRepliesPerThread: { type: Number, default: 20 },
      workingHoursOnly: { type: Boolean, default: false },
      workingHours: {
        start: { type: String, default: "09:00" },
        end: { type: String, default: "18:00" },
        timezone: { type: String, default: "Asia/Kolkata" },
      },
    },

    // AI Product Detection (admin-gated, hidden feature)
    aiProductDetection: {
      enabled: { type: Boolean, default: false },
      provider: { type: String },
      replyTemplate: { type: String, default: "I found this! {{productName}} — check it out here:" },
      linkButtonLabel: { type: String, default: "Shop Now" },
      fallbackToDefault: { type: Boolean, default: true },
      detectOnlyCategories: { type: [String], default: [] },
    },
  },

  // Smart Features — admin-gated access control (hidden from regular users)
  smartFeatures: {
    shopifyConnected: { type: Boolean, default: false },
    knowledgeBaseActive: { type: Boolean, default: false },
    smartRepliesActive: { type: Boolean, default: false },
    enabledBy: { type: String },
    enabledAt: { type: Date },
    disabledAt: { type: Date },
    notes: { type: String },
  },

  // AI Feature — admin-gated access control (hidden from regular users)
  aiFeature: {
    enabled: { type: Boolean, default: false },
    enabledBy: { type: String },
    enabledAt: { type: Date },
    disabledAt: { type: Date },
    notes: { type: String },
  },

  createdAt: { type: Date, default: Date.now },
});

// Compound unique: one IG account per user
InstagramAccountSchema.index({ userId: 1, instagramUserId: 1 }, { unique: true });
// Webhook lookup by Instagram user ID (app-scoped)
InstagramAccountSchema.index({ instagramUserId: 1 });
// Webhook lookup by page-scoped ID
InstagramAccountSchema.index({ instagramPageScopedId: 1 }, { sparse: true });

export default mongoose.models.InstagramAccount ||
  mongoose.model("InstagramAccount", InstagramAccountSchema);
