"use client";

import { usePathname } from "next/navigation";
import { ChevronRight } from "lucide-react";
import { SIDEBAR_SECTIONS } from "./sidebarConfig";

function getPageTitle(pathname) {
  for (const section of SIDEBAR_SECTIONS) {
    for (const item of section.items) {
      if (pathname === item.href || (item.href !== "/admin/dashboard" && pathname?.startsWith(item.href))) {
        return item.label;
      }
    }
  }
  return "Dashboard";
}

export default function AdminTopBar() {
  const pathname = usePathname();
  const pageTitle = getPageTitle(pathname);

  return (
    <header className="sticky top-0 z-30 h-14 flex items-center justify-between px-6 border-b"
      style={{ background: "#FFFFFF", borderColor: "#E2E8F0" }}>
      {/* Breadcrumb */}
      <div className="flex items-center gap-1.5 text-sm">
        <span style={{ color: "#94A3B8" }}>Admin</span>
        <ChevronRight size={14} style={{ color: "#CBD5E1" }} />
        <span className="font-medium" style={{ color: "#0F172A" }}>{pageTitle}</span>
      </div>

      {/* Admin info */}
      <div className="flex items-center gap-3">
        <span className="text-xs font-medium hidden sm:inline" style={{ color: "#64748B" }}>admin</span>
        <div className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold"
          style={{ background: "#EEF2FF", color: "#4338CA" }}>
          A
        </div>
      </div>
    </header>
  );
}
