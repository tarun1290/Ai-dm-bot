import { NextResponse } from 'next/server';
import { createHmac } from 'crypto';
import dbConnect from '@/lib/dbConnect';
import User from '@/models/User';
import Event from '@/models/Event';
import ProcessedMid from '@/models/ProcessedMid';

// Business Login for Instagram uses graph.instagram.com — NOT graph.facebook.com
// instagram_oembed is the only call that stays on graph.facebook.com
const IG_BASE = 'https://graph.instagram.com/v25.0';
const FB_BASE = 'https://graph.facebook.com/v25.0';
const VERIFY_TOKEN = process.env.VERIFY_TOKEN;

// ─── Graph API Helpers ────────────────────────────────────────────────────────

async function getMedia(id, token) {
    if (!id) return null;
    try {
        const url = new URL(`${IG_BASE}/${id}`);
        url.searchParams.set('fields', 'id,media_type,permalink,media_url,thumbnail_url,shortcode,timestamp,username');
        url.searchParams.set('access_token', token);
        const res = await fetch(url.toString());
        return res.ok ? res.json() : null;
    } catch { return null; }
}

async function getOEmbed(mediaUrl, token) {
    if (!mediaUrl) return null;
    try {
        // instagram_oembed lives on graph.facebook.com
        const url = new URL(`${FB_BASE}/instagram_oembed`);
        url.searchParams.set('url', mediaUrl);
        url.searchParams.set('fields', 'thumbnail_url,title,author_name');
        url.searchParams.set('access_token', token);
        const res = await fetch(url.toString());
        return res.ok ? res.json() : null;
    } catch { return null; }
}

async function getUser(id, token) {
    if (!id) return null;
    try {
        const url = new URL(`${IG_BASE}/${id}`);
        url.searchParams.set('fields', 'name,username,profile_picture_url');
        url.searchParams.set('access_token', token);
        const res = await fetch(url.toString());
        return res.ok ? res.json() : null;
    } catch { return null; }
}

// With Instagram User Tokens (Business Login), /me resolves to the Instagram
// account — so /me/messages sends from the correct Instagram account directly.
async function sendDM(recipientId, text, token) {
    if (!recipientId || !text) return;
    try {
        const url = new URL(`${IG_BASE}/me/messages`);
        url.searchParams.set('access_token', token);
        const res = await fetch(url.toString(), {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ recipient: { id: recipientId }, message: { text } })
        });
        const data = await res.json();
        if (data.error) console.error('[DM Error]', data.error.message);
        else console.log(`[DM Sent] -> ${recipientId}`);
        return data;
    } catch (e) { console.error('[DM Error]', e.message); }
}

async function sendQuickReply(recipientId, text, quickReplies, token) {
    const url = new URL(`${IG_BASE}/me/messages`);
    url.searchParams.set('access_token', token);
    const res = await fetch(url.toString(), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            recipient: { id: recipientId },
            message: { text, quick_replies: quickReplies.slice(0, 13) }
        })
    });
    const data = await res.json();
    if (data.error) throw new Error(`Quick reply failed: ${data.error.message}`);
    return data;
}

async function sendGenericTemplate(recipientId, elements, token) {
    const url = new URL(`${IG_BASE}/me/messages`);
    url.searchParams.set('access_token', token);
    const res = await fetch(url.toString(), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            recipient: { id: recipientId },
            message: { attachment: { type: 'template', payload: { template_type: 'generic', elements } } }
        })
    });
    if (!res.ok) throw new Error(`Generic template failed: ${res.status}`);
    return res.json();
}

// Public reply to a comment on your own post
// Must use JSON body — NOT query params
async function replyToComment(commentId, text, token) {
    const url = new URL(`${IG_BASE}/${commentId}/replies`);
    url.searchParams.set('access_token', token);
    const res = await fetch(url.toString(), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text })
    });
    if (!res.ok) throw new Error(`Reply failed: ${res.status}`);
    return res.json();
}

// Private DM to a commenter — MUST use /me/messages with recipient.comment_id
// This is the only valid way to initiate a private DM from a comment (Business Login)
// Quick replies are NOT supported here (first-contact thread); plain text only
async function sendPrivateReply(commentId, text, token) {
    try {
        const url = new URL(`${IG_BASE}/me/messages`);
        url.searchParams.set('access_token', token);
        const res = await fetch(url.toString(), {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                recipient: { comment_id: commentId },
                message: { text }
            })
        });
        const data = await res.json();
        if (data.error) console.error('[PrivateReply Error]', data.error.message);
        return data;
    } catch (e) {
        console.error('[PrivateReply Error]', e.message);
        return null;
    }
}

// Reply to a @mention of the business in a comment on another user's post
// Uses POST /{ig-user-id}/mentions with media_id + comment_id
async function replyToMention(igUserId, mediaId, commentId, text, token) {
    try {
        const url = new URL(`${IG_BASE}/${igUserId}/mentions`);
        url.searchParams.set('access_token', token);
        const res = await fetch(url.toString(), {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ media_id: mediaId, comment_id: commentId, message: text })
        });
        const data = await res.json();
        if (data.error) console.error('[Mention Reply Error]', data.error.message);
        return data;
    } catch (e) {
        console.error('[Mention Reply Error]', e.message);
        return null;
    }
}

async function saveEvent(data) {
    try {
        await dbConnect();
        return await Event.create(data);
    } catch (err) {
        console.error('[DB] Failed to save event:', err.message);
    }
}

// Mark user as disconnected when token expires (error code 190)
async function handleTokenExpiry(userId) {
    try {
        await dbConnect();
        await User.findOneAndUpdate(
            { userId },
            { isConnected: false, tokenExpired: true }
        );
        console.warn(`[Token] Marked user ${userId} as disconnected — token expired`);
    } catch (err) {
        console.error('[Token Expiry Handler]', err.message);
    }
}

// Check API response for token expiry and handle it
function checkTokenError(data, botUser) {
    if (data?.error?.code === 190) {
        handleTokenExpiry(botUser.userId);
        return true;
    }
    return false;
}

async function handleAutoReply(commentId, senderId, type, fromInfo, rawPayload, token, automation, botUser) {
    if (!commentId) return;

    // Dedup check
    try {
        await dbConnect();
        const existing = await Event.findOne({ 'content.commentId': commentId, 'reply.status': 'sent' });
        if (existing) {
            console.log(`[Skip] Already replied to: ${commentId}`);
            return;
        }
    } catch {}

    if (!automation?.isActive) return;

    const mediaId = rawPayload.media_id || rawPayload.post_id;
    if (automation.postTrigger === 'specific' && automation.selectedPostId && mediaId !== automation.selectedPostId) return;

    const commentText = (fromInfo?.text || '').toLowerCase();
    if (automation.commentTrigger === 'specific' && automation.keywords?.length > 0) {
        const hasKeyword = automation.keywords.some(k => commentText.includes(k.toLowerCase()));
        if (!hasKeyword) return;
    }

    let replyStatus = 'skipped';
    const publicReply = automation.replyMessages?.length > 0
        ? automation.replyMessages[Math.floor(Math.random() * automation.replyMessages.length)]
        : 'Check your DM! 📩';
    const privateDM = automation.dmContent || 'Hi there! 👋 Thanks for reaching out.';

    try {
        // Public comment reply
        if (automation.replyEnabled) {
            try { await replyToComment(commentId, publicReply, token); } catch (e) { console.error('[Public Fail]', e.message); }
        }

        // Private DM via comment_id — plain text only (first-contact thread)
        // Quick replies require an existing ongoing DM thread and are NOT supported here
        const dmText = automation.linkUrl
            ? `${privateDM}\n\n🔗 ${automation.linkUrl}`
            : privateDM;

        const dmResult = await sendPrivateReply(commentId, dmText, token);
        if (dmResult && !dmResult.error) {
            replyStatus = 'sent';
        } else {
            if (checkTokenError(dmResult, botUser)) {
                replyStatus = 'token_expired';
            } else {
                replyStatus = 'failed';
            }
        }
    } catch (err) {
        console.error('[AutoReply Error]', err.message);
        replyStatus = 'failed';
    }

    await saveEvent({
        type,
        targetBusinessId: automation.instagramBusinessId,
        from: { id: fromInfo?.id, username: fromInfo?.username, name: fromInfo?.name },
        content: { commentId, text: fromInfo?.text, mediaId },
        reply: { publicReply, privateDM: privateDM, status: replyStatus },
    });
}

// ─── GET — Webhook Verification ──────────────────────────────────────────────

export async function GET(request) {
    const { searchParams } = new URL(request.url);
    const mode = searchParams.get('hub.mode');
    const token = searchParams.get('hub.verify_token');
    const challenge = searchParams.get('hub.challenge');

    console.log(`[Webhook] Verification attempt — mode=${mode} token=${token?.substring(0, 5)}...`);

    if (mode === 'subscribe' && token === VERIFY_TOKEN) {
        console.log('[Webhook] ✅ Verified successfully');
        return new NextResponse(challenge, { status: 200 });
    }

    console.log('[Webhook] ❌ Verification failed — token mismatch');
    return new NextResponse('Forbidden', { status: 403 });
}

// ─── POST — Incoming Webhook Events ──────────────────────────────────────────

export async function POST(request) {
    // Read raw body text for signature validation before parsing JSON
    let rawBody;
    try {
        rawBody = await request.text();
    } catch {
        return new NextResponse('Bad Request', { status: 400 });
    }

    // X-Hub-Signature-256 validation (required by Meta)
    const appSecret = process.env.META_APP_SECRET;
    const sigHeader = request.headers.get('x-hub-signature-256');
    if (appSecret && sigHeader) {
        const expected = 'sha256=' + createHmac('sha256', appSecret).update(rawBody).digest('hex');
        if (sigHeader !== expected) {
            console.warn('[Webhook] ❌ Signature mismatch — rejecting request');
            return new NextResponse('Unauthorized', { status: 401 });
        }
    }

    let body;
    try {
        body = JSON.parse(rawBody);
    } catch {
        return new NextResponse('Bad Request', { status: 400 });
    }

    if (body.object !== 'instagram') {
        return new NextResponse('Not Found', { status: 404 });
    }

    const entries = body.entry || [];

    for (const entry of entries) {
        const targetId = entry.id;

        try { await dbConnect(); } catch (e) {
            console.error('[DB Error]', e.message);
            continue;
        }

        const botUser = await User.findOne({ instagramBusinessId: targetId }).catch(() => null);

        if (!botUser?.instagramAccessToken) {
            console.log(`[Webhook] No active account for ID: ${targetId}`);
            continue;
        }

        const token = botUser.instagramAccessToken;
        const igBusinessId = botUser.instagramBusinessId;

        // 1. Comments & Mentions (Feed / Live Comments)
        const changes = entry.changes || [];
        for (const change of changes) {
            const { field, value } = change;
            const fromId = value.from?.id || value.sender_id;
            if (fromId === targetId || fromId === igBusinessId) continue;

            if (field === 'feed' || field === 'comments' || field === 'live_comments') {
                if (value.item === 'comment' || field === 'comments' || field === 'live_comments') {
                    const cid = value.comment_id || value.id;
                    console.log(`[Comment] @${value.from?.username}: ${value.message || value.text}`);
                    await handleAutoReply(cid, fromId, 'comment', {
                        id: fromId, username: value.from?.username, text: value.message || value.text
                    }, value, token, { ...botUser.automation, instagramBusinessId: igBusinessId }, botUser);
                }
            }

            // Mentions: user tagged the business in a comment on another post
            // Must use POST /{ig-user-id}/mentions (NOT comment replies endpoint)
            if (field === 'mention' || field === 'mentions') {
                const mentionMediaId = value.media_id;
                const mentionCommentId = value.comment_id;
                console.log(`[Mention] in media ${mentionMediaId}, comment ${mentionCommentId}`);

                if (botUser.automation?.isActive && mentionMediaId && mentionCommentId) {
                    const mentionReply = botUser.automation.replyMessages?.length > 0
                        ? botUser.automation.replyMessages[Math.floor(Math.random() * botUser.automation.replyMessages.length)]
                        : 'Thanks for the mention! 🙌';

                    const mentionResult = await replyToMention(igBusinessId, mentionMediaId, mentionCommentId, mentionReply, token);
                    const mentionStatus = mentionResult && !mentionResult.error ? 'sent' : 'failed';
                    if (mentionResult && checkTokenError(mentionResult, botUser)) {
                        // token expired — stop processing
                    }

                    await saveEvent({
                        type: 'mention',
                        targetBusinessId: igBusinessId,
                        from: { id: fromId, username: value.from?.username },
                        content: { commentId: mentionCommentId, mediaId: mentionMediaId, text: value.text },
                        reply: { publicReply: mentionReply, status: mentionStatus },
                    });
                }
            }
        }

        // 2. Direct Messages & Postbacks
        // Only process entry.messaging — NOT standby (standby = handled by another app)
        const messaging = entry.messaging || [];
        for (const event of messaging) {
            const senderId = event.sender?.id || event.from?.id;
            if (senderId === targetId || senderId === botUser.instagramBusinessId) continue;

            // Handle DMs (including shared reels/posts)
            if (event.message) {
                const mid = event.message.mid; // Unique message ID from Meta

                // ── ATOMIC DEDUPLICATION: Block race conditions for good ──
                if (mid) {
                    try {
                        await dbConnect();
                        // findOneAndUpdate with upsert: true is atomic.
                        // If it returns a result where lastErrorObject.updatedExisting is true,
                        // it means another instance already successfully claimed this mid.
                        const dedup = await ProcessedMid.findOneAndUpdate(
                            { mid },
                            { $setOnInsert: { mid, createdAt: new Date() } },
                            { upsert: true, rawResult: true }
                        );

                        if (dedup.lastErrorObject?.updatedExisting) {
                            console.log(`[Skip] Duplicate mid detected at DB level: ${mid}`);
                            continue;
                        }
                        console.log(`[Process] Claimed unique mid: ${mid}`);
                    } catch (err) {
                        console.error('[Dedup Error]', err.message);
                        // If DB is down or error, we skip to be safe against infinite loops/retries
                        continue;
                    }
                }

                console.log(`[Incoming Message] sender=${senderId} mid=${mid}`);
                const profile = await getUser(senderId, token);
                const msgText = event.message.text;
                if (msgText) console.log(`[Message] @${profile?.username || 'user'}: ${msgText}`);

                const attachments = event.message.attachments || [];
                let replySentForThisMessage = false;

                for (const att of attachments) {
                    if (replySentForThisMessage) break;

                    const isSharedContent = !!(att.payload?.reel_video_id || att.payload?.media?.id);
                    const rawMediaId = att.payload?.reel_video_id || att.payload?.media?.id || att.payload?.id;
                    let mediaUrl = att.payload?.url || att.url || null;
                    let thumbnailUrl = null;
                    let permalink = null;
                    const attachmentType = att.payload?.reel_video_id ? 'reel'
                        : att.payload?.media?.id ? 'post_share'
                        : (att.type || 'media');

                    // Fetch rich metadata for shared posts/reels
                    if (rawMediaId) {
                        const meta = await getMedia(rawMediaId, token);
                        if (meta?.permalink) permalink = meta.permalink;
                        if (meta?.thumbnail_url) thumbnailUrl = meta.thumbnail_url;
                        if (meta?.media_url) {
                            if (!mediaUrl) mediaUrl = meta.media_url;
                            if (!thumbnailUrl) thumbnailUrl = meta.media_url;
                        }
                    }

                    // oEmbed fallback for thumbnail
                    if (!thumbnailUrl && (permalink || mediaUrl)) {
                        const oembed = await getOEmbed(permalink || mediaUrl, token);
                        if (oembed?.thumbnail_url) thumbnailUrl = oembed.thumbnail_url;
                    }

                    const fromInfo = {
                        id: senderId,
                        username: profile?.username,
                        name: profile?.name,
                    };

                    if (isSharedContent) {
                        // Shared reel/post — send auto-reply
                        console.log('[Shared] Post/Reel detected — sending reply');
                        const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://aidmbot.vercel.app';
                        const firstName = profile?.name?.split(' ')[0] || 'there';
                        const replyText = `Hi ${firstName}! 👋 Thanks for sharing! 🎉\n\n🔗 ${appUrl}`;
                        let templateSent = false;

                        // Generic template (image card) — works on Instagram when thumbnail available
                        if (thumbnailUrl) {
                            try {
                                await sendGenericTemplate(senderId, [{
                                    title: `Hi ${firstName}! 👋 Thanks for sharing!`,
                                    image_url: thumbnailUrl,
                                    subtitle: 'Check out more content and updates.',
                                    buttons: [{ type: 'web_url', url: appUrl, title: 'Visit Us 🚀' }]
                                }], token);
                                console.log(`[Generic Sent] -> ${senderId}`);
                                templateSent = true;
                                replySentForThisMessage = true;
                            } catch (e) { console.error('[Template Fail]', e.message); }
                        }

                        // Quick reply fallback (no image needed)
                        if (!templateSent) {
                            try {
                                await sendQuickReply(senderId, replyText, [
                                    { content_type: 'text', title: 'Visit Us 🚀', payload: 'VISIT_SITE' },
                                    { content_type: 'text', title: 'Thanks! 👍', payload: 'THANKS' }
                                ], token);
                                console.log(`[QuickReply Sent] -> ${senderId}`);
                                templateSent = true;
                                replySentForThisMessage = true;
                            } catch {
                                try {
                                    await sendDM(senderId, replyText, token);
                                    replySentForThisMessage = true;
                                } catch (e) { console.error('[DM Fallback Fail]', e.message); }
                            }
                        }

                        await saveEvent({
                            type: 'reel_share',
                            targetBusinessId: botUser.instagramBusinessId,
                            from: fromInfo,
                            content: { mediaId: rawMediaId, mediaUrl: permalink ? null : mediaUrl, thumbnailUrl, permalink, attachmentType, text: msgText },
                            reply: { privateDM: replyText, status: replySentForThisMessage ? 'sent' : 'failed' },
                        });

                    } else if (att.type === 'image' || att.type === 'video' || att.type === 'audio') {
                        // Direct image/video/audio — save without auto-reply
                        await saveEvent({
                            type: 'dm',
                            targetBusinessId: botUser.instagramBusinessId,
                            from: fromInfo,
                            content: { mediaUrl, thumbnailUrl: thumbnailUrl || mediaUrl, attachmentType, text: msgText },
                            reply: { status: 'skipped' },
                        });
                    }
                }

                // Save plain text DMs (no attachments)
                if (msgText && !attachments.length) {
                    await saveEvent({
                        type: 'dm',
                        targetBusinessId: botUser.instagramBusinessId,
                        from: { id: senderId, username: profile?.username, name: profile?.name },
                        content: { text: msgText },
                        reply: { status: 'skipped' },
                    });
                }
            }

            // Handle Postbacks (Button clicks)
            if (event.postback) {
                const payload = event.postback.payload;
                const title = event.postback.title;
                console.log(`[Postback] From ${senderId}: ${title} (${payload})`);

                const pbProfile = await getUser(senderId, token);
                const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://aidmbot.vercel.app';
                let replyText = 'Thanks for your choice! 🌟';
                if (payload === 'VISIT_SITE') {
                    replyText = `Here's the link you requested: ${appUrl} 🚀`;
                } else if (payload === 'CONTACT_SUPPORT_PAYLOAD') {
                    replyText = "Our support team has been notified. 💬 We'll get back to you shortly!";
                }

                const dmResult = await sendDM(senderId, replyText, token);
                checkTokenError(dmResult, botUser);

                await saveEvent({
                    type: 'postback',
                    targetBusinessId: botUser.instagramBusinessId,
                    from: { id: senderId, username: pbProfile?.username, name: pbProfile?.name },
                    content: { text: title, url: payload },
                    reply: { privateDM: replyText, status: 'sent' },
                });
            }
        }
    }

    return new NextResponse('OK', { status: 200 });
}
