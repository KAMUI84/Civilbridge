export default function PageShell({ title, subtitle, children, maxWidth = 1200 }) {
  return (
    <div style={{ background: "linear-gradient(180deg,#f7f9ff 0%, #ffffff 40%)" }}>
      <div style={{ maxWidth, margin: "0 auto", padding: "34px 18px" }}>
        <div style={{ marginBottom: 18 }}>
          <h1 style={{ margin: 0, fontSize: 34, letterSpacing: "-0.02em", color: "#0c1220" }}>
            {title}
          </h1>
          {subtitle ? (
            <p style={{ margin: "10px 0 0", color: "#64708a", fontWeight: 650, maxWidth: 80 + "ch" }}>
              {subtitle}
            </p>
          ) : null}
        </div>

        <div
          style={{
            border: "1px solid #eef0f4",
            borderRadius: 18,
            background: "#fff",
            padding: 18,
            boxShadow: "0 18px 40px rgba(12,18,32,.06)",
          }}
        >
          {children}
        </div>
      </div>
    </div>
  );
}