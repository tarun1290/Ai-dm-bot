// [SMART FEATURES] Uncomment when Shopify + Knowledge Base + Smart Replies are enabled
// /**
//  * AI Text Caller — Provider-agnostic text completion
//  *
//  * Supports Claude, OpenAI, and Gemini for text-only (non-vision) calls.
//  * Used by intent classification and reply generation.
//  */
//
// const MODEL_MAP = {
//   claude: {
//     flash: "claude-haiku-4-5-20251001",
//     haiku: "claude-haiku-4-5-20251001",
//     sonnet: "claude-sonnet-4-20250514",
//   },
//   openai: {
//     flash: "gpt-4o-mini",
//     haiku: "gpt-4o-mini",
//     sonnet: "gpt-4o",
//   },
//   gemini: {
//     flash: "gemini-2.0-flash",
//     haiku: "gemini-2.0-flash",
//     sonnet: "gemini-2.5-pro",
//   },
// };
//
// const COST_ESTIMATES = {
//   flash: 0.0005,
//   haiku: 0.001,
//   sonnet: 0.005,
// };
//
// /**
//  * Call an AI model with a system + user prompt (text only).
//  *
//  * @param {"flash"|"haiku"|"sonnet"} tier - Model tier
//  * @param {string} systemPrompt
//  * @param {string} userPrompt
//  * @param {number} maxTokens
//  * @returns {Promise<{ text: string, tokensUsed: number, estimatedCost: number }>}
//  */
// export async function callAI(tier, systemPrompt, userPrompt, maxTokens = 1000) {
//   const provider = process.env.AI_VISION_PROVIDER || "claude";
//   const model = MODEL_MAP[provider]?.[tier] || MODEL_MAP.claude[tier];
//
//   switch (provider) {
//     case "claude":
//       return callClaude(model, systemPrompt, userPrompt, maxTokens, tier);
//     case "openai":
//       return callOpenAI(model, systemPrompt, userPrompt, maxTokens, tier);
//     case "gemini":
//       return callGemini(model, systemPrompt, userPrompt, maxTokens, tier);
//     default:
//       throw new Error(`Unknown AI provider: ${provider}`);
//   }
// }
//
// async function callClaude(model, systemPrompt, userPrompt, maxTokens, tier) {
//   const apiKey = process.env.AI_ANTHROPIC_API_KEY;
//   if (!apiKey) throw new Error("AI_ANTHROPIC_API_KEY not configured");
//
//   const res = await fetch("https://api.anthropic.com/v1/messages", {
//     method: "POST",
//     headers: {
//       "Content-Type": "application/json",
//       "x-api-key": apiKey,
//       "anthropic-version": "2023-06-01",
//     },
//     body: JSON.stringify({
//       model,
//       max_tokens: maxTokens,
//       system: systemPrompt,
//       messages: [{ role: "user", content: userPrompt }],
//     }),
//   });
//
//   if (!res.ok) throw new Error(`Claude API error: ${res.status}`);
//   const data = await res.json();
//   const text = data.content?.[0]?.text || "";
//   const tokensUsed = (data.usage?.input_tokens || 0) + (data.usage?.output_tokens || 0);
//
//   return { text, tokensUsed, estimatedCost: COST_ESTIMATES[tier] || 0.001 };
// }
//
// async function callOpenAI(model, systemPrompt, userPrompt, maxTokens, tier) {
//   const apiKey = process.env.AI_OPENAI_API_KEY;
//   if (!apiKey) throw new Error("AI_OPENAI_API_KEY not configured");
//
//   const res = await fetch("https://api.openai.com/v1/chat/completions", {
//     method: "POST",
//     headers: {
//       Authorization: `Bearer ${apiKey}`,
//       "Content-Type": "application/json",
//     },
//     body: JSON.stringify({
//       model,
//       max_tokens: maxTokens,
//       messages: [
//         { role: "system", content: systemPrompt },
//         { role: "user", content: userPrompt },
//       ],
//     }),
//   });
//
//   if (!res.ok) throw new Error(`OpenAI API error: ${res.status}`);
//   const data = await res.json();
//   const text = data.choices?.[0]?.message?.content || "";
//   const tokensUsed = data.usage?.total_tokens || 0;
//
//   return { text, tokensUsed, estimatedCost: COST_ESTIMATES[tier] || 0.001 };
// }
//
// async function callGemini(model, systemPrompt, userPrompt, maxTokens, tier) {
//   const apiKey = process.env.AI_GEMINI_API_KEY;
//   if (!apiKey) throw new Error("AI_GEMINI_API_KEY not configured");
//
//   const res = await fetch(
//     `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
//     {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify({
//         systemInstruction: { parts: [{ text: systemPrompt }] },
//         contents: [{ parts: [{ text: userPrompt }] }],
//         generationConfig: { maxOutputTokens: maxTokens },
//       }),
//     }
//   );
//
//   if (!res.ok) throw new Error(`Gemini API error: ${res.status}`);
//   const data = await res.json();
//   const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
//   const tokensUsed = data.usageMetadata?.totalTokenCount || 0;
//
//   return { text, tokensUsed, estimatedCost: COST_ESTIMATES[tier] || 0.001 };
// }
// [/SMART FEATURES]

// Stub — active while smart features are disabled
export async function callAI(_tier, _systemPrompt, _userPrompt, _maxTokens) { return { text: '', tokensUsed: 0, estimatedCost: 0 }; }
