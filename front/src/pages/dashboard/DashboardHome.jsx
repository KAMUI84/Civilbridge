export default function DashboardHome() {
  return (
    <div>
      <h1 style={{ margin: 0, fontSize: 28, color: "#0c1220" }}>
        Project Management Dashboard
      </h1>
      <p style={{ color: "#64708a", fontWeight: 650 }}>
        Track progress, budget health, permits, and documents.
      </p>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: 12,
          marginTop: 14,
        }}
      >
        <StatCard title="Overall Progress" value="0%" sub="Start a project to track progress" />
        <StatCard title="Budget Health" value="—" sub="Create an estimate to track costs" />
        <StatCard title="Permit Status" value="—" sub="Add region to see required permits" />
      </div>

      <div
        style={{
          marginTop: 14,
          border: "1px solid #eef0f4",
          borderRadius: 16,
          padding: 14,
          background: "#f7f8fb",
        }}
      >
        <h3 style={{ margin: 0, color: "#0c1220" }}>Next Actions</h3>
        <ul style={{ marginTop: 10, color: "#3a4357", lineHeight: 1.7 }}>
          <li>Create your first project</li>
          <li>Generate an estimate / BOQ</li>
          <li>Upload plan and documents</li>
          <li>Request quotes from verified experts</li>
        </ul>
      </div>
    </div>
  );
}

function StatCard({ title, value, sub }) {
  return (
    <div
      style={{
        border: "1px solid #eef0f4",
        borderRadius: 16,
        padding: 14,
        boxShadow: "0 10px 24px rgba(12,18,32,.05)",
      }}
    >
      <div style={{ fontWeight: 850, color: "#3a4357" }}>{title}</div>
      <div style={{ fontSize: 30, fontWeight: 950, marginTop: 8, color: "#0c1220" }}>
        {value}
      </div>
      <div style={{ color: "#64708a", fontWeight: 650, marginTop: 6 }}>{sub}</div>
    </div>
  );
}