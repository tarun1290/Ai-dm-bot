// [SMART FEATURES] Uncomment when Shopify + Knowledge Base + Smart Replies are enabled
// /**
//  * Text Chunking Utility
//  *
//  * Splits text into overlapping chunks for embedding and retrieval.
//  * Targets 500-800 tokens per chunk with 100-token overlap.
//  */
//
// /**
//  * Split text into chunks suitable for embedding.
//  * Uses paragraph boundaries for cleaner splits.
//  *
//  * @param {string} text - Full text to chunk
//  * @param {number} maxTokens - Maximum tokens per chunk (1 token ≈ 4 chars)
//  * @param {number} overlap - Overlap tokens between chunks
//  * @returns {string[]} Array of text chunks
//  */
// export function chunkText(text, maxTokens = 600, overlap = 100) {
//   if (!text || !text.trim()) return [];
//
//   const maxChars = maxTokens * 4;
//   const overlapChars = overlap * 4;
//   const chunks = [];
//
//   // Split by double newlines (paragraphs) for cleaner chunks
//   const paragraphs = text.split(/\n\n+/).filter((p) => p.trim().length > 0);
//   let currentChunk = "";
//
//   for (const para of paragraphs) {
//     const candidate = currentChunk ? currentChunk + "\n\n" + para : para;
//
//     if (candidate.length > maxChars && currentChunk.length > 0) {
//       chunks.push(currentChunk.trim());
//       // Start new chunk with overlap from end of previous
//       const overlapText = currentChunk.slice(-overlapChars);
//       currentChunk = overlapText + "\n\n" + para;
//     } else {
//       currentChunk = candidate;
//     }
//   }
//
//   if (currentChunk.trim()) {
//     chunks.push(currentChunk.trim());
//   }
//
//   // Handle case where a single paragraph exceeds maxChars
//   const finalChunks = [];
//   for (const chunk of chunks) {
//     if (chunk.length > maxChars * 1.5) {
//       // Force-split long chunks by sentences
//       const sentences = chunk.split(/(?<=[.!?])\s+/);
//       let sub = "";
//       for (const sentence of sentences) {
//         if ((sub + " " + sentence).length > maxChars && sub.length > 0) {
//           finalChunks.push(sub.trim());
//           sub = sub.slice(-overlapChars) + " " + sentence;
//         } else {
//           sub += (sub ? " " : "") + sentence;
//         }
//       }
//       if (sub.trim()) finalChunks.push(sub.trim());
//     } else {
//       finalChunks.push(chunk);
//     }
//   }
//
//   return finalChunks;
// }
// [/SMART FEATURES]

// Stub — active while smart features are disabled
export function chunkText(_text, _maxTokens, _overlap) { return []; }

/**
 * Strip HTML tags and extract plain text.
 * @param {string} html
 * @returns {string}
 */
export function stripHtml(html) {
  if (!html) return "";
  return html
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}
