// [SMART FEATURES] Uncomment when Shopify + Knowledge Base + Smart Replies are enabled
// /**
//  * AI Reply Generator
//  *
//  * Builds a grounded AI reply using retrieved context (products + knowledge).
//  * Chooses model tier based on intent complexity.
//  */
//
// import { callAI } from "./aiCaller";
//
// /**
//  * Generate a smart reply grounded in business data.
//  *
//  * @param {string} messageText - Customer's DM message
//  * @param {string} intent - Classified intent
//  * @param {Object} context - Retrieved context (products, knowledgeChunks)
//  * @param {Object[]} conversationHistory - Previous messages in this thread
//  * @param {Object} accountInfo - { businessName, username, tone, businessDescription }
//  * @returns {Promise<{ text: string, model: string, tokensUsed: number, productsReferenced: string[], chunksUsed: number, confidence: number, estimatedCost: number }>}
//  */
// export async function generateSmartReply(messageText, intent, context, conversationHistory, accountInfo) {
//   const tier = intent === "recommendation" ? "sonnet" : "haiku";
//
//   // Build context sections
//   let contextText = "";
//
//   if (context.products.length > 0) {
//     contextText += "\n## AVAILABLE PRODUCTS:\n";
//     context.products.forEach((p, i) => {
//       contextText += `${i + 1}. ${p.title} — ${p.price} ${p.available ? "(In Stock)" : "(Out of Stock)"}`;
//       if (p.vendor) contextText += ` by ${p.vendor}`;
//       contextText += "\n";
//       if (p.description) contextText += `   ${p.description}\n`;
//       if (p.url) contextText += `   Link: ${p.url}\n`;
//     });
//   }
//
//   if (context.knowledgeChunks.length > 0) {
//     contextText += "\n## BUSINESS INFORMATION:\n";
//     context.knowledgeChunks.forEach((c) => {
//       contextText += `${c.content}\n---\n`;
//     });
//   }
//
//   // Build conversation history (last 6 messages)
//   let historyText = "";
//   if (conversationHistory?.length > 0) {
//     historyText = "\n## CONVERSATION HISTORY:\n";
//     conversationHistory.slice(-6).forEach((msg) => {
//       historyText += `${msg.role === "user" ? "Customer" : "You"}: ${msg.content}\n`;
//     });
//   }
//
//   const toneGuide = {
//     friendly: "warm, enthusiastic, and approachable",
//     professional: "polished, respectful, and business-like",
//     casual: "relaxed, fun, and conversational",
//   };
//   const toneDesc = toneGuide[accountInfo.tone] || toneGuide.friendly;
//
//   const businessDesc = accountInfo.businessDescription
//     ? `\nAbout this business: ${accountInfo.businessDescription}`
//     : "";
//
//   const systemPrompt = `You are a ${toneDesc} customer support assistant for ${accountInfo.businessName || "this business"} on Instagram.${businessDesc}
//
// RULES:
// - Keep replies short and conversational (max 3-4 sentences for simple queries, max 6-8 for detailed ones)
// - Be warm and use a ${toneDesc} tone
// - If recommending products, include the product name and price
// - NEVER make up product information — only reference products from AVAILABLE PRODUCTS
// - NEVER make up business policies — only reference info from BUSINESS INFORMATION
// - If you don't have enough information, say so honestly and suggest contacting the business directly
// - If a product link is available, mention it naturally: "You can check it out here: [link]"
// - Do NOT use markdown formatting — this is an Instagram DM, use plain text only
// - Use emojis sparingly and naturally (1-2 max per message)
// - If the customer seems frustrated, acknowledge their concern first
// - NEVER mention that you're an AI, a bot, or using a knowledge base
// - Respond as if you ARE the business
// - Keep response under 1000 characters (Instagram DM limit)`;
//
//   const userPrompt = `${contextText}${historyText}
//
// ## CUSTOMER'S MESSAGE:
// "${messageText}"
//
// Intent: ${intent}
//
// Generate a helpful reply:`;
//
//   try {
//     const result = await Promise.race([
//       callAI(tier, systemPrompt, userPrompt),
//       new Promise((_, reject) => setTimeout(() => reject(new Error("reply generation timeout")), 5000)),
//     ]);
//
//     const replyText = result.text.trim();
//
//     // Identify which products were referenced in the reply
//     const productsReferenced = context.products
//       .filter((p) => replyText.toLowerCase().includes(p.title.toLowerCase()))
//       .map((p) => p.title);
//
//     return {
//       text: replyText,
//       model: tier,
//       tokensUsed: result.tokensUsed,
//       productsReferenced,
//       chunksUsed: context.knowledgeChunks.length,
//       confidence: 0.8,
//       estimatedCost: result.estimatedCost,
//     };
//   } catch (err) {
//     console.error("[ReplyGenerator] Error:", err.message);
//     throw err;
//   }
// }
// [/SMART FEATURES]

// Stub — active while smart features are disabled
export async function generateSmartReply(_messageText, _intent, _context, _conversationHistory, _accountInfo) { return { text: '', model: 'disabled', tokensUsed: 0, productsReferenced: [], chunksUsed: 0, confidence: 0, estimatedCost: 0 }; }
