// [SMART FEATURES] Uncomment when Shopify + Knowledge Base + Smart Replies are enabled
// /**
//  * Handoff Detection
//  *
//  * Determines when to stop AI replies and hand off to a human.
//  */
//
// const HANDOFF_KEYWORDS = [
//   "talk to a human",
//   "speak to someone",
//   "real person",
//   "speak to a person",
//   "human agent",
//   "manager",
//   "supervisor",
//   "connect me to",
//   "talk to someone",
//   "actual person",
// ];
//
// const ESCALATION_KEYWORDS = [
//   "refund",
//   "broken",
//   "damaged",
//   "lawyer",
//   "legal",
//   "complaint",
//   "sue",
//   "scam",
//   "fraud",
//   "report",
//   "consumer court",
// ];
//
// /**
//  * Determine if the conversation should be handed off to a human.
//  *
//  * @param {string} intent - Classified intent
//  * @param {number} confidence - Intent classification confidence
//  * @param {string} messageText - Latest message
//  * @param {Object[]} conversationHistory - All messages in thread
//  * @returns {{ shouldHandOff: boolean, reason: string|null }}
//  */
// export function shouldHandOff(intent, confidence, messageText, conversationHistory) {
//   const lower = messageText.toLowerCase();
//
//   // 1. Spam — don't reply at all, but don't hand off either
//   if (intent === "spam") {
//     return { shouldHandOff: false, reason: null, skipReply: true };
//   }
//
//   // 2. Low confidence on intent
//   if (confidence < 0.5) {
//     return { shouldHandOff: true, reason: `Low intent confidence: ${confidence}` };
//   }
//
//   // 3. Explicit request for human
//   for (const kw of HANDOFF_KEYWORDS) {
//     if (lower.includes(kw)) {
//       return { shouldHandOff: true, reason: `Customer requested human: "${kw}"` };
//     }
//   }
//
//   // 4. Support intent with escalation keywords
//   if (intent === "support") {
//     for (const kw of ESCALATION_KEYWORDS) {
//       if (lower.includes(kw)) {
//         return { shouldHandOff: true, reason: `Escalation keyword in support request: "${kw}"` };
//       }
//     }
//   }
//
//   // 5. Conversation looping (> 10 messages without resolution)
//   if (conversationHistory && conversationHistory.length > 10) {
//     return { shouldHandOff: true, reason: "Conversation exceeds 10 messages" };
//   }
//
//   return { shouldHandOff: false, reason: null, skipReply: false };
// }
// [/SMART FEATURES]

// Stub — active while smart features are disabled
export function shouldHandOff(_intent, _confidence, _messageText, _conversationHistory) { return { shouldHandOff: false }; }

/**
 * Greeting template responses (no AI needed).
 */
export const GREETING_TEMPLATES = [
  "Hey there! How can I help you today?",
  "Hi! Thanks for reaching out. What can I do for you?",
  "Hello! I'm here to help. What are you looking for?",
  "Hey! How can I assist you today?",
];

/**
 * Order status template (when no order info is available).
 */
export const ORDER_STATUS_TEMPLATE =
  "To help you with your order, could you share your order number or the email you used to place it? I'll look it up for you!";

/**
 * Handoff message sent to the customer.
 */
export const HANDOFF_MESSAGE =
  "Let me connect you with our team. Someone will get back to you shortly!";
