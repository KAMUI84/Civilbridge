export default function PageShell({ title, subtitle, children, maxWidth = 1200 }) {
  return (
    <div style={{ background: "#ffffff" }}>
      <div style={{ maxWidth, margin: "0 auto", padding: "100px 18px 28px" }}>
        <div style={{ marginBottom: 14 }}>
          <h1 style={{ margin: 0, fontSize: 32, letterSpacing: "-0.02em", color: "#0f172a" }}>
            {title}
          </h1>
          {subtitle ? (
            <p style={{ margin: "8px 0 0", color: "#64748b", fontWeight: 650, maxWidth: 80 + "ch" }}>
              {subtitle}
            </p>
          ) : null}
        </div>

        <div
          style={{
            border: "1px solid #e9eef5",
            borderRadius: 18,
            background: "#ffffff",
            padding: 16,
            boxShadow: "0 12px 28px rgba(15,23,42,.05)",
          }}
        >
          {children}
        </div>
      </div>
    </div>
  );
}
