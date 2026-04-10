import { Link } from "react-router-dom";

/**
 * PlanCard — renders a single plan from the real /api/plans response shape.
 * Props:
 *   plan — Plan record (with assets, title, category, builtAreaM2, estimatedCostMin/Max, status, etc.)
 */
export default function PlanCard({ plan = {} }) {
  const cover = plan.assets?.[0]?.assetUrl
    ?? "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=2000&q=80";

  const currency = plan.currency ?? "RWF";
  const hasPrice = plan.estimatedCostMin != null && plan.estimatedCostMax != null;
  const priceLabel = hasPrice
    ? `${currency} ${Number(plan.estimatedCostMin).toLocaleString()} – ${Number(plan.estimatedCostMax).toLocaleString()}`
    : "Cost on request";

  const isApproved = plan.status === "APPROVED";

  return (
    <div
      style={{
        border: "1px solid var(--color-border, #e5e7eb)",
        borderRadius: 12,
        overflow: "hidden",
        background: "var(--color-surface, #fff)",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Cover image */}
      <div
        style={{
          height: 180,
          backgroundImage: `url("${cover}")`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundColor: "#1a1a1a",
        }}
      />

      <div style={{ padding: 16, flex: 1, display: "flex", flexDirection: "column", gap: 8 }}>
        {/* Title + price */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
          <div style={{ fontWeight: 700, fontSize: 15, color: "var(--color-text-primary, #111)", flex: 1 }}>
            {plan.title}
          </div>
          <div style={{ fontSize: 12, fontWeight: 600, color: "#3b82f6", whiteSpace: "nowrap" }}>
            {priceLabel}
          </div>
        </div>

        {/* Chips */}
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {plan.category && (
            <span style={{ fontSize: 11, padding: "2px 8px", borderRadius: 20, background: "var(--color-bg-subtle, #f3f4f6)", color: "var(--color-text-secondary, #6b7280)" }}>
              {plan.category}
            </span>
          )}
          {plan.floors != null && (
            <span style={{ fontSize: 11, padding: "2px 8px", borderRadius: 20, background: "var(--color-bg-subtle, #f3f4f6)", color: "var(--color-text-secondary, #6b7280)" }}>
              {plan.floors} floor{plan.floors !== 1 ? "s" : ""}
            </span>
          )}
          {plan.builtAreaM2 != null && (
            <span style={{ fontSize: 11, padding: "2px 8px", borderRadius: 20, background: "var(--color-bg-subtle, #f3f4f6)", color: "var(--color-text-secondary, #6b7280)" }}>
              {plan.builtAreaM2} m²
            </span>
          )}
          {plan.tier && (
            <span style={{ fontSize: 11, padding: "2px 8px", borderRadius: 20, background: plan.tier === "FREE" ? "#f3f4f6" : "#dbeafe", color: plan.tier === "FREE" ? "#6b7280" : "#1d4ed8", fontWeight: 600 }}>
              {plan.tier}
            </span>
          )}
          <span style={{ fontSize: 11, padding: "2px 8px", borderRadius: 20, background: isApproved ? "#dcfce7" : "#fef3c7", color: isApproved ? "#15803d" : "#92400e", fontWeight: 600 }}>
            {plan.status ?? "PENDING"}
          </span>
        </div>

        {plan.style && (
          <div style={{ fontSize: 12, color: "var(--color-text-tertiary, #9ca3af)" }}>{plan.style}</div>
        )}

        {/* Action */}
        <div style={{ marginTop: "auto", paddingTop: 10 }}>
          <Link
            to={`/plans/${plan.id}`}
            style={{ display: "inline-block", fontSize: 13, fontWeight: 600, padding: "7px 18px", borderRadius: 8, background: "#3b82f6", color: "#fff", textDecoration: "none" }}
          >
            View Plan
          </Link>
        </div>
      </div>
    </div>
  );
}
