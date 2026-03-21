/**
 * Reel Frame Extraction
 *
 * Extracts the best available image frame from a reel for AI analysis.
 * Uses Graph API thumbnail, then media_url, then oEmbed as fallbacks.
 */

const IG_BASE = "https://graph.instagram.com/v25.0";
const FB_BASE = "https://graph.facebook.com/v25.0";

/**
 * Extract a frame URL from a reel/media.
 *
 * @param {string} mediaId - Instagram media ID
 * @param {string} accessToken - Instagram API access token
 * @returns {Promise<{ frameUrl: string|null, caption: string, permalink: string, ownerUsername: string }>}
 */
export async function extractReelFrame(mediaId, accessToken) {
  const result = {
    frameUrl: null,
    caption: "",
    permalink: "",
    ownerUsername: "",
  };

  if (!mediaId || !accessToken) return result;

  // 1. Try Graph API media endpoint
  try {
    const url = new URL(`${IG_BASE}/${mediaId}`);
    url.searchParams.set(
      "fields",
      "id,thumbnail_url,media_url,caption,permalink,username,media_type"
    );
    url.searchParams.set("access_token", accessToken);

    const res = await fetch(url.toString());
    if (res.ok) {
      const data = await res.json();
      result.caption = data.caption || "";
      result.permalink = data.permalink || "";
      result.ownerUsername = data.username || "";

      if (data.thumbnail_url) {
        result.frameUrl = data.thumbnail_url;
        return result;
      }

      // For images, media_url is the image itself
      if (data.media_url && data.media_type !== "VIDEO") {
        result.frameUrl = data.media_url;
        return result;
      }

      // For videos, media_url is the video file — not ideal but usable as last resort
      if (data.media_url) {
        result.frameUrl = data.media_url;
      }
    }
  } catch (e) {
    console.error("[FrameExtract] Graph API failed:", e.message);
  }

  // 2. Try oEmbed if we have a permalink
  if (!result.frameUrl && result.permalink) {
    try {
      const url = new URL(`${FB_BASE}/instagram_oembed`);
      url.searchParams.set("url", result.permalink);
      url.searchParams.set("access_token", accessToken);

      const res = await fetch(url.toString());
      if (res.ok) {
        const data = await res.json();
        if (data.thumbnail_url) {
          result.frameUrl = data.thumbnail_url;
        }
      }
    } catch (e) {
      console.error("[FrameExtract] oEmbed failed:", e.message);
    }
  }

  return result;
}
