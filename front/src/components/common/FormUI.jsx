export const labelStyle = { display: "grid", gap: 6, fontWeight: 900, color: "#ffffff", fontSize: 13 };
export const inputStyle = { padding: "12px 12px", borderRadius: 14, border: "1px solid #1a1a1a", outline: "none", fontWeight: 750, background: "#0a0a0a", color: "#ffffff" };
export const textareaStyle = { ...inputStyle, minHeight: 110, resize: "vertical" };

export const primaryBtn = {
  padding: "12px 14px",
  borderRadius: 14,
  border: "1px solid rgba(59,130,246,0.3)",
  background: "linear-gradient(135deg,#3b82f6,#1d4ed8)",
  color: "#fff",
  fontWeight: 950,
  cursor: "pointer",
  boxShadow: "0 14px 26px rgba(59,130,246,.3)",
};

export const ghostBtn = {
  padding: "12px 14px",
  borderRadius: 14,
  border: "1px solid #1a1a1a",
  background: "#0a0a0a",
  color: "#ffffff",
  fontWeight: 950,
  cursor: "pointer",
};

export const errBox = {
  padding: 12,
  borderRadius: 12,
  background: "rgba(239,68,68,.1)",
  border: "1px solid rgba(239,68,68,.2)",
  color: "#ef4444",
  fontWeight: 750,
};