"use client";

import { useState, useEffect } from "react";
import { Brain, Link2, MousePointer2, Eye, TrendingUp, ShoppingBag, Globe, Smartphone, DollarSign, Loader2 } from "lucide-react";
import { adminGetAiAnalytics } from "@/app/admin/actions";

const CATEGORY_COLORS = {
  food: "#22c55e", clothing: "#7c3aed", shoes: "#e11d48", accessories: "#db2777",
  electronics: "#3b82f6", beauty: "#ec4899", home: "#f59e0b", fitness: "#0d9488", other: "#6b7280",
};

function MiniStatCard({ icon: Icon, label, value, sub, color }) {
  return (
    <div className="rounded-[16px] p-5 space-y-2" style={{ backgroundColor: "var(--admin-card)", border: "1px solid var(--admin-border)" }}>
      <Icon size={16} style={{ color: color || "var(--admin-text-muted)" }} />
      <p className="text-2xl font-black" style={{ color: "var(--admin-text-primary)" }}>{value}</p>
      <p className="text-[11px] font-semibold" style={{ color: "var(--admin-text-muted)" }}>{label}</p>
      {sub && <p className="text-[10px]" style={{ color: "var(--admin-text-muted)" }}>{sub}</p>}
    </div>
  );
}

export default function AdminAiAnalytics() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminGetAiAnalytics()
      .then((res) => { if (!res.error) setData(res); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 size={24} className="animate-spin" style={{ color: "var(--primary)" }} />
      </div>
    );
  }

  if (!data) return null;

  const maxCatCount = Math.max(...(data.categoryBreakdown?.map(c => c.count) || [1]));

  return (
    <div className="space-y-8">
      {/* Stats strip */}
      <div>
        <h2 className="text-xs font-black uppercase tracking-widest mb-5" style={{ color: "var(--admin-text-muted)" }}>
          AI & Link Analytics
        </h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <MiniStatCard icon={Link2} label="Total Links" value={data.totalLinks} color="#3b82f6" />
          <MiniStatCard icon={MousePointer2} label="Total Clicks" value={data.totalClicks} sub={`${data.totalUnique} unique`} color="#22c55e" />
          <MiniStatCard icon={Eye} label="Clicks Today" value={data.clicksToday} color="#f59e0b" />
          <MiniStatCard icon={Brain} label="Detections" value={data.detectionsThisMonth} sub={`${data.successRate}% success rate`} color="#7c3aed" />
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
          <MiniStatCard icon={TrendingUp} label="AI Cost This Month" value={`$${data.aiCostThisMonth}`} color="#ef4444" />
          <MiniStatCard icon={MousePointer2} label="Clicks This Month" value={data.clicksThisMonth} color="#3b82f6" />
          <MiniStatCard icon={DollarSign} label="Est. Affiliate Revenue" value={`$${data.estimatedRevenue}`}
            sub={`If 3% commission at avg $25`} color="#22c55e" />
        </div>
      </div>

      {/* Category breakdown */}
      {data.categoryBreakdown?.length > 0 && (
        <div>
          <h3 className="text-xs font-black uppercase tracking-widest mb-4" style={{ color: "var(--admin-text-muted)" }}>
            Product Categories Detected
          </h3>
          <div className="space-y-2">
            {data.categoryBreakdown.map((cat) => (
              <div key={cat._id} className="flex items-center gap-3">
                <span className="text-[11px] font-bold uppercase w-20 text-right" style={{ color: CATEGORY_COLORS[cat._id] || "#6b7280" }}>
                  {cat._id || "other"}
                </span>
                <div className="flex-1 h-6 rounded-full overflow-hidden" style={{ backgroundColor: "var(--admin-surface-alt)" }}>
                  <div className="h-full rounded-full transition-all" style={{
                    width: `${(cat.count / maxCatCount) * 100}%`,
                    backgroundColor: CATEGORY_COLORS[cat._id] || "#6b7280",
                    opacity: 0.7,
                  }} />
                </div>
                <span className="text-[12px] font-black w-10" style={{ color: "var(--admin-text-primary)" }}>{cat.count}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Top products */}
      {data.topProducts?.length > 0 && (
        <div>
          <h3 className="text-xs font-black uppercase tracking-widest mb-4" style={{ color: "var(--admin-text-muted)" }}>
            Top Detected Products
          </h3>
          <div className="rounded-[16px] overflow-hidden" style={{ border: "1px solid var(--admin-border)" }}>
            <table className="w-full">
              <thead>
                <tr style={{ backgroundColor: "var(--admin-surface-alt)" }}>
                  <th className="text-left px-4 py-3 text-[10px] font-black uppercase tracking-widest" style={{ color: "var(--admin-text-muted)" }}>Product</th>
                  <th className="text-left px-4 py-3 text-[10px] font-black uppercase tracking-widest" style={{ color: "var(--admin-text-muted)" }}>Category</th>
                  <th className="text-right px-4 py-3 text-[10px] font-black uppercase tracking-widest" style={{ color: "var(--admin-text-muted)" }}>Detected</th>
                  <th className="text-right px-4 py-3 text-[10px] font-black uppercase tracking-widest" style={{ color: "var(--admin-text-muted)" }}>Users</th>
                </tr>
              </thead>
              <tbody>
                {data.topProducts.slice(0, 10).map((p, i) => (
                  <tr key={i} style={{ borderTop: "1px solid var(--admin-border)" }}>
                    <td className="px-4 py-3 text-[12px] font-bold" style={{ color: "var(--admin-text-primary)" }}>{p._id}</td>
                    <td className="px-4 py-3">
                      <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full"
                        style={{ color: CATEGORY_COLORS[p.category] || "#6b7280", backgroundColor: `${CATEGORY_COLORS[p.category] || "#6b7280"}15` }}>
                        {p.category || "other"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right text-[12px] font-black" style={{ color: "var(--admin-text-primary)" }}>{p.count}</td>
                    <td className="px-4 py-3 text-right text-[12px]" style={{ color: "var(--admin-text-muted)" }}>{p.userCount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Click geography + Device breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {data.clickGeo?.length > 0 && (
          <div>
            <h3 className="text-xs font-black uppercase tracking-widest mb-4" style={{ color: "var(--admin-text-muted)" }}>
              Clicks by Country
            </h3>
            <div className="rounded-[16px] p-5 space-y-2" style={{ backgroundColor: "var(--admin-card)", border: "1px solid var(--admin-border)" }}>
              {data.clickGeo.map((g) => (
                <div key={g._id} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Globe size={12} style={{ color: "var(--admin-text-muted)" }} />
                    <span className="text-[12px] font-bold" style={{ color: "var(--admin-text-primary)" }}>{g._id}</span>
                  </div>
                  <span className="text-[12px] font-black" style={{ color: "var(--primary)" }}>{g.clicks}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {data.deviceBreakdown?.length > 0 && (
          <div>
            <h3 className="text-xs font-black uppercase tracking-widest mb-4" style={{ color: "var(--admin-text-muted)" }}>
              Clicks by Device
            </h3>
            <div className="rounded-[16px] p-5 space-y-3" style={{ backgroundColor: "var(--admin-card)", border: "1px solid var(--admin-border)" }}>
              {data.deviceBreakdown.map((d) => {
                const total = data.deviceBreakdown.reduce((s, x) => s + x.clicks, 0);
                const pct = total > 0 ? Math.round((d.clicks / total) * 100) : 0;
                return (
                  <div key={d._id} className="flex items-center gap-3">
                    <Smartphone size={12} style={{ color: "var(--admin-text-muted)" }} />
                    <span className="text-[12px] font-bold w-16" style={{ color: "var(--admin-text-primary)" }}>{d._id || "unknown"}</span>
                    <div className="flex-1 h-4 rounded-full overflow-hidden" style={{ backgroundColor: "var(--admin-surface-alt)" }}>
                      <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: "var(--primary)" }} />
                    </div>
                    <span className="text-[11px] font-black w-12 text-right" style={{ color: "var(--admin-text-primary)" }}>{pct}%</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* AI Detection Log */}
      {data.recentDetections?.length > 0 && (
        <div>
          <h3 className="text-xs font-black uppercase tracking-widest mb-4" style={{ color: "var(--admin-text-muted)" }}>
            Recent AI Detections
          </h3>
          <div className="rounded-[16px] overflow-hidden" style={{ border: "1px solid var(--admin-border)" }}>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr style={{ backgroundColor: "var(--admin-surface-alt)" }}>
                    <th className="text-left px-4 py-3 text-[10px] font-black uppercase tracking-widest" style={{ color: "var(--admin-text-muted)" }}>Date</th>
                    <th className="text-left px-4 py-3 text-[10px] font-black uppercase tracking-widest" style={{ color: "var(--admin-text-muted)" }}>Product</th>
                    <th className="text-left px-4 py-3 text-[10px] font-black uppercase tracking-widest" style={{ color: "var(--admin-text-muted)" }}>Status</th>
                    <th className="text-right px-4 py-3 text-[10px] font-black uppercase tracking-widest" style={{ color: "var(--admin-text-muted)" }}>Time</th>
                  </tr>
                </thead>
                <tbody>
                  {data.recentDetections.map((d) => (
                    <tr key={d._id} style={{ borderTop: "1px solid var(--admin-border)" }}>
                      <td className="px-4 py-3 text-[11px]" style={{ color: "var(--admin-text-muted)" }}>
                        {new Date(d.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3 text-[12px] font-bold" style={{ color: "var(--admin-text-primary)" }}>
                        {d.detectedProducts?.[0]?.name || "—"}
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full"
                          style={{
                            backgroundColor: d.status === "success" ? "var(--success-light)" : "var(--error-light)",
                            color: d.status === "success" ? "var(--success)" : "var(--error)",
                          }}>
                          {d.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right text-[11px]" style={{ color: "var(--admin-text-muted)" }}>
                        {d.processingTimeMs ? `${d.processingTimeMs}ms` : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Per-user AI stats */}
      {data.userAiStats?.length > 0 && (
        <div>
          <h3 className="text-xs font-black uppercase tracking-widest mb-4" style={{ color: "var(--admin-text-muted)" }}>
            AI Users Performance
          </h3>
          <div className="rounded-[16px] overflow-hidden" style={{ border: "1px solid var(--admin-border)" }}>
            <table className="w-full">
              <thead>
                <tr style={{ backgroundColor: "var(--admin-surface-alt)" }}>
                  <th className="text-left px-4 py-3 text-[10px] font-black uppercase tracking-widest" style={{ color: "var(--admin-text-muted)" }}>User</th>
                  <th className="text-right px-4 py-3 text-[10px] font-black uppercase tracking-widest" style={{ color: "var(--admin-text-muted)" }}>Links</th>
                  <th className="text-right px-4 py-3 text-[10px] font-black uppercase tracking-widest" style={{ color: "var(--admin-text-muted)" }}>Clicks</th>
                  <th className="text-right px-4 py-3 text-[10px] font-black uppercase tracking-widest" style={{ color: "var(--admin-text-muted)" }}>Detections</th>
                  <th className="text-right px-4 py-3 text-[10px] font-black uppercase tracking-widest" style={{ color: "var(--admin-text-muted)" }}>Cost</th>
                </tr>
              </thead>
              <tbody>
                {data.userAiStats.map((u) => (
                  <tr key={u.userId} style={{ borderTop: "1px solid var(--admin-border)" }}>
                    <td className="px-4 py-3 text-[12px] font-bold" style={{ color: "var(--admin-text-primary)" }}>
                      {u.username ? `@${u.username}` : u.email || u.userId}
                    </td>
                    <td className="px-4 py-3 text-right text-[12px] font-black" style={{ color: "var(--admin-text-primary)" }}>{u.links}</td>
                    <td className="px-4 py-3 text-right text-[12px] font-black" style={{ color: "var(--primary)" }}>{u.clicks}</td>
                    <td className="px-4 py-3 text-right text-[12px]" style={{ color: "var(--admin-text-muted)" }}>{u.detections}</td>
                    <td className="px-4 py-3 text-right text-[12px]" style={{ color: "var(--admin-text-muted)" }}>${(u.cost || 0).toFixed(3)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
