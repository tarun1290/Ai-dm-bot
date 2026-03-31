"use client";

import React, { useState, useEffect } from 'react';
import { Loader2, CheckCircle2, AtSign, Share2, Link2, MessageSquare, ToggleLeft, ToggleRight, Layers, Brain, Info, Shield, Reply, MessageCircleWarning } from "lucide-react";
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

import { getInstagramAccount, saveAutomation, saveReelCategories, saveReelDefaultReply } from '@/app/dashboard/actions';
import { saveAiDetectionSettings, getAiDetectionStats } from '@/app/dashboard/ai-actions';
// [SMART FEATURES] import { saveSmartReplyConfig, getSmartReplyStats, getShopifyStore, getKnowledgeDocuments } from '@/app/dashboard/smart-actions';
import ReelCategoryEditor from './automation/ReelCategoryEditor';
// [PLANS DISABLED] Feature gating imports not needed during Early Access
import AccountSummary from './automation/AccountSummary';
import TriggerForm from './automation/TriggerForm';
import ResponseEditor from './automation/ResponseEditor';
import CommentManager from './automation/CommentManager';

// ── Tab config ──────────────────────────────────────────────────────────────
const TABS = [
  { id: "comment", label: "Comment to DM", icon: MessageSquare, configKey: "replyEnabled" },
  { id: "reel", label: "Reel Shares", icon: Share2, configKey: "reelShareEnabled" },
  { id: "mention", label: "Mention Replies", icon: AtSign, configKey: "mentionsEnabled" },
  { id: "follower", label: "Follower Gate", icon: Shield, configKey: "requireFollow" },
  { id: "reply", label: "Comment Reply", icon: Reply, configKey: "replyEnabled" },
  { id: "moderation", label: "Comment Manager", icon: MessageCircleWarning, configKey: null },
  { id: "rules", label: "Smart Rules", icon: Layers, configKey: null },
];

function DmPreview({ title, subtitle, buttonLabel }) {
  return (
    <div className="max-w-[260px] rounded-xl p-4 space-y-2" style={{ backgroundColor: '#F4F4F5', border: '1px solid #E4E4E7' }}>
      <p className="text-sm font-semibold" style={{ color: title ? '#18181B' : '#D4D4D8' }}>
        {title || 'Title preview'}
      </p>
      <p className="text-xs leading-relaxed" style={{ color: subtitle ? '#52525B' : '#D4D4D8' }}>
        {subtitle || 'Subtitle text will appear here'}
      </p>
      {(buttonLabel || true) && (
        <div className="pt-1">
          <span className="inline-block text-xs font-medium px-4 py-1.5 rounded-lg" style={{ border: '1px solid #E4E4E7', color: buttonLabel ? '#4F46E5' : '#D4D4D8' }}>
            {buttonLabel || 'Button'}
          </span>
        </div>
      )}
    </div>
  );
}

function CharCount({ value, max }) {
  const len = (value || '').length;
  const pct = (len / max) * 100;
  return (
    <span className="text-xs" style={{ color: pct >= 100 ? '#DC2626' : pct >= 90 ? '#D97706' : '#A1A1AA' }}>
      {len}/{max}
    </span>
  );
}

function TabToggle({ enabled, onChange }) {
  return (
    <button onClick={() => onChange(!enabled)}
      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
      style={enabled
        ? { backgroundColor: '#ECFDF5', color: '#059669' }
        : { backgroundColor: '#F4F4F5', color: '#A1A1AA' }
      }>
      {enabled ? <ToggleRight size={14} /> : <ToggleLeft size={14} />}
      {enabled ? 'Active' : 'Inactive'}
    </button>
  );
}

function SectionBox({ title, children }) {
  return (
    <div className="rounded-lg p-5" style={{ backgroundColor: '#FAFAFA' }}>
      {title && <p className="text-xs font-medium uppercase tracking-wider mb-4" style={{ color: '#A1A1AA' }}>{title}</p>}
      {children}
    </div>
  );
}

export default function Automation({ aiEnabled = false }) {
  const [instaData, setInstaData] = useState({ isConnected: false, username: "", media: [], followersCount: 0 });
  const [fetching, setFetching] = useState(true);
  const [publishing, setPublishing] = useState(false);
  const [saved, setSaved] = useState(false);
  const [activeTab, setActiveTab] = useState(() => {
    if (typeof window !== 'undefined') return localStorage.getItem('engagr-auto-tab') || 'comment';
    return 'comment';
  });

  const [config, setConfig] = useState({
    postTrigger: "specific", commentTrigger: "any", replyEnabled: true, selectedPostId: null,
    keywords: "", replyMessages: ["Check your DMs! 📩"],
    dmContent: "Hey there! Thanks so much for your interest 😊\n\nClick below and I'll send you the link right away ✨",
    buttonText: "Yes", linkUrl: "", deliveryMessage: "", deliveryButtonText: "",
    requireFollow: false, followPromptPublicReply: "", followPromptDM: "",
    followButtonText: "I'm following now! ✓",
    followerGate: {
      enabled: false,
      appliesTo: { commentToDm: true, reelShareReply: true, mentionReply: true },
      nonFollowerMessage: { title: "Follow us to unlock! 🔓", subtitle: "Follow @{username} to get access to this content. Once you follow, tap the button below!", visitProfileLabel: "Visit Profile", confirmFollowLabel: "I'm following now! ✔️" },
      verificationFailedMessage: { title: "Hmm, I can't see your follow yet 🤔", subtitle: "Please make sure you've followed @{username} and try again!" },
      maxRetries: 3,
      successMessage: { enabled: false, title: "Thanks for following! 🎉", subtitle: "Here's your content:" },
      skipForReturningUsers: false, skipForVerifiedFollowers: true,
    },
    mentionsEnabled: false, mentionReplyMessage: "Thanks for the mention! 🙌",
    reelShareEnabled: false, reelShareMessage: "Hey! 👋 Thanks for sharing!",
    reelShareLinkUrl: "", reelShareButtonText: "Check it out 🚀",
  });

  const [reelCategories, setReelCategories] = useState([]);
  const [reelDefaultReply, setReelDefaultReply] = useState({ enabled: true, message: "", linkUrl: "", buttonText: "Check it out 🚀" });
  const [savingCategories, setSavingCategories] = useState(false);
  const [aiConfig, setAiConfig] = useState({ enabled: false, replyTemplate: "I found this! {{productName}} — check it out here:", linkButtonLabel: "Shop Now", fallbackToDefault: true, detectOnlyCategories: [] });
  const [aiDetectionStats, setAiDetectionStats] = useState(null);
  const [savingAi, setSavingAi] = useState(false);

  // [SMART FEATURES] Smart Reply config state — uncomment when enabled
  // const [smartReplyConfig, setSmartReplyConfig] = useState({ enabled: false, tone: "friendly", businessDescription: "", autoReplyToAllDMs: false, excludeKeywords: [], maxRepliesPerThread: 20, workingHoursOnly: false, workingHours: { start: "09:00", end: "18:00", timezone: "Asia/Kolkata" } });
  // [/SMART FEATURES]

  useEffect(() => {
    async function load() {
      try {
        const data = await getInstagramAccount();
        if (data?.isConnected) {
          setInstaData(data);
          if (data.automation) {
            const a = data.automation;
            setConfig(prev => ({
              ...prev, postTrigger: a.postTrigger || "specific", commentTrigger: a.commentTrigger || "any",
              replyEnabled: a.replyEnabled ?? true, selectedPostId: a.selectedPostId || data.media?.[0]?.id || null,
              keywords: a.keywords?.join(", ") || "", replyMessages: a.replyMessages?.length > 0 ? [a.replyMessages[0]] : prev.replyMessages,
              dmContent: a.dmContent || prev.dmContent, buttonText: a.buttonText || prev.buttonText,
              linkUrl: a.linkUrl || prev.linkUrl, deliveryMessage: a.deliveryMessage || "",
              deliveryButtonText: a.deliveryButtonText || "", requireFollow: a.requireFollow ?? false,
              followPromptPublicReply: a.followPromptPublicReply || "", followPromptDM: a.followPromptDM || "",
              followButtonText: a.followButtonText || "I'm following now! ✓",
              followerGate: a.followerGate ? { ...config.followerGate, ...a.followerGate, enabled: a.followerGate.enabled ?? a.requireFollow ?? false } : config.followerGate,
              mentionsEnabled: a.mentionsEnabled ?? false, mentionReplyMessage: a.mentionReplyMessage || "Thanks for the mention! 🙌",
              reelShareEnabled: a.reelShareEnabled ?? false, reelShareMessage: a.reelShareMessage || "Hey! 👋 Thanks for sharing!",
              reelShareLinkUrl: a.reelShareLinkUrl || "", reelShareButtonText: a.reelShareButtonText || "Check it out 🚀",
            }));
            if (a.reelCategories) setReelCategories(a.reelCategories);
            if (a.reelShareDefaultReply) setReelDefaultReply(a.reelShareDefaultReply);
            if (a.aiProductDetection) setAiConfig(prev => ({ ...prev, ...a.aiProductDetection }));
          } else if (data.media?.length > 0) {
            setConfig(prev => ({ ...prev, selectedPostId: data.media[0].id }));
          }
        }
        if (aiEnabled) {
          getAiDetectionStats().then(res => { if (res.success) setAiDetectionStats(res); }).catch(() => {});
        }
      } catch (e) { console.error("Failed to load:", e); }
      finally { setFetching(false); }
    }
    load();
  }, [aiEnabled]);

  const update = (key, value) => setConfig(prev => ({ ...prev, [key]: value }));

  const handlePublish = async () => {
    setPublishing(true); setSaved(false);
    try {
      const res = await saveAutomation(config);
      if (res.success) { setSaved(true); toast.success("Automation saved!"); setTimeout(() => setSaved(false), 3000); }
    } catch (e) { toast.error(`Failed: ${e.message}`); }
    finally { setPublishing(false); }
  };

  const handleSaveCategories = async () => {
    setSavingCategories(true);
    try {
      const [catRes, defRes] = await Promise.all([saveReelCategories(reelCategories), saveReelDefaultReply(reelDefaultReply)]);
      if (catRes.success && defRes.success) { toast.success("Rules saved!"); if (catRes.categories) setReelCategories(catRes.categories); }
      else toast.error(catRes.error || defRes.error || "Failed");
    } catch (e) { toast.error(e.message); }
    finally { setSavingCategories(false); }
  };

  const handleSaveAi = async () => {
    setSavingAi(true);
    try { const res = await saveAiDetectionSettings(aiConfig); if (res.success) toast.success("AI settings saved!"); else toast.error(res.error); }
    catch (e) { toast.error(e.message); } finally { setSavingAi(false); }
  };

  const switchTab = (id) => { setActiveTab(id); if (typeof window !== 'undefined') localStorage.setItem('engagr-auto-tab', id); };

  if (fetching) {
    return <div className="flex h-[60vh] w-full items-center justify-center"><Loader2 className="animate-spin" size={24} style={{ color: '#4F46E5' }} /></div>;
  }

  if (!instaData.isConnected) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] space-y-4 text-center">
        <h3 className="text-xl font-semibold" style={{ color: '#18181B' }}>Instagram Not Connected</h3>
        <p className="max-w-xs text-sm" style={{ color: '#71717A' }}>Connect your Instagram account to set up automations.</p>
        <button onClick={() => window.location.href = '/onboarding'}
          className="px-6 py-2.5 text-white rounded-lg text-sm font-medium" style={{ backgroundColor: '#4F46E5' }}>
          Connect Instagram
        </button>
      </div>
    );
  }

  const isExpired = false;
  const allTabs = [...TABS, ...(aiEnabled ? [{ id: "ai", label: "AI Detection", icon: Brain, configKey: "aiConfig.enabled", beta: false }] : [{ id: "ai-beta", label: "AI Detection", icon: Brain, beta: true }])];

  const SaveButton = ({ onClick, loading, label = "Save changes" }) => (
    <div className="flex justify-end gap-3 pt-4" style={{ borderTop: '1px solid #F0F0F0' }}>
      <button onClick={onClick} disabled={loading}
        className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium text-white transition-colors disabled:opacity-50"
        style={{ backgroundColor: '#4F46E5' }}
        onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#4338CA'; }}
        onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#4F46E5'; }}>
        {loading ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle2 size={14} />}
        {loading ? "Saving..." : label}
      </button>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight" style={{ color: '#18181B' }}>Automation</h1>
          <p className="text-sm mt-1" style={{ color: '#71717A' }}>Configure how Engagr responds to interactions</p>
        </div>
        <span className="text-xs font-medium px-3 py-1.5 rounded-full" style={{ backgroundColor: '#EEF2FF', color: '#4F46E5' }}>
          @{instaData.username}
        </span>
      </div>

      {/* Tab bar + panel */}
      <div className="rounded-xl overflow-hidden" style={{ backgroundColor: '#FFFFFF', border: '1px solid #F0F0F0' }}>
        {/* Tabs */}
        <div className="flex overflow-x-auto no-scrollbar" style={{ borderBottom: '1px solid #F0F0F0' }}>
          {allTabs.map((tab) => {
            const isActive = activeTab === tab.id;
            const Icon = tab.icon;
            const isEnabled = tab.configKey ? (tab.configKey === "aiConfig.enabled" ? aiConfig.enabled : config[tab.configKey]) : (tab.id === "rules" ? config.reelShareEnabled : false);
            return (
              <button key={tab.id} onClick={() => switchTab(tab.id)}
                className={cn("flex items-center gap-2 px-5 py-3.5 text-sm font-medium whitespace-nowrap transition-all border-b-2 flex-shrink-0",
                  isActive ? "border-indigo-600" : "border-transparent"
                )}
                style={{ color: isActive ? '#4F46E5' : '#71717A', backgroundColor: isActive ? '#FFFFFF' : 'transparent' }}
                onMouseEnter={(e) => { if (!isActive) e.currentTarget.style.backgroundColor = '#FAFAFA'; }}
                onMouseLeave={(e) => { if (!isActive) e.currentTarget.style.backgroundColor = isActive ? '#FFFFFF' : 'transparent'; }}>
                <Icon size={16} />
                <span className="hidden sm:inline">{tab.label}</span>
                {tab.beta && <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded-full" style={{ backgroundColor: '#F5F3FF', color: '#7C3AED' }}>Beta</span>}
                {!tab.beta && isEnabled && <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: '#059669' }} />}
              </button>
            );
          })}
        </div>

        {/* Panel */}
        <div className="p-6 space-y-6">

          {/* ── Comment to DM ──────────────────────────────────────────── */}
          {activeTab === "comment" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold" style={{ color: '#18181B' }}>Comment to DM</h2>
                  <p className="text-sm" style={{ color: '#71717A' }}>Automatically DM users who comment with matching keywords</p>
                </div>
                <TabToggle enabled={config.replyEnabled} onChange={(v) => update('replyEnabled', v)} />
              </div>
              <div style={{ opacity: config.replyEnabled ? 1 : 0.5 }}>
                <SectionBox title="Trigger rules">
                  <TriggerForm {...config} media={instaData.media} selectedPost={config.selectedPostId}
                    replyToggle={config.replyEnabled}
                    setPostTrigger={(v) => update('postTrigger', v)} setCommentTrigger={(v) => update('commentTrigger', v)}
                    setSelectedPost={(v) => update('selectedPostId', v)} setKeywords={(v) => update('keywords', v)}
                    setReplyToggle={(v) => update('replyEnabled', v)} setReplyMessages={(v) => update('replyMessages', v)}
                    setRequireFollow={(v) => update('requireFollow', v)}
                    setFollowPromptPublicReply={(v) => update('followPromptPublicReply', v)}
                    setFollowPromptDM={(v) => update('followPromptDM', v)}
                    setFollowButtonText={(v) => update('followButtonText', v)}
                    instagramUsername={instaData.username} />
                </SectionBox>
                <SectionBox title="DM Response">
                  <ResponseEditor {...config}
                    setDmContent={(v) => update('dmContent', v)} setButtonText={(v) => update('buttonText', v)}
                    setLinkUrl={(v) => update('linkUrl', v)} setDeliveryMessage={(v) => update('deliveryMessage', v)}
                    setDeliveryButtonText={(v) => update('deliveryButtonText', v)} />
                </SectionBox>
              </div>
              <SaveButton onClick={handlePublish} loading={publishing} />
            </div>
          )}

          {/* ── Reel Shares ────────────────────────────────────────────── */}
          {activeTab === "reel" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold" style={{ color: '#18181B' }}>Reel Share Replies</h2>
                  <p className="text-sm" style={{ color: '#71717A' }}>Auto-reply when someone shares your reel or post in DMs</p>
                </div>
                <TabToggle enabled={config.reelShareEnabled} onChange={(v) => update('reelShareEnabled', v)} />
              </div>
              <div style={{ opacity: config.reelShareEnabled ? 1 : 0.5 }}>
                <SectionBox title="Reply message">
                  <div className="space-y-4">
                    <div>
                      <label className="text-xs font-medium mb-1.5 block" style={{ color: '#71717A' }}>DM Message</label>
                      <textarea value={config.reelShareMessage} onChange={(e) => update('reelShareMessage', e.target.value)} rows={2}
                        className="w-full rounded-lg px-4 py-2.5 text-sm outline-none resize-none"
                        style={{ border: '1px solid #E4E4E7', color: '#18181B' }}
                        placeholder="Hey! 👋 Thanks for sharing!" />
                      <p className="text-xs mt-1" style={{ color: '#A1A1AA' }}>Use <span className="font-medium" style={{ color: '#4F46E5' }}>{'{name}'}</span> for sender&apos;s first name.</p>
                    </div>
                    <div>
                      <label className="text-xs font-medium mb-1.5 block" style={{ color: '#71717A' }}>Link URL</label>
                      <input type="url" value={config.reelShareLinkUrl} onChange={(e) => update('reelShareLinkUrl', e.target.value)}
                        className="w-full rounded-lg px-4 py-2.5 text-sm outline-none"
                        style={{ border: '1px solid #E4E4E7', color: '#18181B' }} placeholder="https://your-link.com" />
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="text-xs font-medium" style={{ color: '#71717A' }}>Button Text</label>
                        <CharCount value={config.reelShareButtonText} max={20} />
                      </div>
                      <input type="text" value={config.reelShareButtonText} onChange={(e) => update('reelShareButtonText', e.target.value)}
                        className="w-full rounded-lg px-4 py-2.5 text-sm outline-none"
                        style={{ border: '1px solid #E4E4E7', color: '#18181B' }} placeholder="Check it out 🚀" maxLength={20} />
                    </div>
                  </div>
                </SectionBox>
                <SectionBox title="Preview">
                  <DmPreview title={config.reelShareMessage || "Hey! 👋 Thanks for sharing!"} subtitle={config.reelShareLinkUrl ? `🔗 ${config.reelShareLinkUrl}` : ""} buttonLabel={config.reelShareButtonText || "Check it out 🚀"} />
                </SectionBox>
              </div>
              <SaveButton onClick={handlePublish} loading={publishing} />
            </div>
          )}

          {/* ── Mention Replies ─────────────────────────────────────────── */}
          {activeTab === "mention" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold" style={{ color: '#18181B' }}>Mention Detection</h2>
                  <p className="text-sm" style={{ color: '#71717A' }}>Auto-reply when someone mentions you in comments</p>
                </div>
                <TabToggle enabled={config.mentionsEnabled} onChange={() => update('mentionsEnabled', !config.mentionsEnabled)} />
              </div>
              <div style={{ opacity: config.mentionsEnabled ? 1 : 0.5 }}>
                <SectionBox title="Reply message">
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-xs font-medium" style={{ color: '#71717A' }}>Public Reply</label>
                      <CharCount value={config.mentionReplyMessage} max={300} />
                    </div>
                    <textarea value={config.mentionReplyMessage} onChange={(e) => update('mentionReplyMessage', e.target.value)} rows={2}
                      className="w-full rounded-lg px-4 py-2.5 text-sm outline-none resize-none"
                      style={{ border: '1px solid #E4E4E7', color: '#18181B' }} placeholder="Thanks for the mention! 🙌" maxLength={300} />
                    <p className="text-xs mt-1" style={{ color: '#A1A1AA' }}>This public reply is posted under the comment where you were mentioned.</p>
                  </div>
                </SectionBox>
              </div>
              <SaveButton onClick={handlePublish} loading={publishing} />
            </div>
          )}

          {/* ── Follower Gate ──────────────────────────────────────────── */}
          {activeTab === "follower" && (() => {
            const fg = config.followerGate || {};
            const nf = fg.nonFollowerMessage || {};
            const vf = fg.verificationFailedMessage || {};
            const sm = fg.successMessage || {};
            const uFg = (path, val) => {
              const keys = path.split('.');
              setConfig(prev => {
                const newFg = JSON.parse(JSON.stringify(prev.followerGate || {}));
                let obj = newFg;
                for (let i = 0; i < keys.length - 1; i++) { if (!obj[keys[i]]) obj[keys[i]] = {}; obj = obj[keys[i]]; }
                obj[keys[keys.length - 1]] = val;
                return { ...prev, followerGate: newFg, requireFollow: newFg.enabled ?? prev.requireFollow };
              });
            };
            const ign = instaData.username || 'youraccount';
            return (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-semibold" style={{ color: '#18181B' }}>Follower Gate</h2>
                    <p className="text-sm" style={{ color: '#71717A' }}>Require users to follow before receiving content</p>
                  </div>
                  <TabToggle enabled={fg.enabled || config.requireFollow} onChange={(v) => { uFg('enabled', v); update('requireFollow', v); }} />
                </div>

                <div style={{ opacity: (fg.enabled || config.requireFollow) ? 1 : 0.5 }}>
                  {/* Applies to */}
                  <SectionBox title="Applies to">
                    <div className="flex flex-wrap gap-4">
                      {[['commentToDm', 'Comment to DM'], ['reelShareReply', 'Reel share replies'], ['mentionReply', 'Mention replies']].map(([key, label]) => (
                        <label key={key} className="flex items-center gap-2 text-sm" style={{ color: '#18181B' }}>
                          <input type="checkbox" checked={fg.appliesTo?.[key] !== false} onChange={(e) => uFg(`appliesTo.${key}`, e.target.checked)} style={{ accentColor: '#4F46E5' }} />
                          {label}
                        </label>
                      ))}
                    </div>
                  </SectionBox>

                  {/* Non-follower message */}
                  <SectionBox title="Non-follower DM">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div>
                          <div className="flex items-center justify-between mb-1.5">
                            <label className="text-xs font-medium" style={{ color: '#71717A' }}>Message text</label>
                            <CharCount value={nf.subtitle} max={640} />
                          </div>
                          <textarea value={nf.subtitle || ""} onChange={(e) => uFg('nonFollowerMessage.subtitle', e.target.value)} rows={3}
                            className="w-full rounded-lg px-4 py-2.5 text-sm outline-none resize-none"
                            style={{ border: '1px solid #E4E4E7', color: '#18181B' }} maxLength={640}
                            placeholder={`Follow @${ign} to get access to this content!`} />
                          <p className="text-xs mt-1" style={{ color: '#A1A1AA' }}>Use <span style={{ color: '#4F46E5' }}>{'{username}'}</span> to insert your IG handle</p>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="text-xs font-medium mb-1.5 block" style={{ color: '#71717A' }}>Profile button label</label>
                            <input type="text" value={nf.visitProfileLabel || "Visit Profile"} onChange={(e) => uFg('nonFollowerMessage.visitProfileLabel', e.target.value)}
                              className="w-full rounded-lg px-3 py-2 text-sm outline-none"
                              style={{ border: '1px solid #E4E4E7', color: '#18181B' }} maxLength={20} />
                          </div>
                          <div>
                            <label className="text-xs font-medium mb-1.5 block" style={{ color: '#71717A' }}>Confirm button label</label>
                            <input type="text" value={nf.confirmFollowLabel || "I'm following now! ✔️"} onChange={(e) => uFg('nonFollowerMessage.confirmFollowLabel', e.target.value)}
                              className="w-full rounded-lg px-3 py-2 text-sm outline-none"
                              style={{ border: '1px solid #E4E4E7', color: '#18181B' }} maxLength={20} />
                          </div>
                        </div>
                      </div>
                      <DmPreview title="Follow to unlock 🔓"
                        subtitle={(nf.subtitle || `Follow @${ign} to get access!`).replace(/\{username\}/g, ign)}
                        buttonLabel={nf.confirmFollowLabel || "I'm following now! ✔️"} />
                    </div>
                  </SectionBox>

                  {/* Verification failed */}
                  <SectionBox title="Verification failed message">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div>
                          <div className="flex items-center justify-between mb-1.5">
                            <label className="text-xs font-medium" style={{ color: '#71717A' }}>Retry message text</label>
                            <CharCount value={vf.subtitle} max={640} />
                          </div>
                          <textarea value={vf.subtitle || ""} onChange={(e) => uFg('verificationFailedMessage.subtitle', e.target.value)} rows={2}
                            className="w-full rounded-lg px-4 py-2.5 text-sm outline-none resize-none"
                            style={{ border: '1px solid #E4E4E7', color: '#18181B' }} maxLength={640}
                            placeholder={`Hmm, I can't see your follow yet. Make sure you've followed @${ign} and try again!`} />
                        </div>
                        <div>
                          <label className="text-xs font-medium mb-1.5 block" style={{ color: '#71717A' }}>Max retries before auto-delivering</label>
                          <input type="number" value={fg.maxRetries ?? 3} onChange={(e) => uFg('maxRetries', Number(e.target.value))} min={1} max={10}
                            className="w-20 rounded-lg px-3 py-2 text-sm outline-none"
                            style={{ border: '1px solid #E4E4E7', color: '#18181B' }} />
                          <p className="text-xs mt-1" style={{ color: '#A1A1AA' }}>After this many failed attempts, content is sent anyway</p>
                        </div>
                      </div>
                      <DmPreview title="Can't see your follow yet 🤔"
                        subtitle={(vf.subtitle || `Please make sure you've followed @${ign} and try again!`).replace(/\{username\}/g, ign)}
                        buttonLabel={nf.confirmFollowLabel || "I'm following now! ✔️"} />
                    </div>
                  </SectionBox>

                  {/* Success message */}
                  <SectionBox title="Success message (optional)">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <p className="text-sm font-medium" style={{ color: '#18181B' }}>Send a success message before content</p>
                        <p className="text-xs" style={{ color: '#A1A1AA' }}>Shown right before the content DM is delivered</p>
                      </div>
                      <TabToggle enabled={sm.enabled} onChange={(v) => uFg('successMessage.enabled', v)} />
                    </div>
                    {sm.enabled && (
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className="space-y-3">
                          <div>
                            <label className="text-xs font-medium mb-1.5 block" style={{ color: '#71717A' }}>Title</label>
                            <input type="text" value={sm.title || ""} onChange={(e) => uFg('successMessage.title', e.target.value)}
                              className="w-full rounded-lg px-3 py-2 text-sm outline-none"
                              style={{ border: '1px solid #E4E4E7', color: '#18181B' }} placeholder="Thanks for following! 🎉" maxLength={80} />
                          </div>
                          <div>
                            <label className="text-xs font-medium mb-1.5 block" style={{ color: '#71717A' }}>Subtitle</label>
                            <input type="text" value={sm.subtitle || ""} onChange={(e) => uFg('successMessage.subtitle', e.target.value)}
                              className="w-full rounded-lg px-3 py-2 text-sm outline-none"
                              style={{ border: '1px solid #E4E4E7', color: '#18181B' }} placeholder="Here's your content:" />
                          </div>
                        </div>
                        <DmPreview title={sm.title || "Thanks for following! 🎉"} subtitle={sm.subtitle || "Here's your content:"} buttonLabel="" />
                      </div>
                    )}
                  </SectionBox>

                  {/* Bypass rules */}
                  <SectionBox title="Bypass rules">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm" style={{ color: '#18181B' }}>Skip for verified followers</p>
                          <p className="text-xs" style={{ color: '#A1A1AA' }}>If already confirmed in a previous interaction</p>
                        </div>
                        <TabToggle enabled={fg.skipForVerifiedFollowers !== false} onChange={(v) => uFg('skipForVerifiedFollowers', v)} />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm" style={{ color: '#18181B' }}>Skip for returning users</p>
                          <p className="text-xs" style={{ color: '#A1A1AA' }}>If they&apos;ve passed the gate before</p>
                        </div>
                        <TabToggle enabled={fg.skipForReturningUsers} onChange={(v) => uFg('skipForReturningUsers', v)} />
                      </div>
                    </div>
                  </SectionBox>
                </div>
                <SaveButton onClick={handlePublish} loading={publishing} />
              </div>
            );
          })()}

          {/* ── Comment Reply ─────────────────────────────────────────── */}
          {activeTab === "reply" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold" style={{ color: '#18181B' }}>Comment Reply</h2>
                  <p className="text-sm" style={{ color: '#71717A' }}>Post a public reply to comments that trigger the Comment to DM automation</p>
                </div>
                <TabToggle enabled={config.replyEnabled} onChange={(v) => update('replyEnabled', v)} />
              </div>
              <div style={{ opacity: config.replyEnabled ? 1 : 0.5 }}>
                <SectionBox title="Reply message">
                  <div className="space-y-4">
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="text-xs font-medium" style={{ color: '#71717A' }}>Public reply text</label>
                        <CharCount value={config.replyMessages?.[0]} max={300} />
                      </div>
                      <textarea value={config.replyMessages?.[0] || ""} onChange={(e) => update('replyMessages', [e.target.value])} rows={2}
                        className="w-full rounded-lg px-4 py-2.5 text-sm outline-none resize-none"
                        style={{ border: '1px solid #E4E4E7', color: '#18181B' }} placeholder="Check your DMs! 📩" maxLength={300} />
                      <p className="text-xs mt-1" style={{ color: '#A1A1AA' }}>This appears publicly under their comment before the DM is sent.</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <span className="text-xs" style={{ color: '#A1A1AA' }}>Quick insert:</span>
                      {['{username}', '👋', '🙏', '❤️', '🙌', '📩'].map((v) => (
                        <button key={v} onClick={() => update('replyMessages', [(config.replyMessages?.[0] || '') + (v === '{username}' ? ' @{{username}}' : ` ${v}`)])}
                          className="text-xs px-2 py-1 rounded-md transition-colors"
                          style={{ backgroundColor: '#F4F4F5', color: '#52525B' }}
                          onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#EEF2FF'; }}
                          onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#F4F4F5'; }}>
                          {v}
                        </button>
                      ))}
                    </div>
                  </div>
                </SectionBox>
                <SectionBox title="Rate limiting">
                  <div className="flex items-center gap-3">
                    <div className="flex-1 h-1.5 rounded-full" style={{ backgroundColor: '#F0F0F0' }}>
                      <div className="h-full rounded-full" style={{ backgroundColor: '#4F46E5', width: '10%' }} />
                    </div>
                    <span className="text-xs" style={{ color: '#A1A1AA' }}>~55/hr Instagram limit</span>
                  </div>
                  <p className="text-xs mt-2" style={{ color: '#A1A1AA' }}>Instagram allows approximately 55 comment replies per hour. Engagr automatically throttles when approaching the limit.</p>
                </SectionBox>
              </div>
              <SaveButton onClick={handlePublish} loading={publishing} />
            </div>
          )}

          {/* ── Comment Manager ─────────────────────────────────────── */}
          {activeTab === "moderation" && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-semibold" style={{ color: '#18181B' }}>Comment Manager</h2>
                <p className="text-sm" style={{ color: '#71717A' }}>View, hide, or delete comments on your posts</p>
              </div>
              <CommentManager media={instaData.media || []} accountId={instaData.accountId} />
            </div>
          )}

          {/* ── Smart Reel Rules ───────────────────────────────────────── */}
          {activeTab === "rules" && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-semibold" style={{ color: '#18181B' }}>Smart Reel Rules</h2>
                <p className="text-sm" style={{ color: '#71717A' }}>Create category-based rules to send different replies based on reel content</p>
              </div>
              {!config.reelShareEnabled && (
                <div className="px-4 py-3 rounded-lg text-sm" style={{ backgroundColor: '#FFFBEB', color: '#92400E' }}>
                  Enable Reel Share Replies first to use smart rules.
                </div>
              )}
              <div style={{ opacity: config.reelShareEnabled ? 1 : 0.5 }}>
                <ReelCategoryEditor categories={reelCategories} defaultReply={reelDefaultReply}
                  onChange={setReelCategories} onDefaultReplyChange={setReelDefaultReply} />
              </div>
              <SaveButton onClick={handleSaveCategories} loading={savingCategories} label="Save rules" />
            </div>
          )}

          {/* ── AI Detection (real or beta) ────────────────────────────── */}
          {activeTab === "ai" && aiEnabled && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold" style={{ color: '#18181B' }}>AI Product Detection</h2>
                  <p className="text-sm" style={{ color: '#71717A' }}>AI analyzes shared reels to identify products and send purchase links</p>
                </div>
                <TabToggle enabled={aiConfig.enabled} onChange={(v) => setAiConfig(prev => ({ ...prev, enabled: v }))} />
              </div>
              <div style={{ opacity: aiConfig.enabled ? 1 : 0.5 }}>
                <SectionBox title="Settings">
                  <div className="space-y-4">
                    <div>
                      <label className="text-xs font-medium mb-1.5 block" style={{ color: '#71717A' }}>Reply template</label>
                      <textarea value={aiConfig.replyTemplate} onChange={(e) => setAiConfig(prev => ({ ...prev, replyTemplate: e.target.value }))} rows={2}
                        className="w-full rounded-lg px-4 py-2.5 text-sm outline-none resize-none"
                        style={{ border: '1px solid #E4E4E7', color: '#18181B' }} />
                      <p className="text-xs mt-1" style={{ color: '#A1A1AA' }}>
                        Variables: <span style={{ color: '#4F46E5' }}>{'{{productName}}'}</span>, <span style={{ color: '#4F46E5' }}>{'{{productBrand}}'}</span>
                      </p>
                    </div>
                    <div>
                      <label className="text-xs font-medium mb-1.5 block" style={{ color: '#71717A' }}>Button label</label>
                      <input type="text" value={aiConfig.linkButtonLabel} onChange={(e) => setAiConfig(prev => ({ ...prev, linkButtonLabel: e.target.value }))}
                        className="w-full rounded-lg px-4 py-2.5 text-sm outline-none"
                        style={{ border: '1px solid #E4E4E7', color: '#18181B' }} maxLength={20} />
                    </div>
                    <div className="flex items-center justify-between py-2">
                      <div>
                        <p className="text-sm font-medium" style={{ color: '#18181B' }}>Fallback to default reply</p>
                        <p className="text-xs" style={{ color: '#A1A1AA' }}>If AI finds no product, send the default reel reply</p>
                      </div>
                      <TabToggle enabled={aiConfig.fallbackToDefault} onChange={(v) => setAiConfig(prev => ({ ...prev, fallbackToDefault: v }))} />
                    </div>
                  </div>
                </SectionBox>
              </div>
              <SaveButton onClick={handleSaveAi} loading={savingAi} label="Save AI settings" />
            </div>
          )}

          {activeTab === "ai-beta" && !aiEnabled && (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4" style={{ backgroundColor: '#F5F3FF' }}>
                <Brain size={24} style={{ color: '#7C3AED' }} />
              </div>
              <h3 className="text-lg font-semibold mb-1" style={{ color: '#18181B' }}>AI Product Detection</h3>
              <p className="text-sm max-w-sm mb-4" style={{ color: '#71717A' }}>AI analyzes shared reels to identify products and send purchase links automatically.</p>
              <span className="text-[10px] font-semibold px-2.5 py-1 rounded-full" style={{ backgroundColor: '#F5F3FF', color: '#7C3AED' }}>Coming Q2 2026</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
