export default function GoogleButton({ onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={btn}
    >
      <span style={gIcon}>G</span>
      Continue with Google
    </button>
  );
}

const btn = {
  width: "100%",
  height: 44,
  borderRadius: 14,
  border: "1px solid #e9ecf2",
  background: "#fff",
  cursor: "pointer",
  fontWeight: 900,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 10,
};

const gIcon = {
  width: 26,
  height: 26,
  borderRadius: 10,
  display: "grid",
  placeItems: "center",
  background: "linear-gradient(135deg,#111827,#0c1220)",
  color: "#fff",
  fontWeight: 950,
  fontSize: 13,
};