"use client";

import { TrendingUp, TrendingDown } from "lucide-react";

/**
 * @param {{ label: string, value: string|number, trend?: number, trendDirection?: 'up'|'down', icon?: any, format?: 'number'|'percentage'|'currency' }} props
 */
export default function StatCard({ label, value, trend, trendDirection, icon: Icon, format = "number" }) {
  const formattedValue = format === "currency"
    ? `$${Number(value).toFixed(2)}`
    : format === "percentage"
      ? `${value}%`
      : typeof value === "number" ? value.toLocaleString() : value;

  const trendColor = trendDirection === "down" ? "#DC2626" : "#059669";
  const TrendIcon = trendDirection === "down" ? TrendingDown : TrendingUp;

  return (
    <div className="rounded-lg p-5 transition-shadow hover:shadow-md"
      style={{ background: "#FFFFFF", border: "1px solid #E2E8F0", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
      <div className="flex items-start justify-between mb-3">
        <p className="text-sm" style={{ color: "#64748B" }}>{label}</p>
        {Icon && (
          <div className="w-8 h-8 rounded-md flex items-center justify-center" style={{ background: "#F8FAFC" }}>
            <Icon size={16} style={{ color: "#94A3B8" }} />
          </div>
        )}
      </div>
      <p className="text-2xl font-bold" style={{ color: "#0F172A" }}>{formattedValue}</p>
      {trend !== undefined && trend !== null && (
        <div className="flex items-center gap-1 mt-2">
          <TrendIcon size={12} style={{ color: trendColor }} />
          <span className="text-xs font-medium" style={{ color: trendColor }}>
            {trend > 0 ? "+" : ""}{trend} this month
          </span>
        </div>
      )}
    </div>
  );
}
