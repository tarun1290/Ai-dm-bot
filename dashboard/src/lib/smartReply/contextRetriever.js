// [SMART FEATURES] Uncomment when Shopify + Knowledge Base + Smart Replies are enabled
// /**
//  * Context Retrieval (RAG)
//  *
//  * Searches Shopify products and Knowledge Base for relevant context
//  * based on the user's message and classified intent.
//  */
//
// import dbConnect from "@/lib/dbConnect";
// import ShopifyStore from "@/models/ShopifyStore";
// import { generateEmbedding } from "@/lib/embeddings";
// import { vectorSearch } from "@/lib/vectorSearch";
//
// const PRODUCT_INTENTS = ["product_inquiry", "recommendation", "other"];
// const KNOWLEDGE_INTENTS = ["product_inquiry", "support", "recommendation", "general_question", "other"];
//
// /**
//  * Retrieve context from Shopify catalog and Knowledge Base.
//  *
//  * @param {string} accountId - InstagramAccount._id
//  * @param {string} userId - Engagr user ID
//  * @param {string} messageText - The user's DM message
//  * @param {string} intent - Classified intent
//  * @returns {Promise<{ products: Object[], knowledgeChunks: Object[], orderInfo: Object|null }>}
//  */
// export async function retrieveContext(accountId, userId, messageText, intent) {
//   await dbConnect();
//
//   const context = { products: [], knowledgeChunks: [], orderInfo: null };
//
//   try {
//     // Generate query embedding (shared between both searches)
//     const queryEmbedding = await Promise.race([
//       generateEmbedding(messageText),
//       new Promise((_, reject) => setTimeout(() => reject(new Error("embedding timeout")), 3000)),
//     ]);
//
//     // Search Shopify products
//     if (PRODUCT_INTENTS.includes(intent)) {
//       try {
//         const store = await ShopifyStore.findOne({ userId, isConnected: true }).lean();
//         if (store) {
//           const products = await vectorSearch("shopifyproducts", queryEmbedding, { userId }, 5);
//           context.products = products.map((p) => ({
//             title: p.title,
//             description: p.description?.slice(0, 200),
//             price: p.priceRange
//               ? `${p.priceRange.min}${p.priceRange.min !== p.priceRange.max ? `-${p.priceRange.max}` : ""}`
//               : p.variants?.[0]?.price || "N/A",
//             url: p.productUrl,
//             image: p.primaryImageUrl,
//             vendor: p.vendor,
//             available: p.variants?.some((v) => v.available) ?? true,
//             score: p.score,
//           }));
//         }
//       } catch (e) {
//         console.error("[ContextRetriever] Shopify search failed:", e.message);
//       }
//     }
//
//     // Search Knowledge Base
//     if (KNOWLEDGE_INTENTS.includes(intent)) {
//       try {
//         const chunks = await vectorSearch("knowledgechunks", queryEmbedding, { userId }, 5);
//         context.knowledgeChunks = chunks.map((c) => ({
//           content: c.content,
//           source: c.metadata?.sourceUrl || "uploaded document",
//           score: c.score,
//         }));
//       } catch (e) {
//         console.error("[ContextRetriever] Knowledge search failed:", e.message);
//       }
//     }
//
//     // Order status template
//     if (intent === "order_status") {
//       context.orderInfo = {
//         templateResponse: true,
//         message:
//           "To help you with your order, could you share your order number or the email you used to place it? I'll look it up for you!",
//       };
//     }
//   } catch (err) {
//     console.error("[ContextRetriever] Error:", err.message);
//   }
//
//   return context;
// }
// [/SMART FEATURES]

// Stub — active while smart features are disabled
export async function retrieveContext(_accountId, _userId, _messageText, _intent) { return { products: [], knowledgeChunks: [], orderInfo: null }; }
