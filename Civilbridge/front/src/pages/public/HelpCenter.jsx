import { useState } from "react";
import PageShell from "../../components/common/PageShell";
import SEO from "../../components/seo/SEO";
import { contactService } from "../../services/contactService";
import { labelStyle, inputStyle, textareaStyle, primaryBtn, errBox } from "../../components/common/FormUI";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const TOPICS = [
  "Advanced estimation help",
  "Plan guidance",
  "Marketplace follow-up",
  "Expert assignment support",
  "Legal or account help",
];

export default function HelpCenter() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    topic: TOPICS[0],
    message: "",
  });
  const [submittedEmail, setSubmittedEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  async function submit(event) {
    event.preventDefault();
    setErr("");

    if (!form.name.trim()) return setErr("Please enter your name.");
    if (!form.email.trim()) return setErr("Please enter your email address.");
    if (!EMAIL_RE.test(form.email.trim())) return setErr("Please enter a valid email address.");
    if (!form.message.trim()) return setErr("Please enter the details of the help you need.");

    setLoading(true);
    try {
      setSubmittedEmail(form.email.trim());
      await contactService.submit({
        name: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        topic: form.topic,
        message: form.message.trim(),
      });
      setSent(true);
      setForm({
        name: "",
        email: "",
        phone: "",
        topic: TOPICS[0],
        message: "",
      });
    } catch (error) {
      setErr(error.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <PageShell
      title="Help Center"
      subtitle="Share the essentials for advanced support and the team will route your request directly."
    >
      <SEO
        title="Help Center"
        description="Get advanced help from CivilBridge."
      />

      <div style={{ display: "grid", gridTemplateColumns: "1fr 0.92fr", gap: 16 }}>
        <form onSubmit={submit} style={{ display: "grid", gap: 12 }} noValidate>
          {err ? <div style={errBox}>{err}</div> : null}

          {sent ? (
            <div
              style={{
                padding: 20,
                borderRadius: 14,
                background: "rgba(34,197,94,0.08)",
                border: "1px solid rgba(34,197,94,0.2)",
                color: "#15803d",
                lineHeight: 1.7,
              }}
            >
              <div style={{ fontSize: 18, fontWeight: 800, marginBottom: 6 }}>Request received</div>
              <div>
                We sent a confirmation to <strong>{submittedEmail || "your email"}</strong>. The help desk will review it and respond within one business day.
              </div>
            </div>
          ) : (
            <>
              <label style={labelStyle}>
                Full name *
                <input
                  style={inputStyle}
                  value={form.name}
                  onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
                  placeholder="Your name"
                  disabled={loading}
                  autoComplete="name"
                />
              </label>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <label style={labelStyle}>
                  Email *
                  <input
                    style={inputStyle}
                    type="email"
                    value={form.email}
                    onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
                    placeholder="name@example.com"
                    disabled={loading}
                    autoComplete="email"
                  />
                </label>

                <label style={labelStyle}>
                  Phone
                  <input
                    style={inputStyle}
                    type="tel"
                    value={form.phone}
                    onChange={(event) => setForm((current) => ({ ...current, phone: event.target.value }))}
                    placeholder="+250..."
                    disabled={loading}
                    autoComplete="tel"
                  />
                </label>
              </div>

              <label style={labelStyle}>
                Topic
                <select
                  style={inputStyle}
                  value={form.topic}
                  onChange={(event) => setForm((current) => ({ ...current, topic: event.target.value }))}
                  disabled={loading}
                >
                  {TOPICS.map((topic) => (
                    <option key={topic} value={topic}>{topic}</option>
                  ))}
                </select>
              </label>

              <label style={labelStyle}>
                Details *
                <textarea
                  style={textareaStyle}
                  value={form.message}
                  onChange={(event) => setForm((current) => ({ ...current, message: event.target.value }))}
                  placeholder="Explain the issue, what page or item is involved, and what kind of help you need."
                  disabled={loading}
                  rows={6}
                />
              </label>

              <button
                style={{ ...primaryBtn, opacity: loading ? 0.7 : 1, cursor: loading ? "not-allowed" : "pointer" }}
                disabled={loading}
              >
                {loading ? "Sending..." : "Send for advanced help"}
              </button>
            </>
          )}
        </form>

        <div
          style={{
            border: "1px solid #e8eef5",
            borderRadius: 18,
            padding: 16,
            background: "#ffffff",
            boxShadow: "0 12px 26px rgba(15,23,42,0.05)",
            display: "grid",
            gap: 14,
          }}
        >
          <div>
            <div style={{ fontWeight: 900, color: "#0f172a", marginBottom: 8 }}>What to include</div>
            <ul style={{ margin: 0, paddingLeft: 18, display: "grid", gap: 8, color: "#64748b", lineHeight: 1.6 }}>
              <li>Which plan, listing, expert, or tool you are referring to</li>
              <li>What outcome you are trying to achieve</li>
              <li>Any budget, location, or timing detail that matters</li>
              <li>The best email or phone number for follow-up</li>
            </ul>
          </div>

          <div style={{ height: 1, background: "#edf2f8" }} />

          <div style={{ display: "grid", gap: 8, color: "#64748b", lineHeight: 1.6 }}>
            <div><strong style={{ color: "#0f172a" }}>Routing:</strong> sent directly to the CivilBridge support desk</div>
            <div><strong style={{ color: "#0f172a" }}>Response time:</strong> within one business day</div>
            <div><strong style={{ color: "#0f172a" }}>Location:</strong> Kigali, Rwanda</div>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 960px) {
          div[style*="grid-template-columns: 1fr 0.92fr"] {
            grid-template-columns: 1fr !important;
          }
          div[style*="grid-template-columns: 1fr 1fr"] {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </PageShell>
  );
}
