// [SMART FEATURES] Uncomment when Shopify + Knowledge Base + Smart Replies are enabled
// /**
//  * MongoDB Atlas Vector Search
//  *
//  * Requires two Atlas Vector Search indexes (created in Atlas dashboard):
//  * 1. product_vector_index on shopifyproducts.embedding
//  * 2. knowledge_vector_index on knowledgechunks.embedding
//  *
//  * See SMART_FEATURES_SETUP.md for index definitions.
//  */
//
// import mongoose from "mongoose";
// import dbConnect from "@/lib/dbConnect";
//
// /**
//  * Run a vector similarity search against a MongoDB collection.
//  *
//  * @param {string} collectionName - MongoDB collection name (lowercase, e.g. "shopifyproducts")
//  * @param {number[]} queryEmbedding - Query vector (1536 dimensions)
//  * @param {Object} filters - Pre-filter conditions (e.g. { userId: "owner" })
//  * @param {number} limit - Max results to return
//  * @returns {Promise<Object[]>} Documents sorted by similarity score
//  */
// export async function vectorSearch(collectionName, queryEmbedding, filters = {}, limit = 5) {
//   await dbConnect();
//
//   const indexName = collectionName === "shopifyproducts"
//     ? "product_vector_index"
//     : "knowledge_vector_index";
//
//   const pipeline = [
//     {
//       $vectorSearch: {
//         index: indexName,
//         path: "embedding",
//         queryVector: queryEmbedding,
//         numCandidates: limit * 10,
//         limit,
//         filter: filters,
//       },
//     },
//     {
//       $project: {
//         embedding: 0,
//         score: { $meta: "vectorSearchScore" },
//       },
//     },
//   ];
//
//   try {
//     const db = mongoose.connection.db;
//     return await db.collection(collectionName).aggregate(pipeline).toArray();
//   } catch (err) {
//     // Vector search index may not exist yet — fall back gracefully
//     console.error(`[VectorSearch] Failed on ${collectionName}:`, err.message);
//     return [];
//   }
// }
// [/SMART FEATURES]

// Stub — active while smart features are disabled
export async function vectorSearch() { return []; }
