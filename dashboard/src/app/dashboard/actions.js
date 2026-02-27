"use server";

import dbConnect from "@/lib/dbConnect";
import Event from "@/models/Event";
import User from "@/models/User";
import { auth, currentUser } from "@clerk/nextjs/server";

export async function getDashboardStats() {
  await dbConnect();
  
  const totalContacts = await Event.distinct("from.id").countDocuments();
  
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);
  
  const sentToday = await Event.countDocuments({
    "reply.status": "sent",
    createdAt: { $gte: startOfDay }
  });
  
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const sentYesterday = await Event.countDocuments({
      "reply.status": "sent",
      createdAt: { $gte: yesterday, $lt: startOfDay }
  });

  const transmissionTrend = sentYesterday === 0 ? 0 : Math.round(((sentToday - sentYesterday) / sentYesterday) * 100);

  const latestEvents = await Event.find()
    .sort({ createdAt: -1 })
    .limit(5)
    .lean();

  return {
    contacts: totalContacts,
    sentToday,
    transmissionTrend,
    latestEvents: JSON.parse(JSON.stringify(latestEvents))
  };
}

export async function saveInstagramAccount(data) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  await dbConnect();

  const user = await User.findOneAndUpdate(
    { clerkId: userId },
    {
      instagramAccessToken: data.pageAccessToken || data.accessToken,
      instagramBusinessId: data.instagramBusinessId,
      instagramUsername: data.instagramUsername,
      pageId: data.pageId,
      pageAccessToken: data.pageAccessToken,
      isConnected: true,
    },
    { upsert: true, new: true }
  );

  return { success: true, user: JSON.parse(JSON.stringify(user)) };
}

export async function getAccountsFromToken(token) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  try {
    const res = await fetch(`https://graph.facebook.com/v25.0/me/accounts?fields=name,access_token,instagram_business_account{id,username,name,profile_picture_url}&access_token=${token}`);
    const data = await res.json();
    
    if (data.error) {
      console.error("[Instagram API Error]", data.error);
      throw new Error(data.error.message);
    }

    console.log(`[Discovery] Found ${data.data?.length || 0} potential accounts. Checking for Instagram links...`);
    
    const accounts = data.data
      ?.filter(p => {
        if (!p.instagram_business_account) {
          console.log(`[Discovery] Page "${p.name}" has no linked Instagram Business account.`);
          return false;
        }
        return true;
      })
      .map(p => ({
        pageId: p.id,
        pageToken: p.access_token,
        igId: p.instagram_business_account.id,
        username: p.instagram_business_account.username,
        name: p.instagram_business_account.name,
        profilePic: p.instagram_business_account.profile_picture_url
      }));

    return { 
      success: true, 
      accounts, 
      totalPages: data.data?.length || 0 
    };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

export async function saveDiscoveredAccount(details) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  await dbConnect();

  // Prefer the user-pasted token; fall back to the page token from Meta OAuth
  const accessToken = details.userToken || details.pageToken;

  if (!accessToken) {
    return { success: false, error: "No Instagram access token available." };
  }

  const user = await User.findOneAndUpdate(
    { clerkId: userId },
    {
      instagramAccessToken: accessToken,
      instagramBusinessId: details.igId,
      instagramUsername: details.username,
      pageId: details.pageId,
      pageAccessToken: details.pageToken,
      isConnected: true,
    },
    { upsert: true, new: true }
  );

  return { success: true, username: details.username };
}

export async function autoConnectBotAccount() {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const accessToken = process.env.INSTAGRAM_ACCESS_TOKEN;
  const businessId = process.env.INSTAGRAM_BUSINESS_ACCOUNT_ID;

  if (!accessToken || !businessId) {
    throw new Error("Bot credentials not found in environment variables");
  }

  // Fetch username for completeness
  const igRes = await fetch(`https://graph.facebook.com/v25.0/${businessId}?access_token=${accessToken}&fields=username`);
  const igData = await igRes.json();

  await dbConnect();

  const user = await User.findOneAndUpdate(
    { clerkId: userId },
    {
      instagramAccessToken: accessToken,
      instagramBusinessId: businessId,
      instagramUsername: igData.username || "InstagramBot",
      isConnected: true,
    },
    { upsert: true, new: true }
  );

  return { success: true, user: JSON.parse(JSON.stringify(user)) };
}

export async function saveAutomation(data) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  await dbConnect();

  const user = await User.findOneAndUpdate(
    { clerkId: userId },
    {
      automation: {
        postTrigger: data.postTrigger,
        selectedPostId: data.selectedPostId,
        commentTrigger: data.commentTrigger,
        keywords: data.keywords ? data.keywords.split(',').map(k => k.trim()).filter(k => k) : [],
        replyEnabled: data.replyEnabled,
        replyMessages: data.replyMessages || [],
        dmContent: data.dmContent,
        buttonText: data.buttonText,
        linkUrl: data.linkUrl,
        isActive: true,
      }
    },
    { new: true }
  );

  return { success: true, automation: JSON.parse(JSON.stringify(user.automation)) };
}

export async function getInstagramAccount() {
  const { userId } = await auth();
  if (!userId) return null;

  await dbConnect();
  const user = await User.findOne({ clerkId: userId });

  if (!user || !user.isConnected) {
    return { isConnected: false };
  }

  // Fetch profile and media
  let media = [];
  let profilePicture = null;
  let followersCount = 0;
  
  try {
    // 1. Fetch Profile
    const profileRes = await fetch(`https://graph.facebook.com/v25.0/${user.instagramBusinessId}?fields=profile_picture_url,followers_count&access_token=${user.instagramAccessToken}`);
    const profileData = await profileRes.json();
    if (profileData.profile_picture_url) {
      profilePicture = profileData.profile_picture_url;
      followersCount = profileData.followers_count || 0;
    }

    // 2. Fetch Media (increased limit slightly for better selection)
    const mediaRes = await fetch(`https://graph.facebook.com/v25.0/${user.instagramBusinessId}/media?fields=id,media_type,media_url,thumbnail_url,permalink,caption,like_count,comments_count&limit=12&access_token=${user.instagramAccessToken}`);
    const mediaData = await mediaRes.json();
    if (mediaData.data) {
      media = mediaData.data;
    }
  } catch (error) {
    console.error("Failed to fetch Instagram account details:", error);
  }

  return {
    isConnected: true,
    username: user.instagramUsername,
    businessId: user.instagramBusinessId,
    profilePicture,
    followersCount,
    media,
    automation: user.automation ? JSON.parse(JSON.stringify(user.automation)) : null
  };
}
