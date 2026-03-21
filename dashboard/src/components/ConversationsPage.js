"use client";

import React, { useState, useEffect } from "react";
import { MessageSquare, AlertTriangle, Loader2, Search, X, ChevronRight, Brain, ShoppingBag } from "lucide-react";
import { cn } from "@/lib/utils";

// Server actions — we'll import from smart-actions
import { getSmartReplyStats } from "@/app/dashboard/smart-actions";

const STATUS_CONFIG = {
  active: { label: "Active", bg: "var(--success-light)", color: "var(--success)" },
  handed_off: { label: "Needs Attention", bg: "var(--warning-light)", color: "var(--warning)" },
  closed: { label: "Closed", bg: "var(--surface-alt)", color: "var(--text-muted)" },
};

const INTENT_COLORS = {
  product_inquiry: "var(--primary)", recommendation: "var(--info)", support: "var(--error)",
  order_status: "var(--warning)", general_question: "var(--accent)", greeting: "var(--success)",
};

function StatCard({ label, value, icon: Icon, color }) {
  return (
    <div className="p-6 rounded-[24px]" style={{ backgroundColor: "var(--card)", border: "1px solid var(--border)" }}>
      <div className="flex items-center gap-2 mb-3">
        <Icon size={14} style={{ color: color || "var(--text-placeholder)" }} />
        <p className="text-[11px] font-bold uppercase tracking-widest" style={{ color: "var(--text-placeholder)" }}>{label}</p>
      </div>
      <h3 className="text-3xl font-black" style={{ color: "var(--text-primary)" }}>{value}</h3>
    </div>
  );
}

export default function ConversationsPage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getSmartReplyStats()
      .then((res) => { if (res.success) setStats(res); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 size={24} className="animate-spin" style={{ color: "var(--primary)" }} />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-black tracking-tight" style={{ color: "var(--text-primary)" }}>Conversations</h1>
        <p className="text-sm font-medium mt-1" style={{ color: "var(--text-muted)" }}>AI-powered conversation threads with your audience</p>
      </div>

      {stats && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard icon={MessageSquare} label="Active" value={stats.activeThreads} color="var(--success)" />
          <StatCard icon={AlertTriangle} label="Needs Attention" value={stats.totalHandoffs} color="var(--warning)" />
          <StatCard icon={Brain} label="Total Replies" value={stats.totalReplies} color="var(--primary)" />
          <StatCard icon={MessageSquare} label="This Month" value={stats.repliesThisMonth} color="var(--info)" />
        </div>
      )}

      {/* Intent breakdown */}
      {stats?.intentBreakdown?.length > 0 && (
        <div className="rounded-[24px] p-6" style={{ backgroundColor: "var(--card)", border: "1px solid var(--border)" }}>
          <h3 className="text-sm font-black mb-4" style={{ color: "var(--text-primary)" }}>Intent Breakdown</h3>
          <div className="flex flex-wrap gap-3">
            {stats.intentBreakdown.map((item) => (
              <div key={item._id} className="flex items-center gap-2 px-4 py-2 rounded-xl"
                style={{ backgroundColor: "var(--surface-alt)" }}>
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: INTENT_COLORS[item._id] || "var(--text-muted)" }} />
                <span className="text-[12px] font-bold" style={{ color: "var(--text-primary)" }}>{item._id || "unknown"}</span>
                <span className="text-[12px] font-black" style={{ color: "var(--primary)" }}>{item.count}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty state */}
      {!stats?.totalReplies && (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <MessageSquare size={40} style={{ color: "var(--text-placeholder)" }} className="mb-4" />
          <h3 className="text-lg font-black mb-2" style={{ color: "var(--text-primary)" }}>No conversations yet</h3>
          <p className="text-sm max-w-xs" style={{ color: "var(--text-muted)" }}>
            Conversations will appear here when the AI starts replying to DMs. Make sure smart replies are enabled on the Automation page.
          </p>
        </div>
      )}
    </div>
  );
}
