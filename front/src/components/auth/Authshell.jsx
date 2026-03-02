import { Link } from "react-router-dom";

export default function AuthShell({
  title,
  subtitle,
  leftTitle = "Success starts here",
  leftBullets = [
    "Verified experts & suppliers",
    "Plans + estimation + BOQ tools",
    "Compliance & permits guidance",
    "Dashboard for project progress",
  ],
  leftImage = "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1600&q=80",
  children,
}) {
  return (
    <div style={styles.backdrop}>
      <div style={styles.modal}>
        {/* LEFT */}
        <div style={{ ...styles.left, backgroundImage: `url("${leftImage}")` }}>
          <div style={styles.leftOverlay} />
          <div style={styles.leftContent}>
            <div style={styles.brandPill}>CivilBridge</div>
            <h2 style={styles.leftTitle}>{leftTitle}</h2>
            <ul style={styles.bullets}>
              {leftBullets.map((b, i) => (
                <li key={i} style={styles.bulletItem}>
                  <span style={styles.check}>✓</span>
                  <span>{b}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* RIGHT */}
        <div style={styles.right}>
          <Link to="/" aria-label="Close" style={styles.closeBtn}>
            ✕
          </Link>

          <div style={{ display: "grid", gap: 6 }}>
            <h1 style={styles.h1}>{title}</h1>
            {subtitle ? <div style={styles.sub}>{subtitle}</div> : null}
          </div>

          <div style={{ height: 14 }} />

          {children}
        </div>
      </div>
    </div>
  );
}

const styles = {
  backdrop: {
    minHeight: "calc(100vh - 72px)", // if navbar is sticky; adjust if needed
    display: "grid",
    placeItems: "center",
    padding: "26px 18px",
    background: "rgba(12,18,32,0.55)",
  },
  modal: {
    width: "min(1040px, 100%)",
    height: "min(640px, calc(100vh - 120px))",
    background: "#fff",
    borderRadius: 20,
    overflow: "hidden",
    display: "grid",
    gridTemplateColumns: "1.05fr 0.95fr",
    boxShadow: "0 28px 90px rgba(0,0,0,.30)",
    border: "1px solid rgba(255,255,255,0.16)",
  },
  left: {
    position: "relative",
    backgroundSize: "cover",
    backgroundPosition: "center",
  },
  leftOverlay: {
    position: "absolute",
    inset: 0,
    background:
      "linear-gradient(135deg, rgba(29,78,216,0.70), rgba(12,18,32,0.55))",
  },
  leftContent: {
    position: "relative",
    zIndex: 2,
    padding: 26,
    color: "#fff",
    height: "100%",
    display: "flex",
    flexDirection: "column",
    justifyContent: "flex-start",
    gap: 14,
  },
  brandPill: {
    width: "fit-content",
    padding: "8px 12px",
    borderRadius: 999,
    background: "rgba(255,255,255,0.16)",
    border: "1px solid rgba(255,255,255,0.22)",
    fontWeight: 900,
    fontSize: 12,
  },
  leftTitle: {
    margin: 0,
    fontSize: 44,
    lineHeight: 1.05,
    letterSpacing: "-0.02em",
    fontWeight: 950,
  },
  bullets: {
    margin: 0,
    paddingLeft: 0,
    listStyle: "none",
    display: "grid",
    gap: 10,
    maxWidth: 420,
  },
  bulletItem: {
    display: "flex",
    gap: 10,
    alignItems: "flex-start",
    fontWeight: 700,
    color: "rgba(255,255,255,0.92)",
  },
  check: {
    display: "inline-grid",
    placeItems: "center",
    width: 20,
    height: 20,
    borderRadius: 999,
    background: "rgba(255,255,255,0.16)",
    border: "1px solid rgba(255,255,255,0.22)",
    fontWeight: 900,
    flex: "0 0 auto",
    marginTop: 1,
  },
  right: {
    position: "relative",
    padding: 26,
    overflow: "auto",
  },
  closeBtn: {
    position: "absolute",
    top: 16,
    right: 16,
    width: 40,
    height: 40,
    borderRadius: 12,
    border: "1px solid #eef0f4",
    background: "#fff",
    display: "grid",
    placeItems: "center",
    textDecoration: "none",
    color: "#0c1220",
    fontWeight: 900,
  },
  h1: { margin: 0, color: "#0c1220", fontWeight: 950, fontSize: 30 },
  sub: { color: "#64708a", fontWeight: 650 },
};