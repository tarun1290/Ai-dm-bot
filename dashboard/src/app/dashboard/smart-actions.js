"use server";

import { cookies } from "next/headers";
import dbConnect from "@/lib/dbConnect";
import User from "@/models/User";
import InstagramAccount from "@/models/InstagramAccount";
import ShopifyStore from "@/models/ShopifyStore";
import ShopifyProduct from "@/models/ShopifyProduct";
import KnowledgeDocument from "@/models/KnowledgeDocument";
import KnowledgeChunk from "@/models/KnowledgeChunk";
import ConversationThread from "@/models/ConversationThread";
import { verifyToken } from "@/lib/jwt";
import { buildAuthUrl } from "@/lib/shopify/oauth";
import { syncShopifyProducts } from "@/lib/shopify/sync";
import { processDocument, refreshUrlDocument } from "@/lib/knowledge/processor";
import { generateEmbedding } from "@/lib/embeddings";
import { vectorSearch } from "@/lib/vectorSearch";

// ── Auth helpers ────────────────────────────────────────────────────────────

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

async function checkFlag(userId, flag) {
  const user = await User.findOne({ userId }).lean();
  return !!user?.flags?.[flag];
}

// ── Smart Features Status ───────────────────────────────────────────────────

export async function getSmartFeaturesStatus(accountId) {
  const userId = await getOwnerId();
  await dbConnect();

  const user = await User.findOne({ userId }).lean();
  const account = await resolveAccount(userId, accountId);

  return {
    shopifyEnabled: !!user?.flags?.shopifyEnabled,
    knowledgeBaseEnabled: !!user?.flags?.knowledgeBaseEnabled,
    smartRepliesEnabled: !!user?.flags?.smartRepliesEnabled,
    accountSmartFeatures: account?.smartFeatures || null,
  };
}

// ══════════════════════════════════════════════════════════════════════════════
// SHOPIFY ACTIONS
// ══════════════════════════════════════════════════════════════════════════════

export async function startShopifyConnect(accountId, shopDomain) {
  const userId = await getOwnerId();
  await dbConnect();

  if (!(await checkFlag(userId, "shopifyEnabled"))) {
    return { error: "Feature not available" };
  }

  if (!shopDomain || !/^[a-zA-Z0-9][a-zA-Z0-9-]*\.myshopify\.com$/.test(shopDomain)) {
    return { error: "Invalid Shopify domain. Must end in .myshopify.com" };
  }

  try {
    const url = await buildAuthUrl(shopDomain, userId, accountId);
    return { success: true, authUrl: url };
  } catch (e) {
    return { error: e.message };
  }
}

export async function getShopifyStore(accountId) {
  const userId = await getOwnerId();
  await dbConnect();

  if (!(await checkFlag(userId, "shopifyEnabled"))) {
    return { error: "Feature not available" };
  }

  const store = await ShopifyStore.findOne({ userId })
    .select("-accessToken")
    .lean();

  if (!store) return { success: true, store: null };

  return { success: true, store: JSON.parse(JSON.stringify(store)) };
}

export async function disconnectShopify(storeId) {
  const userId = await getOwnerId();
  await dbConnect();

  if (!(await checkFlag(userId, "shopifyEnabled"))) {
    return { error: "Feature not available" };
  }

  const store = await ShopifyStore.findOne({ _id: storeId, userId });
  if (!store) return { error: "Store not found" };

  await ShopifyStore.findByIdAndUpdate(storeId, {
    isConnected: false,
    disconnectedAt: new Date(),
    updatedAt: new Date(),
  });

  return { success: true };
}

export async function triggerShopifySync(storeId) {
  const userId = await getOwnerId();
  await dbConnect();

  if (!(await checkFlag(userId, "shopifyEnabled"))) {
    return { error: "Feature not available" };
  }

  const store = await ShopifyStore.findOne({ _id: storeId, userId });
  if (!store) return { error: "Store not found" };

  const result = await syncShopifyProducts(storeId);
  return result;
}

export async function searchShopifyProducts(accountId, query, limit = 5) {
  const userId = await getOwnerId();
  await dbConnect();

  if (!(await checkFlag(userId, "shopifyEnabled"))) {
    return { error: "Feature not available" };
  }

  const results = [];

  // 1. Try vector search
  try {
    const queryEmbedding = await generateEmbedding(query);
    const vectorResults = await vectorSearch(
      "shopifyproducts",
      queryEmbedding,
      { userId },
      limit
    );
    results.push(...vectorResults);
  } catch (e) {
    console.error("[ShopifySearch] Vector search failed:", e.message);
  }

  // 2. Fallback: text search
  if (results.length < limit) {
    const textResults = await ShopifyProduct.find(
      { userId, status: "active", $text: { $search: query } },
      { score: { $meta: "textScore" }, embedding: 0 }
    )
      .sort({ score: { $meta: "textScore" } })
      .limit(limit)
      .lean();

    // Deduplicate
    const existingIds = new Set(results.map((r) => r._id?.toString()));
    for (const r of textResults) {
      if (!existingIds.has(r._id.toString())) {
        results.push(r);
      }
    }
  }

  return {
    success: true,
    products: JSON.parse(JSON.stringify(results.slice(0, limit))),
  };
}

// ══════════════════════════════════════════════════════════════════════════════
// KNOWLEDGE BASE ACTIONS
// ══════════════════════════════════════════════════════════════════════════════

export async function getKnowledgeDocuments(accountId) {
  const userId = await getOwnerId();
  await dbConnect();

  if (!(await checkFlag(userId, "knowledgeBaseEnabled"))) {
    return { error: "Feature not available" };
  }

  const account = await resolveAccount(userId, accountId);
  if (!account) return { error: "No account found" };

  const docs = await KnowledgeDocument.find({
    userId,
    accountId: account._id,
  })
    .sort({ createdAt: -1 })
    .lean();

  return { success: true, documents: JSON.parse(JSON.stringify(docs)) };
}

export async function addKnowledgeUrl(accountId, url) {
  const userId = await getOwnerId();
  await dbConnect();

  if (!(await checkFlag(userId, "knowledgeBaseEnabled"))) {
    return { error: "Feature not available" };
  }

  if (!url || !url.startsWith("https://")) {
    return { error: "URL must use HTTPS" };
  }

  const account = await resolveAccount(userId, accountId);
  if (!account) return { error: "No account found" };

  // Check limits: max 5 URLs per account
  const urlCount = await KnowledgeDocument.countDocuments({
    userId, accountId: account._id, fileType: "url",
  });
  if (urlCount >= 5) {
    return { error: "Maximum 5 URL sources per account" };
  }

  // Check total document limit
  const docCount = await KnowledgeDocument.countDocuments({
    userId, accountId: account._id,
  });
  if (docCount >= 10) {
    return { error: "Maximum 10 documents per account" };
  }

  const hostname = new URL(url).hostname;
  const doc = await KnowledgeDocument.create({
    userId,
    accountId: account._id,
    fileName: hostname,
    fileType: "url",
    fileUrl: url,
    status: "processing",
    metadata: { domain: hostname },
  });

  // Process async
  processDocument(doc._id.toString()).catch((e) =>
    console.error("[Knowledge] URL processing failed:", e.message)
  );

  return {
    success: true,
    document: JSON.parse(JSON.stringify(doc)),
  };
}

export async function uploadKnowledgePdf(accountId, fileUrl, fileName, fileSize) {
  const userId = await getOwnerId();
  await dbConnect();

  if (!(await checkFlag(userId, "knowledgeBaseEnabled"))) {
    return { error: "Feature not available" };
  }

  const account = await resolveAccount(userId, accountId);
  if (!account) return { error: "No account found" };

  // Validate size (max 10MB)
  if (fileSize > 10 * 1024 * 1024) {
    return { error: "PDF must be under 10MB" };
  }

  // Check limits
  const docCount = await KnowledgeDocument.countDocuments({
    userId, accountId: account._id,
  });
  if (docCount >= 10) {
    return { error: "Maximum 10 documents per account" };
  }

  const doc = await KnowledgeDocument.create({
    userId,
    accountId: account._id,
    fileName: fileName || "document.pdf",
    fileType: "pdf",
    fileUrl,
    fileSize,
    status: "processing",
  });

  // Process async
  processDocument(doc._id.toString()).catch((e) =>
    console.error("[Knowledge] PDF processing failed:", e.message)
  );

  return {
    success: true,
    document: JSON.parse(JSON.stringify(doc)),
  };
}

export async function deleteKnowledgeDocument(documentId) {
  const userId = await getOwnerId();
  await dbConnect();

  if (!(await checkFlag(userId, "knowledgeBaseEnabled"))) {
    return { error: "Feature not available" };
  }

  const doc = await KnowledgeDocument.findOne({ _id: documentId, userId });
  if (!doc) return { error: "Document not found" };

  await KnowledgeChunk.deleteMany({ documentId: doc._id });
  await KnowledgeDocument.deleteOne({ _id: doc._id });

  return { success: true };
}

export async function refreshKnowledgeUrl(documentId) {
  const userId = await getOwnerId();
  await dbConnect();

  if (!(await checkFlag(userId, "knowledgeBaseEnabled"))) {
    return { error: "Feature not available" };
  }

  const doc = await KnowledgeDocument.findOne({ _id: documentId, userId, fileType: "url" });
  if (!doc) return { error: "URL document not found" };

  // Process async
  refreshUrlDocument(documentId).catch((e) =>
    console.error("[Knowledge] URL refresh failed:", e.message)
  );

  return { success: true };
}

export async function searchKnowledge(accountId, query, limit = 5) {
  const userId = await getOwnerId();
  await dbConnect();

  if (!(await checkFlag(userId, "knowledgeBaseEnabled"))) {
    return { error: "Feature not available" };
  }

  const account = await resolveAccount(userId, accountId);
  if (!account) return { error: "No account found" };

  try {
    const queryEmbedding = await generateEmbedding(query);
    const results = await vectorSearch(
      "knowledgechunks",
      queryEmbedding,
      { userId, accountId: account._id },
      limit
    );

    // Enrich with document info
    const enriched = [];
    for (const chunk of results) {
      const doc = await KnowledgeDocument.findById(chunk.documentId)
        .select("fileName fileType fileUrl metadata")
        .lean();
      enriched.push({
        ...chunk,
        document: doc ? JSON.parse(JSON.stringify(doc)) : null,
      });
    }

    return { success: true, chunks: JSON.parse(JSON.stringify(enriched)) };
  } catch (e) {
    console.error("[KnowledgeSearch] Failed:", e.message);
    return { success: true, chunks: [] };
  }
}

// ══════════════════════════════════════════════════════════════════════════════
// CONVERSATION THREAD ACTIONS
// ══════════════════════════════════════════════════════════════════════════════

export async function getConversationThread(accountId, senderIgId) {
  const userId = await getOwnerId();
  await dbConnect();

  if (!(await checkFlag(userId, "smartRepliesEnabled"))) {
    return { error: "Feature not available" };
  }

  const account = await resolveAccount(userId, accountId);
  if (!account) return { error: "No account found" };

  const thread = await ConversationThread.findOne({
    accountId: account._id,
    senderIgId,
    status: "active",
    expiresAt: { $gt: new Date() },
  }).lean();

  if (!thread) return { success: true, thread: null };

  return { success: true, thread: JSON.parse(JSON.stringify(thread)) };
}

export async function saveConversationMessage(threadId, message) {
  await dbConnect();

  const thread = await ConversationThread.findById(threadId);
  if (!thread) return { error: "Thread not found" };

  thread.messages.push({
    role: message.role,
    content: message.content,
    timestamp: new Date(),
    metadata: message.metadata || {},
  });

  thread.messageCount = thread.messages.length;
  thread.lastMessageAt = new Date();
  thread.expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
  thread.updatedAt = new Date();

  // If thread has > 20 messages, summarize older ones
  if (thread.messages.length > 20) {
    const olderMessages = thread.messages.slice(0, thread.messages.length - 10);
    const summary = olderMessages
      .map((m) => `${m.role}: ${m.content.substring(0, 100)}`)
      .join("\n");
    thread.context.conversationSummary = summary;
    thread.messages = thread.messages.slice(-10);
  }

  await thread.save();

  return { success: true };
}

export async function createConversationThread(accountId, senderIgId, senderUsername) {
  const userId = await getOwnerId();
  await dbConnect();

  const account = await resolveAccount(userId, accountId);
  if (!account) return { error: "No account found" };

  const thread = await ConversationThread.create({
    userId,
    accountId: account._id,
    senderIgId,
    senderUsername,
    messages: [],
    status: "active",
    messageCount: 0,
    lastMessageAt: new Date(),
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
  });

  return { success: true, thread: JSON.parse(JSON.stringify(thread)) };
}

// ══════════════════════════════════════════════════════════════════════════════
// SMART REPLY CONFIG ACTION
// ══════════════════════════════════════════════════════════════════════════════

export async function saveSmartReplyConfig(config, accountId) {
  const userId = await getOwnerId();
  await dbConnect();

  if (!(await checkFlag(userId, "smartRepliesEnabled"))) {
    return { error: "Feature not available" };
  }

  const account = await resolveAccount(userId, accountId);
  if (!account) return { error: "No account found" };

  const cleanConfig = {
    enabled: config.enabled ?? false,
    tone: config.tone || "friendly",
    businessDescription: config.businessDescription || "",
    autoReplyToAllDMs: config.autoReplyToAllDMs ?? false,
    excludeKeywords: (config.excludeKeywords || []).map((k) => k.trim()).filter(Boolean),
    maxRepliesPerThread: config.maxRepliesPerThread || 20,
    workingHoursOnly: config.workingHoursOnly ?? false,
    workingHours: {
      start: config.workingHours?.start || "09:00",
      end: config.workingHours?.end || "18:00",
      timezone: config.workingHours?.timezone || "Asia/Kolkata",
    },
  };

  await InstagramAccount.findByIdAndUpdate(account._id, {
    "automation.smartReplyConfig": cleanConfig,
  });

  await User.findOneAndUpdate({ userId }, {
    "automation.smartReplyConfig": cleanConfig,
  });

  return { success: true, config: cleanConfig };
}

export async function getSmartReplyStats(accountId) {
  const userId = await getOwnerId();
  await dbConnect();

  if (!(await checkFlag(userId, "smartRepliesEnabled"))) {
    return { error: "Feature not available" };
  }

  const account = await resolveAccount(userId, accountId);
  if (!account) return { error: "No account found" };

  const Event = (await import("@/models/Event")).default;
  const acctId = account._id;

  const totalReplies = await Event.countDocuments({ accountId: acctId, type: "smart_reply", "reply.status": "sent" });
  const totalHandoffs = await Event.countDocuments({ accountId: acctId, type: "smart_reply", "metadata.handoff": true });

  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);
  const repliesThisMonth = await Event.countDocuments({
    accountId: acctId,
    type: "smart_reply",
    "reply.status": "sent",
    createdAt: { $gte: startOfMonth },
  });

  const intentBreakdown = await Event.aggregate([
    { $match: { accountId: acctId, type: "smart_reply" } },
    { $group: { _id: "$metadata.intent", count: { $sum: 1 } } },
    { $sort: { count: -1 } },
  ]);

  const activeThreads = await ConversationThread.countDocuments({
    accountId: acctId,
    status: "active",
    expiresAt: { $gt: new Date() },
  });

  return {
    success: true,
    totalReplies,
    totalHandoffs,
    repliesThisMonth,
    activeThreads,
    intentBreakdown: JSON.parse(JSON.stringify(intentBreakdown)),
  };
}
