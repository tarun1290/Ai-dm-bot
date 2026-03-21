// [SMART FEATURES] Uncomment when Shopify + Knowledge Base + Smart Replies are enabled
// /**
//  * Embedding Generation
//  *
//  * Uses OpenAI text-embedding-3-small for vector embeddings.
//  * Cheapest option at ~$0.02/1M tokens.
//  */
//
// import OpenAI from "openai";
//
// let openaiClient = null;
//
// function getClient() {
//   if (!openaiClient) {
//     const apiKey = process.env.EMBEDDING_API_KEY;
//     if (!apiKey) throw new Error("EMBEDDING_API_KEY not configured");
//     openaiClient = new OpenAI({ apiKey });
//   }
//   return openaiClient;
// }
//
// /**
//  * Generate a vector embedding for a text string.
//  * @param {string} text - Text to embed (truncated to ~30k chars / ~8000 tokens)
//  * @returns {Promise<number[]>} 1536-dimension embedding vector
//  */
// export async function generateEmbedding(text) {
//   if (!text || !text.trim()) throw new Error("Cannot embed empty text");
//
//   const truncated = text.slice(0, 30000);
//   const model = process.env.EMBEDDING_MODEL || "text-embedding-3-small";
//
//   const response = await getClient().embeddings.create({
//     model,
//     input: truncated,
//     dimensions: 1536,
//   });
//
//   return response.data[0].embedding;
// }
//
// /**
//  * Generate embeddings for multiple texts in a single API call.
//  * @param {string[]} texts - Array of texts to embed
//  * @returns {Promise<number[][]>} Array of embedding vectors
//  */
// export async function generateEmbeddings(texts) {
//   if (!texts?.length) return [];
//
//   const model = process.env.EMBEDDING_MODEL || "text-embedding-3-small";
//   const truncated = texts.map((t) => (t || "").slice(0, 30000));
//
//   const response = await getClient().embeddings.create({
//     model,
//     input: truncated,
//     dimensions: 1536,
//   });
//
//   return response.data.map((d) => d.embedding);
// }
// [/SMART FEATURES]

// Stub — active while smart features are disabled
export async function generateEmbedding(_text) { return []; }
export async function generateEmbeddings(_texts) { return []; }
