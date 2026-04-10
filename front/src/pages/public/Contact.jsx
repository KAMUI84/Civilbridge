import { useState } from "react";
import PageShell from "../../components/common/PageShell";
import SEO from "../../components/seo/SEO";
import { contactService } from "../../services/contactService";
import { labelStyle, inputStyle, textareaStyle, primaryBtn, errBox } from "../../components/common/FormUI";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function Contact() {
  const [name,    setName]    = useState("");
  const [email,   setEmail]   = useState("");
  const [msg,     setMsg]     = useState("");
  const [sent,    setSent]    = useState(false);
  const [loading, setLoading] = useState(false);
  const [err,     setErr]     = useState("");

  async function submit(e) {
    e.preventDefault();
    setErr("");

    if (!name.trim())        return setErr("Please enter your name.");
    if (!email.trim())       return setErr("Please enter your email address.");
    if (!EMAIL_RE.test(email.trim())) return setErr("Please enter a valid email address.");
    if (!msg.trim())         return setErr("Please enter a message.");

    setLoading(true);
    try {
      await contactService.submit({ name: name.trim(), email: email.trim(), message: msg.trim() });
      setSent(true);
    } catch (error) {
      setErr(error.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <PageShell
      title="Contact"
      subtitle="Send us a message, request a site visit, or ask for help with plans, estimation, or listings."
    >
      <SEO title="Contact — CivilBridge" description="Get in touch with the CivilBridge team for support, site visits, or construction inquiries." />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 0.9fr", gap: 16 }}>
        <form onSubmit={submit} style={{ display: "grid", gap: 12 }} noValidate>
          {err && <div style={errBox}>{err}</div>}

          {sent ? (
            <div style={{
              padding: 20,
              borderRadius: 12,
              background: "rgba(34,197,94,.1)",
              border: "1px solid rgba(34,197,94,.2)",
              color: "#22c55e",
              fontWeight: 700,
              lineHeight: 1.6,
            }}>
              <div style={{ fontSize: 18, marginBottom: 6 }}>Message sent!</div>
              <div style={{ fontWeight: 400, fontSize: 14, color: "#86efac" }}>
                We've sent a confirmation to <strong>{email}</strong>. Our team will reply within one business day.
              </div>
            </div>
          ) : (
            <>
              <label style={labelStyle}>
                Full name *
                <input
                  style={inputStyle}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your name"
                  disabled={loading}
                  autoComplete="name"
                />
              </label>

              <label style={labelStyle}>
                Email *
                <input
                  style={inputStyle}
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  disabled={loading}
                  autoComplete="email"
                />
              </label>

              <label style={labelStyle}>
                Message *
                <textarea
                  style={textareaStyle}
                  value={msg}
                  onChange={(e) => setMsg(e.target.value)}
                  placeholder="Tell us what you need..."
                  disabled={loading}
                  rows={5}
                />
              </label>

              <button style={{ ...primaryBtn, opacity: loading ? 0.7 : 1, cursor: loading ? "not-allowed" : "pointer" }} disabled={loading}>
                {loading ? "Sending…" : "Send Message"}
              </button>
            </>
          )}
        </form>

        <div style={{ border: "1px solid #1a1a1a", borderRadius: 16, padding: 16, background: "#0a0a0a" }}>
          <div style={{ fontWeight: 950, color: "#ffffff", marginBottom: 10 }}>Quick options</div>
          <ul style={{ margin: 0, paddingLeft: 18, display: "grid", gap: 10, color: "#a0a0a0", fontWeight: 650 }}>
            <li>Request site visit for a property/land</li>
            <li>Upload your plan and request estimation</li>
            <li>Ask about verified engineers/contractors</li>
            <li>Permits &amp; compliance guidance</li>
          </ul>

          <div style={{ height: 1, background: "#1a1a1a", margin: "14px 0" }} />

          <div style={{ display: "grid", gap: 8, color: "#a0a0a0", fontWeight: 650 }}>
            <div><b style={{ color: "#ffffff" }}>Email:</b> support@civilbridge.rw</div>
            <div><b style={{ color: "#ffffff" }}>Office:</b> Kigali (Pilot launch)</div>
            <div><b style={{ color: "#ffffff" }}>Response time:</b> Within 1 business day</div>
          </div>
        </div>
      </div>

      <style>{`@media (max-width: 960px){ div[style*="grid-template-columns: 1fr 0.9fr"]{ grid-template-columns: 1fr !important; } }`}</style>
    </PageShell>
  );
}
