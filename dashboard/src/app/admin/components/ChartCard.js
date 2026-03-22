"use client";

import { BarChart3 } from "lucide-react";

/**
 * @param {{ title: string, children: React.ReactNode, isEmpty?: boolean, emptyMessage?: string, emptySubtext?: string }} props
 */
export default function ChartCard({ title, children, isEmpty = false, emptyMessage = "No data yet", emptySubtext = "Data will appear here once events are recorded." }) {
  return (
    <div className="rounded-lg overflow-hidden"
      style={{ background: "#FFFFFF", border: "1px solid #E2E8F0", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
      <div className="px-5 py-4 border-b" style={{ borderColor: "#F1F5F9" }}>
        <h3 className="text-sm font-semibold" style={{ color: "#0F172A" }}>{title}</h3>
      </div>
      <div style={{ height: 280 }}>
        {isEmpty ? (
          <div className="flex flex-col items-center justify-center h-full text-center px-6">
            <div className="w-16 h-16 rounded-xl flex items-center justify-center mb-4 border-2 border-dashed"
              style={{ borderColor: "#E2E8F0" }}>
              <BarChart3 size={24} style={{ color: "#CBD5E1" }} />
            </div>
            <p className="text-sm font-medium mb-1" style={{ color: "#64748B" }}>{emptyMessage}</p>
            <p className="text-xs" style={{ color: "#94A3B8" }}>{emptySubtext}</p>
          </div>
        ) : (
          <div className="p-4 h-full">{children}</div>
        )}
      </div>
    </div>
  );
}
