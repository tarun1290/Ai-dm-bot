"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Link2, ExternalLink, Copy, Plus, Trash2, Search, Filter,
  Loader2, BarChart3, MousePointer2, Eye, TrendingUp, Pause, Play,
  ChevronLeft, ChevronRight, X, CheckCircle2, ShoppingBag,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
  getTrackedLinks, getLinksOverviewStats, getLinksChartData,
  getTrackedLinkDetail, updateTrackedLink, deleteTrackedLink, createManualLink,
} from "@/app/dashboard/ai-actions";

const CATEGORY_COLORS = {
  food: { bg: "var(--success-light)", color: "var(--success)", label: "Food" },
  clothing: { bg: "#f3e8ff", color: "#7c3aed", label: "Clothing" },
  shoes: { bg: "#fff1f2", color: "#e11d48", label: "Shoes" },
  accessories: { bg: "#fce7f3", color: "#db2777", label: "Accessories" },
  electronics: { bg: "var(--info-light)", color: "var(--info)", label: "Electronics" },
  beauty: { bg: "#fdf2f8", color: "#ec4899", label: "Beauty" },
  home: { bg: "var(--warning-light)", color: "var(--warning)", label: "Home" },
  fitness: { bg: "#ccfbf1", color: "#0d9488", label: "Fitness" },
  other: { bg: "var(--surface-alt)", color: "var(--text-muted)", label: "Other" },
};

function StatCard({ label, value, sub, icon: Icon }) {
  return (
    <div className="p-6 rounded-[24px] flex flex-col justify-center" style={{ backgroundColor: "var(--card)", border: "1px solid var(--border)" }}>
      <div className="flex items-center gap-2 mb-3">
        <Icon size={14} style={{ color: "var(--text-placeholder)" }} />
        <p className="text-[11px] font-bold uppercase tracking-widest" style={{ color: "var(--text-placeholder)" }}>{label}</p>
      </div>
      <h3 className="text-3xl font-black" style={{ color: "var(--text-primary)" }}>{value}</h3>
      {sub && <p className="text-[12px] font-medium mt-1" style={{ color: "var(--text-muted)" }}>{sub}</p>}
    </div>
  );
}

function CategoryBadge({ category }) {
  const c = CATEGORY_COLORS[category] || CATEGORY_COLORS.other;
  return (
    <span className="inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider"
      style={{ backgroundColor: c.bg, color: c.color }}>
      {c.label}
    </span>
  );
}

function CreateLinkModal({ open, onClose, onCreated }) {
  const [url, setUrl] = useState("");
  const [name, setName] = useState("");
  const [category, setCategory] = useState("other");
  const [creating, setCreating] = useState(false);

  if (!open) return null;

  const handleCreate = async () => {
    if (!url) return toast.error("URL is required");
    setCreating(true);
    try {
      const res = await createManualLink({ url, productName: name, category });
      if (res.success) {
        toast.success("Link created!");
        onCreated(res);
        onClose();
        setUrl(""); setName(""); setCategory("other");
      } else {
        toast.error(res.error);
      }
    } catch (e) { toast.error(e.message); }
    finally { setCreating(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={onClose}>
      <div className="w-full max-w-md rounded-[28px] p-8 shadow-2xl" style={{ backgroundColor: "var(--card)" }} onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-black" style={{ color: "var(--text-primary)" }}>Create Tracked Link</h3>
          <button onClick={onClose}><X size={18} style={{ color: "var(--text-muted)" }} /></button>
        </div>
        <div className="space-y-4">
          <div>
            <label className="text-[11px] font-black uppercase tracking-widest mb-1.5 block" style={{ color: "var(--text-placeholder)" }}>Destination URL *</label>
            <input type="url" value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://..."
              className="w-full rounded-xl px-4 py-3 text-sm font-medium outline-none"
              style={{ backgroundColor: "var(--input-bg)", border: "1px solid var(--input-border)", color: "var(--input-text)" }} />
          </div>
          <div>
            <label className="text-[11px] font-black uppercase tracking-widest mb-1.5 block" style={{ color: "var(--text-placeholder)" }}>Label (optional)</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Product name or label"
              className="w-full rounded-xl px-4 py-3 text-sm font-medium outline-none"
              style={{ backgroundColor: "var(--input-bg)", border: "1px solid var(--input-border)", color: "var(--input-text)" }} />
          </div>
          <div>
            <label className="text-[11px] font-black uppercase tracking-widest mb-1.5 block" style={{ color: "var(--text-placeholder)" }}>Category</label>
            <select value={category} onChange={(e) => setCategory(e.target.value)}
              className="w-full rounded-xl px-4 py-3 text-sm font-medium outline-none"
              style={{ backgroundColor: "var(--input-bg)", border: "1px solid var(--input-border)", color: "var(--input-text)" }}>
              {Object.entries(CATEGORY_COLORS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
            </select>
          </div>
          <button onClick={handleCreate} disabled={creating}
            className="w-full py-3 rounded-2xl font-bold text-sm text-white flex items-center justify-center gap-2"
            style={{ background: "linear-gradient(to right, var(--primary), var(--primary-dark))" }}>
            {creating ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
            {creating ? "Creating..." : "Create Link"}
          </button>
        </div>
      </div>
    </div>
  );
}

function LinkDetailPanel({ linkId, onClose }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [customUrl, setCustomUrl] = useState("");
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    if (!linkId) return;
    setLoading(true);
    getTrackedLinkDetail(linkId).then((res) => {
      if (res.success) {
        setData(res);
        setCustomUrl(res.link.affiliateConfig?.userCustomUrl || "");
      }
      setLoading(false);
    });
  }, [linkId]);

  if (!linkId) return null;

  const handleOverride = async () => {
    const res = await updateTrackedLink(linkId, { customUrl });
    if (res.success) { toast.success("Link updated!"); setEditing(false); }
  };

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://engagr-dm.vercel.app";

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50" onClick={onClose}>
      <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-t-[28px] sm:rounded-[28px] p-8 shadow-2xl"
        style={{ backgroundColor: "var(--card)" }} onClick={(e) => e.stopPropagation()}>
        {loading ? (
          <div className="flex items-center justify-center py-20"><Loader2 size={24} className="animate-spin" style={{ color: "var(--primary)" }} /></div>
        ) : data?.link ? (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                {data.link.metadata?.productImageUrl ? (
                  <img src={data.link.metadata.productImageUrl} alt="" className="w-16 h-16 rounded-2xl object-cover" style={{ border: "1px solid var(--border)" }} />
                ) : (
                  <div className="w-16 h-16 rounded-2xl flex items-center justify-center" style={{ backgroundColor: "var(--surface-alt)" }}>
                    <ShoppingBag size={24} style={{ color: "var(--text-placeholder)" }} />
                  </div>
                )}
                <div>
                  <h3 className="text-lg font-black" style={{ color: "var(--text-primary)" }}>{data.link.metadata?.productName || "Link"}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <CategoryBadge category={data.link.metadata?.productCategory} />
                    {data.link.metadata?.confidence && (
                      <span className="text-[10px] font-bold" style={{ color: "var(--success)" }}>{Math.round(data.link.metadata.confidence * 100)}% confident</span>
                    )}
                  </div>
                </div>
              </div>
              <button onClick={onClose}><X size={18} style={{ color: "var(--text-muted)" }} /></button>
            </div>

            {/* URLs */}
            <div className="space-y-3 p-4 rounded-2xl" style={{ backgroundColor: "var(--surface-alt)" }}>
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-widest" style={{ color: "var(--text-placeholder)" }}>Tracked URL</span>
                <button onClick={() => { navigator.clipboard.writeText(`${appUrl}/go/${data.link.shortCode}`); toast.success("Copied!"); }}
                  className="flex items-center gap-1 text-[11px] font-bold" style={{ color: "var(--primary)" }}>
                  <Copy size={10} /> Copy
                </button>
              </div>
              <p className="text-sm font-mono" style={{ color: "var(--primary)" }}>{appUrl}/go/{data.link.shortCode}</p>
              <div className="pt-2 border-t" style={{ borderColor: "var(--border)" }}>
                <span className="text-[11px] font-bold uppercase tracking-widest" style={{ color: "var(--text-placeholder)" }}>Destination</span>
                <p className="text-sm truncate mt-1" style={{ color: "var(--text-muted)" }}>
                  {data.link.affiliateConfig?.overriddenByUser ? data.link.affiliateConfig.userCustomUrl : data.link.originalUrl}
                </p>
              </div>
              {!editing ? (
                <button onClick={() => setEditing(true)} className="text-[11px] font-bold" style={{ color: "var(--primary)" }}>
                  Override with your own link
                </button>
              ) : (
                <div className="flex gap-2 pt-2">
                  <input type="url" value={customUrl} onChange={(e) => setCustomUrl(e.target.value)} placeholder="Your custom URL"
                    className="flex-1 rounded-xl px-3 py-2 text-sm outline-none"
                    style={{ backgroundColor: "var(--input-bg)", border: "1px solid var(--input-border)", color: "var(--input-text)" }} />
                  <button onClick={handleOverride} className="px-3 py-2 rounded-xl text-[11px] font-bold text-white" style={{ backgroundColor: "var(--primary)" }}>Save</button>
                  <button onClick={() => setEditing(false)} className="px-3 py-2 rounded-xl text-[11px] font-bold" style={{ color: "var(--text-muted)" }}>Cancel</button>
                </div>
              )}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl text-center" style={{ backgroundColor: "var(--primary-light)" }}>
                <p className="text-3xl font-black" style={{ color: "var(--primary)" }}>{data.link.stats?.totalClicks || 0}</p>
                <p className="text-[11px] font-bold" style={{ color: "var(--primary)" }}>Total Clicks</p>
              </div>
              <div className="p-4 rounded-2xl text-center" style={{ backgroundColor: "var(--success-light)" }}>
                <p className="text-3xl font-black" style={{ color: "var(--success)" }}>{data.link.stats?.uniqueClicks || 0}</p>
                <p className="text-[11px] font-bold" style={{ color: "var(--success)" }}>Unique Clicks</p>
              </div>
            </div>

            {/* Source info */}
            {data.link.metadata?.reelPermalink && (
              <div className="text-[12px] space-y-1" style={{ color: "var(--text-muted)" }}>
                {data.link.metadata.reelOwnerUsername && <p>Reel by: <span className="font-bold">@{data.link.metadata.reelOwnerUsername}</span></p>}
                {data.link.metadata.senderUsername && <p>Shared by: <span className="font-bold">@{data.link.metadata.senderUsername}</span></p>}
                <p>Created: {new Date(data.link.createdAt).toLocaleDateString()}</p>
              </div>
            )}

            {/* Recent clicks */}
            {data.recentClicks?.length > 0 && (
              <div>
                <h4 className="text-[11px] font-black uppercase tracking-widest mb-3" style={{ color: "var(--text-placeholder)" }}>Recent Clicks</h4>
                <div className="space-y-1">
                  {data.recentClicks.slice(0, 10).map((click) => (
                    <div key={click._id} className="flex items-center justify-between py-2 px-3 rounded-xl text-[11px]"
                      style={{ backgroundColor: "var(--surface-alt)" }}>
                      <span style={{ color: "var(--text-muted)" }}>{click.country || "Unknown"} · {click.device}</span>
                      <span style={{ color: "var(--text-placeholder)" }}>{new Date(click.timestamp).toLocaleString()}</span>
                      {click.isUnique && <span className="font-bold" style={{ color: "var(--success)" }}>New</span>}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <p style={{ color: "var(--text-muted)" }}>Link not found</p>
        )}
      </div>
    </div>
  );
}

export default function LinksPage() {
  const [stats, setStats] = useState(null);
  const [links, setLinks] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [detailId, setDetailId] = useState(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    const [statsRes, linksRes] = await Promise.all([
      getLinksOverviewStats(),
      getTrackedLinks(null, { search, category: categoryFilter, status: statusFilter }, page),
    ]);
    if (statsRes.success) setStats(statsRes);
    if (linksRes.success) { setLinks(linksRes.links); setTotal(linksRes.total); }
    setLoading(false);
  }, [search, categoryFilter, statusFilter, page]);

  useEffect(() => { loadData(); }, [loadData]);

  const handleDelete = async (id) => {
    if (!confirm("Delete this link? All click data will be lost.")) return;
    const res = await deleteTrackedLink(id);
    if (res.success) { toast.success("Link deleted"); loadData(); }
  };

  const handleToggleStatus = async (id, current) => {
    const newStatus = current === "active" ? "paused" : "active";
    const res = await updateTrackedLink(id, { status: newStatus });
    if (res.success) { toast.success(`Link ${newStatus}`); loadData(); }
  };

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://engagr-dm.vercel.app";
  const totalPages = Math.ceil(total / 20);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black tracking-tight" style={{ color: "var(--text-primary)" }}>Tracked Links</h1>
          <p className="text-sm font-medium mt-1" style={{ color: "var(--text-muted)" }}>AI-detected product links and click analytics</p>
        </div>
        <button onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 px-5 py-3 rounded-2xl font-bold text-sm text-white"
          style={{ background: "linear-gradient(to right, var(--primary), var(--primary-dark))" }}>
          <Plus size={16} /> Create Link
        </button>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard icon={Link2} label="Total Links" value={stats.totalLinks} />
          <StatCard icon={MousePointer2} label="Total Clicks" value={stats.totalClicks} />
          <StatCard icon={TrendingUp} label="Clicks This Month" value={stats.clicksThisMonth} />
          <StatCard icon={Eye} label="Unique This Month" value={stats.uniqueThisMonth} />
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="flex-1 min-w-[200px] relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "var(--text-placeholder)" }} />
          <input type="text" value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search products..."
            className="w-full rounded-xl pl-9 pr-4 py-2.5 text-sm font-medium outline-none"
            style={{ backgroundColor: "var(--input-bg)", border: "1px solid var(--input-border)", color: "var(--input-text)" }} />
        </div>
        <select value={categoryFilter} onChange={(e) => { setCategoryFilter(e.target.value); setPage(1); }}
          className="rounded-xl px-4 py-2.5 text-sm font-medium outline-none"
          style={{ backgroundColor: "var(--input-bg)", border: "1px solid var(--input-border)", color: "var(--input-text)" }}>
          <option value="">All Categories</option>
          {Object.entries(CATEGORY_COLORS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
        </select>
        <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
          className="rounded-xl px-4 py-2.5 text-sm font-medium outline-none"
          style={{ backgroundColor: "var(--input-bg)", border: "1px solid var(--input-border)", color: "var(--input-text)" }}>
          <option value="">All Status</option>
          <option value="active">Active</option>
          <option value="paused">Paused</option>
        </select>
      </div>

      {/* Links table */}
      <div className="rounded-[28px] overflow-hidden" style={{ backgroundColor: "var(--card)", border: "1px solid var(--border)" }}>
        {loading ? (
          <div className="flex items-center justify-center py-20"><Loader2 size={24} className="animate-spin" style={{ color: "var(--primary)" }} /></div>
        ) : links.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center px-6">
            <div className="w-16 h-16 rounded-3xl flex items-center justify-center mb-6" style={{ backgroundColor: "var(--surface-alt)" }}>
              <Link2 size={28} style={{ color: "var(--text-placeholder)" }} />
            </div>
            <h3 className="text-lg font-black mb-2" style={{ color: "var(--text-primary)" }}>No tracked links yet</h3>
            <p className="text-sm max-w-xs mb-6" style={{ color: "var(--text-muted)" }}>
              Links are automatically created when AI detects a product in a shared reel. You can also create links manually.
            </p>
            <button onClick={() => setShowCreate(true)}
              className="px-6 py-3 rounded-2xl font-bold text-sm text-white"
              style={{ backgroundColor: "var(--primary)" }}>
              Create Manual Link
            </button>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr style={{ borderBottom: "1px solid var(--border)" }}>
                    <th className="text-left px-5 py-4 text-[10px] font-black uppercase tracking-widest" style={{ color: "var(--text-placeholder)" }}>Product</th>
                    <th className="text-left px-5 py-4 text-[10px] font-black uppercase tracking-widest" style={{ color: "var(--text-placeholder)" }}>Category</th>
                    <th className="text-left px-5 py-4 text-[10px] font-black uppercase tracking-widest" style={{ color: "var(--text-placeholder)" }}>Short URL</th>
                    <th className="text-right px-5 py-4 text-[10px] font-black uppercase tracking-widest" style={{ color: "var(--text-placeholder)" }}>Clicks</th>
                    <th className="text-right px-5 py-4 text-[10px] font-black uppercase tracking-widest" style={{ color: "var(--text-placeholder)" }}>Unique</th>
                    <th className="text-left px-5 py-4 text-[10px] font-black uppercase tracking-widest" style={{ color: "var(--text-placeholder)" }}>Last Click</th>
                    <th className="text-center px-5 py-4 text-[10px] font-black uppercase tracking-widest" style={{ color: "var(--text-placeholder)" }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {links.map((link) => (
                    <tr key={link._id} className="transition-colors hover:opacity-90" style={{ borderBottom: "1px solid var(--border)" }}>
                      <td className="px-5 py-4">
                        <button onClick={() => setDetailId(link._id)} className="flex items-center gap-3 text-left">
                          {link.metadata?.productImageUrl ? (
                            <img src={link.metadata.productImageUrl} alt="" className="w-10 h-10 rounded-xl object-cover flex-shrink-0" style={{ border: "1px solid var(--border)" }} />
                          ) : (
                            <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: "var(--surface-alt)" }}>
                              <ShoppingBag size={16} style={{ color: "var(--text-placeholder)" }} />
                            </div>
                          )}
                          <span className="text-sm font-bold truncate max-w-[160px]" style={{ color: "var(--text-primary)" }}>
                            {link.metadata?.productName || "Link"}
                          </span>
                        </button>
                      </td>
                      <td className="px-5 py-4"><CategoryBadge category={link.metadata?.productCategory} /></td>
                      <td className="px-5 py-4">
                        <button onClick={() => { navigator.clipboard.writeText(`${appUrl}/go/${link.shortCode}`); toast.success("Copied!"); }}
                          className="flex items-center gap-1.5 text-[12px] font-mono hover:opacity-70" style={{ color: "var(--primary)" }}>
                          <Copy size={10} /> /go/{link.shortCode}
                        </button>
                      </td>
                      <td className="px-5 py-4 text-right">
                        <span className="text-sm font-black" style={{ color: "var(--text-primary)" }}>{link.stats?.totalClicks || 0}</span>
                      </td>
                      <td className="px-5 py-4 text-right">
                        <span className="text-sm font-bold" style={{ color: "var(--text-muted)" }}>{link.stats?.uniqueClicks || 0}</span>
                      </td>
                      <td className="px-5 py-4">
                        <span className="text-[12px]" style={{ color: "var(--text-placeholder)" }}>
                          {link.stats?.lastClickedAt ? new Date(link.stats.lastClickedAt).toLocaleDateString() : "—"}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center justify-center gap-1">
                          <button onClick={() => handleToggleStatus(link._id, link.status)} className="p-1.5 rounded-lg hover:opacity-70"
                            title={link.status === "active" ? "Pause" : "Activate"}
                            style={{ color: link.status === "active" ? "var(--success)" : "var(--warning)" }}>
                            {link.status === "active" ? <Pause size={12} /> : <Play size={12} />}
                          </button>
                          <button onClick={() => setDetailId(link._id)} className="p-1.5 rounded-lg hover:opacity-70"
                            style={{ color: "var(--primary)" }} title="View details">
                            <BarChart3 size={12} />
                          </button>
                          <button onClick={() => handleDelete(link._id)} className="p-1.5 rounded-lg hover:opacity-70"
                            style={{ color: "var(--error)" }} title="Delete">
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-5 py-4" style={{ borderTop: "1px solid var(--border)" }}>
                <span className="text-[12px] font-medium" style={{ color: "var(--text-muted)" }}>
                  {total} links total · Page {page} of {totalPages}
                </span>
                <div className="flex gap-2">
                  <button onClick={() => setPage(Math.max(1, page - 1))} disabled={page === 1}
                    className="p-2 rounded-xl disabled:opacity-30" style={{ color: "var(--text-muted)" }}>
                    <ChevronLeft size={14} />
                  </button>
                  <button onClick={() => setPage(Math.min(totalPages, page + 1))} disabled={page === totalPages}
                    className="p-2 rounded-xl disabled:opacity-30" style={{ color: "var(--text-muted)" }}>
                    <ChevronRight size={14} />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      <CreateLinkModal open={showCreate} onClose={() => setShowCreate(false)} onCreated={() => loadData()} />
      <LinkDetailPanel linkId={detailId} onClose={() => setDetailId(null)} />
    </div>
  );
}
