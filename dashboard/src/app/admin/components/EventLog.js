"use client";

import { useState } from "react";
import { Loader2, ChevronLeft, ChevronRight } from "lucide-react";

const TYPE_COLORS = {
  comment: { bg: "#EFF6FF", color: "#2563EB", label: "Comment" },
  dm: { bg: "#ECFDF5", color: "#059669", label: "DM" },
  reel_share: { bg: "#F5F3FF", color: "#7C3AED", label: "Reel" },
  mention: { bg: "#FDF2F8", color: "#DB2777", label: "Mention" },
  reaction: { bg: "#FFF1F2", color: "#E11D48", label: "Reaction" },
  postback: { bg: "#F0F9FF", color: "#0284C7", label: "Postback" },
  smart_reply: { bg: "#F0FDFA", color: "#0D9488", label: "Smart Reply" },
  ai_detection: { bg: "#F5F3FF", color: "#6D28D9", label: "AI Detection" },
  error: { bg: "#FEF2F2", color: "#DC2626", label: "Error" },
};

const STATUS_COLORS = {
  sent: { bg: "#ECFDF5", color: "#059669" },
  failed: { bg: "#FEF2F2", color: "#DC2626" },
  skipped: { bg: "#F8FAFC", color: "#94A3B8" },
  quota_exceeded: { bg: "#FEF2F2", color: "#DC2626" },
};

function timeAgo(date) {
  const diff = (Date.now() - new Date(date)) / 1000;
  if (diff < 60) return `${Math.floor(diff)}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

/**
 * @param {{ events: any[], loading?: boolean, emptyMessage?: string }} props
 */
export default function EventLog({ events = [], loading = false, emptyMessage = "No events" }) {
  const [page, setPage] = useState(1);
  const pageSize = 20;
  const totalPages = Math.ceil(events.length / pageSize);
  const paginated = events.slice((page - 1) * pageSize, page * pageSize);

  if (loading) {
    return (
      <div className="rounded-lg p-12 flex items-center justify-center"
        style={{ background: "#FFFFFF", border: "1px solid #E2E8F0" }}>
        <Loader2 size={20} className="animate-spin" style={{ color: "#94A3B8" }} />
      </div>
    );
  }

  return (
    <div className="rounded-lg overflow-hidden"
      style={{ background: "#FFFFFF", border: "1px solid #E2E8F0", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
      <div className="px-5 py-3 border-b" style={{ borderColor: "#F1F5F9" }}>
        <h3 className="text-sm font-semibold" style={{ color: "#0F172A" }}>Activity log</h3>
      </div>

      {paginated.length === 0 ? (
        <div className="px-5 py-12 text-center text-sm" style={{ color: "#94A3B8" }}>{emptyMessage}</div>
      ) : (
        <div className="divide-y" style={{ borderColor: "#F1F5F9" }}>
          {paginated.map((event, i) => {
            const typeStyle = TYPE_COLORS[event.type] || TYPE_COLORS.dm;
            const statusStyle = STATUS_COLORS[event.reply?.status] || STATUS_COLORS.skipped;
            return (
              <div key={event._id || i} className="px-5 py-3 flex items-center gap-4 text-sm transition-colors"
                onMouseEnter={(e) => { e.currentTarget.style.background = "#FAFAFA"; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}>
                <span className="text-xs w-16 flex-shrink-0" style={{ color: "#94A3B8" }}>{timeAgo(event.createdAt)}</span>
                <span className="text-xs font-medium truncate w-24 flex-shrink-0" style={{ color: "#475569" }}>
                  @{event.from?.username || "unknown"}
                </span>
                <span className="text-[10px] font-medium px-2 py-0.5 rounded-full flex-shrink-0"
                  style={{ background: typeStyle.bg, color: typeStyle.color }}>{typeStyle.label}</span>
                <span className="flex-1 truncate text-xs" style={{ color: "#64748B" }}>
                  {event.content?.text || event.reply?.privateDM || event.content?.attachmentType || "—"}
                </span>
                {event.reply?.status && (
                  <span className="text-[10px] font-medium px-2 py-0.5 rounded-full flex-shrink-0"
                    style={{ background: statusStyle.bg, color: statusStyle.color }}>
                    {event.reply.status}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-between px-5 py-3 border-t" style={{ borderColor: "#F1F5F9" }}>
          <span className="text-xs" style={{ color: "#94A3B8" }}>{events.length} events</span>
          <div className="flex gap-1">
            <button onClick={() => setPage(Math.max(1, page - 1))} disabled={page === 1}
              className="p-1.5 rounded disabled:opacity-30" style={{ color: "#64748B" }}><ChevronLeft size={14} /></button>
            <button onClick={() => setPage(Math.min(totalPages, page + 1))} disabled={page === totalPages}
              className="p-1.5 rounded disabled:opacity-30" style={{ color: "#64748B" }}><ChevronRight size={14} /></button>
          </div>
        </div>
      )}
    </div>
  );
}
