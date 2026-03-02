import PageShell from "../../components/common/PageShell";

export default function Pricing() {
  return (
    <PageShell title="Pricing" subtitle="Start free. Upgrade when you need advanced documents, team workflows, and premium tools.">
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12 }}>
        <PlanCard name="Free" price="0" items={["Browse listings & plans", "Basic estimation preview", "Request visits (manual)"]} />
        <PlanCard name="Pro" price="9/mo" highlight items={["Save estimates & BOQs", "Project dashboard", "Uploads & documents", "Priority support"]} />
        <PlanCard name="Business" price="Custom" items={["Multi-team roles", "Admin approvals", "Compliance workflows", "Supplier quotes & procurement"]} />
      </div>

      <style>{`@media (max-width: 960px){ div[style*="repeat(3,1fr)"]{ grid-template-columns: 1fr !important; } }`}</style>
    </PageShell>
  );
}

function PlanCard({ name, price, items, highlight }) {
  return (
    <div style={{
      border: "1px solid #eef0f4",
      borderRadius: 18,
      padding: 16,
      background: highlight ? "linear-gradient(180deg,#f7f9ff,#fff)" : "#fff",
      boxShadow: highlight ? "0 18px 40px rgba(29,78,216,.10)" : "none"
    }}>
      <div style={{ fontWeight: 950, color: "#0c1220", fontSize: 16 }}>{name}</div>
      <div style={{ fontWeight: 950, color: "#1d4ed8", fontSize: 28, margin: "8px 0 12px" }}>{price}</div>
      <ul style={{ margin: 0, paddingLeft: 18, display: "grid", gap: 10, color: "#3a4357", fontWeight: 650 }}>
        {items.map((x) => <li key={x}>{x}</li>)}
      </ul>
      <button style={{
        marginTop: 14,
        width: "100%",
        padding: "12px 14px",
        borderRadius: 14,
        border: "1px solid rgba(29,78,216,0.2)",
        background: highlight ? "linear-gradient(135deg,#2a66ff,#1d4ed8)" : "#fff",
        color: highlight ? "#fff" : "#0c1220",
        fontWeight: 950,
        cursor: "pointer",
      }}>
        {name === "Free" ? "Get Started" : "Choose Plan"}
      </button>
    </div>
  );
}