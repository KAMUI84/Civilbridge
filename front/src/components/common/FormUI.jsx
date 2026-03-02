export const labelStyle = { display: "grid", gap: 6, fontWeight: 900, color: "#0c1220", fontSize: 13 };
export const inputStyle = { padding: "12px 12px", borderRadius: 14, border: "1px solid #e9ecf2", outline: "none", fontWeight: 750 };
export const textareaStyle = { ...inputStyle, minHeight: 110, resize: "vertical" };

export const primaryBtn = {
  padding: "12px 14px",
  borderRadius: 14,
  border: "1px solid rgba(29,78,216,0.2)",
  background: "linear-gradient(135deg,#2a66ff,#1d4ed8)",
  color: "#fff",
  fontWeight: 950,
  cursor: "pointer",
  boxShadow: "0 14px 26px rgba(29,78,216,.18)",
};

export const ghostBtn = {
  padding: "12px 14px",
  borderRadius: 14,
  border: "1px solid #e9ecf2",
  background: "#fff",
  color: "#0c1220",
  fontWeight: 950,
  cursor: "pointer",
};

export const errBox = {
  padding: 12,
  borderRadius: 12,
  background: "#fff1f2",
  border: "1px solid #ffe4e6",
  color: "#9f1239",
  fontWeight: 750,
};