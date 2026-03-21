"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Bot, ArrowRight, CheckCircle2, AlertCircle, Instagram,
  ShieldCheck, Zap, MessageSquare, ChevronDown, ExternalLink,
} from "lucide-react";
import { getAccountsFromToken, saveDiscoveredAccount } from "../dashboard/actions";

export default function Onboarding() {
  const router = useRouter();

  const [step, setStep] = useState("connect"); // connect | success
  const [loading, setLoading] = useState(false);
  const [discoveredAccounts, setDiscoveredAccounts] = useState([]);
  const [connectedUsername, setConnectedUsername] = useState("");
  const [error, setError] = useState("");
  const [showHelp, setShowHelp] = useState(false);

  const appId = process.env.NEXT_PUBLIC_FACEBOOK_APP_ID || "2989539487909963";

  // Build the redirect URI once — used for both the OAuth request and the token exchange
  const getRedirectUri = () => `${window.location.origin}/onboarding`;

  // Handle OAuth redirect — Instagram sends ?code= back to this page
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get("code");
    const oauthError = params.get("error");

    if (code) {
      window.history.replaceState(null, null, window.location.pathname);
      handleTokenExchange(code);
    } else if (oauthError) {
      window.history.replaceState(null, null, window.location.pathname);
      setError("Login was cancelled or permissions were not granted. Please try again.");
    }
  }, []);

  // Auto-redirect to dashboard after successful connection
  useEffect(() => {
    if (step === "success") {
      const timer = setTimeout(() => router.push("/dashboard"), 1500);
      return () => clearTimeout(timer);
    }
  }, [step, router]);

  const handleInstagramLogin = () => {
    setError("");
    const redirectUri = getRedirectUri();
    const url = new URL("https://www.instagram.com/oauth/authorize");
    url.searchParams.set("client_id", appId);
    url.searchParams.set("redirect_uri", redirectUri);
    url.searchParams.set("response_type", "code");
    url.searchParams.set("scope", "instagram_business_basic,instagram_business_manage_messages,instagram_business_manage_comments");
    window.location.href = url.toString();
  };

  const handleTokenExchange = async (code) => {
    setLoading(true);
    setError("");
    try {
      // Pass the exact same redirect_uri used in the OAuth request
      const redirectUri = getRedirectUri();
      const res = await getAccountsFromToken(code, redirectUri);

      if (res.success) {
        if (res.accounts.length === 1) {
          await handleSelectAccount(res.accounts[0]);
        } else if (res.accounts.length > 1) {
          setDiscoveredAccounts(res.accounts);
        } else {
          setError("No accounts found. Make sure your Instagram account is a Business or Creator account.");
        }
      } else {
        setError(res.error || "Could not discover accounts. Please try again.");
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectAccount = async (account) => {
    setLoading(true);
    setError("");
    try {
      const res = await saveDiscoveredAccount({ ...account, userToken: account.pageToken });
      if (res.success) {
        setConnectedUsername(account.username);
        setStep("success");
      } else {
        setError(res.error || "Failed to save account. Please try again.");
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (step === "success") {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-6 relative overflow-hidden">
        <div className="absolute top-[-20%] right-[-10%] w-[500px] h-[500px] bg-emerald-50 rounded-full blur-[100px] opacity-60 pointer-events-none" />
        <div className="absolute bottom-[-20%] left-[-10%] w-[500px] h-[500px] bg-teal-50 rounded-full blur-[100px] opacity-60 pointer-events-none" />

        <div className="flex flex-col items-center space-y-8 relative">
          <div className="w-24 h-24 bg-gradient-to-tr from-emerald-400 to-teal-500 rounded-full flex items-center justify-center shadow-2xl shadow-emerald-200 animate-bounce">
            <CheckCircle2 className="text-white" size={48} />
          </div>
          <div className="text-center space-y-3">
            <h2 className="text-4xl font-black text-slate-900 tracking-tight">Connected!</h2>
            <p className="text-slate-400 font-bold uppercase tracking-[0.2em] text-[11px]">
              Automation is ready for @{connectedUsername}
            </p>
          </div>
          <div className="w-48 h-1.5 bg-slate-100 rounded-full overflow-hidden">
            <div className="w-full h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background blobs — matching sign-in */}
      <div className="absolute top-[-20%] right-[-10%] w-[500px] h-[500px] bg-pink-50 rounded-full blur-[100px] opacity-60 pointer-events-none" />
      <div className="absolute bottom-[-20%] left-[-10%] w-[500px] h-[500px] bg-purple-50 rounded-full blur-[100px] opacity-60 pointer-events-none" />

      <div className="w-full max-w-md relative">
        {/* Branding — matching sign-in */}
        <div className="flex items-center justify-center gap-3 mb-10">
          <div className="w-11 h-11 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-pink-200">
            <Bot className="text-white" size={24} />
          </div>
          <span className="text-xl font-black text-slate-900 uppercase tracking-tight">Engagr</span>
        </div>

        {/* Main card */}
        <div className="bg-white border border-slate-100 rounded-[32px] p-10 shadow-[0_24px_64px_-16px_rgba(0,0,0,0.07)] space-y-8">
          <div className="space-y-2">
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">Connect Instagram</h1>
            <p className="text-slate-400 font-medium text-sm">
              Link your Business account to start automating DMs, replies, and engagement.
            </p>
          </div>

          {error && (
            <div className="flex items-start gap-2 bg-red-50 border border-red-100 text-red-600 rounded-2xl px-4 py-3 text-sm font-medium">
              <AlertCircle size={14} className="flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <div className="space-y-5">
            {/* Features preview */}
            <div className="space-y-3">
              {[
                { icon: MessageSquare, text: "Auto-reply to comments with DMs", color: "text-blue-500" },
                { icon: Zap, text: "Instant follower verification gate", color: "text-amber-500" },
                { icon: ShieldCheck, text: "Secure OAuth 2.0 connection", color: "text-emerald-500" },
              ].map(({ icon: Icon, text, color }) => (
                <div key={text} className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-xl bg-slate-50 flex items-center justify-center ${color}`}>
                    <Icon size={14} />
                  </div>
                  <span className="text-sm font-medium text-slate-600">{text}</span>
                </div>
              ))}
            </div>

            {/* Connect button — matching sign-in gradient */}
            <button
              onClick={handleInstagramLogin}
              disabled={loading}
              className="w-full py-4 bg-gradient-to-r from-[#FF3040] to-[#E5266E] text-white rounded-2xl font-black text-base hover:opacity-90 transition-all shadow-xl shadow-pink-200 flex items-center justify-center gap-3 disabled:opacity-60 mt-2"
            >
              {loading ? (
                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <Instagram size={20} />
                  Connect with Instagram
                  <ArrowRight size={18} />
                </>
              )}
            </button>

            {/* Account selection */}
            {discoveredAccounts.length > 0 && (
              <div className="space-y-3 pt-2">
                <div className="flex items-center gap-3">
                  <div className="flex-1 h-px bg-slate-100" />
                  <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Select Account</span>
                  <div className="flex-1 h-px bg-slate-100" />
                </div>
                {discoveredAccounts.map((acc) => (
                  <button
                    key={acc.igId}
                    onClick={() => handleSelectAccount(acc)}
                    disabled={loading}
                    className="w-full flex items-center gap-4 bg-slate-50 border border-slate-200 p-4 rounded-2xl hover:border-primary hover:bg-pink-50/50 transition-all group disabled:opacity-60"
                  >
                    <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#FFDA3A] via-[#FF3040] to-[#E5266E] flex items-center justify-center text-white font-black text-sm">
                      {acc.username?.[0]?.toUpperCase() || "?"}
                    </div>
                    <div className="text-left">
                      <p className="text-sm font-black text-slate-900 group-hover:text-primary">@{acc.username}</p>
                      <p className="text-[11px] font-medium text-slate-400">{acc.name}</p>
                    </div>
                    <ArrowRight size={14} className="ml-auto text-slate-300 group-hover:text-primary" />
                  </button>
                ))}
                <button
                  onClick={() => setDiscoveredAccounts([])}
                  className="w-full py-2 text-[11px] font-bold text-slate-400 hover:text-slate-700 transition-colors"
                >
                  Cancel
                </button>
              </div>
            )}

            <div className="flex items-center gap-3">
              <div className="flex-1 h-px bg-slate-100" />
              <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Requirements</span>
              <div className="flex-1 h-px bg-slate-100" />
            </div>

            {/* Instagram Business info card */}
            <div className="flex items-center gap-3 bg-gradient-to-r from-pink-50 to-purple-50 border border-pink-100 rounded-2xl px-5 py-4">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#FFDA3A] via-[#FF3040] to-[#E5266E] flex items-center justify-center flex-shrink-0">
                <Instagram size={18} className="text-white" />
              </div>
              <div>
                <p className="text-sm font-black text-slate-800 leading-none mb-0.5">Business or Creator Account</p>
                <p className="text-[11px] text-slate-400 font-medium">Personal accounts are not supported by Instagram API</p>
              </div>
            </div>

            {/* Skip link */}
            <button
              onClick={() => router.push("/dashboard")}
              className="w-full py-3 text-[11px] font-bold text-slate-400 hover:text-slate-700 transition-colors text-center"
            >
              Skip for now
            </button>
          </div>
        </div>

        {/* Troubleshooting */}
        <div className="mt-6 text-center">
          <button
            onClick={() => setShowHelp(!showHelp)}
            className="text-[10px] font-black text-slate-400 hover:text-primary transition-colors uppercase tracking-widest inline-flex items-center gap-1.5"
          >
            Connection issues? <ChevronDown size={12} className={`transition-transform ${showHelp ? "rotate-180" : ""}`} />
          </button>

          {showHelp && (
            <div className="mt-4 bg-slate-50 rounded-2xl p-6 border border-slate-100 space-y-4 text-left">
              <div className="flex items-center gap-2 text-primary">
                <ExternalLink size={14} />
                <p className="text-[11px] font-black uppercase tracking-tight">Troubleshooting</p>
              </div>
              <div className="space-y-3">
                <div className="space-y-1">
                  <p className="text-[12px] font-black text-slate-900">1. Instagram Business Login</p>
                  <p className="text-[11px] text-slate-500 font-medium">In Meta Dashboard, add the <strong>&quot;Instagram Login for Business&quot;</strong> product.</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[12px] font-black text-slate-900">2. App Type</p>
                  <p className="text-[11px] text-slate-500 font-medium">Your Meta App must be <strong>&quot;Business&quot;</strong> type with Instagram permissions.</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[12px] font-black text-slate-900">3. Redirect URI</p>
                  <p className="text-[11px] text-slate-500 font-medium">
                    Add <code className="bg-white px-1.5 py-0.5 rounded text-primary border border-pink-100 text-[10px]">
                      {typeof window !== "undefined" ? window.location.origin : ""}/onboarding
                    </code> to Valid OAuth Redirect URIs.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Loading overlay */}
      {loading && (
        <div className="fixed inset-0 bg-white/70 backdrop-blur-sm z-50 flex flex-col items-center justify-center space-y-4">
          <div className="w-12 h-12 border-4 border-pink-100 border-t-primary rounded-full animate-spin" />
          <p className="text-[11px] font-black text-primary uppercase tracking-widest animate-pulse">
            Connecting to Instagram...
          </p>
        </div>
      )}
    </div>
  );
}
