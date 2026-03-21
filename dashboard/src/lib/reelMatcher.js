/**
 * Smart Reel Replies — Category Matching Engine
 *
 * Matches incoming reel share data against user-defined category rules.
 * Returns the best-matching rule (highest priority) or null.
 */

/**
 * Extract hashtags from a caption string.
 * @param {string} caption
 * @returns {string[]} lowercase hashtags without the # prefix
 */
function extractHashtags(caption) {
  if (!caption) return [];
  const matches = caption.match(/#[\w\u00C0-\u024F]+/g);
  return matches ? matches.map(h => h.slice(1).toLowerCase()) : [];
}

/**
 * Extract a reel/media ID from an Instagram URL.
 * Handles URLs like:
 *   https://www.instagram.com/reel/ABC123/
 *   https://www.instagram.com/p/ABC123/
 * @param {string} url
 * @returns {string|null} shortcode or null
 */
function extractReelIdFromUrl(url) {
  if (!url) return null;
  const match = url.match(/instagram\.com\/(?:reel|p)\/([A-Za-z0-9_-]+)/);
  return match ? match[1] : null;
}

/**
 * Check if a single detection criterion matches the reel data.
 * @param {"keyword"|"hashtag"|"account"|"reelId"} type
 * @param {string} value - the rule value to match against
 * @param {object} reelData - { caption, hashtags, ownerUsername, mediaId, shortcode, permalink }
 * @returns {boolean}
 */
function checkCriterion(type, value, reelData) {
  const val = value.toLowerCase().trim();
  if (!val) return false;

  switch (type) {
    case "keyword": {
      const caption = (reelData.caption || "").toLowerCase();
      return caption.includes(val);
    }
    case "hashtag": {
      const tag = val.startsWith("#") ? val.slice(1) : val;
      return reelData.hashtags.includes(tag);
    }
    case "account": {
      const username = val.startsWith("@") ? val.slice(1) : val;
      return (reelData.ownerUsername || "").toLowerCase() === username;
    }
    case "reelId": {
      // Match against media ID, shortcode, or shortcode extracted from permalink
      const urlShortcode = extractReelIdFromUrl(val);
      const target = urlShortcode || val;
      return (
        reelData.mediaId === target ||
        reelData.shortcode === target ||
        reelData.permalinkShortcode === target
      );
    }
    default:
      return false;
  }
}

/**
 * Evaluate a single category rule against reel data.
 * @param {object} rule - a reelCategories entry
 * @param {object} reelData
 * @returns {{ matched: boolean, matchedCriteria: string[] }}
 */
function evaluateRule(rule, reelData) {
  if (!rule.enabled) return { matched: false, matchedCriteria: [] };

  const detection = rule.detection || {};
  const checks = [];

  for (const kw of detection.keywords || []) {
    if (checkCriterion("keyword", kw, reelData)) checks.push(`keyword:${kw}`);
  }
  for (const ht of detection.hashtags || []) {
    if (checkCriterion("hashtag", ht, reelData)) checks.push(`hashtag:${ht}`);
  }
  for (const acct of detection.accountUsernames || []) {
    if (checkCriterion("account", acct, reelData)) checks.push(`account:${acct}`);
  }
  for (const rid of detection.specificReelIds || []) {
    if (checkCriterion("reelId", rid, reelData)) checks.push(`reelId:${rid}`);
  }

  // No detection criteria defined — rule cannot match
  const totalCriteria =
    (detection.keywords?.length || 0) +
    (detection.hashtags?.length || 0) +
    (detection.accountUsernames?.length || 0) +
    (detection.specificReelIds?.length || 0);

  if (totalCriteria === 0) return { matched: false, matchedCriteria: [] };

  const matchMode = rule.matchMode || "any";
  const matched = matchMode === "all"
    ? checks.length === totalCriteria
    : checks.length > 0;

  return { matched, matchedCriteria: checks };
}

/**
 * Match reel data against all category rules and return the best match.
 * Rules are evaluated by priority (higher number = higher priority),
 * then by creation order (earlier = higher priority).
 *
 * @param {object} reelData - { caption, ownerUsername, mediaId, shortcode, permalink }
 * @param {object[]} categoryRules - the reelCategories array from automation config
 * @returns {{ rule: object, matchedCriteria: string[] } | null}
 */
export function matchReelToCategory(reelData, categoryRules) {
  if (!categoryRules?.length || !reelData) return null;

  // Pre-process reel data
  const processed = {
    ...reelData,
    caption: reelData.caption || "",
    hashtags: extractHashtags(reelData.caption),
    ownerUsername: (reelData.ownerUsername || "").toLowerCase(),
    mediaId: reelData.mediaId || "",
    shortcode: reelData.shortcode || "",
    permalinkShortcode: extractReelIdFromUrl(reelData.permalink) || "",
  };

  // Sort by priority desc, then by array index (creation order)
  const sorted = categoryRules
    .map((rule, idx) => ({ rule, idx }))
    .sort((a, b) => (b.rule.priority || 0) - (a.rule.priority || 0) || a.idx - b.idx);

  for (const { rule } of sorted) {
    const result = evaluateRule(rule, processed);
    if (result.matched) {
      return { rule, matchedCriteria: result.matchedCriteria };
    }
  }

  return null;
}

export { extractHashtags, extractReelIdFromUrl };
