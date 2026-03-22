"use client";

import { X, Loader2 } from "lucide-react";

const COLOR_MAP = {
  danger: { bg: "#DC2626", hover: "#B91C1C" },
  success: { bg: "#059669", hover: "#047857" },
  primary: { bg: "#4338CA", hover: "#3730A3" },
};

/**
 * @param {{ isOpen: boolean, onClose: () => void, onConfirm: () => void, title: string, description?: string, confirmLabel?: string, confirmColor?: 'danger'|'success'|'primary', children?: React.ReactNode, loading?: boolean }} props
 */
export default function ConfirmModal({ isOpen, onClose, onConfirm, title, description, confirmLabel = "Confirm", confirmColor = "primary", children, loading = false }) {
  if (!isOpen) return null;

  const colors = COLOR_MAP[confirmColor] || COLOR_MAP.primary;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />

      {/* Modal */}
      <div className="relative w-full max-w-md rounded-xl p-6 shadow-xl" style={{ background: "#FFFFFF" }}>
        <button className="absolute top-4 right-4 p-1 rounded hover:bg-slate-100" onClick={onClose}>
          <X size={16} style={{ color: "#94A3B8" }} />
        </button>

        <h3 className="text-lg font-semibold mb-1" style={{ color: "#0F172A" }}>{title}</h3>
        {description && <p className="text-sm mb-4" style={{ color: "#64748B" }}>{description}</p>}

        {children && <div className="mb-4">{children}</div>}

        <div className="flex justify-end gap-3 mt-6">
          <button onClick={onClose} disabled={loading}
            className="px-4 py-2 text-sm font-medium rounded-md transition-colors"
            style={{ border: "1px solid #E2E8F0", color: "#475569" }}
            onMouseEnter={(e) => { e.currentTarget.style.background = "#F8FAFC"; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}>
            Cancel
          </button>
          <button onClick={onConfirm} disabled={loading}
            className="px-4 py-2 text-sm font-medium rounded-md text-white transition-colors flex items-center gap-2"
            style={{ background: colors.bg }}
            onMouseEnter={(e) => { e.currentTarget.style.background = colors.hover; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = colors.bg; }}>
            {loading && <Loader2 size={14} className="animate-spin" />}
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
