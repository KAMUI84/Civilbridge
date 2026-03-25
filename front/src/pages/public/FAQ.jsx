import PageShell from "../../components/common/PageShell";

const faqs = [
  { q: "Do I need AI to use CivilBridge?", a: "No. Estimation, BOQ tools, listings, plans, and expert connections work without AI. Intelligence is optional." },
  { q: "Can I upload my own plan and get an estimate?", a: "Yes. Upload your drawings and key project details in Upload Center. Estimator uses rules/unit-rates to generate a BOQ." },
  { q: "Do you sell land and finished houses?", a: "We list verified properties and plots. For deeper verification and viewing, we connect you with the right contact and arrange visits." },
  { q: "How do you verify professionals?", a: "Profiles can be reviewed and approved by admin. Documents and licenses can be uploaded and tracked." },
];

export default function FAQ() {
  return (
    <PageShell title="FAQ" subtitle="Quick answers about how the platform works.">
      <div style={{ display: "grid", gap: 12 }}>
        {faqs.map((f) => (
          <div key={f.q} style={{ border: "1px solid #1a1a1a", borderRadius: 16, padding: 16, background: "#0a0a0a" }}>
            <div style={{ fontWeight: 950, color: "#ffffff" }}>{f.q}</div>
            <div style={{ color: "#a0a0a0", fontWeight: 650, marginTop: 8, lineHeight: 1.6 }}>{f.a}</div>
          </div>
        ))}
      </div>
    </PageShell>
  );
}