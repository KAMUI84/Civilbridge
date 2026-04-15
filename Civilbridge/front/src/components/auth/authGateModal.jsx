export default function AuthGateModal({ open, onClose, onGoLogin, onGoRegister }) {
  if (!open) return null;

  return (
    <div style={overlay} onMouseDown={onClose}>
      <div style={modal} onMouseDown={(e) => e.stopPropagation()}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 10, alignItems: "center" }}>
          <div style={{ fontWeight: 950, fontSize: 18, color: "#0c1220" }}>
            Continue with an account
          </div>
          <button onClick={onClose} style={xBtn} aria-label="Close">
            ✕
          </button>
        </div>

        <p style={{ margin: "10px 0 0", color: "#64708a", fontWeight: 650, lineHeight: 1.6 }}>
          You used the free guest messages. Sign in to keep chatting, save projects, and access advanced tools.
        </p>

        <div style={{ display: "grid", gap: 10, marginTop: 16 }}>
          <button onClick={onGoRegister} style={primaryBtn}>
            Create account
          </button>
          <button onClick={onGoLogin} style={ghostBtn}>
            Sign in
          </button>
        </div>

        <div style={{ marginTop: 12, color: "#94a3b8", fontWeight: 650, fontSize: 12 }}>
          Later we’ll add phone/email verification + Google sign-in.
        </div>
      </div>
    </div>
  );
}

const overlay = {
  position: "fixed",
  inset: 0,
  background: "rgba(12,18,32,0.55)",
  backdropFilter: "blur(6px)",
  display: "grid",
  placeItems: "center",
  zIndex: 999,
  padding: 18,
};

const modal = {
  width: "min(520px, 100%)",
  borderRadius: 18,
  border: "1px solid rgba(255,255,255,0.16)",
  background: "linear-gradient(135deg,#ffffff,#f7f9ff)",
  boxShadow: "0 26px 80px rgba(0,0,0,.25)",
  padding: 16,
};

const xBtn = {
  width: 38,
  height: 38,
  borderRadius: 12,
  border: "1px solid #eef0f4",
  background: "#fff",
  cursor: "pointer",
  fontWeight: 900,
};

const primaryBtn = {
  padding: "12px 14px",
  borderRadius: 14,
  border: "1px solid rgba(29,78,216,0.2)",
  background: "linear-gradient(135deg,#2a66ff,#1d4ed8)",
  color: "#fff",
  fontWeight: 950,
  cursor: "pointer",
  boxShadow: "0 14px 26px rgba(29,78,216,.18)",
};

const ghostBtn = {
  padding: "12px 14px",
  borderRadius: 14,
  border: "1px solid #e9ecf2",
  background: "#fff",
  color: "#0c1220",
  fontWeight: 950,
  cursor: "pointer",
};