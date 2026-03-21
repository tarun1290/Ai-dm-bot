"use client";

import Link from "next/link";
import { useState } from "react";
import {
  MessageSquare, Zap, Users2, BarChart3, Shield, Bell,
  ArrowRight, Check, Star, Play, Heart, ChevronRight,
  Instagram, ShieldCheck, UserCheck, Activity, MousePointer2,
  MessageCircle, AtSign, TrendingUp, Menu, X,
} from "lucide-react";

/* ─────────────────────────── DATA ─────────────────────────── */

const FEATURES = [
  {
    icon: MessageSquare,
    title: "Comment-to-DM Automation",
    description: "Instantly detect comments on your posts or reels and auto-send a personalized DM. Turn casual engagement into real conversations.",
    color: "text-blue-600", bg: "bg-blue-50", border: "border-blue-100",
  },
  {
    icon: UserCheck,
    title: "Follower Verification Gate",
    description: "Send a confirm-follow button to non-followers. Once they follow and tap confirm, your automation message is delivered automatically.",
    color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-100",
  },
  {
    icon: Zap,
    title: "Smart Reply Presets",
    description: "Choose from ready-made public reply and DM templates, or write your own. One-click setup for every tone and brand voice.",
    color: "text-amber-600", bg: "bg-amber-50", border: "border-amber-100",
  },
  {
    icon: Play,
    title: "Reel Share Detection",
    description: "When someone shares your reel in a DM, Engagr captures the share and auto-replies with a rich card linking back to the original content.",
    color: "text-purple-600", bg: "bg-purple-50", border: "border-purple-100",
  },
  {
    icon: AtSign,
    title: "Mentions Tracker",
    description: "Get notified and auto-respond every time someone mentions your brand in their stories, posts, or comments.",
    color: "text-pink-600", bg: "bg-pink-50", border: "border-pink-100",
  },
  {
    icon: BarChart3,
    title: "Real-time Analytics",
    description: "Track transmission health, daily DMs sent, interaction breakdown by type, and growth trends. All on a live dashboard.",
    color: "text-cyan-600", bg: "bg-cyan-50", border: "border-cyan-100",
  },
  {
    icon: Users2,
    title: "Contact Management",
    description: "See every unique user who has interacted with your account. Search, sort, and view each contact's interaction history and DM status.",
    color: "text-indigo-600", bg: "bg-indigo-50", border: "border-indigo-100",
  },
  {
    icon: Activity,
    title: "Activity Feed & Logs",
    description: "A full filterable log of all interactions: comments, DMs, reel shares, mentions, reactions, and button taps. Up to 100 recent events.",
    color: "text-rose-600", bg: "bg-rose-50", border: "border-rose-100",
  },
];

const STEPS = [
  {
    step: "01",
    title: "Connect Your Instagram",
    description: "Sign up, log in with Instagram Business Login, and authorize Engagr in under 60 seconds. No Facebook Page needed.",
  },
  {
    step: "02",
    title: "Configure Your Automation",
    description: "Pick a post or reel, set keyword triggers or any-comment mode, choose your public reply, craft the DM message, and optionally enable the follower gate.",
  },
  {
    step: "03",
    title: "Go Live & Watch It Work",
    description: "Hit 'Save & Activate' and your automation starts instantly. Every qualifying comment triggers a public reply and private DM in real time.",
  },
];

const CASE_STUDIES = [
  {
    brand: "LuxeThread Boutique",
    industry: "Fashion & Apparel",
    logo: "LT",
    gradient: "from-pink-500 to-rose-500",
    problem: "Getting 500+ comments on product launch reels but manually sending only 20 DMs per day. Most interested buyers never heard back.",
    solution: "Set up comment-to-DM automation on every new launch reel. Keyword trigger on 'price', 'link', and 'details' with an instant DM containing the product link.",
    results: [
      { metric: "3.2x", label: "More DM conversations" },
      { metric: "40%", label: "Increase in DM-driven sales" },
      { metric: "12 hrs", label: "Saved per week" },
    ],
    quote: "We went from missing hundreds of leads to replying to every single one within seconds. The ROI was immediate.",
  },
  {
    brand: "FitLife by Coach Arjun",
    industry: "Fitness & Coaching",
    logo: "FL",
    gradient: "from-emerald-500 to-teal-500",
    problem: "Spending 3+ hours every day replying to 'how to join' and 'price' comments on coaching reels. Could not scale beyond 50 clients.",
    solution: "Enabled keyword-triggered automation with follower verification gate. Non-followers get a follow prompt, confirmed followers receive the program link instantly.",
    results: [
      { metric: "15 hrs", label: "Saved per week" },
      { metric: "2x", label: "More program sign-ups" },
      { metric: "95%", label: "Follower conversion rate" },
    ],
    quote: "The follower gate is genius. People actually follow now because they want the DM. My follower count grew 30% in a month.",
  },
  {
    brand: "SnackBox India",
    industry: "E-commerce & D2C",
    logo: "SB",
    gradient: "from-amber-500 to-orange-500",
    problem: "A product reel went viral with 2,000+ comments overnight. The team could not keep up, and potential customers moved on.",
    solution: "Activated any-comment automation with a DM containing the shop link and a 10% discount code. Public reply thanked commenters and told them to check DMs.",
    results: [
      { metric: "47%", label: "Increase in website traffic" },
      { metric: "2.8L", label: "Additional revenue (first month)" },
      { metric: "0", label: "Missed leads" },
    ],
    quote: "Our reel hit 2,000 comments and Engagr handled every single one. We made more revenue that week than the entire previous month.",
  },
];

const STATS = [
  { value: "50K+", label: "DMs Delivered" },
  { value: "2,500+", label: "Automations Created" },
  { value: "98.7%", label: "Delivery Success Rate" },
  { value: "< 3s", label: "Average Reply Time" },
];

/* ─────────────────────────── COMPONENTS ─────────────────────────── */

function Navbar() {
  const [open, setOpen] = useState(false);
  return (
    <nav className="fixed top-0 inset-x-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-100">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center shadow-sm shadow-pink-200">
            <ShieldCheck className="text-white" size={17} />
          </div>
          <span className="text-lg font-black text-slate-900 uppercase tracking-tight">Engagr</span>
        </Link>

        {/* Desktop */}
        <div className="hidden md:flex items-center gap-8">
          <a href="#features" className="text-sm font-semibold text-slate-500 hover:text-slate-900 transition-colors">Features</a>
          <a href="#how-it-works" className="text-sm font-semibold text-slate-500 hover:text-slate-900 transition-colors">How It Works</a>
          <a href="#case-studies" className="text-sm font-semibold text-slate-500 hover:text-slate-900 transition-colors">Case Studies</a>
          <Link href="/pricing" className="text-sm font-semibold text-slate-500 hover:text-slate-900 transition-colors">Pricing</Link>
        </div>

        <div className="hidden md:flex items-center gap-3">
          <Link href="/sign-in" className="px-5 py-2 text-sm font-bold text-slate-700 hover:text-primary transition-colors">
            Sign In
          </Link>
          <Link href="/sign-up" className="px-5 py-2.5 bg-primary text-white text-sm font-bold rounded-xl hover:opacity-90 transition-all shadow-lg shadow-pink-200">
            Get Started Free
          </Link>
        </div>

        {/* Mobile toggle */}
        <button onClick={() => setOpen(!open)} className="md:hidden p-2 text-slate-600">
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden bg-white border-t border-slate-100 px-6 py-6 space-y-4">
          <a href="#features" onClick={() => setOpen(false)} className="block text-sm font-semibold text-slate-600">Features</a>
          <a href="#how-it-works" onClick={() => setOpen(false)} className="block text-sm font-semibold text-slate-600">How It Works</a>
          <a href="#case-studies" onClick={() => setOpen(false)} className="block text-sm font-semibold text-slate-600">Case Studies</a>
          <Link href="/pricing" className="block text-sm font-semibold text-slate-600">Pricing</Link>
          <div className="pt-4 border-t border-slate-100 flex flex-col gap-3">
            <Link href="/sign-in" className="text-center py-3 text-sm font-bold text-slate-700 border border-slate-200 rounded-xl">Sign In</Link>
            <Link href="/sign-up" className="text-center py-3 bg-primary text-white text-sm font-bold rounded-xl">Get Started Free</Link>
          </div>
        </div>
      )}
    </nav>
  );
}

function Footer() {
  return (
    <footer className="bg-slate-950 text-white">
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10">
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <ShieldCheck className="text-white" size={17} />
              </div>
              <span className="text-lg font-black uppercase tracking-tight">Engagr</span>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed">
              Next-generation Instagram automation for businesses that want to turn every comment into a conversion.
            </p>
          </div>
          <div>
            <h4 className="text-xs font-black uppercase tracking-widest text-slate-500 mb-4">Product</h4>
            <ul className="space-y-2.5 text-sm text-slate-400">
              <li><a href="#features" className="hover:text-white transition-colors">Features</a></li>
              <li><Link href="/pricing" className="hover:text-white transition-colors">Pricing</Link></li>
              <li><a href="#case-studies" className="hover:text-white transition-colors">Case Studies</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-xs font-black uppercase tracking-widest text-slate-500 mb-4">Account</h4>
            <ul className="space-y-2.5 text-sm text-slate-400">
              <li><Link href="/sign-in" className="hover:text-white transition-colors">Sign In</Link></li>
              <li><Link href="/sign-up" className="hover:text-white transition-colors">Create Account</Link></li>
              <li><Link href="/dashboard" className="hover:text-white transition-colors">Dashboard</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-xs font-black uppercase tracking-widest text-slate-500 mb-4">Legal</h4>
            <ul className="space-y-2.5 text-sm text-slate-400">
              <li><span className="cursor-default">Privacy Policy</span></li>
              <li><span className="cursor-default">Terms of Service</span></li>
              <li><Link href="/data-deletion-status" className="hover:text-white transition-colors">Data Deletion</Link></li>
            </ul>
          </div>
        </div>
        <div className="mt-14 pt-8 border-t border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-slate-500">&copy; {new Date().getFullYear()} Engagr. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-full">
              <Instagram size={13} className="text-slate-400" />
              <span className="text-xs text-slate-400 font-medium">Built on Meta Instagram API</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

/* ─────────────────────────── PAGE ─────────────────────────── */

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* ── HERO ────────────────────────────────────────────────── */}
      <section className="relative pt-32 pb-24 px-6 overflow-hidden">
        {/* Background decoration */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[900px] bg-gradient-to-b from-pink-50 via-purple-50/30 to-transparent rounded-full blur-3xl -z-10 pointer-events-none" />

        <div className="max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-primary/5 border border-primary/10 rounded-full mb-8">
            <Zap size={13} className="text-primary" />
            <span className="text-xs font-bold text-primary uppercase tracking-widest">Instagram Automation Platform</span>
          </div>

          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black text-slate-900 tracking-tight leading-[1.05] mb-6">
            Turn Every Comment<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FF3040] to-[#E5266E]">
              Into a Conversation
            </span>
          </h1>

          <p className="text-lg sm:text-xl text-slate-500 max-w-2xl mx-auto leading-relaxed mb-10 font-medium">
            Engagr automatically replies to Instagram comments and sends personalized DMs in under 3 seconds.
            Capture every lead, grow your followers, and close more sales — hands-free.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <Link
              href="/sign-up"
              className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-[#FF3040] to-[#E5266E] text-white font-bold text-base rounded-2xl hover:opacity-90 transition-all shadow-xl shadow-pink-200 flex items-center justify-center gap-2"
            >
              Start Free Trial <ArrowRight size={18} />
            </Link>
            <Link
              href="/pricing"
              className="w-full sm:w-auto px-8 py-4 bg-white border border-slate-200 text-slate-700 font-bold text-base rounded-2xl hover:border-slate-300 hover:bg-slate-50 transition-all flex items-center justify-center gap-2"
            >
              View Pricing
            </Link>
          </div>

          {/* Dashboard mockup */}
          <div className="relative max-w-4xl mx-auto">
            <div className="bg-white border border-slate-200 rounded-[24px] shadow-2xl shadow-slate-200/60 p-2 sm:p-3">
              <div className="bg-slate-50 rounded-[18px] p-6 sm:p-10 space-y-6">
                {/* Mockup top bar */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#FFDA3A] via-[#FF3040] to-[#E5266E] flex items-center justify-center">
                      <Instagram size={18} className="text-white" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-900">@yourbrand</p>
                      <div className="flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">Automation Live</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <div className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-center">
                      <p className="text-xl font-black text-slate-900">247</p>
                      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">DMs Today</p>
                    </div>
                    <div className="px-4 py-2 bg-emerald-50 border border-emerald-100 rounded-xl text-center">
                      <p className="text-xl font-black text-emerald-600">+32%</p>
                      <p className="text-[9px] font-bold text-emerald-500 uppercase tracking-widest">Growth</p>
                    </div>
                  </div>
                </div>

                {/* Mockup feed */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {[
                    { type: "Comment", user: "@priya_styles", text: "OMG how much is this?", status: "Replied", statusColor: "text-emerald-600 bg-emerald-50 border-emerald-100" },
                    { type: "Reel Share", user: "@rahul.fit", text: "Shared your reel", status: "DM Sent", statusColor: "text-blue-600 bg-blue-50 border-blue-100" },
                    { type: "Mention", user: "@foodie_delhi", text: "Tagged you in story", status: "Replied", statusColor: "text-emerald-600 bg-emerald-50 border-emerald-100" },
                  ].map((item) => (
                    <div key={item.user} className="bg-white border border-slate-100 rounded-2xl p-4 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">{item.type}</span>
                        <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full border ${item.statusColor}`}>{item.status}</span>
                      </div>
                      <p className="text-xs font-bold text-slate-900">{item.user}</p>
                      <p className="text-[11px] text-slate-400 truncate">{item.text}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            {/* Glow behind mockup */}
            <div className="absolute inset-0 bg-gradient-to-t from-pink-100/40 to-transparent rounded-[24px] blur-2xl -z-10 scale-105" />
          </div>
        </div>
      </section>

      {/* ── STATS BAR ───────────────────────────────────────────── */}
      <section className="border-y border-slate-100 bg-slate-50/50 py-12 px-6">
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8">
          {STATS.map((s) => (
            <div key={s.label} className="text-center">
              <p className="text-3xl sm:text-4xl font-black text-slate-900 mb-1">{s.value}</p>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── FEATURES ────────────────────────────────────────────── */}
      <section id="features" className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-xs font-black text-primary uppercase tracking-[0.2em] mb-3">Everything You Need</p>
            <h2 className="text-4xl sm:text-5xl font-black text-slate-900 tracking-tight mb-4">
              Powerful Features,<br />Zero Complexity
            </h2>
            <p className="text-slate-500 max-w-xl mx-auto text-base font-medium">
              From comment detection to follower verification — every tool you need to automate your Instagram engagement.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {FEATURES.map((f) => {
              const Icon = f.icon;
              return (
                <div key={f.title} className="bg-white border border-slate-100 rounded-[24px] p-7 hover:shadow-lg hover:shadow-slate-100 hover:-translate-y-1 transition-all duration-300 group">
                  <div className={`w-11 h-11 rounded-2xl ${f.bg} border ${f.border} flex items-center justify-center mb-5 group-hover:scale-110 transition-transform`}>
                    <Icon size={20} className={f.color} />
                  </div>
                  <h3 className="text-[15px] font-black text-slate-900 mb-2">{f.title}</h3>
                  <p className="text-[13px] text-slate-500 leading-relaxed">{f.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ────────────────────────────────────────── */}
      <section id="how-it-works" className="py-24 px-6 bg-slate-50 border-y border-slate-100">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-xs font-black text-primary uppercase tracking-[0.2em] mb-3">Simple Setup</p>
            <h2 className="text-4xl sm:text-5xl font-black text-slate-900 tracking-tight mb-4">
              Live in 3 Minutes
            </h2>
            <p className="text-slate-500 max-w-lg mx-auto text-base font-medium">
              No coding, no APIs to configure, no Facebook Page required. Just connect and go.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {STEPS.map((s, i) => (
              <div key={s.step} className="relative">
                {i < STEPS.length - 1 && (
                  <div className="hidden md:block absolute top-12 left-full w-full h-px border-t-2 border-dashed border-slate-200 -z-10" />
                )}
                <div className="bg-white border border-slate-100 rounded-[28px] p-8 shadow-sm h-full">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary/10 to-pink-100 flex items-center justify-center mb-6">
                    <span className="text-lg font-black text-primary">{s.step}</span>
                  </div>
                  <h3 className="text-lg font-black text-slate-900 mb-2">{s.title}</h3>
                  <p className="text-[13px] text-slate-500 leading-relaxed">{s.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CASE STUDIES ────────────────────────────────────────── */}
      <section id="case-studies" className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-xs font-black text-primary uppercase tracking-[0.2em] mb-3">Real Results</p>
            <h2 className="text-4xl sm:text-5xl font-black text-slate-900 tracking-tight mb-4">
              Case Studies
            </h2>
            <p className="text-slate-500 max-w-lg mx-auto text-base font-medium">
              See how businesses across industries are using Engagr to grow their Instagram engagement and revenue.
            </p>
          </div>

          <div className="space-y-10">
            {CASE_STUDIES.map((cs, idx) => (
              <div key={cs.brand} className="bg-white border border-slate-100 rounded-[32px] overflow-hidden shadow-sm hover:shadow-lg transition-shadow duration-300">
                <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.2fr]">
                  {/* Left — brand + problem */}
                  <div className="p-8 sm:p-10 lg:border-r border-slate-100">
                    <div className="flex items-center gap-4 mb-6">
                      <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${cs.gradient} flex items-center justify-center text-white text-sm font-black`}>
                        {cs.logo}
                      </div>
                      <div>
                        <h3 className="text-lg font-black text-slate-900">{cs.brand}</h3>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{cs.industry}</p>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <p className="text-[10px] font-black text-rose-500 uppercase tracking-widest mb-1.5">The Problem</p>
                        <p className="text-[13px] text-slate-600 leading-relaxed">{cs.problem}</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest mb-1.5">The Solution</p>
                        <p className="text-[13px] text-slate-600 leading-relaxed">{cs.solution}</p>
                      </div>
                    </div>
                  </div>

                  {/* Right — results + quote */}
                  <div className="p-8 sm:p-10 bg-slate-50/50 flex flex-col justify-between">
                    <div>
                      <p className="text-[10px] font-black text-primary uppercase tracking-widest mb-5">Results</p>
                      <div className="grid grid-cols-3 gap-4 mb-8">
                        {cs.results.map((r) => (
                          <div key={r.label} className="bg-white border border-slate-100 rounded-2xl p-4 text-center">
                            <p className="text-2xl sm:text-3xl font-black text-slate-900 mb-1">{r.metric}</p>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-tight">{r.label}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-start gap-3 bg-white border border-slate-100 rounded-2xl p-5">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Star size={14} className="text-white fill-white" />
                      </div>
                      <p className="text-[13px] text-slate-600 italic leading-relaxed">"{cs.quote}"</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FOLLOWER GATE HIGHLIGHT ─────────────────────────────── */}
      <section className="py-24 px-6 bg-gradient-to-br from-slate-950 to-slate-900 text-white overflow-hidden relative">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(229,38,110,0.12),transparent_60%)] pointer-events-none" />
        <div className="max-w-5xl mx-auto relative">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/5 border border-white/10 rounded-full mb-6">
                <UserCheck size={13} className="text-emerald-400" />
                <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest">Exclusive Feature</span>
              </div>
              <h2 className="text-4xl sm:text-5xl font-black tracking-tight mb-5 leading-[1.1]">
                Follower<br />Verification Gate
              </h2>
              <p className="text-slate-400 text-base leading-relaxed mb-8 max-w-md">
                Non-followers who comment receive a DM with a <strong className="text-white">"I'm following now"</strong> button. Engagr verifies their follow status in real time. Only confirmed followers get your automation message. Grow your followers while capturing leads.
              </p>
              <div className="space-y-3">
                {[
                  "Non-follower comments on your post",
                  "Bot sends a DM with follow prompt + confirm button",
                  "User follows your account and taps confirm",
                  "Engagr verifies the follow and delivers your DM",
                ].map((step, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0 border border-white/10">
                      <span className="text-xs font-black text-white">{i + 1}</span>
                    </div>
                    <p className="text-sm text-slate-300 font-medium">{step}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Phone mockup */}
            <div className="flex justify-center">
              <div className="w-72 bg-slate-800 border border-slate-700 rounded-[36px] p-4 shadow-2xl">
                <div className="bg-white rounded-[24px] overflow-hidden">
                  <div className="bg-gradient-to-r from-[#FFDA3A] via-[#FF3040] to-[#E5266E] p-4 flex items-center gap-3">
                    <Instagram size={18} className="text-white" />
                    <span className="text-white text-sm font-bold">Instagram DM</span>
                  </div>
                  <div className="p-4 space-y-3">
                    <div className="bg-slate-100 rounded-2xl rounded-tl-sm p-3 max-w-[200px]">
                      <p className="text-xs text-slate-700 leading-relaxed">
                        Hey! Follow @yourbrand to receive my message 💌
                      </p>
                    </div>
                    <div className="bg-slate-100 rounded-2xl rounded-tl-sm p-3 max-w-[220px] space-y-2">
                      <p className="text-xs text-slate-700">Once you've followed, tap below to confirm! 👇</p>
                      <div className="bg-primary text-white text-xs font-bold text-center py-2 px-4 rounded-xl">
                        I'm following now! ✓
                      </div>
                    </div>
                    <div className="bg-emerald-50 border border-emerald-100 rounded-2xl rounded-tl-sm p-3 max-w-[230px] mt-1">
                      <p className="text-xs text-emerald-700 leading-relaxed">
                        Thanks for following! Here's your exclusive link 🎁
                      </p>
                      <p className="text-[10px] text-primary font-bold mt-1">🔗 yourlink.com/offer</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ───────────────────────────────────────────── */}
      <section className="py-24 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-4xl sm:text-5xl font-black text-slate-900 tracking-tight mb-5">
            Ready to Automate Your<br />Instagram Growth?
          </h2>
          <p className="text-slate-500 text-base font-medium mb-10 max-w-lg mx-auto">
            Join thousands of businesses that use Engagr to capture leads, grow followers, and close more sales from Instagram — on autopilot.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/sign-up"
              className="w-full sm:w-auto px-10 py-4 bg-gradient-to-r from-[#FF3040] to-[#E5266E] text-white font-bold text-base rounded-2xl hover:opacity-90 transition-all shadow-xl shadow-pink-200 flex items-center justify-center gap-2"
            >
              Get Started Free <ArrowRight size={18} />
            </Link>
            <Link
              href="/pricing"
              className="w-full sm:w-auto px-10 py-4 bg-white border border-slate-200 text-slate-700 font-bold text-base rounded-2xl hover:border-slate-300 transition-all flex items-center justify-center gap-2"
            >
              Compare Plans <ChevronRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
