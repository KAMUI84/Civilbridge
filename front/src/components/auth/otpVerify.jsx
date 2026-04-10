import { useState } from "react";
import { writeLS, readLS } from "../../utils/storage.js";

export default function OtpVerify({ target, onVerified }) {
  const [code, setCode] = useState("");
  const [err, setErr] = useState("");

  const verify = () => {
    setErr("");
    const saved = readLS("cb_otp", null);
    if (!saved || saved.target !== target) {
      setErr("OTP expired. Please request again.");
      return;
    }
    if (code.trim() !== saved.code) {
      setErr("Invalid code.");
      return;
    }

    // mark verified
    writeLS("cb_verified", { target, verifiedAt: new Date().toISOString() });
    onVerified?.();
  };

  return (
    <div style={{ display: "grid", gap: 10 }}>
      <div style={{ fontWeight: 950, color: "#0c1220" }}>Verify {target}</div>
      <div style={{ color: "#64708a", fontWeight: 650 }}>
        Enter the 6-digit code sent to your email/phone (MVP uses local OTP).
      </div>

      {err ? (
        <div style={{ padding: 12, borderRadius: 12, background: "#fff1f2", border: "1px solid #ffe4e6", color: "#9f1239", fontWeight: 750 }}>
          {err}
        </div>
      ) : null}

      <input
        value={code}
        onChange={(e) => setCode(e.target.value)}
        placeholder="Enter code"
        style={{
          padding: "12px 12px",
          borderRadius: 14,
          border: "1px solid #e9ecf2",
          outline: "none",
          fontWeight: 750,
        }}
      />

      <button
        type="button"
        onClick={verify}
        style={{
          padding: "12px 14px",
          borderRadius: 14,
          border: "1px solid rgba(29,78,216,0.2)",
          background: "linear-gradient(135deg,#2a66ff,#1d4ed8)",
          color: "#fff",
          fontWeight: 950,
          cursor: "pointer",
        }}
      >
        Verify
      </button>
    </div>
  );
}
