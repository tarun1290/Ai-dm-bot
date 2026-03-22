"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import dbConnect from "@/lib/dbConnect";
import User from "@/models/User";
import Event from "@/models/Event";
import InstagramAccount from "@/models/InstagramAccount";

async function requireAdmin() {
  const cookieStore = await cookies();
  const session = cookieStore.get("admin_session")?.value;
  if (!session || session !== process.env.ADMIN_KEY) {
    throw new Error("Unauthorized");
  }
}

// ── Overview ────────────────────────────────────────────────────────────────

export async function adminGetOverviewStats() {
  await requireAdmin();
  await dbConnect();

  const totalAccounts = await User.countDocuments();
  const connectedAccounts = await User.countDocuments({ isConnected: true });
  const activeAutomations = await User.countDocuments({ "automation.isActive": true });
  const totalEvents = await Event.countDocuments();

  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);
  const sentToday = await Event.countDocuments({ "reply.status": "sent", createdAt: { $gte: startOfDay } });
  const eventsToday = await Event.countDocuments({ createdAt: { $gte: startOfDay } });

  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);
  const eventsByType = await Event.aggregate([
    { $group: { _id: "$type", count: { $sum: 1 } } },
    { $sort: { count: -1 } },
  ]);

  return {
    totalAccounts, connectedAccounts, activeAutomations, totalEvents,
    sentToday, eventsToday, eventsByType: JSON.parse(JSON.stringify(eventsByType)),
  };
}

// ── Accounts ────────────────────────────────────────────────────────────────

export async function adminGetAccounts(filters = {}, sort = { field: "createdAt", dir: "desc" }, page = 1, limit = 20) {
  await requireAdmin();
  await dbConnect();

  const query = {};
  if (filters.search) {
    const q = filters.search;
    query.$or = [
      { instagramUsername: { $regex: q, $options: "i" } },
      { email: { $regex: q, $options: "i" } },
      { userId: { $regex: q, $options: "i" } },
    ];
  }
  if (filters.plan) query["subscription.plan"] = filters.plan;

  const total = await User.countDocuments(query);
  const sortObj = { [sort.field]: sort.dir === "asc" ? 1 : -1 };
  const users = await User.find(query)
    .select("-instagramAccessToken -passwordHash")
    .sort(sortObj)
    .skip((page - 1) * limit)
    .limit(limit)
    .lean();

  // Get IG account counts per user
  const enriched = [];
  for (const user of users) {
    const igCount = await InstagramAccount.countDocuments({ userId: user.userId, isConnected: true });
    enriched.push({ ...user, igAccountCount: igCount });
  }

  return {
    accounts: JSON.parse(JSON.stringify(enriched)),
    total,
    page,
    totalPages: Math.ceil(total / limit),
  };
}

export async function adminGetAccountDetail(userId) {
  await requireAdmin();
  await dbConnect();

  const user = await User.findOne({ userId }).select("-instagramAccessToken -passwordHash").lean();
  if (!user) return { error: "User not found" };

  const igAccounts = await InstagramAccount.find({ userId }).select("-accessToken").lean();
  const eventCount = await Event.countDocuments({
    $or: igAccounts.map((a) => ({ accountId: a._id })),
  });

  return {
    user: JSON.parse(JSON.stringify(user)),
    igAccounts: JSON.parse(JSON.stringify(igAccounts)),
    eventCount,
  };
}

// ── Feature toggle ──────────────────────────────────────────────────────────

export async function adminToggleFeature(userId, featureFlag, enabled, notes = "") {
  await requireAdmin();
  await dbConnect();

  const user = await User.findOne({ userId });
  if (!user) return { error: "User not found" };

  // Set the flag
  await User.findOneAndUpdate({ userId }, { [`flags.${featureFlag}`]: enabled });

  // For AI detection, also update InstagramAccount.aiFeature
  if (featureFlag === "aiProductDetectionUnlocked") {
    await InstagramAccount.updateMany(
      { userId },
      {
        "aiFeature.enabled": enabled,
        ...(enabled
          ? { "aiFeature.enabledBy": "admin", "aiFeature.enabledAt": new Date(), "aiFeature.notes": notes }
          : { "aiFeature.disabledAt": new Date() }),
      }
    );
  }

  // For smart features, update InstagramAccount.smartFeatures
  if (["shopifyEnabled", "knowledgeBaseEnabled", "smartRepliesEnabled"].includes(featureFlag)) {
    const fieldMap = {
      shopifyEnabled: "smartFeatures.shopifyConnected",
      knowledgeBaseEnabled: "smartFeatures.knowledgeBaseActive",
      smartRepliesEnabled: "smartFeatures.smartRepliesActive",
    };
    await InstagramAccount.updateMany(
      { userId },
      {
        [fieldMap[featureFlag]]: enabled,
        "smartFeatures.enabledBy": enabled ? "admin" : undefined,
        "smartFeatures.enabledAt": enabled ? new Date() : undefined,
        "smartFeatures.disabledAt": enabled ? undefined : new Date(),
        "smartFeatures.notes": notes || undefined,
      }
    );
  }

  console.log(`[Admin] ${enabled ? "Enabled" : "Disabled"} ${featureFlag} for user ${userId}`);
  revalidatePath("/admin");
  return { success: true };
}

export async function adminBulkToggleFeature(userIds, featureFlag, enabled, notes = "") {
  await requireAdmin();
  await dbConnect();

  if (!Array.isArray(userIds) || userIds.length === 0) return { error: "No users selected" };

  await User.updateMany(
    { userId: { $in: userIds } },
    { [`flags.${featureFlag}`]: enabled }
  );

  console.log(`[Admin] Bulk ${enabled ? "enabled" : "disabled"} ${featureFlag} for ${userIds.length} users`);
  revalidatePath("/admin");
  return { success: true, count: userIds.length };
}

// ── Feature stats ───────────────────────────────────────────────────────────

const FEATURE_EVENT_MAP = {
  "comment-to-dm": { type: "comment" },
  "follower-gate": { type: "comment" },
  "reel-share": { type: "reel_share" },
  "mentions": { type: "mention" },
  "reel-rules": { type: "reel_share" },
  "ai-detection": { type: "reel_share", filter: { "metadata.matchType": "ai_detection" } },
  "smart-links": { type: "reel_share", filter: { "metadata.trackedLinkId": { $exists: true } } },
  "smart-replies": { type: "smart_reply" },
  "conversations": { type: "smart_reply" },
};

export async function adminGetFeatureStats(featureName) {
  await requireAdmin();
  await dbConnect();

  const config = FEATURE_EVENT_MAP[featureName];
  const eventFilter = config ? { type: config.type, ...(config.filter || {}) } : {};

  const totalEvents = await Event.countDocuments(eventFilter);

  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);
  const eventsThisMonth = await Event.countDocuments({ ...eventFilter, createdAt: { $gte: startOfMonth } });

  const sent = await Event.countDocuments({ ...eventFilter, "reply.status": "sent" });
  const failed = await Event.countDocuments({ ...eventFilter, "reply.status": "failed" });
  const successRate = totalEvents > 0 ? Math.round((sent / totalEvents) * 100) : 0;

  // Count users with this feature enabled
  const featureFlagMap = {
    "comment-to-dm": null,
    "follower-gate": null,
    "reel-share": null,
    "mentions": null,
    "reel-rules": null,
    "ai-detection": "aiProductDetectionUnlocked",
    "smart-links": "aiProductDetectionUnlocked",
    "smart-replies": "smartRepliesEnabled",
    "knowledge-base": "knowledgeBaseEnabled",
    "shopify": "shopifyEnabled",
    "conversations": "smartRepliesEnabled",
  };
  const flag = featureFlagMap[featureName];
  let enabledUsers = 0;
  if (flag) {
    enabledUsers = await User.countDocuments({ [`flags.${flag}`]: true });
  }

  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);
  const eventsToday = await Event.countDocuments({ ...eventFilter, createdAt: { $gte: startOfDay } });

  return {
    totalEvents, eventsThisMonth, eventsToday, sent, failed, successRate, enabledUsers,
  };
}

export async function adminGetFeatureEvents(featureName, page = 1, limit = 50) {
  await requireAdmin();
  await dbConnect();

  const config = FEATURE_EVENT_MAP[featureName];
  const eventFilter = config ? { type: config.type, ...(config.filter || {}) } : {};

  const events = await Event.find(eventFilter)
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit)
    .lean();

  return { events: JSON.parse(JSON.stringify(events)) };
}

export async function adminGetFeatureAccounts(featureName) {
  await requireAdmin();
  await dbConnect();

  const featureFlagMap = {
    "comment-to-dm": null,
    "follower-gate": null,
    "reel-share": null,
    "mentions": null,
    "reel-rules": null,
    "ai-detection": "aiProductDetectionUnlocked",
    "smart-links": "aiProductDetectionUnlocked",
    "smart-replies": "smartRepliesEnabled",
    "knowledge-base": "knowledgeBaseEnabled",
    "shopify": "shopifyEnabled",
    "conversations": "smartRepliesEnabled",
    "analytics": null,
    "api-access": null,
    "payments": null,
  };

  const accounts = await User.find()
    .select("-instagramAccessToken -passwordHash")
    .sort({ createdAt: -1 })
    .lean();

  return { accounts: JSON.parse(JSON.stringify(accounts)) };
}

// ── Chart data ──────────────────────────────────────────────────────────────

export async function adminGetChartData(featureName, days = 30) {
  await requireAdmin();
  await dbConnect();

  const config = FEATURE_EVENT_MAP[featureName];
  const eventFilter = config ? { type: config.type, ...(config.filter || {}) } : {};

  const since = new Date();
  since.setDate(since.getDate() - days);

  const data = await Event.aggregate([
    { $match: { ...eventFilter, createdAt: { $gte: since } } },
    { $group: { _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } }, count: { $sum: 1 } } },
    { $sort: { _id: 1 } },
  ]);

  return { data: JSON.parse(JSON.stringify(data)) };
}

// ── System ──────────────────────────────────────────────────────────────────

export async function adminGetSystemFlags() {
  await requireAdmin();
  await dbConnect();

  const totalUsers = await User.countDocuments();
  const flagCounts = {};
  for (const flag of ["aiProductDetectionUnlocked", "shopifyEnabled", "knowledgeBaseEnabled", "smartRepliesEnabled"]) {
    flagCounts[flag] = await User.countDocuments({ [`flags.${flag}`]: true });
  }

  return { totalUsers, flagCounts };
}

export async function adminGetWebhookLogs(page = 1, limit = 50) {
  await requireAdmin();
  await dbConnect();

  const events = await Event.find()
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit)
    .lean();
  const total = await Event.countDocuments();

  return { events: JSON.parse(JSON.stringify(events)), total };
}

export async function adminGetCronStatus() {
  await requireAdmin();
  return {
    jobs: [
      { name: "Subscription management", schedule: "Daily", status: "active", lastRun: null },
      { name: "Shopify product sync", schedule: "Daily", status: "disabled", tag: "[SMART FEATURES]" },
      { name: "Knowledge URL refresh", schedule: "Weekly (Sun)", status: "disabled", tag: "[SMART FEATURES]" },
      { name: "Conversation cleanup", schedule: "Daily", status: "disabled", tag: "[SMART FEATURES]" },
    ],
  };
}
