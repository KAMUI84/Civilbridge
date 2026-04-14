import { motion } from "framer-motion";

const MotionDiv = motion.div;

const PALETTE = ["#3b82f6", "#22c55e", "#f59e0b", "#a855f7", "#ef4444", "#06b6d4"];

function fmtRwf(n) {
  if (!n && n !== 0) return "—";
  return `RWF ${Number(n).toLocaleString()}`;
}

/**
 * CostBreakdownChart — horizontal animated bar chart.
 *
 * data: [{ label: string, value: number }]
 */
export default function CostBreakdownChart({ data = [], title = "Cost Breakdown" }) {
  if (data.length === 0) {
    return (
      <div style={{
        padding: 20, border: "1px solid rgba(255,255,255,0.07)",
        borderRadius: 14, background: "var(--color-surface, rgba(255,255,255,0.03))",
      }}>
        <div style={{ fontWeight: 700, fontSize: 14, color: "var(--color-text-primary, #fff)", marginBottom: 12 }}>
          {title}
        </div>
        <p style={{ color: "#6b7280", fontSize: 13, margin: 0 }}>No cost data available yet.</p>
      </div>
    );
  }

  const total = data.reduce((s, d) => s + (Number(d.value) || 0), 0);

  return (
    <div style={{
      padding: 20, border: "1px solid rgba(255,255,255,0.07)",
      borderRadius: 14, background: "var(--color-surface, rgba(255,255,255,0.03))",
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
        <span style={{ fontWeight: 700, fontSize: 14, color: "var(--color-text-primary, #fff)" }}>{title}</span>
        <span style={{ fontSize: 13, color: "#9ca3af" }}>Total: {fmtRwf(total)}</span>
      </div>

      <div style={{ display: "grid", gap: 14 }}>
        {data.map((item, idx) => {
          const pct = total > 0 ? (Number(item.value) / total) * 100 : 0;
          const color = PALETTE[idx % PALETTE.length];
          return (
            <div key={item.label ?? idx}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 6 }}>
                <span style={{ color: "#d1d5db", display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ width: 8, height: 8, borderRadius: "50%", background: color, display: "inline-block" }} />
                  {item.label}
                </span>
                <span style={{ color: "#9ca3af" }}>
                  {fmtRwf(item.value)} ({pct.toFixed(1)}%)
                </span>
              </div>
              <div style={{ height: 8, background: "rgba(255,255,255,0.06)", borderRadius: 999, overflow: "hidden" }}>
                <MotionDiv
                  initial={{ width: 0 }}
                  animate={{ width: `${pct}%` }}
                  transition={{ duration: 0.8, delay: idx * 0.08, ease: "easeOut" }}
                  style={{ height: "100%", background: color, borderRadius: 999 }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
