"use client";

import React, { useState } from "react";
import {
  Sparkles, Link2, ShoppingBag, Brain, BookOpen, MessageCircle,
  BarChart3, Code, CreditCard, CheckCircle2, ArrowLeft, Mail, Rocket,
} from "lucide-react";
import { toast } from "sonner";
import { BETA_FEATURES } from "@/lib/betaFeatures";

const ICON_MAP = {
  Sparkles, Link2, ShoppingBag, Brain, BookOpen, MessageCircle,
  BarChart3, Code, CreditCard,
};

const STATUS_COLORS = {
  teal: { bg: "var(--success-light)", color: "var(--success)", border: "var(--success)" },
  indigo: { bg: "var(--primary-light)", color: "var(--primary)", border: "var(--primary-medium)" },
  gray: { bg: "var(--surface-alt)", color: "var(--text-muted)", border: "var(--border)" },
};

export default function ComingSoonPage({ feature }) {
  const [email, setEmail] = useState("");
  const config = BETA_FEATURES[feature];

  if (!config) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <Rocket size={40} style={{ color: "var(--text-placeholder)" }} className="mb-4" />
        <h2 className="text-2xl font-black mb-2" style={{ color: "var(--text-primary)" }}>Feature not found</h2>
        <p className="text-sm" style={{ color: "var(--text-muted)" }}>This feature doesn&apos;t exist yet.</p>
      </div>
    );
  }

  const Icon = ICON_MAP[config.icon] || Sparkles;
  const statusStyle = STATUS_COLORS[config.statusColor] || STATUS_COLORS.teal;

  const handleNotify = () => {
    if (email.trim()) {
      toast.success("We'll notify you when this launches!");
      setEmail("");
    } else {
      toast.success("We'll notify you when this launches!");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-6 max-w-2xl mx-auto">

      {/* Gradient accent band */}
      <div className="absolute top-0 left-0 right-0 h-64 pointer-events-none"
        style={{
          background: "radial-gradient(ellipse at 50% 0%, var(--primary-light) 0%, transparent 70%)",
          opacity: 0.5,
        }}
      />

      {/* Pulsing icon */}
      <div className="relative z-10 mb-8">
        <div
          className="w-20 h-20 rounded-3xl flex items-center justify-center"
          style={{
            backgroundColor: statusStyle.bg,
            border: `1px solid ${statusStyle.border}`,
            animation: "pulse-glow 2.5s ease-in-out infinite",
          }}
        >
          <Icon size={36} style={{ color: statusStyle.color }} />
        </div>
      </div>

      {/* Status badge */}
      <div className="relative z-10 mb-4">
        <span
          className="inline-flex items-center px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider"
          style={{ backgroundColor: statusStyle.bg, color: statusStyle.color, border: `1px solid ${statusStyle.border}` }}
        >
          {config.status}
        </span>
      </div>

      {/* Heading */}
      <h1
        className="relative z-10 text-3xl md:text-4xl font-black tracking-tight mb-3"
        style={{ color: "var(--text-primary)" }}
      >
        {config.headline}
      </h1>

      {/* Description */}
      <p
        className="relative z-10 text-[15px] font-medium leading-relaxed mb-8 max-w-lg"
        style={{ color: "var(--text-muted)" }}
      >
        {config.description}
      </p>

      {/* Capabilities */}
      <div className="relative z-10 w-full max-w-md mb-10">
        <div
          className="rounded-2xl p-6 text-left space-y-3"
          style={{ backgroundColor: "var(--card)", border: "1px solid var(--border)" }}
        >
          {config.capabilities.map((cap, i) => (
            <div key={i} className="flex items-start gap-3">
              <CheckCircle2
                size={16}
                className="flex-shrink-0 mt-0.5"
                style={{ color: "var(--success)" }}
              />
              <span className="text-[13px] font-medium" style={{ color: "var(--text-secondary)" }}>
                {cap}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Get notified CTA */}
      <div className="relative z-10 w-full max-w-sm mb-6">
        <p className="text-[11px] font-bold uppercase tracking-widest mb-3" style={{ color: "var(--text-placeholder)" }}>
          Get notified when it launches
        </p>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "var(--text-placeholder)" }} />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@email.com"
              className="w-full rounded-xl pl-9 pr-4 py-3 text-sm font-medium outline-none transition-all"
              style={{
                backgroundColor: "var(--input-bg)",
                border: "1px solid var(--input-border)",
                color: "var(--input-text)",
              }}
              onFocus={(e) => { e.currentTarget.style.boxShadow = "0 0 0 3px var(--input-focus-ring)"; }}
              onBlur={(e) => { e.currentTarget.style.boxShadow = "none"; }}
              onKeyDown={(e) => e.key === "Enter" && handleNotify()}
            />
          </div>
          <button
            onClick={handleNotify}
            className="px-5 py-3 rounded-xl font-bold text-sm text-white transition-all"
            style={{ background: "linear-gradient(to right, var(--primary), var(--primary-dark))" }}
          >
            Notify me
          </button>
        </div>
      </div>

      {/* Back link */}
      <button
        onClick={() => window.history.back()}
        className="relative z-10 flex items-center gap-2 text-[13px] font-bold mb-8 transition-all hover:opacity-70"
        style={{ color: "var(--primary)" }}
      >
        <ArrowLeft size={14} />
        Back to dashboard
      </button>

      {/* Footer */}
      <p className="relative z-10 text-[11px] max-w-xs" style={{ color: "var(--text-placeholder)" }}>
        Have feedback or a feature request?{" "}
        <a
          href="mailto:tarun@engagr.io"
          className="font-bold underline"
          style={{ color: "var(--primary)" }}
        >
          We&apos;d love to hear from you.
        </a>
      </p>

      {/* CSS animation */}
      <style jsx>{`
        @keyframes pulse-glow {
          0%, 100% { transform: scale(1); opacity: 0.85; }
          50% { transform: scale(1.06); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
