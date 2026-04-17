import { useState } from "react";
import PageShell from "../../components/common/PageShell";
import SEO from "../../components/seo/SEO";

const faqs = [
  {
    q: "Do I need AI to use CivilBridge?",
    a: "No. Estimation, BOQ tools, listings, plans, and expert connections work without AI. Intelligence is optional.",
  },
  {
    q: "Can I upload my own plan and get an estimate?",
    a: "Yes. Upload your drawings and key project details in Upload Center. Estimator uses rules and unit-rates to generate a BOQ.",
  },
  {
    q: "Do you sell land and finished houses?",
    a: "We list verified properties and plots. For deeper verification and viewing, we connect you with the right contact and arrange visits.",
  },
  {
    q: "How do you verify professionals?",
    a: "Profiles are reviewed through admin approval. Documents, credentials, and visibility are controlled before experts appear publicly.",
  },
];

function AccordionRow({ item, open, onToggle }) {
  return (
    <div
      style={{
        border: "1px solid #e8eef5",
        borderRadius: 16,
        background: "#ffffff",
        boxShadow: "0 12px 26px rgba(15,23,42,0.05)",
      }}
    >
      <button
        type="button"
        onClick={onToggle}
        style={{
          width: "100%",
          border: "none",
          background: "transparent",
          padding: 16,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 12,
          cursor: "pointer",
          color: "#0f172a",
          fontSize: 15,
          fontWeight: 800,
          textAlign: "left",
        }}
      >
        <span>{item.q}</span>
        <span
          style={{
            fontSize: 18,
            color: "#2563eb",
            transform: open ? "rotate(45deg)" : "rotate(0deg)",
            transition: "transform 0.2s ease",
          }}
        >
          +
        </span>
      </button>

      {open ? (
        <div style={{ padding: "0 16px 16px", color: "#64748b", lineHeight: 1.7 }}>
          {item.a}
        </div>
      ) : null}
    </div>
  );
}

export default function FAQAccordion() {
  const [openIndex, setOpenIndex] = useState(0);

  return (
    <PageShell title="Documentation" subtitle="Open a question to reveal the answer.">
      <SEO
        title="Documentation"
        description="Frequently asked questions about CivilBridge."
      />

      <div style={{ display: "grid", gap: 12 }}>
        {faqs.map((item, index) => (
          <AccordionRow
            key={item.q}
            item={item}
            open={openIndex === index}
            onToggle={() => setOpenIndex((current) => (current === index ? -1 : index))}
          />
        ))}
      </div>
    </PageShell>
  );
}
