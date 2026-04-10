import { Link } from "react-router-dom";
import SEO from "../../components/seo/SEO";

export default function ServerError() {
  return (
    <>
      <SEO title="Server error" noindex />
      <div style={s.wrap}>
        <div style={s.card}>
          <div style={s.code}>500</div>
          <h1 style={s.title}>Server error</h1>
          <p style={s.body}>
            Something went wrong on our end. We've been notified and are working on a fix.
          </p>
          <div style={s.actions}>
            <button onClick={() => window.location.reload()} style={s.secondary}>Reload page</button>
            <Link to="/" style={s.primary}>Go home</Link>
          </div>
        </div>
      </div>
    </>
  );
}

const s = {
  wrap:      { minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--color-background, #0a0a0a)", padding: 24 },
  card:      { maxWidth: 440, textAlign: "center" },
  code:      { fontSize: 96, fontWeight: 900, color: "#1d2432", lineHeight: 1, marginBottom: 8, userSelect: "none" },
  title:     { fontSize: 26, fontWeight: 800, color: "var(--color-text-primary, #fff)", margin: "0 0 10px" },
  body:      { fontSize: 15, color: "#9ca3af", lineHeight: 1.6, margin: "0 0 28px" },
  actions:   { display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" },
  primary:   { padding: "11px 28px", borderRadius: 10, background: "#3b82f6", color: "#fff", fontWeight: 700, fontSize: 14, textDecoration: "none" },
  secondary: { padding: "11px 28px", borderRadius: 10, border: "1px solid rgba(255,255,255,0.1)", background: "transparent", color: "#9ca3af", fontWeight: 600, fontSize: 14, cursor: "pointer" },
};
