"use client";

import Link from "next/link";
import { useState, useEffect, useRef, useCallback } from "react";
import {
  Menu, X, ArrowRight, MessageCircle, Send, UserCheck, Zap,
  BarChart3, Target, Smartphone, Check, Minus, MessageSquare,
  Lock, Film, ChevronRight, Sun, Moon,
} from "lucide-react";
import { useTheme } from "./ThemeProvider";

/* ═══════════════════════════════════════════════════════════════════════════════
   DATA
   ═══════════════════════════════════════════════════════════════════════════════ */

const NAV_LINKS = [
  { label: "How it works", href: "#how-it-works" },
  { label: "Features", href: "#features" },
  { label: "Pricing", href: "#pricing" },
];

const STATS = [
  { value: "10x", label: "Faster DM responses" },
  { value: "3s", label: "Avg. reply time" },
  { value: "85%", label: "DM open rate" },
  { value: "0", label: "Manual work needed" },
];

const STEPS = [
  {
    num: "01",
    title: "Someone comments",
    desc: "A follower drops a comment with a trigger keyword like \"link\" or \"price\" on your post or reel.",
    icon: MessageCircle,
  },
  {
    num: "02",
    title: "Public reply fires",
    desc: "Engagr instantly posts a public reply like \"Check your DMs! \u{1F4E9}\" \u2014 boosting engagement visibility.",
    icon: Send,
  },
  {
    num: "03",
    title: "DM lands in their inbox",
    desc: "A private DM arrives with your greeting message and a confirmation button. No manual effort needed.",
    icon: MessageSquare,
  },
  {
    num: "04",
    title: "Content delivered",
    desc: "They tap \"Yes\", Engagr optionally verifies they follow you, then delivers your link or content.",
    icon: Zap,
  },
];

const FEATURES = [
  {
    icon: MessageCircle,
    title: "Comment-to-DM flows",
    desc: "Multi-step DM sequences triggered by comments. Public reply + greeting + confirmation + content delivery.",
    color: "var(--info)",
    bg: "var(--info-light)",
  },
  {
    icon: Lock,
    title: "Follower verification gate",
    desc: "Restrict content delivery to followers only. Non-followers get a follow prompt with re-verification.",
    color: "var(--success)",
    bg: "var(--success-light)",
  },
  {
    icon: Film,
    title: "Reel share detection",
    desc: "When someone shares your reel in a DM, auto-reply with a rich card, thumbnail, and CTA button.",
    color: "var(--primary)",
    bg: "var(--primary-light)",
  },
  {
    icon: BarChart3,
    title: "Real-time dashboard",
    desc: "Track DMs sent, comments handled, contacts gained, and engagement trends \u2014 all in one place.",
    color: "var(--accent)",
    bg: "var(--accent-light)",
  },
  {
    icon: Target,
    title: "Smart keyword triggers",
    desc: "Trigger on specific keywords, any comment, or target a specific post or reel. Full control.",
    color: "var(--warning)",
    bg: "var(--warning-light)",
  },
  {
    icon: Smartphone,
    title: "Live phone preview",
    desc: "See exactly how your DM flow looks in an iPhone mockup as you build it. What you see is what they get.",
    color: "var(--error)",
    bg: "var(--error-light)",
  },
];

const DEMO_CARDS = [
  {
    label: "Instagram Comment",
    dot: "var(--success)",
    username: "@sarah_creates",
    comment: "OMG I need this! Where\u2019s the link? \u{1F60D}",
    botReply: "Check your DMs! \u{1F4E9}",
  },
  {
    label: "Private DM",
    dot: "var(--primary)",
    greeting: "Hey Sarah! \u{1F44B} Thanks for your interest.",
    question: "Want me to send you the exclusive link?",
    button: "Yes, send it! \u{1F64C}",
  },
  {
    label: "Content Delivered",
    dot: "var(--accent)",
    message: "Here\u2019s your exclusive access. This link expires in 24 hours \u{1F525}",
    button: "Get Access \u2192",
  },
];

const PLANS = [
  {
    id: "silver",
    name: "Silver",
    price: 499,
    period: "month",
    tagline: "Perfect for creators just getting started.",
    features: [
      { text: "1 Instagram account", included: true },
      { text: "500 automated DMs/month", included: true },
      { text: "Comment-to-DM automation", included: true },
      { text: "Smart reply presets", included: true },
      { text: "Reel share detection", included: true },
      { text: "Follower verification gate", included: false },
      { text: "Mentions tracker", included: false },
      { text: "Contact management", included: false },
    ],
    cta: "Get Started",
    featured: false,
  },
  {
    id: "gold",
    name: "Gold",
    price: 999,
    period: "month",
    tagline: "For serious creators who want the full toolkit.",
    features: [
      { text: "1 Instagram account", included: true },
      { text: "Unlimited automated DMs", included: true },
      { text: "Comment-to-DM automation", included: true },
      { text: "Smart reply presets", included: true },
      { text: "Reel share detection", included: true },
      { text: "Follower verification gate", included: true },
      { text: "Mentions tracker", included: true },
      { text: "Contact management & activity logs", included: true },
    ],
    cta: "Get Started",
    featured: true,
  },
  {
    id: "platinum",
    name: "Platinum",
    price: 1499,
    period: "month",
    tagline: "For agencies and brands managing multiple accounts.",
    features: [
      { text: "Multiple Instagram accounts", included: true },
      { text: "Unlimited automated DMs", included: true },
      { text: "Everything in Gold", included: true },
      { text: "Custom API access", included: true },
      { text: "White-label branding", included: true },
      { text: "Priority support", included: true },
      { text: "Advanced analytics", included: true },
      { text: "Dedicated onboarding", included: true },
    ],
    cta: "Contact Sales",
    featured: false,
  },
];

const FOOTER_COLS = [
  {
    title: "Product",
    links: [
      { label: "Features", href: "#features" },
      { label: "Pricing", href: "#pricing" },
      { label: "How it works", href: "#how-it-works" },
    ],
  },
  {
    title: "Account",
    links: [
      { label: "Sign In", href: "/sign-in" },
      { label: "Sign Up", href: "/sign-up" },
      { label: "Dashboard", href: "/dashboard" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Privacy Policy", href: "#" },
      { label: "Terms of Service", href: "#" },
      { label: "Support", href: "#" },
    ],
  },
];

/* ═══════════════════════════════════════════════════════════════════════════════
   SCROLL REVEAL HOOK
   ═══════════════════════════════════════════════════════════════════════════════ */

function useScrollReveal() {
  const ref = useRef(null);

  useEffect(() => {
    const root = ref.current;
    if (!root) return;
    const els = root.querySelectorAll(".reveal");
    if (!els.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );

    els.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return ref;
}

/* ═══════════════════════════════════════════════════════════════════════════════
   COMPONENT
   ═══════════════════════════════════════════════════════════════════════════════ */

export default function LandingPage() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const rootRef = useScrollReveal();

  // Close mobile menu on anchor click
  const handleNavClick = useCallback(() => setMenuOpen(false), []);

  return (
    <div
      ref={rootRef}
      style={{ fontFamily: "var(--font-sans), 'DM Sans', sans-serif", backgroundColor: "var(--bg)", color: "var(--text-primary)" }}
    >
      {/* ── NAVBAR ───────────────────────────────────────────────────────── */}
      <nav
        className="fixed top-0 left-0 right-0 z-50 glass"
        style={{ borderBottom: "1px solid var(--glass-border)" }}
      >
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          {/* Logo */}
          <a href="#" className="flex items-center gap-0.5 select-none">
            <span
              className="text-2xl tracking-tight"
              style={{ fontFamily: "var(--font-serif), 'Instrument Serif', serif", color: "var(--text-primary)" }}
            >
              engag
            </span>
            <span
              className="text-2xl tracking-tight"
              style={{ fontFamily: "var(--font-serif), 'Instrument Serif', serif", color: "var(--accent)" }}
            >
              r
            </span>
          </a>

          {/* Desktop links */}
          <div className="hidden md:flex items-center gap-8">
            {NAV_LINKS.map((l) => (
              <a
                key={l.href}
                href={l.href}
                className="text-sm font-medium transition-colors"
                style={{ color: "var(--text-muted)" }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "var(--text-primary)")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-muted)")}
              >
                {l.label}
              </a>
            ))}
          </div>

          {/* Desktop actions */}
          <div className="hidden md:flex items-center gap-3">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg transition-colors"
              style={{ color: "var(--text-muted)" }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "var(--primary)")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-muted)")}
            >
              {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
            </button>
            <Link
              href="/sign-in"
              className="text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
              style={{ color: "var(--text-muted)" }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "var(--text-primary)")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-muted)")}
            >
              Sign In
            </Link>
            <Link
              href="/sign-up"
              className="text-sm font-bold px-5 py-2.5 rounded-xl text-white transition-all hover:opacity-90"
              style={{ backgroundColor: "var(--primary)" }}
            >
              Get Started
            </Link>
          </div>

          {/* Mobile hamburger */}
          <button
            className="md:hidden p-2"
            onClick={() => setMenuOpen(!menuOpen)}
            style={{ color: "var(--text-primary)" }}
          >
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div
            className="md:hidden px-6 pb-6 pt-2 space-y-4 glass"
            style={{ borderTop: "1px solid var(--glass-border)" }}
          >
            {NAV_LINKS.map((l) => (
              <a
                key={l.href}
                href={l.href}
                onClick={handleNavClick}
                className="block text-sm font-medium py-2"
                style={{ color: "var(--text-secondary)" }}
              >
                {l.label}
              </a>
            ))}
            <div className="flex items-center gap-3 pt-2">
              <button onClick={toggleTheme} className="p-2 rounded-lg" style={{ color: "var(--text-muted)" }}>
                {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
              </button>
              <Link href="/sign-in" onClick={handleNavClick} className="text-sm font-semibold" style={{ color: "var(--text-muted)" }}>
                Sign In
              </Link>
              <Link
                href="/sign-up"
                onClick={handleNavClick}
                className="text-sm font-bold px-5 py-2.5 rounded-xl text-white"
                style={{ backgroundColor: "var(--primary)" }}
              >
                Get Started
              </Link>
            </div>
          </div>
        )}
      </nav>

      {/* ── HERO ─────────────────────────────────────────────────────────── */}
      <section className="relative pt-32 pb-24 md:pt-44 md:pb-32 px-6 overflow-hidden">
        {/* Radial glow */}
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[600px] rounded-full blur-[120px] opacity-30 pointer-events-none"
          style={{ background: "radial-gradient(circle, var(--primary-glow), transparent 70%)" }}
        />

        <div className="max-w-4xl mx-auto text-center relative">
          {/* Badge */}
          <div
            className="reveal inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-8"
            style={{ backgroundColor: "var(--surface-alt)", border: "1px solid var(--border)" }}
          >
            <span className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: "var(--success)" }} />
            <span className="text-xs font-semibold" style={{ color: "var(--text-muted)" }}>
              Now in beta &mdash; join the waitlist
            </span>
          </div>

          {/* Headline */}
          <h1
            className="reveal reveal-delay-1 text-4xl sm:text-5xl md:text-6xl lg:text-7xl leading-[1.08] tracking-tight mb-6"
            style={{ fontFamily: "var(--font-serif), 'Instrument Serif', serif", color: "var(--text-primary)" }}
          >
            Turn Instagram comments
            <br />
            into{" "}
            <em style={{ color: "var(--accent)", fontStyle: "italic" }}>conversations</em>
          </h1>

          {/* Subheadline */}
          <p
            className="reveal reveal-delay-2 text-base sm:text-lg md:text-xl max-w-2xl mx-auto leading-relaxed mb-10"
            style={{ color: "var(--text-muted)" }}
          >
            Someone comments on your post. Engagr replies publicly, slides into their DMs,
            verifies they follow you, and delivers your content &mdash; all in under 3 seconds.
          </p>

          {/* CTAs */}
          <div className="reveal reveal-delay-3 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/sign-up"
              className="px-8 py-3.5 rounded-xl text-white font-bold text-sm flex items-center gap-2 transition-all hover:opacity-90 shadow-lg"
              style={{ backgroundColor: "var(--primary)", boxShadow: "0 12px 32px -8px var(--primary-glow)" }}
            >
              Start Free Trial <ArrowRight size={16} />
            </Link>
            <a
              href="#how-it-works"
              className="px-8 py-3.5 rounded-xl font-bold text-sm transition-all"
              style={{ color: "var(--text-secondary)", border: "1px solid var(--border)" }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = "var(--primary)"; e.currentTarget.style.color = "var(--primary)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.color = "var(--text-secondary)"; }}
            >
              See how it works
            </a>
          </div>
        </div>
      </section>

      {/* ── SOCIAL PROOF STRIP ───────────────────────────────────────────── */}
      <section className="py-12 px-6" style={{ borderTop: "1px solid var(--border)", borderBottom: "1px solid var(--border)" }}>
        <div className="max-w-5xl mx-auto">
          <p
            className="reveal text-[10px] font-black uppercase tracking-[0.2em] text-center mb-8"
            style={{ color: "var(--text-placeholder)" }}
          >
            Built for creators who mean business
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
            {STATS.map((s, i) => (
              <div key={s.label} className={`reveal reveal-delay-${i + 1} text-center`}>
                <p
                  className="text-3xl sm:text-4xl font-black tracking-tight"
                  style={{ fontFamily: "var(--font-serif), 'Instrument Serif', serif", color: "var(--text-primary)" }}
                >
                  {s.value}
                </p>
                <p className="text-xs font-semibold mt-1" style={{ color: "var(--text-muted)" }}>
                  {s.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ─────────────────────────────────────────────────── */}
      <section id="how-it-works" className="py-24 md:py-32 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <p
              className="reveal text-[10px] font-black uppercase tracking-[0.2em] mb-4"
              style={{ color: "var(--accent)" }}
            >
              How it works
            </p>
            <h2
              className="reveal reveal-delay-1 text-3xl sm:text-4xl md:text-5xl tracking-tight mb-4"
              style={{ fontFamily: "var(--font-serif), 'Instrument Serif', serif", color: "var(--text-primary)" }}
            >
              Three seconds. Four steps. Zero effort.
            </h2>
            <p className="reveal reveal-delay-2 text-base max-w-xl mx-auto" style={{ color: "var(--text-muted)" }}>
              Set it up once, and Engagr handles every comment, every DM, every follow check &mdash; 24/7.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {STEPS.map((step, i) => {
              const Icon = step.icon;
              return (
                <div
                  key={step.num}
                  className={`reveal reveal-delay-${i + 1} group rounded-2xl p-7 transition-all hover-lift`}
                  style={{ backgroundColor: "var(--card)", border: "1px solid var(--border)" }}
                >
                  <div className="flex items-center gap-3 mb-5">
                    <span
                      className="text-xs font-black px-2.5 py-1 rounded-lg"
                      style={{ backgroundColor: "var(--primary-light)", color: "var(--primary)" }}
                    >
                      {step.num}
                    </span>
                    <Icon size={18} style={{ color: "var(--text-placeholder)" }} />
                  </div>
                  <h3 className="text-base font-bold mb-2" style={{ color: "var(--text-primary)" }}>
                    {step.title}
                  </h3>
                  <p className="text-sm leading-relaxed" style={{ color: "var(--text-muted)" }}>
                    {step.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── FEATURES (dark bg) ───────────────────────────────────────────── */}
      <section
        id="features"
        className="py-24 md:py-32 px-6"
        style={{ backgroundColor: "#1E1B4B" }}
      >
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <p
              className="reveal text-[10px] font-black uppercase tracking-[0.2em] mb-4"
              style={{ color: "#2DD4BF" }}
            >
              Features
            </p>
            <h2
              className="reveal reveal-delay-1 text-3xl sm:text-4xl md:text-5xl tracking-tight mb-4 text-white"
              style={{ fontFamily: "var(--font-serif), 'Instrument Serif', serif" }}
            >
              Everything you need. Nothing you don&rsquo;t.
            </h2>
            <p className="reveal reveal-delay-2 text-base max-w-xl mx-auto" style={{ color: "rgba(255,255,255,0.5)" }}>
              One platform. Every feature to turn comments into conversions.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {FEATURES.map((f, i) => {
              const Icon = f.icon;
              return (
                <div
                  key={f.title}
                  className={`reveal reveal-delay-${(i % 3) + 1} group rounded-2xl p-7 transition-all hover-lift`}
                  style={{
                    backgroundColor: "rgba(255,255,255,0.05)",
                    border: "1px solid rgba(255,255,255,0.08)",
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.09)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.15)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.05)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)"; }}
                >
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center mb-5"
                    style={{ backgroundColor: f.bg, color: f.color }}
                  >
                    <Icon size={18} />
                  </div>
                  <h3 className="text-base font-bold mb-2 text-white">{f.title}</h3>
                  <p className="text-sm leading-relaxed" style={{ color: "rgba(255,255,255,0.5)" }}>
                    {f.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── DEMO PREVIEW ─────────────────────────────────────────────────── */}
      <section className="py-24 md:py-32 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <p
              className="reveal text-[10px] font-black uppercase tracking-[0.2em] mb-4"
              style={{ color: "var(--primary)" }}
            >
              In action
            </p>
            <h2
              className="reveal reveal-delay-1 text-3xl sm:text-4xl md:text-5xl tracking-tight"
              style={{ fontFamily: "var(--font-serif), 'Instrument Serif', serif", color: "var(--text-primary)" }}
            >
              From comment to conversion in 3 seconds
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {DEMO_CARDS.map((card, i) => (
              <div
                key={card.label}
                className={`reveal reveal-delay-${i + 1} rounded-2xl p-6 transition-all hover-lift`}
                style={{ backgroundColor: "var(--card)", border: "1px solid var(--border)" }}
              >
                {/* Label */}
                <div className="flex items-center gap-2 mb-5">
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: card.dot }} />
                  <span className="text-[10px] font-black uppercase tracking-[0.15em]" style={{ color: "var(--text-placeholder)" }}>
                    {card.label}
                  </span>
                </div>

                {/* Card 1: Comment */}
                {card.comment && (
                  <div className="space-y-4">
                    <div className="rounded-xl p-4" style={{ backgroundColor: "var(--surface-alt)" }}>
                      <p className="text-xs font-bold mb-1" style={{ color: "var(--text-primary)" }}>{card.username}</p>
                      <p className="text-sm" style={{ color: "var(--text-secondary)" }}>{card.comment}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 rounded-full flex items-center justify-center" style={{ backgroundColor: "var(--primary-light)" }}>
                        <Zap size={10} style={{ color: "var(--primary)" }} />
                      </div>
                      <p className="text-xs font-semibold" style={{ color: "var(--primary)" }}>{card.botReply}</p>
                    </div>
                  </div>
                )}

                {/* Card 2: DM */}
                {card.greeting && (
                  <div className="space-y-4">
                    <div className="rounded-xl p-4" style={{ backgroundColor: "var(--surface-alt)" }}>
                      <p className="text-sm mb-1" style={{ color: "var(--text-secondary)" }}>{card.greeting}</p>
                      <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>{card.question}</p>
                    </div>
                    <button
                      className="w-full py-2.5 rounded-xl text-sm font-bold text-white transition-all"
                      style={{ backgroundColor: "var(--primary)" }}
                    >
                      {card.button}
                    </button>
                  </div>
                )}

                {/* Card 3: Delivered */}
                {card.message && !card.greeting && (
                  <div className="space-y-4">
                    <div className="rounded-xl p-4" style={{ backgroundColor: "var(--surface-alt)" }}>
                      <p className="text-sm" style={{ color: "var(--text-secondary)" }}>{card.message}</p>
                    </div>
                    <button
                      className="w-full py-2.5 rounded-xl text-sm font-bold text-white transition-all"
                      style={{ backgroundColor: "var(--accent)" }}
                    >
                      {card.button}
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PRICING ──────────────────────────────────────────────────────── */}
      <section
        id="pricing"
        className="py-24 md:py-32 px-6"
        style={{ background: "linear-gradient(to bottom, var(--bg), var(--primary-light))" }}
      >
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <p
              className="reveal text-[10px] font-black uppercase tracking-[0.2em] mb-4"
              style={{ color: "var(--primary)" }}
            >
              Pricing
            </p>
            <h2
              className="reveal reveal-delay-1 text-3xl sm:text-4xl md:text-5xl tracking-tight mb-4"
              style={{ fontFamily: "var(--font-serif), 'Instrument Serif', serif", color: "var(--text-primary)" }}
            >
              Simple plans. No surprises.
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
            {PLANS.map((plan, i) => (
              <div
                key={plan.id}
                className={`reveal reveal-delay-${i + 1} rounded-2xl p-8 relative transition-all hover-lift`}
                style={{
                  backgroundColor: "var(--card)",
                  border: plan.featured ? "2px solid var(--primary)" : "1px solid var(--border)",
                  boxShadow: plan.featured ? "0 24px 48px -12px var(--primary-glow)" : "none",
                }}
              >
                {plan.featured && (
                  <span
                    className="absolute -top-3 left-1/2 -translate-x-1/2 text-[10px] font-black uppercase tracking-widest px-4 py-1 rounded-full text-white"
                    style={{ backgroundColor: "var(--primary)" }}
                  >
                    Most Popular
                  </span>
                )}

                <h3 className="text-lg font-bold mb-1" style={{ color: "var(--text-primary)" }}>
                  {plan.name}
                </h3>
                <p className="text-sm mb-5" style={{ color: "var(--text-muted)" }}>
                  {plan.tagline}
                </p>

                <div className="flex items-baseline gap-1 mb-6">
                  <span className="text-4xl font-black" style={{ color: "var(--text-primary)" }}>
                    \u20B9{plan.price.toLocaleString()}
                  </span>
                  <span className="text-sm font-medium" style={{ color: "var(--text-placeholder)" }}>
                    /{plan.period}
                  </span>
                </div>

                <ul className="space-y-3 mb-8">
                  {plan.features.map((f) => (
                    <li key={f.text} className="flex items-center gap-3">
                      {f.included ? (
                        <Check size={14} style={{ color: "var(--success)", flexShrink: 0 }} />
                      ) : (
                        <Minus size={14} style={{ color: "var(--text-placeholder)", flexShrink: 0 }} />
                      )}
                      <span
                        className="text-sm"
                        style={{ color: f.included ? "var(--text-secondary)" : "var(--text-placeholder)" }}
                      >
                        {f.text}
                      </span>
                    </li>
                  ))}
                </ul>

                <Link
                  href="/sign-up"
                  className="block text-center py-3 rounded-xl text-sm font-bold transition-all"
                  style={
                    plan.featured
                      ? { backgroundColor: "var(--primary)", color: "white" }
                      : { border: "1px solid var(--border)", color: "var(--text-secondary)" }
                  }
                  onMouseEnter={(e) => {
                    if (!plan.featured) { e.currentTarget.style.borderColor = "var(--primary)"; e.currentTarget.style.color = "var(--primary)"; }
                    else e.currentTarget.style.opacity = "0.9";
                  }}
                  onMouseLeave={(e) => {
                    if (!plan.featured) { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.color = "var(--text-secondary)"; }
                    else e.currentTarget.style.opacity = "1";
                  }}
                >
                  {plan.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ────────────────────────────────────────────────────── */}
      <section className="py-24 md:py-32 px-6">
        <div className="max-w-4xl mx-auto">
          <div
            className="reveal rounded-3xl p-10 md:p-16 text-center relative overflow-hidden"
            style={{ backgroundColor: "#1E1B4B" }}
          >
            {/* Glow */}
            <div
              className="absolute bottom-0 right-0 w-[400px] h-[300px] rounded-full blur-[100px] opacity-30 pointer-events-none"
              style={{ background: "var(--accent)" }}
            />

            <div className="relative">
              <h2
                className="text-3xl sm:text-4xl md:text-5xl tracking-tight mb-5 text-white"
                style={{ fontFamily: "var(--font-serif), 'Instrument Serif', serif" }}
              >
                Stop leaving DMs on the table.
              </h2>
              <p
                className="text-base md:text-lg max-w-xl mx-auto mb-10 leading-relaxed"
                style={{ color: "rgba(255,255,255,0.55)" }}
              >
                Every unanswered comment is a missed conversion. Engagr makes sure every single one
                gets a reply, a DM, and a chance to convert &mdash; automatically.
              </p>
              <Link
                href="/sign-up"
                className="inline-flex items-center gap-2 px-8 py-4 rounded-xl font-bold text-sm text-white transition-all hover:opacity-90"
                style={{ backgroundColor: "#14B8A6", boxShadow: "0 12px 32px -8px rgba(20, 184, 166, 0.4)" }}
              >
                Start Your Free Trial <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── FOOTER ───────────────────────────────────────────────────────── */}
      <footer className="py-16 px-6" style={{ borderTop: "1px solid var(--border)" }}>
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-10 mb-12">
            {/* Logo col */}
            <div className="col-span-2 md:col-span-1">
              <a href="#" className="flex items-center gap-0.5 mb-3 select-none">
                <span
                  className="text-xl tracking-tight"
                  style={{ fontFamily: "var(--font-serif), 'Instrument Serif', serif", color: "var(--text-primary)" }}
                >
                  engag
                </span>
                <span
                  className="text-xl tracking-tight"
                  style={{ fontFamily: "var(--font-serif), 'Instrument Serif', serif", color: "var(--accent)" }}
                >
                  r
                </span>
              </a>
              <p className="text-xs leading-relaxed" style={{ color: "var(--text-placeholder)" }}>
                Instagram automation for creators and businesses.
              </p>
            </div>

            {FOOTER_COLS.map((col) => (
              <div key={col.title}>
                <h4 className="text-xs font-black uppercase tracking-[0.15em] mb-4" style={{ color: "var(--text-placeholder)" }}>
                  {col.title}
                </h4>
                <ul className="space-y-2.5">
                  {col.links.map((link) => (
                    <li key={link.label}>
                      <a
                        href={link.href}
                        className="text-sm font-medium transition-colors"
                        style={{ color: "var(--text-muted)" }}
                        onMouseEnter={(e) => (e.currentTarget.style.color = "var(--text-primary)")}
                        onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-muted)")}
                      >
                        {link.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div
            className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4"
            style={{ borderTop: "1px solid var(--border)" }}
          >
            <p className="text-xs" style={{ color: "var(--text-placeholder)" }}>
              &copy; 2026 Engagr. All rights reserved.
            </p>
            <p className="text-xs" style={{ color: "var(--text-placeholder)" }}>
              Not affiliated with Meta or Instagram.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
