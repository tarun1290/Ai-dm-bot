const STYLES = {
  early_access: { bg: "#F0FDFA", color: "#0F766E", border: "#99F6E4", label: "Early Access" },
  trial: { bg: "#F0FDFA", color: "#0F766E", border: "#99F6E4", label: "Trial" },
  silver: { bg: "#F8FAFC", color: "#475569", border: "#E2E8F0", label: "Silver" },
  gold: { bg: "#FFFBEB", color: "#B45309", border: "#FDE68A", label: "Gold" },
  platinum: { bg: "#EEF2FF", color: "#4338CA", border: "#C7D2FE", label: "Platinum" },
};

/**
 * @param {{ plan: 'early_access' | 'trial' | 'silver' | 'gold' | 'platinum' }} props
 */
export default function PlanBadge({ plan }) {
  const s = STYLES[plan] || STYLES.early_access;
  return (
    <span className="inline-flex items-center text-[11px] font-medium px-2 py-0.5 rounded-full"
      style={{ background: s.bg, color: s.color, border: `1px solid ${s.border}` }}>
      {s.label}
    </span>
  );
}
