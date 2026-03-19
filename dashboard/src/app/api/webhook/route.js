import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import User from '@/models/User';
import Event from '@/models/Event';
import ProcessedMid from '@/models/ProcessedMid';

const BASE_URL = 'https://graph.facebook.com/v25.0';
const VERIFY_TOKEN = process.env.VERIFY_TOKEN;

// ─── Graph API Helpers (native fetch, no axios needed) ───────────────────────

async function getMedia(id, token) {
    if (!id) return null;
    try {
        const url = new URL(`${BASE_URL}/${id}`);
        url.searchParams.set('fields', 'id,media_type,permalink,media_url,thumbnail_url,shortcode,timestamp,username');
        url.searchParams.set('access_token', token);
        const res = await fetch(url.toString());
        return res.ok ? res.json() : null;
    } catch { return null; }
}

async function getOEmbed(mediaUrl, token) {
    if (!mediaUrl) return null;
    try {
        const url = new URL(`${BASE_URL}/instagram_oembed`);
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
        const url = new URL(`${BASE_URL}/${id}`);
        url.searchParams.set('fields', 'name,username,profile_picture_url');
        url.searchParams.set('access_token', token);
        const res = await fetch(url.toString());
        return res.ok ? res.json() : null;
    } catch { return null; }
}

// All messaging functions use /{igBusinessId}/messages — NOT /me/messages
// because the token from config_id flow is a Facebook User Token, where
// /me = Facebook user (not Instagram account). Using the explicit IG Business ID
// ensures messages are sent from the correct Instagram account.

async function sendDM(recipientId, text, token, igBusinessId) {
    if (!recipientId || !text) return;
    try {
        const senderId = igBusinessId || 'me';
        const url = new URL(`${BASE_URL}/${senderId}/messages`);
        url.searchParams.set('access_token', token);
        await fetch(url.toString(), {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ recipient: { id: recipientId }, message: { text } })
        });
        console.log(`[DM Sent] -> ${recipientId}`);
    } catch (e) { console.error('[DM Error]', e.message); }
}

// Quick replies — Instagram-supported interactive message
async function sendQuickReply(recipientId, text, quickReplies, token, igBusinessId) {
    const senderId = igBusinessId || 'me';
    const url = new URL(`${BASE_URL}/${senderId}/messages`);
    url.searchParams.set('access_token', token);
    const res = await fetch(url.toString(), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            recipient: { id: recipientId },
            message: {
                text,
                quick_replies: quickReplies.slice(0, 13) // Instagram max 13
            }
        })
    });
    const data = await res.json();
    if (data.error) throw new Error(`Quick reply failed: ${data.error.message}`);
    return data;
}

async function sendGenericTemplate(recipientId, elements, token, igBusinessId) {
    const senderId = igBusinessId || 'me';
    const url = new URL(`${BASE_URL}/${senderId}/messages`);
    url.searchParams.set('access_token', token);
    const res = await fetch(url.toString(), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            recipient: { id: recipientId },
            message: {
                attachment: {
                    type: 'template',
                    payload: { template_type: 'generic', elements }
                }
            }
        })
    });
    if (!res.ok) throw new Error(`Generic template failed: ${res.status}`);
    return res.json();
}

async function replyToComment(commentId, text, token) {
    const url = new URL(`${BASE_URL}/${commentId}/replies`);
    url.searchParams.set('message', text);
    url.searchParams.set('access_token', token);
    const res = await fetch(url.toString(), { method: 'POST' });
    if (!res.ok) throw new Error(`Reply failed: ${res.status}`);
    return res.json();
}

async function sendPrivateReply(commentId, text, token) {
    try {
        const url = new URL(`${BASE_URL}/${commentId}/private_replies`);
        url.searchParams.set('message', text);
        url.searchParams.set('access_token', token);
        const res = await fetch(url.toString(), { method: 'POST' });
        return res.ok ? res.json() : null;
    } catch { return null; }
}

async function saveEvent(data) {
    try {
        await dbConnect();
        return await Event.create(data);
    } catch (err) {
        console.error('[DB] Failed to save event:', err.message);
    }
}

async function handleAutoReply(commentId, senderId, type, fromInfo, rawPayload, token, automation, igBusinessId) {
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

        // Private DM — use quick replies (Instagram-supported interactive format)
        // If a link is configured, include it in the text + a "Visit Link" quick reply chip
        const dmText = automation.linkUrl
            ? `${privateDM}\n\n🔗 ${automation.linkUrl}`
            : privateDM;

        const quickReplies = automation.linkUrl
            ? [
                { content_type: 'text', title: automation.buttonText || 'Visit Link 🔗', payload: 'VISIT_LINK' },
                { content_type: 'text', title: 'Thanks! 👍', payload: 'THANKS' }
              ]
            : [
                { content_type: 'text', title: 'Tell me more 💬', payload: 'MORE_INFO' },
                { content_type: 'text', title: 'Thanks! 👍', payload: 'THANKS' }
              ];

        try {
            await sendQuickReply(senderId, dmText, quickReplies, token, igBusinessId);
            replyStatus = 'sent';
        } catch {
            // Fallback to plain text if quick reply fails
            try {
                await sendDM(senderId, dmText, token, igBusinessId);
                replyStatus = 'fallback';
            } catch (e) {
                console.error('[DM Fallback Fail]', e.message);
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
        from: { id: fromInfo?.id, username: fromInfo?.username, name: fromInfo?.name, profilePic: fromInfo?.profilePic },
        content: { commentId, text: fromInfo?.text, mediaId },
        reply: { publicReply, privateDM, status: replyStatus },
        raw: rawPayload
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
    let body;
    try {
        body = await request.json();
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

        const botUser = await User.findOne({
            $or: [{ instagramBusinessId: targetId }, { pageId: targetId }]
        }).catch(() => null);

        if (!botUser?.instagramAccessToken) {
            console.log(`[Webhook] No active account for ID: ${targetId}`);
            continue;
        }

        const token = botUser.instagramAccessToken;
        const igBusinessId = botUser.instagramBusinessId;

        // 1. Comments & Mentions (Feed)
        const changes = entry.changes || [];
        for (const change of changes) {
            const { field, value } = change;
            const fromId = value.from?.id || value.sender_id;
            if (fromId === targetId || fromId === igBusinessId) continue;

            if (field === 'feed' || field === 'comments') {
                if (value.item === 'comment' || field === 'comments') {
                    const cid = value.comment_id || value.id;
                    console.log(`[Comment] @${value.from?.username}: ${value.message || value.text}`);
                    await handleAutoReply(cid, fromId, 'comment', {
                        id: fromId, username: value.from?.username, text: value.message || value.text
                    }, value, token, { ...botUser.automation, instagramBusinessId: igBusinessId }, igBusinessId);
                }
            }

            if (field === 'mention' || field === 'mentions') {
                const cid = value.comment_id || value.id;
                await handleAutoReply(cid, fromId, 'mention', {
                    id: fromId, username: value.from?.username, text: value.text
                }, value, token, { ...botUser.automation, instagramBusinessId: igBusinessId }, igBusinessId);
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
                        profilePic: profile?.profile_picture_url,
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
                                }], token, igBusinessId);
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
                                ], token, igBusinessId);
                                console.log(`[QuickReply Sent] -> ${senderId}`);
                                templateSent = true;
                                replySentForThisMessage = true;
                            } catch {
                                try {
                                    await sendDM(senderId, replyText, token, igBusinessId);
                                    replySentForThisMessage = true;
                                } catch (e) { console.error('[DM Fallback Fail]', e.message); }
                            }
                        }

                        await saveEvent({
                            type: 'reel_share',
                            targetBusinessId: botUser.instagramBusinessId,
                            from: fromInfo,
                            content: { mediaId: rawMediaId, mediaUrl, thumbnailUrl, permalink, attachmentType, text: msgText },
                            reply: { privateDM: replyText, status: replySentForThisMessage ? 'sent' : 'failed' },
                            raw: event
                        });

                    } else if (att.type === 'image' || att.type === 'video' || att.type === 'audio') {
                        // Direct image/video/audio — save without auto-reply
                        await saveEvent({
                            type: 'dm',
                            targetBusinessId: botUser.instagramBusinessId,
                            from: fromInfo,
                            content: { mediaUrl, thumbnailUrl: thumbnailUrl || mediaUrl, attachmentType, text: msgText },
                            reply: { status: 'skipped' },
                            raw: event
                        });
                    }
                }

                // Save plain text DMs (no attachments)
                if (msgText && !attachments.length) {
                    await saveEvent({
                        type: 'dm',
                        targetBusinessId: botUser.instagramBusinessId,
                        from: { id: senderId, username: profile?.username, name: profile?.name, profilePic: profile?.profile_picture_url },
                        content: { text: msgText },
                        reply: { status: 'skipped' },
                        raw: event
                    });
                }
            }

            // Handle Postbacks (Button clicks)
            if (event.postback) {
                const payload = event.postback.payload;
                const title = event.postback.title;
                console.log(`[Postback] From ${senderId}: ${title} (${payload})`);

                const pbProfile = await getUser(senderId, token);
                let replyText = 'Thanks for your choice! 🌟';
                if (payload === 'GET_DOCS_PAYLOAD') {
                    replyText = 'Sure! 📚 You can find our docs at: https://github.com/amanraj2408/Query-Bot/blob/main/README.md';
                } else if (payload === 'CONTACT_SUPPORT_PAYLOAD') {
                    replyText = "Our support team has been notified. 💬 We'll get back to you shortly!";
                }

                await sendDM(senderId, replyText, token, igBusinessId);
                await saveEvent({
                    type: 'postback',
                    targetBusinessId: botUser.instagramBusinessId,
                    from: { id: senderId, username: pbProfile?.username, name: pbProfile?.name, profilePic: pbProfile?.profile_picture_url },
                    content: { text: title, url: payload },
                    reply: { privateDM: replyText, status: 'sent' },
                    raw: event
                });
            }
        }
    }

    return new NextResponse('OK', { status: 200 });
}
