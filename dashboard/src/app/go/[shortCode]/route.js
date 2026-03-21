import { NextResponse } from "next/server";
import { createHash } from "crypto";
import dbConnect from "@/lib/dbConnect";
import TrackedLink from "@/models/TrackedLink";
import ClickEvent from "@/models/ClickEvent";

/**
 * Parse device type from User-Agent string.
 */
function parseDevice(ua) {
  if (!ua) return "unknown";
  const lower = ua.toLowerCase();
  if (/tablet|ipad|playbook|silk/.test(lower)) return "tablet";
  if (/mobile|android|iphone|ipod|opera mini|iemobile/.test(lower)) return "mobile";
  return "desktop";
}

/**
 * Parse browser name from User-Agent string.
 */
function parseBrowser(ua) {
  if (!ua) return "unknown";
  if (/edg/i.test(ua)) return "Edge";
  if (/chrome/i.test(ua) && !/chromium/i.test(ua)) return "Chrome";
  if (/firefox/i.test(ua)) return "Firefox";
  if (/safari/i.test(ua) && !/chrome/i.test(ua)) return "Safari";
  if (/opera|opr/i.test(ua)) return "Opera";
  return "other";
}

/**
 * Hash an IP address for privacy (don't store raw IPs).
 */
function hashIp(ip) {
  if (!ip) return "unknown";
  return createHash("sha256").update(ip).digest("hex").substring(0, 16);
}

/**
 * Get approximate country from IP using ip-api.com (free tier).
 * Fire-and-forget — don't block redirect on failure.
 */
async function getCountryFromIp(ip) {
  if (!ip || ip === "127.0.0.1" || ip === "::1") return "local";
  try {
    const res = await fetch(`http://ip-api.com/json/${ip}?fields=country,city`, {
      signal: AbortSignal.timeout(2000),
    });
    if (res.ok) {
      const data = await res.json();
      return { country: data.country || "Unknown", city: data.city || "" };
    }
  } catch { /* don't block on geo failure */ }
  return { country: "Unknown", city: "" };
}

// GET /go/[shortCode] — public redirect endpoint
export async function GET(request, { params }) {
  const { shortCode } = await params;

  await dbConnect();

  const link = await TrackedLink.findOne({ shortCode }).lean();

  if (!link || link.status !== "active") {
    return new NextResponse("Link not found", { status: 404 });
  }

  // Determine destination
  const destination =
    (link.affiliateConfig?.overriddenByUser && link.affiliateConfig?.userCustomUrl)
      ? link.affiliateConfig.userCustomUrl
      : link.originalUrl;

  // Send the redirect immediately — track asynchronously
  const redirectResponse = NextResponse.redirect(destination, 302);

  // Fire-and-forget: record click event and update stats
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
    || request.headers.get("x-real-ip")
    || "unknown";
  const userAgent = request.headers.get("user-agent") || "";
  const referer = request.headers.get("referer") || "";
  const hashedIp = hashIp(ip);
  const device = parseDevice(userAgent);
  const browser = parseBrowser(userAgent);
  const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD

  // Don't await — let this run after response is sent
  (async () => {
    try {
      // Check uniqueness by hashed IP
      const existingClick = await ClickEvent.findOne({
        trackedLinkId: link._id,
        ip: hashedIp,
      }).lean();
      const isUnique = !existingClick;

      // Get geo data
      const geo = await getCountryFromIp(ip);

      // Save click event
      await ClickEvent.create({
        trackedLinkId: link._id,
        shortCode,
        userId: link.userId,
        timestamp: new Date(),
        ip: hashedIp,
        userAgent,
        referer,
        country: geo.country,
        city: geo.city,
        device,
        browser,
        isUnique,
      });

      // Update link stats atomically
      const incFields = { "stats.totalClicks": 1 };
      if (isUnique) incFields["stats.uniqueClicks"] = 1;

      await TrackedLink.findOneAndUpdate(
        { shortCode },
        {
          $inc: incFields,
          $set: { "stats.lastClickedAt": new Date(), updatedAt: new Date() },
        }
      );

      // Update clicksByDate
      const dateResult = await TrackedLink.updateOne(
        { shortCode, "stats.clicksByDate.date": today },
        { $inc: { "stats.clicksByDate.$.clicks": 1 } }
      );
      if (dateResult.modifiedCount === 0) {
        await TrackedLink.updateOne(
          { shortCode },
          { $push: { "stats.clicksByDate": { date: today, clicks: 1 } } }
        );
      }

      // Update clicksByCountry
      if (geo.country && geo.country !== "Unknown") {
        const countryResult = await TrackedLink.updateOne(
          { shortCode, "stats.clicksByCountry.country": geo.country },
          { $inc: { "stats.clicksByCountry.$.clicks": 1 } }
        );
        if (countryResult.modifiedCount === 0) {
          await TrackedLink.updateOne(
            { shortCode },
            { $push: { "stats.clicksByCountry": { country: geo.country, clicks: 1 } } }
          );
        }
      }

      // Update clicksByDevice
      if (device !== "unknown") {
        const deviceResult = await TrackedLink.updateOne(
          { shortCode, "stats.clicksByDevice.device": device },
          { $inc: { "stats.clicksByDevice.$.clicks": 1 } }
        );
        if (deviceResult.modifiedCount === 0) {
          await TrackedLink.updateOne(
            { shortCode },
            { $push: { "stats.clicksByDevice": { device, clicks: 1 } } }
          );
        }
      }
    } catch (e) {
      console.error("[Redirect] Click tracking failed:", e.message);
    }
  })();

  return redirectResponse;
}
