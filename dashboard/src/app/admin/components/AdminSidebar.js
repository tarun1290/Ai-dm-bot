"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { ShieldCheck, Menu, X } from "lucide-react";
import { useState } from "react";
import { SIDEBAR_SECTIONS, STATUS_DOT_COLORS } from "./sidebarConfig";

function SidebarContent({ pathname }) {
  return (
    <>
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-5 border-b" style={{ borderColor: "#E2E8F0" }}>
        <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "#4338CA" }}>
          <ShieldCheck size={16} color="#fff" />
        </div>
        <div className="flex items-center gap-2">
          <span className="text-base font-bold" style={{ color: "#0F172A", fontFamily: "var(--font-inter)" }}>Engagr</span>
          <span className="text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded"
            style={{ background: "#EEF2FF", color: "#4338CA" }}>Admin</span>
        </div>
      </div>

      {/* Nav sections */}
      <nav className="flex-1 overflow-y-auto py-3 px-3">
        {SIDEBAR_SECTIONS.map((section) => (
          <div key={section.label} className="mb-1">
            <p className="text-[10px] uppercase tracking-[0.15em] font-semibold mt-5 mb-2 px-3"
              style={{ color: "#94A3B8" }}>{section.label}</p>
            {section.items.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href || (item.href !== "/admin/dashboard" && pathname?.startsWith(item.href));
              return (
                <Link key={item.id} href={item.href}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-md text-[13px] transition-colors relative"
                  style={{
                    background: isActive ? "#EEF2FF" : "transparent",
                    color: isActive ? "#4338CA" : "#475569",
                    fontWeight: isActive ? 500 : 400,
                    borderLeft: isActive ? "3px solid #4338CA" : "3px solid transparent",
                  }}
                  onMouseEnter={(e) => { if (!isActive) e.currentTarget.style.background = "#F8FAFC"; }}
                  onMouseLeave={(e) => { if (!isActive) e.currentTarget.style.background = "transparent"; }}
                >
                  <Icon size={16} style={{ color: isActive ? "#4338CA" : "#64748B" }} />
                  <span className="flex-1 truncate">{item.label}</span>
                  {item.status && (
                    <span className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                      style={{ background: STATUS_DOT_COLORS[item.status] }} />
                  )}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>
    </>
  );
}

export default function AdminSidebar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex flex-col fixed left-0 top-0 bottom-0 w-60 border-r z-40"
        style={{ background: "#FFFFFF", borderColor: "#E2E8F0" }}>
        <SidebarContent pathname={pathname} />
      </aside>

      {/* Mobile hamburger */}
      <button className="lg:hidden fixed top-3.5 left-4 z-50 p-2 rounded-lg"
        style={{ background: "#fff", border: "1px solid #E2E8F0" }}
        onClick={() => setMobileOpen(true)} aria-label="Menu">
        <Menu size={18} style={{ color: "#475569" }} />
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/20" onClick={() => setMobileOpen(false)} />
          <aside className="relative w-60 h-full flex flex-col shadow-xl" style={{ background: "#FFFFFF" }}>
            <button className="absolute top-4 right-4 p-1" onClick={() => setMobileOpen(false)}>
              <X size={16} style={{ color: "#94A3B8" }} />
            </button>
            <SidebarContent pathname={pathname} />
          </aside>
        </div>
      )}
    </>
  );
}
