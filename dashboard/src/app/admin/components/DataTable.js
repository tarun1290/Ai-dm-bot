"use client";

import { useState, useMemo } from "react";
import { Search, ChevronUp, ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";

/**
 * Generic sortable, searchable, paginated table.
 *
 * @param {{
 *   columns: Array<{ key: string, label: string, sortable?: boolean, render?: (row: any) => React.ReactNode, align?: 'left'|'center'|'right', width?: string }>,
 *   data: any[],
 *   searchPlaceholder?: string,
 *   searchKey?: string,
 *   pageSize?: number,
 *   emptyMessage?: string,
 *   headerActions?: React.ReactNode,
 * }} props
 */
export default function DataTable({ columns, data = [], searchPlaceholder = "Search...", searchKey, pageSize = 20, emptyMessage = "No data", headerActions }) {
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState(null);
  const [sortDir, setSortDir] = useState("asc");
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    let result = data;
    if (search && searchKey) {
      const q = search.toLowerCase();
      result = result.filter((row) => {
        const val = row[searchKey];
        return val && String(val).toLowerCase().includes(q);
      });
    }
    if (sortKey) {
      result = [...result].sort((a, b) => {
        const av = a[sortKey], bv = b[sortKey];
        if (av == null) return 1;
        if (bv == null) return -1;
        if (typeof av === "number") return sortDir === "asc" ? av - bv : bv - av;
        return sortDir === "asc" ? String(av).localeCompare(String(bv)) : String(bv).localeCompare(String(av));
      });
    }
    return result;
  }, [data, search, searchKey, sortKey, sortDir]);

  const totalPages = Math.ceil(filtered.length / pageSize);
  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize);

  const handleSort = (key) => {
    if (sortKey === key) {
      setSortDir(sortDir === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  };

  return (
    <div className="rounded-lg overflow-hidden"
      style={{ background: "#FFFFFF", border: "1px solid #E2E8F0", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
      {/* Toolbar */}
      <div className="flex items-center justify-between gap-4 px-5 py-3 border-b" style={{ borderColor: "#F1F5F9" }}>
        {searchKey ? (
          <div className="relative flex-1 max-w-xs">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "#94A3B8" }} />
            <input type="text" value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              placeholder={searchPlaceholder}
              className="w-full pl-9 pr-3 py-2 text-sm rounded-md outline-none"
              style={{ border: "1px solid #E2E8F0", color: "#0F172A" }} />
          </div>
        ) : <div />}
        {headerActions}
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr style={{ background: "#FAFAFA" }}>
              {columns.map((col) => (
                <th key={col.key}
                  className={`px-5 py-3 text-[11px] uppercase tracking-wider font-semibold whitespace-nowrap ${col.sortable ? "cursor-pointer select-none" : ""}`}
                  style={{ color: "#94A3B8", textAlign: col.align || "left", width: col.width }}
                  onClick={() => col.sortable && handleSort(col.key)}>
                  <span className="inline-flex items-center gap-1">
                    {col.label}
                    {col.sortable && sortKey === col.key && (
                      sortDir === "asc" ? <ChevronUp size={12} /> : <ChevronDown size={12} />
                    )}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paginated.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-5 py-12 text-center text-sm" style={{ color: "#94A3B8" }}>
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              paginated.map((row, i) => (
                <tr key={row._id || row.id || i} className="transition-colors"
                  style={{ borderTop: "1px solid #F1F5F9" }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = "#FAFAFA"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}>
                  {columns.map((col) => (
                    <td key={col.key} className="px-5 py-3" style={{ textAlign: col.align || "left", color: "#475569" }}>
                      {col.render ? col.render(row) : row[col.key] ?? "—"}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-5 py-3 border-t" style={{ borderColor: "#F1F5F9" }}>
          <span className="text-xs" style={{ color: "#94A3B8" }}>{filtered.length} results — Page {page} of {totalPages}</span>
          <div className="flex gap-1">
            <button onClick={() => setPage(Math.max(1, page - 1))} disabled={page === 1}
              className="p-1.5 rounded disabled:opacity-30" style={{ color: "#64748B" }}>
              <ChevronLeft size={14} />
            </button>
            <button onClick={() => setPage(Math.min(totalPages, page + 1))} disabled={page === totalPages}
              className="p-1.5 rounded disabled:opacity-30" style={{ color: "#64748B" }}>
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
