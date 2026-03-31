"use client";

import { Sparkles, Check } from "lucide-react";

export default function SuggestionChips({
  suggestions,
  onSelect,
  activeValue,
  existingValues,
  label = "Quick templates",
  mode = "replace",
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-1.5">
        <Sparkles size={12} style={{ color: "var(--text-placeholder)" }} />
        <span
          className="text-[10px] font-black uppercase tracking-widest"
          style={{ color: "var(--text-placeholder)" }}
        >
          {label}
        </span>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {suggestions.map((text) => {
          const isActive = mode === "replace" && activeValue === text;
          const alreadyExists =
            mode === "append" && existingValues?.some((v) => v === text);

          return (
            <button
              key={text}
              type="button"
              onClick={() => {
                if (alreadyExists) return;
                onSelect(text);
              }}
              disabled={alreadyExists}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-[12px] font-medium transition-all"
              style={
                isActive
                  ? {
                      backgroundColor: "var(--primary-light)",
                      borderWidth: "1px",
                      borderStyle: "solid",
                      borderColor: "var(--primary-medium)",
                      color: "var(--primary)",
                    }
                  : alreadyExists
                  ? {
                      backgroundColor: "var(--surface-alt)",
                      borderWidth: "1px",
                      borderStyle: "solid",
                      borderColor: "var(--border)",
                      color: "var(--text-placeholder)",
                      cursor: "default",
                      opacity: 0.7,
                    }
                  : {
                      backgroundColor: "var(--card)",
                      borderWidth: "1px",
                      borderStyle: "solid",
                      borderColor: "var(--border)",
                      color: "var(--text-secondary)",
                    }
              }
              onMouseEnter={(e) => {
                if (!isActive && !alreadyExists) {
                  e.currentTarget.style.backgroundColor = "var(--primary-light)";
                  e.currentTarget.style.borderColor = "var(--primary-medium)";
                  e.currentTarget.style.color = "var(--primary)";
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive && !alreadyExists) {
                  e.currentTarget.style.backgroundColor = "var(--card)";
                  e.currentTarget.style.borderColor = "var(--border)";
                  e.currentTarget.style.color = "var(--text-secondary)";
                }
              }}
            >
              {alreadyExists && <Check size={11} />}
              <span className="truncate max-w-[260px]">{text}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
