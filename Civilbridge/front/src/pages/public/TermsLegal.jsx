import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import SEO from "../../components/seo/SEO";

const EFFECTIVE_DATE = "April 17, 2026";

const sections = [
  {
    title: "Acceptance of Terms",
    body:
      "By accessing or using CivilBridge as a guest, registered client, engineer, or administrator, you confirm that you have read, understood, and agreed to these Terms & Conditions and the CivilBridge privacy commitments.",
  },
  {
    title: "About CivilBridge",
    body:
      "CivilBridge is a digital construction intelligence platform operated in Rwanda. The platform supports AI-assisted planning, cost estimation, plan analysis, professional matching, and a property marketplace for users across Rwanda and the East African region.",
  },
  {
    title: "Eligibility and Accounts",
    body:
      "You must be at least 18 years old and legally capable of entering binding agreements. Registered accounts require verified contact information, and professional accounts remain subject to manual review and approval before public activation.",
  },
  {
    title: "Platform Services",
    body:
      "CivilBridge offers public browsing, estimation tools, plan workflows, marketplace discovery, expert coordination, and paid project outputs. Certain advanced features may require payment, approval, or engineer review before use.",
  },
  {
    title: "AI Outputs and Engineering Review",
    body:
      "AI estimations, generated plans, BOQs, and feasibility outputs are intelligent approximations based on the information provided and available market benchmarks. They are not certified professional documents and must be reviewed by an approved professional before being relied on for permits, execution, or procurement.",
  },
  {
    title: "As-Is and No Warranty",
    body:
      "CivilBridge and all platform outputs are provided on an as-is and as-available basis. To the fullest extent permitted by law, CivilBridge disclaims warranties of accuracy, merchantability, fitness for a particular purpose, uninterrupted access, or suitability for construction decisions made without professional review.",
  },
  {
    title: "Professionals and Marketplace Listings",
    body:
      "Engineers, architects, contractors, suppliers, and listing owners are responsible for the accuracy of their submissions, credentials, and professional conduct. CivilBridge facilitates discovery and workflow but does not act as a property broker, engineering firm, or construction contractor.",
  },
  {
    title: "Payments and Refunds",
    body:
      "Paid outputs, subscriptions, and project credits follow the published payment and refund rules. Where a technical failure prevents delivery of a paid output, CivilBridge may reprocess the request or issue an appropriate credit in line with the policy framework.",
  },
  {
    title: "Intellectual Property",
    body:
      "CivilBridge retains ownership of the platform, brand, code, interface, and internal systems. Users retain ownership of uploaded files, while granting CivilBridge a limited license to process and store that content in order to deliver services.",
  },
  {
    title: "Prohibited Conduct",
    body:
      "You may not impersonate others, submit false or misleading information, misuse credits, reverse engineer restricted systems, scrape data, upload infringing content, or use the platform for unlawful conduct.",
  },
  {
    title: "Limit of Liability",
    body:
      "To the fullest extent permitted by Rwandan law, CivilBridge Ltd is not liable for indirect, incidental, consequential, or special loss arising from use of the platform, reliance on AI outputs without professional review, actions of independent professionals, listing inaccuracies, permit outcomes, or circumstances outside our reasonable control. Our total aggregate liability for claims connected to your use of the platform shall not exceed the amount you paid to CivilBridge in the twelve months before the claim.",
  },
  {
    title: "Privacy and Data Handling",
    body:
      "CivilBridge collects account, project, usage, payment confirmation, and technical data only as needed to operate the platform, improve services, prevent fraud, and comply with law. Sensitive data is protected with encryption, access controls, and retention limits described in the CivilBridge Legal Framework.",
  },
  {
    title: "Governing Law and Disputes",
    body:
      "These terms are governed by the laws of the Republic of Rwanda. Disputes should first be referred to mediation and, if unresolved, may be submitted to the competent courts of Kigali, Rwanda.",
  },
];

const contactRows = [
  ["General enquiries", "contact@civilbridge.rw"],
  ["Privacy and data requests", "privacy@civilbridge.rw"],
  ["Billing disputes", "billing@civilbridge.rw"],
  ["Engineer verification", "engineers@civilbridge.rw"],
  ["Phone", "+250 7 90 850 144"],
  ["Address", "Kigali, Rwanda"],
];

export default function TermsLegal() {
  const [accepted, setAccepted] = useState(false);

  const summary = useMemo(
    () => [
      "AI outputs require professional review before execution or permit use.",
      "Professional services are delivered by independent experts, not by CivilBridge as an engineering firm.",
      "Platform use is subject to Rwanda law, data protection duties, and the liability limits below.",
    ],
    [],
  );

  return (
    <div style={{ minHeight: "100vh", background: "#f8fafc", color: "#0f172a" }}>
      <SEO
        title="Terms & Conditions"
        description="CivilBridge Terms & Conditions and legal framework."
      />

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "96px 18px 40px" }}>
        <div
          style={{
            display: "grid",
            gap: 18,
            gridTemplateColumns: "1.35fr 0.85fr",
            alignItems: "start",
          }}
        >
          <div
            style={{
              border: "1px solid #e8eef5",
              borderRadius: 22,
              background: "#ffffff",
              padding: 24,
              boxShadow: "0 18px 38px rgba(15,23,42,0.06)",
            }}
          >
            <div style={{ display: "grid", gap: 8, marginBottom: 24 }}>
              <div style={{ color: "#2563eb", fontSize: 12, fontWeight: 800, letterSpacing: "0.14em", textTransform: "uppercase" }}>
                CivilBridge Legal Framework
              </div>
              <h1 style={{ margin: 0, fontSize: 34, letterSpacing: "-0.03em" }}>Terms & Conditions</h1>
              <p style={{ margin: 0, color: "#64748b", lineHeight: 1.7 }}>
                This page is compiled from the CivilBridge legal framework document and governs use of the platform, privacy handling, AI limitations, and user responsibilities.
              </p>
              <div style={{ color: "#64748b", fontSize: 14 }}>
                Effective date: <strong style={{ color: "#0f172a" }}>{EFFECTIVE_DATE}</strong>
              </div>
            </div>

            <div
              style={{
                border: "1px solid #dbeafe",
                background: "#eff6ff",
                borderRadius: 18,
                padding: 18,
                marginBottom: 20,
              }}
            >
              <div style={{ fontWeight: 800, marginBottom: 10 }}>Key points before you continue</div>
              <ul style={{ margin: 0, paddingLeft: 18, display: "grid", gap: 8, color: "#475569", lineHeight: 1.6 }}>
                {summary.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>

            <div style={{ display: "grid", gap: 14 }}>
              {sections.map((section) => (
                <section
                  key={section.title}
                  style={{
                    border: "1px solid #e8eef5",
                    borderRadius: 18,
                    padding: 18,
                    background: "#ffffff",
                  }}
                >
                  <h2 style={{ margin: "0 0 10px", fontSize: 20 }}>{section.title}</h2>
                  <p style={{ margin: 0, color: "#64748b", lineHeight: 1.75 }}>{section.body}</p>
                </section>
              ))}
            </div>
          </div>

          <div style={{ display: "grid", gap: 18, position: "sticky", top: 84 }}>
            <div
              style={{
                border: "1px solid #e8eef5",
                borderRadius: 22,
                background: "#ffffff",
                padding: 20,
                boxShadow: "0 18px 38px rgba(15,23,42,0.06)",
              }}
            >
              <div style={{ fontSize: 20, fontWeight: 800, marginBottom: 10 }}>Clickwrap confirmation</div>
              <p style={{ margin: "0 0 16px", color: "#64748b", lineHeight: 1.7 }}>
                Before starting registration, confirm that you have read and agree to these terms, including the as-is and limit of liability clauses.
              </p>

              <label
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 10,
                  color: "#475569",
                  lineHeight: 1.6,
                  marginBottom: 18,
                }}
              >
                <input
                  type="checkbox"
                  checked={accepted}
                  onChange={(event) => setAccepted(event.target.checked)}
                  style={{ marginTop: 4 }}
                />
                <span>I have read and agree to the CivilBridge Terms & Conditions and Privacy commitments.</span>
              </label>

              {accepted ? (
                <Link
                  to="/register"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: "100%",
                    minHeight: 46,
                    borderRadius: 14,
                    textDecoration: "none",
                    background: "#2563eb",
                    color: "#ffffff",
                    fontWeight: 800,
                  }}
                >
                  Continue to registration
                </Link>
              ) : (
                <button
                  type="button"
                  disabled
                  style={{
                    width: "100%",
                    minHeight: 46,
                    borderRadius: 14,
                    border: "none",
                    background: "#cbd5e1",
                    color: "#ffffff",
                    fontWeight: 800,
                    cursor: "not-allowed",
                  }}
                >
                  Continue to registration
                </button>
              )}
            </div>

            <div
              style={{
                border: "1px solid #e8eef5",
                borderRadius: 22,
                background: "#ffffff",
                padding: 20,
                boxShadow: "0 18px 38px rgba(15,23,42,0.06)",
              }}
            >
              <div style={{ fontSize: 20, fontWeight: 800, marginBottom: 10 }}>Contact information</div>
              <div style={{ display: "grid", gap: 10 }}>
                {contactRows.map(([label, value]) => (
                  <div key={label} style={{ display: "grid", gap: 4 }}>
                    <div style={{ fontSize: 12, fontWeight: 800, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                      {label}
                    </div>
                    <div style={{ color: "#0f172a", lineHeight: 1.6 }}>{value}</div>
                  </div>
                ))}
              </div>
            </div>

            <Link to="/" style={{ color: "#2563eb", fontWeight: 700, textDecoration: "none" }}>
              Back to home
            </Link>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 960px) {
          div[style*="grid-template-columns: 1.35fr 0.85fr"] {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}
