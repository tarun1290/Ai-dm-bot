import { ShieldCheck, KeyRound, AlertCircle } from "lucide-react";
import { adminLogin } from "./actions";

export default async function AdminLoginPage({ searchParams }) {
  const params = await searchParams;
  const hasError = params?.error === "1";

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <div className="w-full max-w-sm space-y-8">

        <div className="text-center space-y-3">
          <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-lg mx-auto border border-slate-200">
            <ShieldCheck className="text-primary" size={30} />
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Admin Access</h1>
          <p className="text-slate-500 text-sm">Enter your admin key to continue</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-[24px] p-8 space-y-5 shadow-sm">
          {hasError && (
            <div className="flex items-center gap-2 bg-rose-50 border border-rose-200 text-rose-600 rounded-xl px-4 py-3 text-sm font-medium">
              <AlertCircle size={16} />
              Invalid admin key. Try again.
            </div>
          )}

          <form action={adminLogin} className="space-y-4">
            <div className="relative">
              <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input
                type="password"
                name="key"
                placeholder="Enter admin key"
                required
                autoFocus
                className="w-full bg-slate-50 border border-slate-200 text-slate-900 placeholder:text-slate-400 rounded-xl pl-11 pr-4 py-3.5 text-sm font-medium focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
              />
            </div>
            <button
              type="submit"
              className="w-full py-3.5 bg-gradient-to-r from-primary to-pink-600 text-white rounded-xl font-bold text-sm hover:opacity-90 transition-all shadow-lg shadow-pink-100"
            >
              Access Dashboard
            </button>
          </form>
        </div>

        <p className="text-center text-[11px] text-slate-400 uppercase tracking-widest font-bold">
          Engagr · Admin Panel
        </p>
      </div>
    </div>
  );
}
