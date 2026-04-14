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
  wrap:      { minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#ffffff", padding: 24 },
  card:      { maxWidth: 440, textAlign: "center", padding: 28, borderRadius: 22, border: "1px solid #e8eef5", background: "#ffffff", boxShadow: "0 16px 34px rgba(15,23,42,0.06)" },
  code:      { fontSize: 96, fontWeight: 900, color: "#dbe7f5", lineHeight: 1, marginBottom: 8, userSelect: "none" },
  title:     { fontSize: 26, fontWeight: 800, color: "#0f172a", margin: "0 0 10px" },
  body:      { fontSize: 15, color: "#64748b", lineHeight: 1.6, margin: "0 0 28px" },
  actions:   { display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" },
  primary:   { padding: "11px 28px", borderRadius: 10, background: "#3b82f6", color: "#fff", fontWeight: 700, fontSize: 14, textDecoration: "none" },
  secondary: { padding: "11px 28px", borderRadius: 10, border: "1px solid #e6ecf4", background: "#ffffff", color: "#0f172a", fontWeight: 600, fontSize: 14, cursor: "pointer" },
};
