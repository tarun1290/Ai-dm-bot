/**
 * AI Product Detection Pipeline
 *
 * Orchestrates: frame extraction → AI vision → product search → tracked link creation
 * Has a 10-second timeout to avoid blocking DM replies.
 */

import { analyzeProductInImage, AI_PROVIDER } from "./provider";
import { extractReelFrame } from "./frameExtractor";
import { searchProductLink } from "./productSearch";
import { createTrackedLink } from "./trackedLinks";
import dbConnect from "@/lib/dbConnect";
import User from "@/models/User";
import ProductDetection from "@/models/ProductDetection";

const AI_PIPELINE_TIMEOUT_MS = 10_000; // 10 seconds

/**
 * Run the full AI product detection pipeline for a reel share.
 *
 * @param {Object} params
 * @param {string} params.mediaId - Instagram media ID of the shared reel
 * @param {string} params.accessToken - Instagram API access token
 * @param {string} params.userId - Engagr user ID (link owner)
 * @param {string} params.accountId - InstagramAccount._id
 * @param {string} params.senderUsername - username of the person who shared the reel
 * @param {Object} params.aiConfig - automation.aiProductDetection settings
 * @param {string|null} params.existingFrameUrl - already-fetched thumbnail (skip re-fetch)
 * @param {string|null} params.existingCaption - already-fetched caption
 * @param {string|null} params.existingPermalink - already-fetched permalink
 * @param {string|null} params.existingOwnerUsername - already-fetched owner username
 * @returns {Promise<{
 *   success: boolean,
 *   product: { name, category, brand, confidence, searchQuery } | null,
 *   trackedUrl: string | null,
 *   trackedLinkId: string | null,
 *   replyMessage: string | null,
 *   buttonLabel: string | null,
 *   frameUrl: string | null,
 *   detectionId: string | null,
 *   error: string | null,
 * }>}
 */
export async function runProductDetection({
  mediaId,
  accessToken,
  userId,
  accountId,
  senderUsername,
  aiConfig,
  existingFrameUrl,
  existingCaption,
  existingPermalink,
  existingOwnerUsername,
}) {
  const startTime = Date.now();

  const emptyResult = {
    success: false,
    product: null,
    trackedUrl: null,
    trackedLinkId: null,
    replyMessage: null,
    buttonLabel: null,
    frameUrl: null,
    detectionId: null,
    error: null,
  };

  try {
    // Wrap the entire pipeline in a timeout
    const result = await Promise.race([
      _runPipeline({
        mediaId, accessToken, userId, accountId, senderUsername, aiConfig,
        existingFrameUrl, existingCaption, existingPermalink, existingOwnerUsername,
        startTime,
      }),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error("AI pipeline timeout")), AI_PIPELINE_TIMEOUT_MS)
      ),
    ]);
    return result;
  } catch (err) {
    console.error("[AI Pipeline] Error:", err.message);

    // Log failed detection
    try {
      await dbConnect();
      await ProductDetection.create({
        userId,
        accountId,
        reelMediaId: mediaId,
        frameUrl: existingFrameUrl,
        aiProvider: AI_PROVIDER,
        status: "api_error",
        errorMessage: err.message,
        processingTimeMs: Date.now() - startTime,
      });
    } catch { /* don't let logging fail the flow */ }

    return { ...emptyResult, error: err.message };
  }
}

async function _runPipeline({
  mediaId, accessToken, userId, accountId, senderUsername, aiConfig,
  existingFrameUrl, existingCaption, existingPermalink, existingOwnerUsername,
  startTime,
}) {
  await dbConnect();

  // 1. Get frame URL
  let frameUrl = existingFrameUrl;
  let caption = existingCaption || "";
  let permalink = existingPermalink || "";
  let ownerUsername = existingOwnerUsername || "";

  if (!frameUrl && mediaId && accessToken) {
    const extracted = await extractReelFrame(mediaId, accessToken);
    frameUrl = extracted.frameUrl;
    caption = extracted.caption || caption;
    permalink = extracted.permalink || permalink;
    ownerUsername = extracted.ownerUsername || ownerUsername;
  }

  if (!frameUrl) {
    // No frame to analyze — log and return
    await ProductDetection.create({
      userId, accountId, reelMediaId: mediaId,
      aiProvider: AI_PROVIDER,
      status: "failed",
      errorMessage: "No frame URL available for analysis",
      processingTimeMs: Date.now() - startTime,
    });
    return {
      success: false, product: null, trackedUrl: null, trackedLinkId: null,
      replyMessage: null, buttonLabel: null, frameUrl: null, detectionId: null,
      error: "No frame available",
    };
  }

  // 2. Run AI vision analysis
  console.log(`[AI Pipeline] Analyzing frame: ${frameUrl.substring(0, 60)}...`);
  const aiResult = await analyzeProductInImage(frameUrl);

  // 3. Filter products by allowed categories (if configured)
  let products = aiResult.products || [];
  const allowedCategories = aiConfig?.detectOnlyCategories || [];
  if (allowedCategories.length > 0) {
    products = products.filter((p) => allowedCategories.includes(p.category));
  }

  // 4. Pick best product (highest confidence)
  if (products.length === 0) {
    const detection = await ProductDetection.create({
      userId, accountId, reelMediaId: mediaId,
      reelPermalink: permalink, reelOwnerUsername: ownerUsername,
      senderUsername, frameUrl,
      aiProvider: aiResult.provider, aiModel: aiResult.model,
      aiResponse: aiResult.rawResponse,
      detectedProducts: [],
      processingTimeMs: Date.now() - startTime,
      status: "no_product_found",
    });

    // Track AI usage cost even for no-product-found
    await _trackAiUsage(userId, aiResult.estimatedCost);

    return {
      success: false, product: null, trackedUrl: null, trackedLinkId: null,
      replyMessage: null, buttonLabel: null, frameUrl,
      detectionId: detection._id.toString(),
      error: "No products detected",
    };
  }

  const bestProduct = products.sort((a, b) => b.confidence - a.confidence)[0];

  // 5. Search for purchase link
  const searchResult = searchProductLink(
    bestProduct.suggestedSearchQuery,
    bestProduct.name,
    bestProduct.category
  );

  // 6. Create tracked link
  let trackedUrl = searchResult.url;
  let trackedLinkId = null;

  try {
    const linkResult = await createTrackedLink({
      userId,
      accountId,
      originalUrl: searchResult.url,
      metadata: {
        productName: bestProduct.name,
        productCategory: bestProduct.category,
        productBrand: bestProduct.brand,
        productImageUrl: frameUrl,
        confidence: bestProduct.confidence,
        aiProvider: aiResult.provider,
        searchQuery: bestProduct.suggestedSearchQuery,
        reelMediaId: mediaId,
        reelOwnerUsername: ownerUsername,
        reelPermalink: permalink,
        senderUsername,
      },
    });
    trackedUrl = linkResult.trackedUrl;
    trackedLinkId = linkResult.trackedLink._id.toString();
  } catch (e) {
    console.error("[AI Pipeline] Tracked link creation failed:", e.message);
    // Fall back to raw search URL — tracking won't work but the user still gets a link
  }

  // 7. Build reply message from template
  const template = aiConfig?.replyTemplate || "I found this! {{productName}} — check it out here:";
  const replyMessage = template
    .replace(/\{\{productName\}\}/g, bestProduct.name)
    .replace(/\{\{productCategory\}\}/g, bestProduct.category)
    .replace(/\{\{productBrand\}\}/g, bestProduct.brand || "");
  const buttonLabel = aiConfig?.linkButtonLabel || "Shop Now";

  // 8. Log detection
  const detectedProducts = products.map((p) => ({
    name: p.name,
    category: p.category,
    brand: p.brand,
    confidence: p.confidence,
    searchQuery: p.suggestedSearchQuery,
    purchaseUrl: p === bestProduct ? trackedUrl : searchProductLink(p.suggestedSearchQuery, p.name, p.category).url,
    trackedLinkId: p === bestProduct && trackedLinkId ? trackedLinkId : undefined,
  }));

  const detection = await ProductDetection.create({
    userId, accountId, reelMediaId: mediaId,
    reelPermalink: permalink, reelOwnerUsername: ownerUsername,
    senderUsername, frameUrl,
    aiProvider: aiResult.provider, aiModel: aiResult.model,
    aiResponse: aiResult.rawResponse,
    detectedProducts,
    processingTimeMs: Date.now() - startTime,
    status: "success",
  });

  // 9. Track AI usage cost
  await _trackAiUsage(userId, aiResult.estimatedCost);

  console.log(`[AI Pipeline] Detected "${bestProduct.name}" (${bestProduct.confidence}) in ${Date.now() - startTime}ms`);

  return {
    success: true,
    product: bestProduct,
    trackedUrl,
    trackedLinkId,
    replyMessage,
    buttonLabel,
    frameUrl,
    detectionId: detection._id.toString(),
    error: null,
  };
}

/**
 * Track AI usage and estimated cost for billing purposes.
 */
async function _trackAiUsage(userId, estimatedCost) {
  try {
    await User.findOneAndUpdate(
      { userId },
      {
        $inc: {
          "usage.aiDetectionsThisMonth": 1,
          "usage.aiDetectionsTotal": 1,
          "usage.aiCostThisMonth": estimatedCost || 0,
        },
      }
    );
  } catch (e) {
    console.error("[AI Pipeline] Failed to track AI usage:", e.message);
  }
}
