import PageShell from "../../components/common/PageShell";

export default function Terms() {
  return (
    <PageShell title="Terms of Service" subtitle="Simple terms for using listings, plans, estimation tools, and expert connections.">
      <div style={{ display: "grid", gap: 12, color: "#3a4357", fontWeight: 650, lineHeight: 1.7 }}>
        <Block t="1. Platform role">CivilBridge provides digital tools, listings, and connections. Final transactions and contracts may involve third parties.</Block>
        <Block t="2. Accuracy">Estimates are indicative and depend on your inputs, unit rates, and market conditions.</Block>
        <Block t="3. Listings">Listing data is provided by partners/owners. Verification is best-effort and can be expanded via site visits.</Block>
        <Block t="4. User conduct">No fraud, no impersonation, and upload only documents you own or have permission to share.</Block>
        <Block t="5. Liability">We are not responsible for third-party performance. Use verified professionals and written agreements.</Block>
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