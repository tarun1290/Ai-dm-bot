// [SMART FEATURES] Uncomment when Shopify + Knowledge Base + Smart Replies are enabled
// /**
//  * Shopify Product Sync
//  *
//  * Fetches all products from a Shopify store and upserts them
//  * into the ShopifyProduct collection with vector embeddings.
//  */
//
// import dbConnect from "@/lib/dbConnect";
// import ShopifyStore from "@/models/ShopifyStore";
// import ShopifyProduct from "@/models/ShopifyProduct";
// import { generateEmbedding } from "@/lib/embeddings";
// import { stripHtml } from "@/lib/knowledge/chunker";
//
// const SHOPIFY_API_VERSION = "2024-01";
//
// /**
//  * Fetch all active products from a Shopify store (handles pagination).
//  * @param {string} shopDomain
//  * @param {string} accessToken
//  * @returns {Promise<Object[]>} Array of Shopify product objects
//  */
// async function fetchAllProducts(shopDomain, accessToken) {
//   const products = [];
//   let url = `https://${shopDomain}/admin/api/${SHOPIFY_API_VERSION}/products.json?limit=250&status=active`;
//
//   while (url) {
//     const response = await fetch(url, {
//       headers: { "X-Shopify-Access-Token": accessToken },
//     });
//
//     if (!response.ok) {
//       throw new Error(`Shopify API error: ${response.status} ${await response.text()}`);
//     }
//
//     const data = await response.json();
//     products.push(...(data.products || []));
//
//     // Handle pagination via Link header
//     const linkHeader = response.headers.get("link");
//     url = null;
//     if (linkHeader) {
//       const nextMatch = linkHeader.match(/<([^>]+)>;\s*rel="next"/);
//       if (nextMatch) url = nextMatch[1];
//     }
//   }
//
//   return products;
// }
//
// /**
//  * Sync all products from a Shopify store into the database.
//  * Generates vector embeddings for semantic search.
//  *
//  * @param {string} storeId - ShopifyStore._id
//  * @returns {Promise<{ success: boolean, productCount: number, error?: string }>}
//  */
// export async function syncShopifyProducts(storeId) {
//   await dbConnect();
//
//   const store = await ShopifyStore.findById(storeId);
//   if (!store || !store.isConnected || !store.accessToken) {
//     return { success: false, error: "Store not connected" };
//   }
//
//   // Mark sync as in progress
//   await ShopifyStore.findByIdAndUpdate(storeId, {
//     "syncStatus.lastSyncStatus": "in_progress",
//   });
//
//   try {
//     const shopifyProducts = await fetchAllProducts(store.shopDomain, store.accessToken);
//     const shopifyIds = new Set();
//     let syncedCount = 0;
//
//     for (const product of shopifyProducts) {
//       shopifyIds.add(String(product.id));
//
//       const plainDescription = stripHtml(product.body_html || "");
//       const searchText = [
//         product.title,
//         plainDescription,
//         product.vendor,
//         ...(product.tags ? product.tags.split(",").map((t) => t.trim()) : []),
//       ].filter(Boolean).join(" ");
//
//       const prices = (product.variants || [])
//         .map((v) => parseFloat(v.price))
//         .filter((p) => !isNaN(p));
//
//       // Generate embedding for search
//       let embedding = null;
//       try {
//         embedding = await generateEmbedding(searchText);
//       } catch (e) {
//         console.error(`[ShopifySync] Embedding failed for product ${product.id}:`, e.message);
//       }
//
//       const productData = {
//         storeId: store._id,
//         userId: store.userId,
//         shopifyProductId: String(product.id),
//         title: product.title,
//         description: plainDescription,
//         vendor: product.vendor,
//         productType: product.product_type,
//         tags: product.tags ? product.tags.split(",").map((t) => t.trim()) : [],
//         handle: product.handle,
//         status: product.status || "active",
//         variants: (product.variants || []).map((v) => ({
//           variantId: String(v.id),
//           title: v.title,
//           price: v.price,
//           compareAtPrice: v.compare_at_price,
//           sku: v.sku,
//           inventoryQuantity: v.inventory_quantity,
//           available: v.inventory_quantity > 0 || v.inventory_management === null,
//         })),
//         images: (product.images || []).map((img) => ({
//           src: img.src,
//           alt: img.alt,
//         })),
//         primaryImageUrl: product.images?.[0]?.src || null,
//         productUrl: `https://${store.shopDomain}/products/${product.handle}`,
//         priceRange: {
//           min: prices.length ? Math.min(...prices) : 0,
//           max: prices.length ? Math.max(...prices) : 0,
//         },
//         searchText,
//         lastSyncedAt: new Date(),
//         updatedAt: new Date(),
//       };
//
//       if (embedding) {
//         productData.embedding = embedding;
//       }
//
//       await ShopifyProduct.findOneAndUpdate(
//         { storeId: store._id, shopifyProductId: String(product.id) },
//         { $set: productData },
//         { upsert: true }
//       );
//       syncedCount++;
//     }
//
//     // Remove products that no longer exist in Shopify
//     await ShopifyProduct.deleteMany({
//       storeId: store._id,
//       shopifyProductId: { $nin: Array.from(shopifyIds) },
//     });
//
//     // Update sync status
//     await ShopifyStore.findByIdAndUpdate(storeId, {
//       "syncStatus.lastSyncAt": new Date(),
//       "syncStatus.lastSyncStatus": "success",
//       "syncStatus.productCount": syncedCount,
//       "syncStatus.lastError": null,
//       updatedAt: new Date(),
//     });
//
//     console.log(`[ShopifySync] Synced ${syncedCount} products for store ${store.shopDomain}`);
//     return { success: true, productCount: syncedCount };
//   } catch (error) {
//     console.error(`[ShopifySync] Failed for store ${storeId}:`, error.message);
//
//     await ShopifyStore.findByIdAndUpdate(storeId, {
//       "syncStatus.lastSyncStatus": "failed",
//       "syncStatus.lastError": error.message,
//       updatedAt: new Date(),
//     });
//
//     return { success: false, error: error.message };
//   }
// }
// [/SMART FEATURES]

// Stub — active while smart features are disabled
export async function syncShopifyProducts(_storeId) { return { success: false, error: 'disabled' }; }
