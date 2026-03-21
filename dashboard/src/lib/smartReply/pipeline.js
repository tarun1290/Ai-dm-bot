// [SMART FEATURES] Uncomment when Shopify + Knowledge Base + Smart Replies are enabled
// /**
//  * Smart Reply Pipeline
//  *
//  * Orchestrates: intent classification → handoff check → context retrieval → AI reply
//  * Called from the webhook handler for plain-text DMs when smart replies are enabled.
//  *
//  * Total pipeline timeout: 8 seconds.
//  */
//
// import dbConnect from "@/lib/dbConnect";
// import ConversationThread from "@/models/ConversationThread";
// import User from "@/models/User";
// import Event from "@/models/Event";
// import { classifyIntent } from "./intentClassifier";
// import { retrieveContext } from "./contextRetriever";
// import { generateSmartReply } from "./replyGenerator";
// import {
//   shouldHandOff,
//   GREETING_TEMPLATES,
//   ORDER_STATUS_TEMPLATE,
//   HANDOFF_MESSAGE,
// } from "./handoff";
//
// const PIPELINE_TIMEOUT_MS = 8000;
// const MAX_REPLIES_PER_SENDER_PER_HOUR = 5;
//
// /**
//  * Run the full smart reply pipeline for an incoming DM.
//  *
//  * @param {Object} params
//  * @param {string} params.senderId - Instagram sender ID
//  * @param {string} params.senderUsername - Sender's username
//  * @param {string} params.messageText - The DM text
//  * @param {string} params.token - Instagram access token for sending replies
//  * @param {Object} params.botUser - User document (Engagr account owner)
//  * @param {Object} params.igAccount - InstagramAccount document
//  * @param {string} params.accountId - InstagramAccount._id
//  * @param {string} params.igBusinessId - Instagram business ID
//  * @param {Function} params.sendDM - sendDM(recipientId, text, token) function
//  * @param {Function} params.sendGenericTemplate - sendGenericTemplate(recipientId, elements, token) function
//  * @param {Function} params.saveEvent - saveEvent(data) function
//  * @param {Function} params.trackDmUsage - trackDmUsage(botUser, source) function
//  * @param {Function} params.enforceDmQuota - enforceDmQuota(botUser, accountId, igBusinessId) function
//  * @returns {Promise<{ handled: boolean, replyText: string|null, error: string|null }>}
//  */
// export async function runSmartReplyPipeline({
//   senderId,
//   senderUsername,
//   messageText,
//   token,
//   botUser,
//   igAccount,
//   accountId,
//   igBusinessId,
//   sendDM,
//   sendGenericTemplate,
//   saveEvent,
//   trackDmUsage,
//   enforceDmQuota,
// }) {
//   const startTime = Date.now();
//   const emptyResult = { handled: false, replyText: null, error: null };
//
//   try {
//     return await Promise.race([
//       _runPipeline({
//         senderId, senderUsername, messageText, token,
//         botUser, igAccount, accountId, igBusinessId,
//         sendDM, sendGenericTemplate, saveEvent, trackDmUsage, enforceDmQuota,
//         startTime,
//       }),
//       new Promise((_, reject) =>
//         setTimeout(() => reject(new Error("Smart reply pipeline timeout")), PIPELINE_TIMEOUT_MS)
//       ),
//     ]);
//   } catch (err) {
//     console.error("[SmartReply] Pipeline error:", err.message);
//     return { ...emptyResult, error: err.message };
//   }
// }
//
// async function _runPipeline({
//   senderId, senderUsername, messageText, token,
//   botUser, igAccount, accountId, igBusinessId,
//   sendDM, sendGenericTemplate, saveEvent, trackDmUsage, enforceDmQuota,
//   startTime,
// }) {
//   await dbConnect();
//
//   const smartConfig = igAccount?.automation?.smartReplyConfig || {};
//   const fromInfo = { id: senderId, username: senderUsername };
//
//   // ── Exclude keywords check ──────────────────────────────────────────────
//   if (smartConfig.excludeKeywords?.length > 0) {
//     const lower = messageText.toLowerCase();
//     if (smartConfig.excludeKeywords.some((kw) => lower.includes(kw.toLowerCase()))) {
//       return { handled: false, replyText: null, error: null };
//     }
//   }
//
//   // ── Working hours check ─────────────────────────────────────────────────
//   if (smartConfig.workingHoursOnly && smartConfig.workingHours) {
//     const { start, end } = smartConfig.workingHours;
//     if (start && end) {
//       const now = new Date();
//       const hours = now.getHours();
//       const minutes = now.getMinutes();
//       const currentTime = hours * 60 + minutes;
//       const [startH, startM] = start.split(":").map(Number);
//       const [endH, endM] = end.split(":").map(Number);
//       const startTime = startH * 60 + (startM || 0);
//       const endTime = endH * 60 + (endM || 0);
//       if (currentTime < startTime || currentTime > endTime) {
//         return { handled: false, replyText: null, error: null };
//       }
//     }
//   }
//
//   // ── Rate limit: max 5 replies per sender per hour ───────────────────────
//   const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
//   const recentReplies = await Event.countDocuments({
//     accountId,
//     "from.id": senderId,
//     type: "smart_reply",
//     createdAt: { $gte: oneHourAgo },
//   });
//   if (recentReplies >= MAX_REPLIES_PER_SENDER_PER_HOUR) {
//     console.log(`[SmartReply] Rate limited for sender ${senderId} (${recentReplies} replies/hour)`);
//     return { handled: false, replyText: null, error: "rate_limited" };
//   }
//
//   // ── DM quota check ─────────────────────────────────────────────────────
//   const quota = await enforceDmQuota(botUser, accountId, igBusinessId);
//   if (!quota.allowed) {
//     return { handled: false, replyText: null, error: "quota_exceeded" };
//   }
//
//   // ── Find or create conversation thread ──────────────────────────────────
//   let thread = await ConversationThread.findOne({
//     accountId,
//     senderIgId: senderId,
//     status: "active",
//     expiresAt: { $gt: new Date() },
//   });
//
//   if (!thread) {
//     thread = await ConversationThread.create({
//       userId: botUser.userId,
//       accountId,
//       senderIgId: senderId,
//       senderUsername,
//       messages: [],
//       status: "active",
//       messageCount: 0,
//       lastMessageAt: new Date(),
//       expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
//     });
//   }
//
//   // ── Max replies per thread check ────────────────────────────────────────
//   const maxReplies = smartConfig.maxRepliesPerThread || 20;
//   const assistantMessages = thread.messages.filter((m) => m.role === "assistant").length;
//   if (assistantMessages >= maxReplies) {
//     console.log(`[SmartReply] Thread max replies reached (${assistantMessages}/${maxReplies})`);
//     return { handled: false, replyText: null, error: "max_replies_reached" };
//   }
//
//   // Add user message to thread
//   thread.messages.push({ role: "user", content: messageText, timestamp: new Date() });
//
//   // ── 1. Classify intent ──────────────────────────────────────────────────
//   const { intent, confidence, extractedEntity } = await classifyIntent(messageText);
//   console.log(`[SmartReply] Intent: ${intent} (${confidence}) entity: ${extractedEntity}`);
//
//   // ── 2. Handoff check ───────────────────────────────────────────────────
//   const handoffResult = shouldHandOff(intent, confidence, messageText, thread.messages);
//
//   if (handoffResult.skipReply) {
//     // Spam — skip silently
//     await saveEvent({
//       type: "smart_reply",
//       accountId,
//       targetBusinessId: igBusinessId,
//       from: fromInfo,
//       content: { text: messageText },
//       reply: { status: "skipped" },
//       metadata: { matchType: "smart_reply", intent, confidence, reason: "spam" },
//     });
//     return { handled: true, replyText: null, error: null };
//   }
//
//   if (handoffResult.shouldHandOff) {
//     try { await sendDM(senderId, HANDOFF_MESSAGE, token); } catch { /* non-fatal */ }
//     thread.status = "handed_off";
//     thread.handedOffAt = new Date();
//     thread.handedOffReason = handoffResult.reason;
//     thread.messages.push({ role: "assistant", content: HANDOFF_MESSAGE, timestamp: new Date() });
//     thread.messageCount = thread.messages.length;
//     thread.lastMessageAt = new Date();
//     await thread.save();
//
//     await saveEvent({
//       type: "smart_reply",
//       accountId,
//       targetBusinessId: igBusinessId,
//       from: fromInfo,
//       content: { text: messageText },
//       reply: { privateDM: HANDOFF_MESSAGE, status: "sent" },
//       metadata: { matchType: "smart_reply", intent, confidence, handoff: true, handoffReason: handoffResult.reason },
//     });
//
//     await trackDmUsage(botUser, quota.source);
//     return { handled: true, replyText: HANDOFF_MESSAGE, error: null };
//   }
//
//   // ── 3. Template responses (no AI needed) ────────────────────────────────
//   if (intent === "greeting") {
//     const reply = GREETING_TEMPLATES[Math.floor(Math.random() * GREETING_TEMPLATES.length)];
//     try { await sendDM(senderId, reply, token); } catch (e) {
//       console.error("[SmartReply] Send greeting failed:", e.message);
//       return { handled: false, replyText: null, error: e.message };
//     }
//
//     thread.messages.push({ role: "assistant", content: reply, timestamp: new Date() });
//     thread.messageCount = thread.messages.length;
//     thread.lastMessageAt = new Date();
//     thread.expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
//     await thread.save();
//
//     await saveEvent({
//       type: "smart_reply",
//       accountId,
//       targetBusinessId: igBusinessId,
//       from: fromInfo,
//       content: { text: messageText },
//       reply: { privateDM: reply, status: "sent" },
//       metadata: { matchType: "smart_reply", intent, confidence, aiModel: "template" },
//     });
//
//     await trackDmUsage(botUser, quota.source);
//     return { handled: true, replyText: reply, error: null };
//   }
//
//   // ── 4. Retrieve context (RAG) ──────────────────────────────────────────
//   const context = await retrieveContext(accountId, botUser.userId, messageText, intent);
//
//   // Order status template
//   if (intent === "order_status" && context.orderInfo?.templateResponse) {
//     const reply = context.orderInfo.message;
//     try { await sendDM(senderId, reply, token); } catch { /* non-fatal */ }
//
//     thread.messages.push({ role: "assistant", content: reply, timestamp: new Date() });
//     thread.messageCount = thread.messages.length;
//     thread.lastMessageAt = new Date();
//     thread.expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
//     await thread.save();
//
//     await saveEvent({
//       type: "smart_reply",
//       accountId,
//       targetBusinessId: igBusinessId,
//       from: fromInfo,
//       content: { text: messageText },
//       reply: { privateDM: reply, status: "sent" },
//       metadata: { matchType: "smart_reply", intent, confidence, aiModel: "template" },
//     });
//
//     await trackDmUsage(botUser, quota.source);
//     return { handled: true, replyText: reply, error: null };
//   }
//
//   // ── 5. Generate AI reply ───────────────────────────────────────────────
//   const accountInfo = {
//     businessName: igAccount.instagramUsername || "this business",
//     username: igAccount.instagramUsername,
//     tone: smartConfig.tone || "friendly",
//     businessDescription: smartConfig.businessDescription || "",
//   };
//
//   const replyResult = await generateSmartReply(
//     messageText, intent, context, thread.messages, accountInfo
//   );
//
//   // Validate reply
//   if (!replyResult.text || replyResult.text.length < 10) {
//     console.error("[SmartReply] AI returned empty/short reply");
//     return { handled: false, replyText: null, error: "empty_reply" };
//   }
//
//   // ── 6. Send the reply ──────────────────────────────────────────────────
//   let replySent = false;
//
//   // If products referenced and have URLs → send generic template with product card
//   if (replyResult.productsReferenced.length > 0 && context.products.length > 0) {
//     const topProduct = context.products.find((p) =>
//       replyResult.productsReferenced.includes(p.title)
//     );
//     if (topProduct?.url && topProduct?.image) {
//       try {
//         // Send text first, then product card
//         await sendDM(senderId, replyResult.text, token);
//         await sendGenericTemplate(senderId, [{
//           title: topProduct.title,
//           subtitle: `${topProduct.price}`,
//           image_url: topProduct.image,
//           default_action: { type: "web_url", url: topProduct.url },
//           buttons: [{ type: "web_url", url: topProduct.url, title: "View Product" }],
//         }], token);
//         replySent = true;
//       } catch (e) {
//         console.error("[SmartReply] Template send failed, trying plain text:", e.message);
//       }
//     }
//   }
//
//   if (!replySent) {
//     try {
//       await sendDM(senderId, replyResult.text, token);
//       replySent = true;
//     } catch (e) {
//       console.error("[SmartReply] DM send failed:", e.message);
//       return { handled: false, replyText: null, error: e.message };
//     }
//   }
//
//   // ── 7. Save to thread ──────────────────────────────────────────────────
//   thread.messages.push({
//     role: "assistant",
//     content: replyResult.text,
//     timestamp: new Date(),
//     metadata: {
//       confidence: replyResult.confidence,
//       aiModel: replyResult.model,
//     },
//   });
//   thread.context.lastRetrievedChunks = context.knowledgeChunks.map((c) => c.content).slice(0, 3);
//   thread.context.lastReferencedProducts = context.products.slice(0, 3).map((p) => ({
//     title: p.title,
//     price: p.price,
//     url: p.url,
//   }));
//   thread.messageCount = thread.messages.length;
//   thread.lastMessageAt = new Date();
//   thread.expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
//
//   // Summarize if thread is getting long
//   if (thread.messages.length > 20) {
//     const older = thread.messages.slice(0, thread.messages.length - 10);
//     thread.context.conversationSummary = older
//       .map((m) => `${m.role}: ${m.content.substring(0, 80)}`)
//       .join("\n");
//     thread.messages = thread.messages.slice(-10);
//   }
//
//   await thread.save();
//
//   // ── 8. Log event ───────────────────────────────────────────────────────
//   await saveEvent({
//     type: "smart_reply",
//     accountId,
//     targetBusinessId: igBusinessId,
//     from: fromInfo,
//     content: { text: messageText },
//     reply: { privateDM: replyResult.text, status: replySent ? "sent" : "failed" },
//     metadata: {
//       matchType: "smart_reply",
//       intent,
//       confidence,
//       extractedEntity,
//       aiModel: replyResult.model,
//       productsReferenced: replyResult.productsReferenced,
//       knowledgeChunksUsed: replyResult.chunksUsed,
//       processingTimeMs: Date.now() - startTime,
//     },
//   });
//
//   // ── 9. Track usage ─────────────────────────────────────────────────────
//   if (replySent) {
//     await trackDmUsage(botUser, quota.source);
//     await User.findOneAndUpdate(
//       { userId: botUser.userId },
//       {
//         $inc: {
//           "usage.aiDetectionsThisMonth": 1,
//           "usage.aiDetectionsTotal": 1,
//           "usage.aiCostThisMonth": replyResult.estimatedCost || 0,
//         },
//       }
//     );
//   }
//
//   console.log(`[SmartReply] Replied to ${senderUsername} (${intent}, ${Date.now() - startTime}ms)`);
//   return { handled: true, replyText: replyResult.text, error: null };
// }
// [/SMART FEATURES]

// Stub — active while smart features are disabled
export async function runSmartReplyPipeline(_params) { return { handled: false, replyText: null, error: 'disabled' }; }
