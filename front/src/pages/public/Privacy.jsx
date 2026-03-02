import PageShell from "../../components/common/PageShell";

export default function Privacy() {
  return (
    <PageShell title="Privacy Policy" subtitle="How we handle your account, uploads, and usage data.">
      <div style={{ display: "grid", gap: 12, color: "#3a4357", fontWeight: 650, lineHeight: 1.7 }}>
        <Block t="Data we collect">Account info, uploaded documents, project details, and usage analytics for platform improvement.</Block>
        <Block t="How we use it">To provide services, support verification, generate estimates, and improve user experience.</Block>
        <Block t="Sharing">We share data only when needed to deliver your request (e.g., site visit contact, verified expert engagement).</Block>
        <Block t="Security">We aim for strong access controls and encryption where appropriate. Never share your password.</Block>
      </div>
    </PageShell>
  );
}

function Block({ t, children }) {
  return (
    <div style={{ border: "1px solid #eef0f4", borderRadius: 16, padding: 16 }}>
      <div style={{ fontWeight: 950, color: "#0c1220", marginBottom: 6 }}>{t}</div>
      <div>{children}</div>
    </div>
  );
}