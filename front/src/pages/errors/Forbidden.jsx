import { Link, useNavigate } from "react-router-dom";
import SEO from "../../components/seo/SEO";

export default function Forbidden() {
  const navigate = useNavigate();
  return (
    <>
      <SEO title="Access denied" noindex />
      <div style={s.wrap}>
        <div style={s.card}>
          <div style={s.code}>403</div>
          <h1 style={s.title}>Access denied</h1>
          <p style={s.body}>
            You don't have permission to view this page.
            Contact your administrator if you believe this is an error.
          </p>
          <div style={s.actions}>
            <button onClick={() => navigate(-1)} style={s.secondary}>Go back</button>
            <Link to="/dashboard" style={s.primary}>Dashboard</Link>
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
