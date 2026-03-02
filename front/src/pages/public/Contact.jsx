import { useState } from "react";
import PageShell from "../../components/common/PageShell";
import { labelStyle, inputStyle, textareaStyle, primaryBtn, errBox } from "../../components/common/FormUI";

export default function Contact() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [msg, setMsg] = useState("");
  const [sent, setSent] = useState(false);
  const [err, setErr] = useState("");

  function submit(e) {
    e.preventDefault();
    setErr("");
    if (!name || !email || !msg) return setErr("Please fill all fields.");
    // Later wire to backend /api/support/ticket
    setSent(true);
  }

  return (
    <PageShell
      title="Contact"
      subtitle="Send us a message, request a site visit, or ask for help with plans, estimation, or listings."
    >
      <div style={{ display: "grid", gridTemplateColumns: "1fr 0.9fr", gap: 16 }}>
        <form onSubmit={submit} style={{ display: "grid", gap: 12 }}>
          {err ? <div style={errBox}>{err}</div> : null}
          {sent ? (
            <div style={{ padding: 12, borderRadius: 12, background: "#ecfdf5", border: "1px solid #d1fae5", color: "#065f46", fontWeight: 800 }}>
              Message sent. We’ll respond soon.
            </div>
          ) : null}

          <label style={labelStyle}>
            Full name
            <input style={inputStyle} value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" />
          </label>

          <label style={labelStyle}>
            Email
            <input style={inputStyle} value={email} onChange={(e) => setEmail(e.target.value)} placeholder="name@example.com" />
          </label>

          <label style={labelStyle}>
            Message
            <textarea style={textareaStyle} value={msg} onChange={(e) => setMsg(e.target.value)} placeholder="Tell us what you need..." />
          </label>

          <button style={primaryBtn}>Send Message</button>
        </form>

        <div style={{ border: "1px solid #eef0f4", borderRadius: 16, padding: 16, background: "#f7f9ff" }}>
          <div style={{ fontWeight: 950, color: "#0c1220", marginBottom: 10 }}>Quick options</div>
          <ul style={{ margin: 0, paddingLeft: 18, display: "grid", gap: 10, color: "#3a4357", fontWeight: 650 }}>
            <li>Request site visit for a property/land</li>
            <li>Upload your plan and request estimation</li>
            <li>Ask about verified engineers/contractors</li>
            <li>Permits & compliance guidance</li>
          </ul>

          <div style={{ height: 1, background: "#eef0f4", margin: "14px 0" }} />

          <div style={{ display: "grid", gap: 8, color: "#64708a", fontWeight: 650 }}>
            <div><b style={{ color: "#0c1220" }}>Email:</b> support@civilbridge.example</div>
            <div><b style={{ color: "#0c1220" }}>Office:</b> Kigali (Pilot launch)</div>
          </div>
        </div>
      </div>

      <style>{`@media (max-width: 960px){ div[style*="grid-template-columns: 1fr 0.9fr"]{ grid-template-columns: 1fr !important; } }`}</style>
    </PageShell>
  );
}