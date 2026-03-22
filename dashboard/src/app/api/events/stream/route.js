import { jwtVerify } from "jose";

export const runtime = "edge";
export const dynamic = "force-dynamic";

const secret = new TextEncoder().encode(
  process.env.JWT_SECRET || "engagr-default-secret-change-in-production"
);

function formatAction(event) {
  switch (event.type) {
    case "comment": return "Comment triggered DM";
    case "mention": return "Mentioned in story";
    case "dm": return "DM received";
    case "reel_share": return "Shared a reel";
    case "reaction": return "Reacted to message";
    case "postback": return "Tapped button";
    case "smart_reply": return "AI replied";
    default: return event.type;
  }
}

export async function GET(request) {
  // Authenticate via cookie
  const cookieHeader = request.headers.get("cookie") || "";
  const tokenMatch = cookieHeader.match(/auth_token=([^;]+)/);
  const token = tokenMatch?.[1];

  if (!token) {
    return new Response("Unauthorized", { status: 401 });
  }

  let userId;
  try {
    const { payload } = await jwtVerify(token, secret);
    userId = payload.userId;
  } catch {
    return new Response("Invalid token", { status: 401 });
  }

  if (!userId) {
    return new Response("No userId", { status: 401 });
  }

  const encoder = new TextEncoder();
  let lastTimestamp = new Date().toISOString();
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://engagr-dm.vercel.app";
  const cronSecret = process.env.CRON_SECRET;

  const stream = new ReadableStream({
    async start(controller) {
      // Send connected event
      controller.enqueue(encoder.encode(`event: connected\ndata: {"status":"connected"}\n\n`));

      const interval = setInterval(async () => {
        try {
          const url = `${appUrl}/api/events/poll?userId=${encodeURIComponent(userId)}&since=${encodeURIComponent(lastTimestamp)}`;
          const res = await fetch(url, {
            headers: { "x-internal-secret": cronSecret || "" },
            cache: "no-store",
          });

          if (!res.ok) {
            controller.enqueue(encoder.encode(`: poll-error ${res.status}\n\n`));
            return;
          }

          const data = await res.json();
          const events = data.events || [];

          for (const event of events) {
            const payload = JSON.stringify({
              id: event._id,
              type: event.type,
              senderUsername: event.from?.username || "unknown",
              action: formatAction(event),
              timestamp: event.createdAt,
              content: event.content?.text?.slice(0, 100),
              replyStatus: event.reply?.status,
            });
            controller.enqueue(encoder.encode(`id: ${event.createdAt}\nevent: activity\ndata: ${payload}\n\n`));
            lastTimestamp = event.createdAt;
          }

          // Heartbeat
          controller.enqueue(encoder.encode(`: heartbeat\n\n`));
        } catch (err) {
          controller.enqueue(encoder.encode(`: error ${err.message}\n\n`));
        }
      }, 2000);

      request.signal.addEventListener("abort", () => {
        clearInterval(interval);
        try { controller.close(); } catch { /* already closed */ }
      });
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      "Connection": "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}
