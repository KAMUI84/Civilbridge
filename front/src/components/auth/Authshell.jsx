import { Link, useNavigate } from "react-router-dom";

export default function AuthShell({
  title,
  subtitle,
  linkText,
  linkTo,
  leftTitle = "Success starts here",
  bullets = [
    "Verified experts & suppliers",
    "Plans + estimation + BOQ tools",
    "Compliance & permits guidance",
    "Dashboard for project progress",
  ],
  children,
}) {
  const nav = useNavigate();

  return (
    <div style={wrap}>
      <div style={modal}>
        <div style={left}>
          <div style={leftOverlay} />
          <div style={leftContent}>
            <div style={pill}>CivilBridge</div>
            <h2 style={leftH2}>{leftTitle}</h2>
            <ul style={ul}>
              {bullets.map((b) => (
                <li key={b} style={li}>{b}</li>
              ))}
            </ul>
          </div>
        </div>

        <div style={right}>
          <button onClick={() => nav("/")} style={closeBtn} aria-label="Close">×</button>

          <h1 style={h1}>{title}</h1>
          <div style={sub}>
            {subtitle} <Link to={linkTo}>{linkText}</Link>
          </div>

          <div style={{ height: 14 }} />

          {children}
        </div>
      </div>
    </div>
  );
}

const wrap = {
  minHeight: "100vh",
  display: "grid",
  placeItems: "center",
  padding: 18,
  background: "radial-gradient(1200px 500px at 50% 10%, rgba(29,78,216,.18), transparent 60%), #0b1220",
};

const modal = {
  width: "min(1040px, 100%)",
  height: "min(620px, calc(100vh - 56px))",
  borderRadius: 18,
  overflow: "hidden",
  display: "grid",
  gridTemplateColumns: "1.1fr 1fr",
  background: "#fff",
  boxShadow: "0 30px 120px rgba(0,0,0,.45)",
  border: "1px solid rgba(255,255,255,.10)",
};

const left = {
  position: "relative",
  backgroundImage: `url("/img/auth-left.jpg")`,
  backgroundSize: "cover",
  backgroundPosition: "center",
};

const leftOverlay = {
  position: "absolute",
  inset: 0,
  background: "linear-gradient(135deg, rgba(29,78,216,.65), rgba(2,6,23,.55))",
};

const leftContent = {
  position: "relative",
  padding: 26,
  color: "#fff",
};

const pill = {
  display: "inline-flex",
  alignItems: "center",
  gap: 8,
  padding: "8px 12px",
  borderRadius: 999,
  background: "rgba(255,255,255,.18)",
  border: "1px solid rgba(255,255,255,.20)",
  fontWeight: 900,
  fontSize: 12,
};

const leftH2 = { margin: "16px 0 10px", fontSize: 44, lineHeight: 1.05, letterSpacing: "-0.03em" };

const ul = { margin: 0, paddingLeft: 18, display: "grid", gap: 10, fontWeight: 650, opacity: 0.95 };
const li = { lineHeight: 1.35 };

const right = {
  position: "relative",
  padding: 26,
  display: "grid",
  alignContent: "start",
  overflow: "auto",
};

const closeBtn = {
  position: "absolute",
  top: 14,
  right: 14,
  width: 40,
  height: 40,
  borderRadius: 12,
  border: "1px solid #eef0f4",
  background: "#fff",
  cursor: "pointer",
  fontSize: 22,
  lineHeight: "40px",
};

const h1 = { margin: 0, color: "#0c1220", fontSize: 34, letterSpacing: "-0.02em" };

const sub = { color: "#64708a", fontWeight: 650 };