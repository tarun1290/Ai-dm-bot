"use server";

import { cookies } from "next/headers";
import dbConnect from "@/lib/dbConnect";
import User from "@/models/User";
import InstagramAccount from "@/models/InstagramAccount";
import TrackedLink from "@/models/TrackedLink";
import ClickEvent from "@/models/ClickEvent";
import ProductDetection from "@/models/ProductDetection";
import Event from "@/models/Event";
import { verifyToken } from "@/lib/jwt";

async function getOwnerId() {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth_token")?.value;
  if (token) {
    const payload = await verifyToken(token);
    if (payload?.userId) return payload.userId;
  }
  return process.env.OWNER_USER_ID || "owner";
}

async function resolveAccount(userId, accountId) {
  if (accountId) return InstagramAccount.findOne({ _id: accountId, userId });
  return (
    (await InstagramAccount.findOne({ userId, isPrimary: true, isConnected: true })) ||
    (await InstagramAccount.findOne({ userId, isConnected: true }))
  );
}

async function checkAiAccess(userId) {
  const user = await User.findOne({ userId }).lean();
  if (!user?.flags?.aiProductDetectionUnlocked) return null;
  return user;
}

// Characters for shortCode generation
const CHARSET = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
function generateShortCode(length = 7) {
  let code = "";
  for (let i = 0; i < length; i++) {
    code += CHARSET[Math.floor(Math.random() * CHARSET.length)];
  }
  return code;
}

// ── Check if AI feature is enabled for the current user ─────────────────
export async function getAiFeatureStatus(accountId) {
  const userId = await getOwnerId();
  await dbConnect();
  const user = await User.findOne({ userId }).lean();
  if (!user?.flags?.aiProductDetectionUnlocked) return { enabled: false };
  const account = await resolveAccount(userId, accountId);
  return {
    enabled: true,
    accountAiEnabled: !!account?.aiFeature?.enabled,
    aiConfig: account?.automation?.aiProductDetection || null,
    usage: {
      detectionsThisMonth: user.usage?.aiDetectionsThisMonth || 0,
      detectionsTotal: user.usage?.aiDetectionsTotal || 0,
      costThisMonth: user.usage?.aiCostThisMonth || 0,
    },
  };
}

// ── Save AI product detection settings ──────────────────────────────────
export async function saveAiDetectionSettings(settings, accountId) {
  const userId = await getOwnerId();
  await dbConnect();
  if (!(await checkAiAccess(userId))) return { error: "Feature not available" };

  const account = await resolveAccount(userId, accountId);
  if (!account) return { error: "No account found." };

  const aiConfig = {
    enabled: settings.enabled ?? false,
    replyTemplate: settings.replyTemplate || "I found this! {{productName}} — check it out here:",
    linkButtonLabel: settings.linkButtonLabel || "Shop Now",
    fallbackToDefault: settings.fallbackToDefault ?? true,
    detectOnlyCategories: settings.detectOnlyCategories || [],
  };

  await InstagramAccount.findByIdAndUpdate(account._id, {
    "automation.aiProductDetection": aiConfig,
  });
  await User.findOneAndUpdate({ userId }, {
    "automation.aiProductDetection": aiConfig,
  });

  return { success: true, aiConfig };
}

// ── Get tracked links (paginated, filtered) ─────────────────────────────
export async function getTrackedLinks(accountId, filters = {}, page = 1, limit = 20) {
  const userId = await getOwnerId();
  await dbConnect();
  if (!(await checkAiAccess(userId))) return { error: "Feature not available" };

  const query = { userId };
  if (accountId) query.accountId = accountId;
  if (filters.category) query["metadata.productCategory"] = filters.category;
  if (filters.status) query.status = filters.status;
  if (filters.search) {
    query["metadata.productName"] = { $regex: filters.search, $options: "i" };
  }
  if (filters.dateFrom || filters.dateTo) {
    query.createdAt = {};
    if (filters.dateFrom) query.createdAt.$gte = new Date(filters.dateFrom);
    if (filters.dateTo) query.createdAt.$lte = new Date(filters.dateTo);
  }

  const total = await TrackedLink.countDocuments(query);
  const links = await TrackedLink.find(query)
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit)
    .lean();

  return {
    success: true,
    links: JSON.parse(JSON.stringify(links)),
    total,
    page,
    totalPages: Math.ceil(total / limit),
  };
}

// ── Get single tracked link detail ──────────────────────────────────────
export async function getTrackedLinkDetail(linkId) {
  const userId = await getOwnerId();
  await dbConnect();
  if (!(await checkAiAccess(userId))) return { error: "Feature not available" };

  const link = await TrackedLink.findOne({ _id: linkId, userId }).lean();
  if (!link) return { error: "Link not found" };

  const recentClicks = await ClickEvent.find({ trackedLinkId: linkId })
    .sort({ timestamp: -1 })
    .limit(20)
    .lean();

  // Daily clicks for last 30 days
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const dailyClicks = await ClickEvent.aggregate([
    { $match: { trackedLinkId: link._id, timestamp: { $gte: thirtyDaysAgo } } },
    {
      $group: {
        _id: { $dateToString: { format: "%Y-%m-%d", date: "$timestamp" } },
        total: { $sum: 1 },
        unique: { $sum: { $cond: ["$isUnique", 1, 0] } },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  return {
    success: true,
    link: JSON.parse(JSON.stringify(link)),
    recentClicks: JSON.parse(JSON.stringify(recentClicks)),
    dailyClicks: JSON.parse(JSON.stringify(dailyClicks)),
  };
}

// ── Update tracked link ─────────────────────────────────────────────────
export async function updateTrackedLink(linkId, updates) {
  const userId = await getOwnerId();
  await dbConnect();
  if (!(await checkAiAccess(userId))) return { error: "Feature not available" };

  const link = await TrackedLink.findOne({ _id: linkId, userId });
  if (!link) return { error: "Link not found" };

  const setFields = {};
  if (updates.status) setFields.status = updates.status;
  if (updates.customUrl !== undefined) {
    setFields["affiliateConfig.overriddenByUser"] = !!updates.customUrl;
    setFields["affiliateConfig.userCustomUrl"] = updates.customUrl || "";
  }

  await TrackedLink.findByIdAndUpdate(linkId, { $set: setFields });
  return { success: true };
}

// ── Delete tracked link ─────────────────────────────────────────────────
export async function deleteTrackedLink(linkId) {
  const userId = await getOwnerId();
  await dbConnect();
  if (!(await checkAiAccess(userId))) return { error: "Feature not available" };

  const link = await TrackedLink.findOne({ _id: linkId, userId });
  if (!link) return { error: "Link not found" };

  await ClickEvent.deleteMany({ trackedLinkId: linkId });
  await TrackedLink.deleteOne({ _id: linkId });
  return { success: true };
}

// ── Create manual link ──────────────────────────────────────────────────
export async function createManualLink(data) {
  const userId = await getOwnerId();
  await dbConnect();
  if (!(await checkAiAccess(userId))) return { error: "Feature not available" };

  if (!data.url) return { error: "URL is required" };

  const account = await resolveAccount(userId);

  let shortCode;
  for (let i = 0; i < 5; i++) {
    shortCode = generateShortCode();
    const existing = await TrackedLink.findOne({ shortCode }).lean();
    if (!existing) break;
  }

  const link = await TrackedLink.create({
    shortCode,
    userId,
    accountId: account?._id,
    originalUrl: data.url,
    destination: data.url,
    metadata: {
      productName: data.productName || "Manual Link",
      productCategory: data.category || "other",
    },
    stats: { totalClicks: 0, uniqueClicks: 0, clicksByDate: [], clicksByCountry: [], clicksByDevice: [] },
  });

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://engagr-dm.vercel.app";
  return {
    success: true,
    link: JSON.parse(JSON.stringify(link)),
    trackedUrl: `${appUrl}/go/${shortCode}`,
  };
}

// ── Links overview stats ────────────────────────────────────────────────
export async function getLinksOverviewStats(accountId) {
  const userId = await getOwnerId();
  await dbConnect();
  if (!(await checkAiAccess(userId))) return { error: "Feature not available" };

  const query = { userId };
  if (accountId) query.accountId = accountId;

  const totalLinks = await TrackedLink.countDocuments(query);
  const allLinks = await TrackedLink.find(query).select("stats").lean();

  let totalClicks = 0;
  let totalUnique = 0;
  for (const l of allLinks) {
    totalClicks += l.stats?.totalClicks || 0;
    totalUnique += l.stats?.uniqueClicks || 0;
  }

  // Clicks this month
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);
  const linkIds = allLinks.map((l) => l._id);
  const monthClicks = linkIds.length
    ? await ClickEvent.countDocuments({ trackedLinkId: { $in: linkIds }, timestamp: { $gte: startOfMonth } })
    : 0;
  const monthUnique = linkIds.length
    ? await ClickEvent.countDocuments({ trackedLinkId: { $in: linkIds }, timestamp: { $gte: startOfMonth }, isUnique: true })
    : 0;

  return {
    success: true,
    totalLinks,
    totalClicks,
    totalUnique,
    clicksThisMonth: monthClicks,
    uniqueThisMonth: monthUnique,
  };
}

// ── Chart data for clicks over time ─────────────────────────────────────
export async function getLinksChartData(accountId, days = 30) {
  const userId = await getOwnerId();
  await dbConnect();
  if (!(await checkAiAccess(userId))) return { error: "Feature not available" };

  const query = { userId };
  if (accountId) query.accountId = accountId;
  const linkIds = (await TrackedLink.find(query).select("_id").lean()).map((l) => l._id);

  if (!linkIds.length) return { success: true, data: [] };

  const since = new Date();
  since.setDate(since.getDate() - days);

  const data = await ClickEvent.aggregate([
    { $match: { trackedLinkId: { $in: linkIds }, timestamp: { $gte: since } } },
    {
      $group: {
        _id: { $dateToString: { format: "%Y-%m-%d", date: "$timestamp" } },
        total: { $sum: 1 },
        unique: { $sum: { $cond: ["$isUnique", 1, 0] } },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  return { success: true, data: JSON.parse(JSON.stringify(data)) };
}

// ── Top performing links ────────────────────────────────────────────────
export async function getTopPerformingLinks(accountId, limit = 5) {
  const userId = await getOwnerId();
  await dbConnect();
  if (!(await checkAiAccess(userId))) return { error: "Feature not available" };

  const query = { userId, status: "active" };
  if (accountId) query.accountId = accountId;

  const links = await TrackedLink.find(query)
    .sort({ "stats.totalClicks": -1 })
    .limit(limit)
    .lean();

  return { success: true, links: JSON.parse(JSON.stringify(links)) };
}

// ── Recent AI detections ────────────────────────────────────────────────
export async function getRecentDetections(accountId, limit = 5) {
  const userId = await getOwnerId();
  await dbConnect();
  if (!(await checkAiAccess(userId))) return { error: "Feature not available" };

  const query = { userId };
  if (accountId) query.accountId = accountId;

  const detections = await ProductDetection.find(query)
    .sort({ createdAt: -1 })
    .limit(limit)
    .lean();

  return { success: true, detections: JSON.parse(JSON.stringify(detections)) };
}

// ── AI detection stats for home/automation pages ────────────────────────
export async function getAiDetectionStats(accountId) {
  const userId = await getOwnerId();
  await dbConnect();
  if (!(await checkAiAccess(userId))) return { error: "Feature not available" };

  const user = await User.findOne({ userId }).lean();
  const query = { userId };
  if (accountId) query.accountId = accountId;

  const totalDetections = await ProductDetection.countDocuments(query);
  const successfulDetections = await ProductDetection.countDocuments({ ...query, status: "success" });
  const totalLinks = await TrackedLink.countDocuments({ userId });

  // Clicks on AI links today
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);
  const linkIds = (await TrackedLink.find({ userId }).select("_id").lean()).map((l) => l._id);
  const clicksToday = linkIds.length
    ? await ClickEvent.countDocuments({ trackedLinkId: { $in: linkIds }, timestamp: { $gte: startOfDay } })
    : 0;

  return {
    success: true,
    detectionsThisMonth: user?.usage?.aiDetectionsThisMonth || 0,
    detectionsTotal: totalDetections,
    successfulDetections,
    linksCreated: totalLinks,
    clicksToday,
    costThisMonth: user?.usage?.aiCostThisMonth || 0,
  };
}
