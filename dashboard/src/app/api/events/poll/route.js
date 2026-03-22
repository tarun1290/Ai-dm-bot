import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Event from "@/models/Event";
import InstagramAccount from "@/models/InstagramAccount";

export async function GET(request) {
  // Internal-only endpoint — called by the SSE stream
  const secret = request.headers.get("x-internal-secret");
  if (secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = request.nextUrl;
  const userId = searchParams.get("userId");
  const since = searchParams.get("since");

  if (!userId || !since) {
    return NextResponse.json({ error: "Missing params" }, { status: 400 });
  }

  await dbConnect();

  // Find user's accounts to build the event filter
  const accounts = await InstagramAccount.find({ userId, isConnected: true })
    .select("_id instagramUserId")
    .lean();

  if (accounts.length === 0) {
    return NextResponse.json({ events: [] });
  }

  const accountIds = accounts.map((a) => a._id);
  const businessIds = accounts.map((a) => a.instagramUserId);

  const events = await Event.find({
    $or: [
      { accountId: { $in: accountIds } },
      { targetBusinessId: { $in: businessIds }, accountId: { $exists: false } },
    ],
    createdAt: { $gt: new Date(since) },
  })
    .select("type from content reply metadata createdAt accountId")
    .sort({ createdAt: 1 })
    .limit(20)
    .lean();

  return NextResponse.json({ events: JSON.parse(JSON.stringify(events)) });
}
