const STYLES = {
  live: { bg: "#ECFDF5", color: "#059669", border: "#A7F3D0", label: "Live" },
  disabled: { bg: "#FFFBEB", color: "#D97706", border: "#FDE68A", label: "Disabled" },
  planned: { bg: "#F8FAFC", color: "#64748B", border: "#E2E8F0", label: "Planned" },
};

/**
 * @param {{ status: 'live' | 'disabled' | 'planned' }} props
 */
export default function StatusBadge({ status }) {
  const s = STYLES[status] || STYLES.planned;
  return (
    <span className="inline-flex items-center text-xs font-medium px-2.5 py-0.5 rounded-full"
      style={{ background: s.bg, color: s.color, border: `1px solid ${s.border}` }}>
      {s.label}
    </span>
  );
}
