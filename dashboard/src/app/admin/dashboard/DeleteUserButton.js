"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { deleteUser } from "@/app/admin/actions";

export default function DeleteUserButton({ userId }) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleDelete = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await deleteUser(userId);
      if (result?.success) {
        router.refresh();
      } else {
        setError(result?.error || "Delete failed");
        setLoading(false);
        setConfirming(false);
      }
    } catch (err) {
      setError(err.message);
      setLoading(false);
      setConfirming(false);
    }
  };

  if (error) {
    return (
      <span className="text-[10px] text-rose-500 font-medium">{error}</span>
    );
  }

  if (!confirming) {
    return (
      <button
        onClick={() => setConfirming(true)}
        className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-all"
        title="Delete user"
      >
        <Trash2 size={13} />
      </button>
    );
  }

  return (
    <div className="flex items-center gap-1.5">
      <span className="text-[10px] text-rose-500 font-bold whitespace-nowrap">Delete?</span>
      <button
        onClick={handleDelete}
        disabled={loading}
        className="px-2 py-0.5 bg-rose-50 text-rose-600 border border-rose-200 rounded text-[10px] font-bold hover:bg-rose-100 transition-all disabled:opacity-60"
      >
        {loading ? "..." : "Yes"}
      </button>
      <button
        onClick={() => setConfirming(false)}
        disabled={loading}
        className="px-2 py-0.5 bg-white text-slate-500 border border-slate-200 rounded text-[10px] font-bold hover:bg-slate-50 transition-all disabled:opacity-40"
      >
        No
      </button>
    </div>
  );
}
