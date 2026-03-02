import PageShell from "../../components/common/PageShell";

export default function About() {
  return (
    <PageShell
      title="About CivilBridge"
      subtitle="We connect real estate + land + plans + estimation + verified experts into one practical construction ecosystem."
    >
      <div style={{ display: "grid", gap: 14 }}>
        <Section title="What we do">
          CivilBridge helps people buy finished real estate, find build-ready plots, explore modern plans, and estimate costs
          before committing. We also connect clients with verified professionals for site visits and execution.
        </Section>

        <Grid3
          items={[
            { t: "Marketplace", d: "Properties & build-ready land listings with key details and request-visit flow." },
            { t: "Plans Library", d: "Pre-designed plans with renders and project previews to reduce design delays." },
            { t: "Estimator", d: "Rule-based BOQ & cost estimation that works even without AI." },
            { t: "Experts", d: "Vetted contractors, engineers, architects, suppliers—role-based profiles & ratings." },
            { t: "Compliance", d: "Permit guidance, checklists, document tracking and readiness for official workflows." },
            { t: "Intelligence", d: "Optional AI guidance that improves decisions—but the platform works without it." },
          ]}
        />

        <Section title="Our goal">
          Make construction more transparent, affordable, and trustworthy—starting locally and expanding regionally as we grow.
        </Section>
      </div>
    </PageShell>
  );
}

function Section({ title, children }) {
  return (
    <div style={{ border: "1px solid #eef0f4", borderRadius: 16, padding: 16, background: "#fff" }}>
      <div style={{ fontWeight: 950, color: "#0c1220", marginBottom: 6 }}>{title}</div>
      <div style={{ color: "#3a4357", lineHeight: 1.6, fontWeight: 650 }}>{children}</div>
    </div>
  );
}

function Grid3({ items }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12 }}>
      {items.map((x) => (
        <div key={x.t} style={{ border: "1px solid #eef0f4", borderRadius: 16, padding: 16, background: "#f7f9ff" }}>
          <div style={{ fontWeight: 950, color: "#0c1220", marginBottom: 6 }}>{x.t}</div>
          <div style={{ color: "#3a4357", lineHeight: 1.55, fontWeight: 650 }}>{x.d}</div>
        </div>
      ))}
      <style>{`@media (max-width: 960px){ div[style*="repeat(3,1fr)"]{ grid-template-columns: 1fr !important; } }`}</style>
    </div>
  );
}