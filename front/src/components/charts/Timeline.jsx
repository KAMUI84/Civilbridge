import { motion } from "framer-motion";

const MotionDiv = motion.div;

const STATUS_COLOR = {
  COMPLETED:   { bg: "#22c55e", border: "#16a34a", label: "Completed" },
  IN_PROGRESS: { bg: "#3b82f6", border: "#2563eb", label: "In progress" },
  PENDING:     { bg: "transparent", border: "#374151", label: "Pending" },
  OVERDUE:     { bg: "#ef4444", border: "#dc2626", label: "Overdue" },
};

function fmtDate(iso) {
  if (!iso) return null;
  return new Date(iso).toLocaleDateString("en-RW", { year: "numeric", month: "short", day: "numeric" });
}

/**
 * Timeline — animated vertical milestone list.
 *
 * items: [{ title, description, status, dueDate, completedAt }]
 */
export default function Timeline({ items = [], title = "Project Timeline" }) {
  if (items.length === 0) {
    return (
      <div style={{
        padding: 20, border: "1px solid rgba(255,255,255,0.07)",
        borderRadius: 14, background: "var(--color-surface, rgba(255,255,255,0.03))",
      }}>
        <div style={{ fontWeight: 700, fontSize: 14, color: "var(--color-text-primary, #fff)", marginBottom: 12 }}>
          {title}
        </div>
        <p style={{ color: "#6b7280", fontSize: 13, margin: 0 }}>No milestones yet.</p>
      </div>
    );
  }

  return (
    <div style={{
      padding: 20, border: "1px solid rgba(255,255,255,0.07)",
      borderRadius: 14, background: "var(--color-surface, rgba(255,255,255,0.03))",
    }}>
      <div style={{ fontWeight: 700, fontSize: 14, color: "var(--color-text-primary, #fff)", marginBottom: 20 }}>
        {title}
      </div>

      <div style={{ position: "relative", paddingLeft: 28 }}>
        {/* Vertical line */}
        <div style={{
          position: "absolute", left: 7, top: 4, bottom: 4,
          width: 2, background: "rgba(255,255,255,0.07)", borderRadius: 2,
        }} />

        {items.map((item, idx) => {
          const s = STATUS_COLOR[item.status] ?? STATUS_COLOR.PENDING;
          const date = item.completedAt ? fmtDate(item.completedAt) : fmtDate(item.dueDate);
          return (
            <MotionDiv
              key={idx}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.07, duration: 0.35, ease: "easeOut" }}
              style={{ position: "relative", marginBottom: idx < items.length - 1 ? 24 : 0 }}
            >
              {/* Dot */}
              <div style={{
                position: "absolute", left: -24, top: 2,
                width: 14, height: 14, borderRadius: "50%",
                background: s.bg, border: `2px solid ${s.border}`,
                boxShadow: s.bg !== "transparent" ? `0 0 8px ${s.bg}50` : "none",
              }} />

              <div style={{ fontSize: 14, fontWeight: 600, color: "var(--color-text-primary, #fff)", marginBottom: 2 }}>
                {item.title}
              </div>
              {item.description && (
                <div style={{ fontSize: 12, color: "#9ca3af", marginBottom: 4 }}>{item.description}</div>
              )}
              <div style={{ display: "flex", gap: 10, fontSize: 11, color: "#6b7280" }}>
                <span style={{ color: s.border, fontWeight: 600 }}>{s.label}</span>
                {date && <span>{date}</span>}
              </div>
            </MotionDiv>
          );
        })}
      </div>
    </div>
  );
}
