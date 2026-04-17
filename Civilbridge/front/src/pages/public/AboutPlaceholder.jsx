import PageShell from "../../components/common/PageShell";
import SEO from "../../components/seo/SEO";

function Panel({ title, text }) {
  return (
    <div
      style={{
        border: "1px solid #e8eef5",
        borderRadius: 18,
        padding: 18,
        background: "#ffffff",
        boxShadow: "0 12px 26px rgba(15,23,42,0.05)",
      }}
    >
      <h2 style={{ margin: "0 0 10px", color: "#0f172a", fontSize: 20 }}>{title}</h2>
      <p style={{ margin: 0, color: "#64748b", lineHeight: 1.7 }}>{text}</p>
    </div>
  );
}

export default function AboutPlaceholder() {
  return (
    <PageShell
      title="About CivilBridge"
      subtitle="CivilBridge brings planning, expert coordination, and construction decision-making into one practical workspace."
    >
      <SEO
        title="About"
        description="About CivilBridge and the platform mission."
      />

      <div style={{ display: "grid", gap: 16 }}>
        <Panel
          title="What CivilBridge is building"
          text="CivilBridge helps clients explore plans, land, property listings, estimations, and approved experts in one connected platform designed for construction work in Rwanda and the wider region."
        />
        <Panel
          title="Current status"
          text="Nothing yet posted. Please wait; you’ll be notified when our full company story and updates are live!"
        />
        <Panel
          title="What will be added next"
          text="This page will expand with our team story, operating model, approval standards, partnerships, and rollout milestones as those materials are finalized."
        />
      </div>
    </PageShell>
  );
}
