import PageShell from "../../components/common/PageShell";
import SEO from "../../components/seo/SEO";

function PlaceholderCard({ title, text }) {
  return (
    <div
      style={{
        border: "1px solid #e8eef5",
        borderRadius: 18,
        padding: 20,
        background: "#ffffff",
        boxShadow: "0 12px 26px rgba(15,23,42,0.05)",
      }}
    >
      <h2 style={{ margin: "0 0 10px", color: "#0f172a", fontSize: 20 }}>{title}</h2>
      <p style={{ margin: 0, color: "#64748b", lineHeight: 1.7 }}>{text}</p>
    </div>
  );
}

export default function Blog() {
  return (
    <PageShell
      title="CivilBridge Blog"
      subtitle="Project notes, product updates, engineering guidance, and construction insights will appear here."
    >
      <SEO
        title="Blog"
        description="CivilBridge blog updates and engineering insights."
      />

      <div style={{ display: "grid", gap: 16 }}>
        <PlaceholderCard
          title="Nothing yet posted"
          text="Please wait; you’ll be notified when our blog is live!"
        />
        <PlaceholderCard
          title="What will appear here"
          text="We will use this space for construction tips, product announcements, legal updates, platform walkthroughs, and new feature releases as they are ready."
        />
      </div>
    </PageShell>
  );
}
