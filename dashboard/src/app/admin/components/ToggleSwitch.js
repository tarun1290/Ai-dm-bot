"use client";

import { Loader2 } from "lucide-react";

/**
 * @param {{ enabled: boolean, disabled?: boolean, onChange?: (v: boolean) => void, loading?: boolean }} props
 */
export default function ToggleSwitch({ enabled, disabled = false, onChange, loading = false }) {
  return (
    <button
      role="switch"
      aria-checked={enabled}
      disabled={disabled || loading}
      onClick={() => onChange?.(!enabled)}
      className="relative inline-flex items-center rounded-full transition-colors duration-200 focus:outline-none"
      style={{
        width: 44,
        height: 24,
        background: disabled ? "#E2E8F0" : enabled ? "#059669" : "#CBD5E1",
        opacity: disabled ? 0.5 : 1,
        cursor: disabled ? "not-allowed" : "pointer",
      }}
    >
      <span
        className="inline-block rounded-full bg-white shadow-sm transition-transform duration-200 flex items-center justify-center"
        style={{
          width: 18,
          height: 18,
          transform: enabled ? "translateX(23px)" : "translateX(3px)",
        }}
      >
        {loading && <Loader2 size={10} className="animate-spin" style={{ color: "#94A3B8" }} />}
      </span>
    </button>
  );
}
