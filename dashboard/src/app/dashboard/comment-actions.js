"use server";

import { cookies } from "next/headers";
import dbConnect from "@/lib/dbConnect";
import Event from "@/models/Event";
import InstagramAccount from "@/models/InstagramAccount";
import { verifyToken } from "@/lib/jwt";

const IG_BASE = "https://graph.instagram.com/v25.0";

async function getOwnerId() {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth_token")?.value;
  if (token) {
    const payload = await verifyToken(token);
    if (payload?.userId) return payload.userId;
  }
  return process.env.OWNER_USER_ID || "owner";
}

async function resolveAccount(userId, accountId) {
  if (accountId) return InstagramAccount.findOne({ _id: accountId, userId });
  return (
    (await InstagramAccount.findOne({ userId, isPrimary: true, isConnected: true })) ||
    (await InstagramAccount.findOne({ userId, isConnected: true }))
  );
}

// ── Hide or unhide a comment ───────────────────────────────────────────
export async function hideCommentAction(accountId, commentId, hide = true) {
  const userId = await getOwnerId();
  await dbConnect();

  const account = await resolveAccount(userId, accountId);
  if (!account) return { success: false, error: "Account not found" };

  try {
    const url = `${IG_BASE}/${commentId}?access_token=${account.accessToken}`;
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ hide }),
    });
    const data = await res.json();

    if (!res.ok || data.error) {
      console.error("[CommentModeration] hideCommentAction failed:", data?.error?.message);
      return { success: false, error: data?.error?.message || "Unknown error" };
    }

    await Event.create({
      type: hide ? "comment_hide" : "comment_unhide",
      accountId: account._id,
      targetBusinessId: account.instagramUserId,
      content: { commentId },
      createdAt: new Date(),
    });

    return { success: true };
  } catch (err) {
    console.error("[CommentModeration] hideCommentAction error:", err.message);
    return { success: false, error: err.message };
  }
}

// ── Delete a comment ───────────────────────────────────────────────────
export async function deleteCommentAction(accountId, commentId) {
  const userId = await getOwnerId();
  await dbConnect();

  const account = await resolveAccount(userId, accountId);
  if (!account) return { success: false, error: "Account not found" };

  try {
    const url = `${IG_BASE}/${commentId}?access_token=${account.accessToken}`;
    const res = await fetch(url, { method: "DELETE" });
    const data = await res.json();

    if (!res.ok || data.error) {
      console.error("[CommentModeration] deleteCommentAction failed:", data?.error?.message);
      return { success: false, error: data?.error?.message || "Unknown error" };
    }

    await Event.create({
      type: "comment_delete",
      accountId: account._id,
      targetBusinessId: account.instagramUserId,
      content: { commentId },
      createdAt: new Date(),
    });

    return { success: true };
  } catch (err) {
    console.error("[CommentModeration] deleteCommentAction error:", err.message);
    return { success: false, error: err.message };
  }
}

// ── Enable or disable comments on a media object ───────────────────────
export async function toggleMediaCommentsAction(accountId, mediaId, enabled = true) {
  const userId = await getOwnerId();
  await dbConnect();

  const account = await resolveAccount(userId, accountId);
  if (!account) return { success: false, error: "Account not found" };

  try {
    const url = `${IG_BASE}/${mediaId}?access_token=${account.accessToken}`;
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ comment_enabled: enabled }),
    });
    const data = await res.json();

    if (!res.ok || data.error) {
      console.error("[CommentModeration] toggleMediaCommentsAction failed:", data?.error?.message);
      return { success: false, error: data?.error?.message || "Unknown error" };
    }

    await Event.create({
      type: enabled ? "comments_enabled" : "comments_disabled",
      accountId: account._id,
      targetBusinessId: account.instagramUserId,
      content: { mediaId },
      createdAt: new Date(),
    });

    return { success: true };
  } catch (err) {
    console.error("[CommentModeration] toggleMediaCommentsAction error:", err.message);
    return { success: false, error: err.message };
  }
}

// ── Fetch all comments on a media object (with pagination) ─────────────
export async function getMediaCommentsAction(accountId, mediaId) {
  const userId = await getOwnerId();
  await dbConnect();

  const account = await resolveAccount(userId, accountId);
  if (!account) return { success: false, error: "Account not found" };

  try {
    const comments = [];
    let url = `${IG_BASE}/${mediaId}/comments?fields=id,text,timestamp,from,like_count,hidden&access_token=${account.accessToken}`;

    while (url) {
      const res = await fetch(url);
      const data = await res.json();

      if (!res.ok || data.error) {
        console.error("[CommentModeration] getMediaCommentsAction failed:", data?.error?.message);
        return { success: false, error: data?.error?.message || "Unknown error" };
      }

      if (data.data) {
        comments.push(...data.data);
      }
      url = data.paging?.next || null;
    }

    return { success: true, comments };
  } catch (err) {
    console.error("[CommentModeration] getMediaCommentsAction error:", err.message);
    return { success: false, error: err.message };
  }
}
