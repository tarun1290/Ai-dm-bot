// [SMART FEATURES] Uncomment when Shopify + Knowledge Base + Smart Replies are enabled
// /**
//  * Knowledge Base Document Processor
//  *
//  * Handles PDF parsing, URL scraping, chunking, and embedding generation.
//  */
//
// import dbConnect from "@/lib/dbConnect";
// import KnowledgeDocument from "@/models/KnowledgeDocument";
// import KnowledgeChunk from "@/models/KnowledgeChunk";
// import { generateEmbedding } from "@/lib/embeddings";
// import { chunkText, stripHtml } from "./chunker";
//
// /**
//  * Extract text content from HTML, focusing on main content.
//  * @param {string} html - Raw HTML string
//  * @returns {{ text: string, title: string }}
//  */
// function extractFromHtml(html) {
//   let title = "";
//   const titleMatch = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
//   if (titleMatch) title = stripHtml(titleMatch[1]);
//
//   // Remove nav, footer, header, aside, script, style
//   let cleaned = html
//     .replace(/<nav[^>]*>[\s\S]*?<\/nav>/gi, "")
//     .replace(/<footer[^>]*>[\s\S]*?<\/footer>/gi, "")
//     .replace(/<header[^>]*>[\s\S]*?<\/header>/gi, "")
//     .replace(/<aside[^>]*>[\s\S]*?<\/aside>/gi, "")
//     .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
//     .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "");
//
//   // Try to extract main/article content first
//   const mainMatch = cleaned.match(/<(?:main|article)[^>]*>([\s\S]*?)<\/(?:main|article)>/i);
//   const text = stripHtml(mainMatch ? mainMatch[1] : cleaned);
//
//   return { text, title };
// }
//
// /**
//  * Process a knowledge document: extract text, chunk, embed, save.
//  * This runs asynchronously after the document is created.
//  *
//  * @param {string} documentId - KnowledgeDocument._id
//  */
// export async function processDocument(documentId) {
//   await dbConnect();
//   const doc = await KnowledgeDocument.findById(documentId);
//   if (!doc) return;
//
//   try {
//     let text = "";
//
//     if (doc.fileType === "pdf") {
//       // Dynamic import to avoid bundling pdf-parse in client code
//       const pdfParse = (await import("pdf-parse")).default;
//       const response = await fetch(doc.fileUrl);
//       const buffer = Buffer.from(await response.arrayBuffer());
//       const pdfData = await pdfParse(buffer);
//       text = pdfData.text;
//       doc.metadata.pageCount = pdfData.numpages;
//     } else if (doc.fileType === "url") {
//       const response = await fetch(doc.fileUrl, {
//         signal: AbortSignal.timeout(15000),
//         headers: { "User-Agent": "Engagr-Bot/1.0" },
//       });
//       if (!response.ok) throw new Error(`Failed to fetch URL: ${response.status}`);
//       const html = await response.text();
//       const extracted = extractFromHtml(html);
//       text = extracted.text;
//       doc.metadata.title = extracted.title || doc.fileName;
//       doc.metadata.domain = new URL(doc.fileUrl).hostname;
//       doc.metadata.lastScrapedAt = new Date();
//     }
//
//     if (!text || text.trim().length < 50) {
//       throw new Error("Not enough text content extracted");
//     }
//
//     const chunks = chunkText(text);
//
//     if (chunks.length === 0) {
//       throw new Error("Text chunking produced no chunks");
//     }
//
//     // Check chunk limit (max 500 per account)
//     const existingChunks = await KnowledgeChunk.countDocuments({
//       userId: doc.userId,
//       accountId: doc.accountId,
//     });
//     if (existingChunks + chunks.length > 500) {
//       throw new Error(`Chunk limit exceeded. Current: ${existingChunks}, new: ${chunks.length}, max: 500`);
//     }
//
//     // Generate embeddings in batches of 20
//     for (let i = 0; i < chunks.length; i += 20) {
//       const batch = chunks.slice(i, i + 20);
//       const embeddings = await Promise.all(
//         batch.map((chunk) => generateEmbedding(chunk))
//       );
//
//       const chunkDocs = batch.map((content, j) => ({
//         documentId: doc._id,
//         userId: doc.userId,
//         accountId: doc.accountId,
//         content,
//         embedding: embeddings[j],
//         chunkIndex: i + j,
//         tokenCount: Math.ceil(content.length / 4),
//         metadata: {
//           sourceUrl: doc.fileType === "url" ? doc.fileUrl : undefined,
//         },
//       }));
//
//       await KnowledgeChunk.insertMany(chunkDocs);
//     }
//
//     doc.status = "ready";
//     doc.chunkCount = chunks.length;
//     doc.totalTokens = chunks.reduce((sum, c) => sum + Math.ceil(c.length / 4), 0);
//     await doc.save();
//
//     console.log(`[Knowledge] Processed document ${documentId}: ${chunks.length} chunks, ${doc.totalTokens} tokens`);
//   } catch (error) {
//     console.error(`[Knowledge] Processing failed for ${documentId}:`, error.message);
//     doc.status = "failed";
//     doc.processingError = error.message;
//     await doc.save();
//   }
// }
//
// /**
//  * Re-process a URL document (re-scrape, re-chunk, re-embed).
//  * Deletes old chunks and creates new ones.
//  *
//  * @param {string} documentId
//  */
// export async function refreshUrlDocument(documentId) {
//   await dbConnect();
//   const doc = await KnowledgeDocument.findById(documentId);
//   if (!doc || doc.fileType !== "url") return;
//
//   // Delete old chunks
//   await KnowledgeChunk.deleteMany({ documentId: doc._id });
//
//   // Reset and re-process
//   doc.status = "processing";
//   doc.chunkCount = 0;
//   doc.totalTokens = 0;
//   doc.processingError = undefined;
//   await doc.save();
//
//   await processDocument(documentId);
// }
// [/SMART FEATURES]

// Stub — active while smart features are disabled
export async function processDocument(_documentId) { return; }
export async function refreshUrlDocument(_documentId) { return; }
