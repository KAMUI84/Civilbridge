export default function PageShell({ title, subtitle, children, maxWidth = 1200 }) {
  return (
    <div style={{ background: "linear-gradient(180deg,#000000 0%, #0a0a0a 40%)" }}>
      <div style={{ maxWidth, margin: "0 auto", padding: "34px 18px" }}>
        <div style={{ marginBottom: 18 }}>
          <h1 style={{ margin: 0, fontSize: 34, letterSpacing: "-0.02em", color: "#ffffff" }}>
            {title}
          </h1>
          {subtitle ? (
            <p style={{ margin: "10px 0 0", color: "#a0a0a0", fontWeight: 650, maxWidth: 80 + "ch" }}>
              {subtitle}
            </p>
          ) : null}
        </div>

        <div
          style={{
            border: "1px solid #1a1a1a",
            borderRadius: 18,
            background: "#0a0a0a",
            padding: 18,
            boxShadow: "0 18px 40px rgba(0,0,0,.3)",
          }}
        >
          {children}
        </div>
      </div>
    </div>
  );
}