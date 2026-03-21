"use client";

import Link from "next/link";
import { useState } from "react";
import {
  ShieldCheck, Check, X as XIcon, ArrowRight, ChevronRight,
  Instagram, Zap, Crown, Gem, Star, Menu, X, HelpCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";

/* ─────────────────────────── ICONS ─────────────────────────── */

const SilverShield = ({ size, className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" />
  </svg>
);

/* ─────────────────────────── PLAN DATA ─────────────────────────── */

const PLANS = [
  {
    id: "silver",
    name: "Silver",
    icon: SilverShield,
    price: 499,
    period: "month",
    tagline: "Perfect for creators just getting started",
    color: "from-slate-400 to-slate-500",
    borderColor: "border-slate-200",
    iconBg: "bg-slate-100",
    iconColor: "text-slate-500",
    features: [
      { text: "1 Instagram account", included: true },
      { text: "Comment-to-DM automation", included: true },
      { text: "500 automated DMs per month", included: true },
      { text: "Smart reply presets", included: true },
      { text: "Basic analytics dashboard", included: true },
      { text: "Reel share detection", included: true },
      { text: "Email support", included: true },
      { text: "Follower verification gate", included: false },
      { text: "Mentions tracker", included: false },
      { text: "Contact management", included: false },
      { text: "Activity feed & logs", included: false },
      { text: "Priority support", included: false },
    ],
    cta: "Start with Silver",
  },
  {
    id: "gold",
    name: "Gold",
    icon: Crown,
    price: 999,
    period: "month",
    tagline: "For growing businesses that want every feature",
    color: "from-amber-500 to-yellow-500",
    borderColor: "border-amber-200",
    iconBg: "bg-amber-50",
    iconColor: "text-amber-600",
    popular: true,
    features: [
      { text: "1 Instagram account", included: true },
      { text: "Comment-to-DM automation", included: true },
      { text: "Unlimited automated DMs", included: true },
      { text: "Smart reply presets", included: true },
      { text: "Advanced analytics & trends", included: true },
      { text: "Reel share detection", included: true },
      { text: "Follower verification gate", included: true },
      { text: "Mentions tracker", included: true },
      { text: "Contact management", included: true },
      { text: "Activity feed & logs", included: true },
      { text: "Priority email support", included: true },
      { text: "Multiple accounts", included: false },
    ],
    cta: "Start with Gold",
  },
  {
    id: "platinum",
    name: "Platinum",
    icon: Gem,
    price: 1999,
    period: "month",
    tagline: "For agencies and brands managing multiple accounts",
    color: "from-violet-500 to-purple-600",
    borderColor: "border-violet-200",
    iconBg: "bg-violet-50",
    iconColor: "text-violet-600",
    features: [
      { text: "Up to 3 Instagram accounts", included: true },
      { text: "Comment-to-DM automation", included: true },
      { text: "Unlimited automated DMs", included: true },
      { text: "Smart reply presets", included: true },
      { text: "Advanced analytics & trends", included: true },
      { text: "Reel share detection", included: true },
      { text: "Follower verification gate", included: true },
      { text: "Mentions tracker", included: true },
      { text: "Contact management", included: true },
      { text: "Activity feed & logs", included: true },
      { text: "Dedicated account manager", included: true },
      { text: "Custom automation templates", included: true },
    ],
    cta: "Start with Platinum",
  },
];

const FAQS = [
  {
    q: "Can I upgrade or downgrade anytime?",
    a: "Yes. You can switch between plans at any time. When you upgrade, you're charged the prorated difference. Downgrades take effect at the next billing cycle.",
  },
  {
    q: "Is there a free trial?",
    a: "Yes! Every plan comes with a 7-day free trial. No credit card required to start. You can explore all features before committing.",
  },
  {
    q: "Do I need a Facebook Page to use Engagr?",
    a: "No. Engagr uses Instagram Business Login (API with Instagram Login), which connects directly to your Instagram account without requiring a Facebook Page.",
  },
  {
    q: "What happens when I hit the DM limit on Silver?",
    a: "You'll receive a notification when you're approaching 500 DMs. After the limit, new comments won't trigger DMs until the next billing cycle — or you can upgrade to Gold for unlimited DMs.",
  },
  {
    q: "How does the follower verification gate work?",
    a: "When enabled, non-followers who comment receive a DM with a 'I'm following now' button. Once they follow your account and tap the button, Engagr verifies their follow status and delivers your automation message.",
  },
  {
    q: "Is my Instagram data safe?",
    a: "Absolutely. Engagr uses official Meta APIs with encrypted tokens. We never store your Instagram password and all data is transmitted over HTTPS. You can revoke access at any time.",
  },
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

        <div className="hidden md:flex items-center gap-8">
          <Link href="/#features" className="text-sm font-semibold text-slate-500 hover:text-slate-900 transition-colors">Features</Link>
          <Link href="/#case-studies" className="text-sm font-semibold text-slate-500 hover:text-slate-900 transition-colors">Case Studies</Link>
          <Link href="/pricing" className="text-sm font-semibold text-primary">Pricing</Link>
        </div>

        <div className="hidden md:flex items-center gap-3">
          <Link href="/sign-in" className="px-5 py-2 text-sm font-bold text-slate-700 hover:text-primary transition-colors">Sign In</Link>
          <Link href="/sign-up" className="px-5 py-2.5 bg-primary text-white text-sm font-bold rounded-xl hover:opacity-90 transition-all shadow-lg shadow-pink-200">Get Started Free</Link>
        </div>

        <button onClick={() => setOpen(!open)} className="md:hidden p-2 text-slate-600">
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {open && (
        <div className="md:hidden bg-white border-t border-slate-100 px-6 py-6 space-y-4">
          <Link href="/#features" className="block text-sm font-semibold text-slate-600">Features</Link>
          <Link href="/#case-studies" className="block text-sm font-semibold text-slate-600">Case Studies</Link>
          <Link href="/pricing" className="block text-sm font-semibold text-primary">Pricing</Link>
          <div className="pt-4 border-t border-slate-100 flex flex-col gap-3">
            <Link href="/sign-in" className="text-center py-3 text-sm font-bold text-slate-700 border border-slate-200 rounded-xl">Sign In</Link>
            <Link href="/sign-up" className="text-center py-3 bg-primary text-white text-sm font-bold rounded-xl">Get Started Free</Link>
          </div>
        </div>
      )}
    </nav>
  );
}

function FAQItem({ q, a }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-slate-100 rounded-2xl overflow-hidden transition-all">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-6 py-5 text-left hover:bg-slate-50/50 transition-colors"
      >
        <span className="text-[14px] font-bold text-slate-900 pr-4">{q}</span>
        <ChevronRight size={16} className={cn("text-slate-400 flex-shrink-0 transition-transform", open && "rotate-90")} />
      </button>
      {open && (
        <div className="px-6 pb-5 -mt-1">
          <p className="text-[13px] text-slate-500 leading-relaxed">{a}</p>
        </div>
      )}
    </div>
  );
}

/* ─────────────────────────── PAGE ─────────────────────────── */

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* ── HEADER ─────────────────────────────────────────────── */}
      <section className="pt-32 pb-16 px-6 text-center relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-gradient-to-b from-purple-50/60 via-pink-50/30 to-transparent rounded-full blur-3xl -z-10 pointer-events-none" />

        <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-primary/5 border border-primary/10 rounded-full mb-6">
          <Zap size={13} className="text-primary" />
          <span className="text-xs font-bold text-primary uppercase tracking-widest">Simple Pricing</span>
        </div>

        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight mb-4">
          Choose Your Plan
        </h1>
        <p className="text-slate-500 text-base sm:text-lg font-medium max-w-lg mx-auto">
          Start with a 7-day free trial on any plan. No credit card required. Upgrade, downgrade, or cancel anytime.
        </p>
      </section>

      {/* ── PLAN CARDS ─────────────────────────────────────────── */}
      <section className="pb-24 px-6">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
          {PLANS.map((plan) => {
            const PlanIcon = plan.icon;
            return (
              <div
                key={plan.id}
                className={cn(
                  "relative bg-white border rounded-[32px] p-8 flex flex-col transition-all hover:shadow-xl hover:shadow-slate-100 hover:-translate-y-1 duration-300",
                  plan.popular ? "border-primary/30 ring-1 ring-primary/10 shadow-lg shadow-pink-100/50" : "border-slate-200"
                )}
              >
                {plan.popular && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                    <div className="px-4 py-1 bg-gradient-to-r from-[#FF3040] to-[#E5266E] text-white text-[10px] font-black uppercase tracking-widest rounded-full shadow-lg shadow-pink-200">
                      Most Popular
                    </div>
                  </div>
                )}

                {/* Plan header */}
                <div className="mb-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className={cn("w-11 h-11 rounded-2xl flex items-center justify-center border", plan.iconBg, plan.borderColor)}>
                      <PlanIcon size={20} className={plan.iconColor} />
                    </div>
                    <div>
                      <h3 className="text-lg font-black text-slate-900">{plan.name}</h3>
                    </div>
                  </div>
                  <p className="text-[13px] text-slate-400 font-medium">{plan.tagline}</p>
                </div>

                {/* Price */}
                <div className="mb-8">
                  <div className="flex items-baseline gap-1">
                    <span className="text-[13px] text-slate-400 font-bold">&#8377;</span>
                    <span className="text-5xl font-black text-slate-900 tracking-tight">{plan.price.toLocaleString("en-IN")}</span>
                    <span className="text-sm text-slate-400 font-medium">/{plan.period}</span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">+ GST where applicable</p>
                </div>

                {/* Features */}
                <ul className="space-y-3 mb-8 flex-1">
                  {plan.features.map((f) => (
                    <li key={f.text} className="flex items-start gap-3">
                      {f.included ? (
                        <Check size={15} className="text-emerald-500 mt-0.5 flex-shrink-0" />
                      ) : (
                        <XIcon size={15} className="text-slate-300 mt-0.5 flex-shrink-0" />
                      )}
                      <span className={cn("text-[13px] font-medium", f.included ? "text-slate-700" : "text-slate-400")}>
                        {f.text}
                      </span>
                    </li>
                  ))}
                </ul>

                {/* CTA */}
                <Link
                  href="/sign-up"
                  className={cn(
                    "w-full py-3.5 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 transition-all",
                    plan.popular
                      ? "bg-gradient-to-r from-[#FF3040] to-[#E5266E] text-white shadow-lg shadow-pink-200 hover:opacity-90"
                      : "bg-slate-900 text-white hover:bg-slate-800"
                  )}
                >
                  {plan.cta} <ArrowRight size={15} />
                </Link>
              </div>
            );
          })}
        </div>

        {/* All plans include */}
        <div className="max-w-3xl mx-auto mt-14 text-center">
          <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-5">All plans include</p>
          <div className="flex flex-wrap justify-center gap-x-8 gap-y-3">
            {[
              "7-day free trial",
              "SSL encrypted",
              "Official Meta APIs",
              "No Facebook Page required",
              "Cancel anytime",
              "Auto-updates",
            ].map((item) => (
              <div key={item} className="flex items-center gap-2">
                <Check size={13} className="text-emerald-500" />
                <span className="text-sm text-slate-600 font-medium">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── COMPARISON TABLE ───────────────────────────────────── */}
      <section className="py-20 px-6 bg-slate-50 border-y border-slate-100">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-black text-slate-900 text-center mb-10 tracking-tight">Plan Comparison</h2>

          <div className="bg-white border border-slate-200 rounded-[24px] overflow-hidden shadow-sm">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/80">
                  <th className="text-left py-4 px-6 text-[11px] font-black text-slate-400 uppercase tracking-widest w-1/3">Feature</th>
                  <th className="text-center py-4 px-4 text-[11px] font-black text-slate-400 uppercase tracking-widest">Silver</th>
                  <th className="text-center py-4 px-4 text-[11px] font-black text-primary uppercase tracking-widest">Gold</th>
                  <th className="text-center py-4 px-4 text-[11px] font-black text-violet-600 uppercase tracking-widest">Platinum</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { feature: "Instagram accounts", silver: "1", gold: "1", platinum: "3" },
                  { feature: "Monthly DM limit", silver: "500", gold: "Unlimited", platinum: "Unlimited" },
                  { feature: "Comment-to-DM", silver: true, gold: true, platinum: true },
                  { feature: "Smart reply presets", silver: true, gold: true, platinum: true },
                  { feature: "Reel share detection", silver: true, gold: true, platinum: true },
                  { feature: "Follower verification gate", silver: false, gold: true, platinum: true },
                  { feature: "Mentions tracker", silver: false, gold: true, platinum: true },
                  { feature: "Contact management", silver: false, gold: true, platinum: true },
                  { feature: "Activity feed & logs", silver: false, gold: true, platinum: true },
                  { feature: "Analytics", silver: "Basic", gold: "Advanced", platinum: "Advanced" },
                  { feature: "Custom templates", silver: false, gold: false, platinum: true },
                  { feature: "Support", silver: "Email", gold: "Priority", platinum: "Dedicated" },
                ].map((row, i) => (
                  <tr key={row.feature} className={cn("border-b border-slate-100 last:border-0", i % 2 === 0 ? "bg-white" : "bg-slate-50/30")}>
                    <td className="py-3.5 px-6 text-[13px] font-semibold text-slate-700">{row.feature}</td>
                    {["silver", "gold", "platinum"].map((plan) => {
                      const val = row[plan];
                      return (
                        <td key={plan} className="py-3.5 px-4 text-center">
                          {val === true ? (
                            <Check size={16} className="text-emerald-500 mx-auto" />
                          ) : val === false ? (
                            <XIcon size={16} className="text-slate-300 mx-auto" />
                          ) : (
                            <span className="text-[13px] font-bold text-slate-600">{val}</span>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* ── FAQ ─────────────────────────────────────────────────── */}
      <section className="py-24 px-6">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-slate-100 border border-slate-200 rounded-full mb-4">
              <HelpCircle size={13} className="text-slate-500" />
              <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">FAQ</span>
            </div>
            <h2 className="text-3xl font-black text-slate-900 tracking-tight">Frequently Asked Questions</h2>
          </div>

          <div className="space-y-3">
            {FAQS.map((faq) => (
              <FAQItem key={faq.q} q={faq.q} a={faq.a} />
            ))}
          </div>
        </div>
      </section>

      {/* ── BOTTOM CTA ──────────────────────────────────────────── */}
      <section className="pb-24 px-6">
        <div className="max-w-4xl mx-auto bg-gradient-to-br from-slate-950 to-slate-900 rounded-[32px] p-10 sm:p-14 text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(229,38,110,0.15),transparent_60%)] pointer-events-none" />
          <div className="relative">
            <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight mb-4">
              Start Your Free Trial Today
            </h2>
            <p className="text-slate-400 text-base font-medium max-w-md mx-auto mb-8">
              7 days free on any plan. No credit card required. Set up your first automation in under 3 minutes.
            </p>
            <Link
              href="/sign-up"
              className="inline-flex items-center gap-2 px-10 py-4 bg-gradient-to-r from-[#FF3040] to-[#E5266E] text-white font-bold text-base rounded-2xl hover:opacity-90 transition-all shadow-xl shadow-pink-900/30"
            >
              Get Started Free <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>

      {/* ── FOOTER ──────────────────────────────────────────────── */}
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
                <li><Link href="/#features" className="hover:text-white transition-colors">Features</Link></li>
                <li><Link href="/pricing" className="hover:text-white transition-colors">Pricing</Link></li>
                <li><Link href="/#case-studies" className="hover:text-white transition-colors">Case Studies</Link></li>
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
            <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-full">
              <Instagram size={13} className="text-slate-400" />
              <span className="text-xs text-slate-400 font-medium">Built on Meta Instagram API</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
