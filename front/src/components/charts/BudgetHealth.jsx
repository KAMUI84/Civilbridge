import { motion } from "framer-motion";

const MotionDiv = motion.div;

/**
 * BudgetHealth — animated progress bar with colour-coded health zones.
 * @param {number}  percent  0–100
 * @param {string}  label    optional override for bottom label
 * @param {boolean} compact  smaller variant for tight spaces
 */
export default function BudgetHealth({ percent = 0, label, compact = false }) {
  const clamp  = Math.max(0, Math.min(100, percent));
  const color  = clamp >= 70 ? "#22c55e" : clamp >= 40 ? "#f59e0b" : "#ef4444";
  const status = clamp >= 70 ? "On track"  : clamp >= 40 ? "Needs attention" : "At risk";

  return (
    <div style={{
      padding: compact ? "12px 14px" : 20,
      border: "1px solid rgba(255,255,255,0.07)",
      borderRadius: 14,
      background: "var(--color-surface, rgba(255,255,255,0.03))",
    }}>
      {!compact && (
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
          <span style={{ fontWeight: 700, fontSize: 14, color: "var(--color-text-primary, #fff)" }}>
            Budget Health
          </span>
          <span style={{ fontWeight: 800, fontSize: 20, color }}>{clamp}%</span>
        </div>
      )}

      {/* Track */}
      <div style={{ height: compact ? 6 : 10, background: "rgba(255,255,255,0.08)", borderRadius: 999, overflow: "hidden" }}>
        <MotionDiv
          initial={{ width: 0 }}
          animate={{ width: `${clamp}%` }}
          transition={{ duration: 1, ease: "easeOut" }}
          style={{ height: "100%", background: color, borderRadius: 999 }}
        />
      </div>

      <div style={{ marginTop: 8, display: "flex", justifyContent: "space-between", fontSize: 12, color: "#9ca3af" }}>
        <span>{label ?? status}</span>
        {compact && <span style={{ color, fontWeight: 700 }}>{clamp}%</span>}
      </div>

      {/* Zone labels */}
      {!compact && (
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 12, fontSize: 11, color: "#6b7280" }}>
          <span style={{ color: "#ef4444" }}>At risk</span>
          <span style={{ color: "#f59e0b" }}>Attention</span>
          <span style={{ color: "#22c55e" }}>On track</span>
        </div>
      )}
    </div>
  );
}
