/**
 * Tracked Link Generator
 *
 * Creates short, trackable redirect URLs for product links.
 * Each link gets a unique shortCode for click tracking.
 */

import dbConnect from "@/lib/dbConnect";
import TrackedLink from "@/models/TrackedLink";

// Characters for shortCode generation (URL-safe alphanumeric)
const CHARSET = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
const CODE_LENGTH = 7;

/**
 * Generate a random alphanumeric short code.
 * @param {number} length
 * @returns {string}
 */
function generateShortCode(length = CODE_LENGTH) {
  let code = "";
  const bytes = new Uint8Array(length);
  crypto.getRandomValues(bytes);
  for (let i = 0; i < length; i++) {
    code += CHARSET[bytes[i] % CHARSET.length];
  }
  return code;
}

/**
 * Generate a unique short code that doesn't exist in the database.
 * Retries up to 5 times in case of collision.
 * @returns {Promise<string>}
 */
async function getUniqueShortCode() {
  for (let attempt = 0; attempt < 5; attempt++) {
    const code = generateShortCode();
    const existing = await TrackedLink.findOne({ shortCode: code }).lean();
    if (!existing) return code;
  }
  // Extremely unlikely fallback — use longer code
  return generateShortCode(10);
}

/**
 * Create a tracked link and return the redirect URL.
 *
 * @param {Object} params
 * @param {string} params.userId
 * @param {string} params.accountId
 * @param {string} params.originalUrl - The actual product/purchase URL
 * @param {Object} params.metadata - Product detection metadata
 * @param {string} params.metadata.productName
 * @param {string} params.metadata.productCategory
 * @param {string} params.metadata.productBrand
 * @param {string} params.metadata.productImageUrl
 * @param {number} params.metadata.confidence
 * @param {string} params.metadata.aiProvider
 * @param {string} params.metadata.searchQuery
 * @param {string} params.metadata.reelMediaId
 * @param {string} params.metadata.reelOwnerUsername
 * @param {string} params.metadata.reelPermalink
 * @param {string} params.metadata.senderUsername
 * @returns {Promise<{ trackedUrl: string, shortCode: string, trackedLink: Object }>}
 */
export async function createTrackedLink({
  userId,
  accountId,
  originalUrl,
  metadata,
}) {
  await dbConnect();

  const shortCode = await getUniqueShortCode();

  const trackedLink = await TrackedLink.create({
    shortCode,
    userId,
    accountId,
    originalUrl,
    destination: originalUrl,
    metadata: {
      productName: metadata.productName,
      productCategory: metadata.productCategory,
      productBrand: metadata.productBrand,
      productImageUrl: metadata.productImageUrl,
      confidence: metadata.confidence,
      aiProvider: metadata.aiProvider,
      searchQuery: metadata.searchQuery,
      reelMediaId: metadata.reelMediaId,
      reelOwnerUsername: metadata.reelOwnerUsername,
      reelPermalink: metadata.reelPermalink,
      senderUsername: metadata.senderUsername,
    },
    affiliateConfig: { isAffiliate: false },
    stats: {
      totalClicks: 0,
      uniqueClicks: 0,
      clicksByDate: [],
      clicksByCountry: [],
      clicksByDevice: [],
    },
  });

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://engagr-dm.vercel.app";
  const trackedUrl = `${appUrl}/go/${shortCode}`;

  return { trackedUrl, shortCode, trackedLink };
}
