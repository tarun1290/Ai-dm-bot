// [SMART FEATURES] Uncomment when Shopify + Knowledge Base + Smart Replies are enabled
// /**
//  * Intent Classification
//  *
//  * Quickly classifies incoming DM messages before expensive retrieval.
//  * Uses the cheapest AI tier (flash/haiku).
//  */
//
// import { callAI } from "./aiCaller";
//
// const INTENT_PROMPT = `Classify this Instagram DM message into one intent category.
//
// Categories:
// - product_inquiry: asking about a specific product, price, availability, features, sizing
// - order_status: asking about their order, shipping, delivery, tracking
// - support: complaint, issue, problem, return, refund, exchange
// - recommendation: asking for suggestions, "what should I buy", "best product for..."
// - general_question: FAQ, business hours, location, policies, general info
// - greeting: hi, hello, hey, thanks (no specific question)
// - spam: irrelevant, promotional, or nonsensical message
// - other: doesn't fit any category
//
// Respond ONLY with valid JSON, no markdown:
// { "intent": "category_name", "confidence": 0.0-1.0, "extractedEntity": "product name or topic if mentioned" }`;
//
// /**
//  * Classify the intent of an incoming DM message.
//  *
//  * @param {string} messageText
//  * @returns {Promise<{ intent: string, confidence: number, extractedEntity: string|null }>}
//  */
// export async function classifyIntent(messageText) {
//   const defaultResult = { intent: "other", confidence: 0.5, extractedEntity: null };
//
//   if (!messageText || messageText.trim().length < 2) {
//     return { intent: "greeting", confidence: 0.9, extractedEntity: null };
//   }
//
//   try {
//     const result = await Promise.race([
//       callAI("flash", "You are an intent classifier. Output only JSON.", `${INTENT_PROMPT}\n\nMessage: "${messageText}"`, 200),
//       new Promise((_, reject) => setTimeout(() => reject(new Error("timeout")), 2000)),
//     ]);
//
//     let parsed;
//     try {
//       let text = result.text.trim();
//       if (text.startsWith("```")) text = text.replace(/^```(?:json)?\s*/, "").replace(/\s*```$/, "");
//       parsed = JSON.parse(text);
//     } catch {
//       return defaultResult;
//     }
//
//     return {
//       intent: parsed.intent || "other",
//       confidence: typeof parsed.confidence === "number" ? parsed.confidence : 0.5,
//       extractedEntity: parsed.extractedEntity || null,
//     };
//   } catch (err) {
//     console.error("[IntentClassifier] Error:", err.message);
//     return defaultResult;
//   }
// }
// [/SMART FEATURES]

// Stub — active while smart features are disabled
export async function classifyIntent(_messageText) { return { intent: 'other', confidence: 0, extractedEntity: null }; }
