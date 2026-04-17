import PageShell from "../../components/common/PageShell";
import SEO from "../../components/seo/SEO";
import { Link } from "react-router-dom";
import {
  Building2,
  Users,
  Shield,
  Zap,
  Globe,
  Award,
  ArrowRight,
  CheckCircle2,
  MapPin,
  Phone,
  Mail,
} from "lucide-react";

const stats = [
  { value: "500+", label: "Projects Managed", icon: Building2 },
  { value: "1,200+", label: "Verified Experts", icon: Users },
  { value: "98%", label: "Client Satisfaction", icon: Award },
  { value: "24/7", label: "AI Support", icon: Zap },
];

const values = [
  {
    title: "Transparency First",
    description:
      "Every cost, timeline, and decision is clear from day one. No hidden fees, no surprises—just honest construction management.",
    icon: Shield,
  },
  {
    title: "Local Expertise",
    description:
      "Built specifically for Rwanda and East Africa. We understand local regulations, materials, pricing, and building codes.",
    icon: MapPin,
  },
  {
    title: "Technology Driven",
    description:
      "AI-powered cost estimation, real-time progress tracking, and digital document management—all in one platform.",
    icon: Zap,
  },
  {
    title: "Community Focused",
    description:
      "Connecting homeowners with verified architects, engineers, and contractors to build stronger communities.",
    icon: Users,
  },
];

const milestones = [
  { year: "2023", event: "CivilBridge founded in Kigali, Rwanda" },
  { year: "2024", event: "Platform launched with AI estimation tools" },
  { year: "2024", event: "1,000+ verified professionals onboarded" },
  { year: "2025", event: "Expanded to regional markets" },
];

export default function About() {
  return (
    <PageShell
      title="About CivilBridge"
      subtitle="Building the future of construction management in Africa"
      maxWidth={1200}
    >
      <SEO
        title="About Us"
        description="CivilBridge is Rwanda's leading construction management platform, connecting homeowners with verified professionals and AI-powered planning tools."
      />

      {/* Hero Section */}
      <section style={styles.hero}>
        <div style={styles.heroContent}>
          <h2 style={styles.heroTitle}>
            Building Dreams, <span style={styles.highlight}>Digitally</span>
          </h2>
          <p style={styles.heroText}>
            CivilBridge is transforming how construction projects are planned, managed, and executed
            in Rwanda and East Africa. We combine cutting-edge technology with deep local expertise
            to make building your dream home or commercial project simpler, more transparent, and more
            affordable than ever before.
          </p>
          <div style={styles.heroCtas}>
            <Link to="/marketplace" style={styles.primaryCta}>
              Browse Listings <ArrowRight size={18} />
            </Link>
            <Link to="/experts" style={styles.secondaryCta}>
              Find Experts
            </Link>
          </div>
        </div>
        <div style={styles.heroVisual}>
          <div style={styles.statsGrid}>
            {stats.map((stat, index) => (
              <div key={index} style={styles.statCard}>
                <stat.icon size={24} style={styles.statIcon} />
                <div style={styles.statValue}>{stat.value}</div>
                <div style={styles.statLabel}>{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section style={styles.section}>
        <div style={styles.sectionHeader}>
          <h3 style={styles.sectionTitle}>Our Mission</h3>
          <p style={styles.sectionSubtitle}>
            Democratizing access to quality construction planning and professional services
          </p>
        </div>
        <p style={styles.missionText}>
          We believe everyone deserves access to professional construction planning, regardless of
          budget or experience. By bringing together verified experts, AI-powered tools, and transparent
          pricing, CivilBridge empowers homeowners to build with confidence.
        </p>
      </section>

      {/* Values Section */}
      <section style={styles.sectionAlt}>
        <div style={styles.sectionHeader}>
          <h3 style={styles.sectionTitle}>What We Stand For</h3>
          <p style={styles.sectionSubtitle}>The principles that guide everything we do</p>
        </div>
        <div style={styles.valuesGrid}>
          {values.map((value, index) => (
            <div key={index} style={styles.valueCard}>
              <div style={styles.valueIcon}>
                <value.icon size={28} />
              </div>
              <h4 style={styles.valueTitle}>{value.title}</h4>
              <p style={styles.valueDesc}>{value.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Journey Section */}
      <section style={styles.section}>
        <div style={styles.sectionHeader}>
          <h3 style={styles.sectionTitle}>Our Journey</h3>
          <p style={styles.sectionSubtitle}>Milestones along the way</p>
        </div>
        <div style={styles.timeline}>
          {milestones.map((milestone, index) => (
            <div key={index} style={styles.timelineItem}>
              <div style={styles.timelineMarker}>
                <CheckCircle2 size={20} />
              </div>
              <div style={styles.timelineContent}>
                <span style={styles.timelineYear}>{milestone.year}</span>
                <span style={styles.timelineEvent}>{milestone.event}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section style={styles.ctaSection}>
        <div style={styles.ctaContent}>
          <h3 style={styles.ctaTitle}>Ready to Build Something Amazing?</h3>
          <p style={styles.ctaText}>
            Join thousands of homeowners and professionals already using CivilBridge to build better.
          </p>
          <div style={styles.ctaButtons}>
            <Link to="/register" style={styles.ctaPrimary}>
              Get Started Free <ArrowRight size={18} />
            </Link>
            <Link to="/contact" style={styles.ctaSecondary}>
              Contact Sales
            </Link>
          </div>
        </div>
      </section>

      {/* Contact Info */}
      <section style={styles.contactSection}>
        <div style={styles.contactGrid}>
          <div style={styles.contactItem}>
            <MapPin size={20} style={styles.contactIcon} />
            <div>
              <div style={styles.contactLabel}>Location</div>
              <div style={styles.contactValue}>Kigali, Rwanda</div>
            </div>
          </div>
          <div style={styles.contactItem}>
            <Mail size={20} style={styles.contactIcon} />
            <div>
              <div style={styles.contactLabel}>Email</div>
              <div style={styles.contactValue}>hello@civilbridge.rw</div>
            </div>
          </div>
          <div style={styles.contactItem}>
            <Phone size={20} style={styles.contactIcon} />
            <div>
              <div style={styles.contactLabel}>Phone</div>
              <div style={styles.contactValue}>+250 788 000 000</div>
            </div>
          </div>
          <div style={styles.contactItem}>
            <Globe size={20} style={styles.contactIcon} />
            <div>
              <div style={styles.contactLabel}>Coverage</div>
              <div style={styles.contactValue}>Rwanda & East Africa</div>
            </div>
          </div>
        </div>
      </section>
    </PageShell>
  );
}

const styles = {
  hero: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "48px",
    alignItems: "center",
    padding: "40px 0",
    borderBottom: "1px solid #e9eef5",
  },
  heroContent: {
    display: "flex",
    flexDirection: "column",
    gap: "20px",
  },
  heroTitle: {
    fontSize: "42px",
    fontWeight: 800,
    lineHeight: 1.1,
    color: "#0f172a",
    margin: 0,
  },
  highlight: {
    color: "#10b981",
  },
  heroText: {
    fontSize: "16px",
    lineHeight: 1.7,
    color: "#64748b",
    margin: 0,
  },
  heroCtas: {
    display: "flex",
    gap: "12px",
    marginTop: "8px",
  },
  primaryCta: {
    display: "inline-flex",
    alignItems: "center",
    gap: "8px",
    background: "linear-gradient(135deg, #10b981, #059669)",
    color: "#ffffff",
    padding: "14px 24px",
    borderRadius: "12px",
    fontWeight: 600,
    fontSize: "14px",
    textDecoration: "none",
    transition: "all 0.2s ease",
    boxShadow: "0 4px 14px rgba(16, 185, 129, 0.35)",
  },
  secondaryCta: {
    display: "inline-flex",
    alignItems: "center",
    padding: "14px 24px",
    borderRadius: "12px",
    border: "1px solid #e2e8f0",
    color: "#475569",
    fontWeight: 600,
    fontSize: "14px",
    textDecoration: "none",
    transition: "all 0.2s ease",
    background: "#ffffff",
  },
  heroVisual: {
    display: "flex",
    justifyContent: "center",
  },
  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(2, 1fr)",
    gap: "16px",
    width: "100%",
    maxWidth: "320px",
  },
  statCard: {
    background: "#f8fafc",
    border: "1px solid #e2e8f0",
    borderRadius: "16px",
    padding: "20px",
    textAlign: "center",
  },
  statIcon: {
    color: "#10b981",
    marginBottom: "8px",
  },
  statValue: {
    fontSize: "24px",
    fontWeight: 800,
    color: "#0f172a",
  },
  statLabel: {
    fontSize: "12px",
    color: "#64748b",
    marginTop: "4px",
  },
  section: {
    padding: "48px 0",
    borderBottom: "1px solid #e9eef5",
  },
  sectionAlt: {
    padding: "48px 0",
    borderBottom: "1px solid #e9eef5",
    background: "#f8fafc",
    margin: "0 -16px",
    paddingLeft: "16px",
    paddingRight: "16px",
  },
  sectionHeader: {
    textAlign: "center",
    marginBottom: "32px",
  },
  sectionTitle: {
    fontSize: "28px",
    fontWeight: 700,
    color: "#0f172a",
    margin: "0 0 8px",
  },
  sectionSubtitle: {
    fontSize: "16px",
    color: "#64748b",
    margin: 0,
  },
  missionText: {
    fontSize: "16px",
    lineHeight: 1.8,
    color: "#475569",
    textAlign: "center",
    maxWidth: "700px",
    margin: "0 auto",
  },
  valuesGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
    gap: "20px",
  },
  valueCard: {
    background: "#ffffff",
    border: "1px solid #e2e8f0",
    borderRadius: "16px",
    padding: "24px",
    transition: "all 0.2s ease",
  },
  valueIcon: {
    width: "48px",
    height: "48px",
    borderRadius: "12px",
    background: "linear-gradient(135deg, #10b981, #059669)",
    color: "#ffffff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: "16px",
  },
  valueTitle: {
    fontSize: "18px",
    fontWeight: 700,
    color: "#0f172a",
    margin: "0 0 8px",
  },
  valueDesc: {
    fontSize: "14px",
    lineHeight: 1.6,
    color: "#64748b",
    margin: 0,
  },
  timeline: {
    display: "flex",
    flexDirection: "column",
    gap: "24px",
    maxWidth: "600px",
    margin: "0 auto",
  },
  timelineItem: {
    display: "flex",
    alignItems: "flex-start",
    gap: "16px",
  },
  timelineMarker: {
    width: "32px",
    height: "32px",
    borderRadius: "50%",
    background: "linear-gradient(135deg, #10b981, #059669)",
    color: "#ffffff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  timelineContent: {
    display: "flex",
    flexDirection: "column",
    gap: "4px",
    paddingTop: "4px",
  },
  timelineYear: {
    fontSize: "14px",
    fontWeight: 700,
    color: "#10b981",
  },
  timelineEvent: {
    fontSize: "15px",
    color: "#475569",
  },
  ctaSection: {
    padding: "56px 0",
    background: "linear-gradient(135deg, #0f172a, #1e293b)",
    margin: "0 -16px",
    borderRadius: "20px",
    marginTop: "32px",
  },
  ctaContent: {
    textAlign: "center",
    maxWidth: "500px",
    margin: "0 auto",
    padding: "0 24px",
  },
  ctaTitle: {
    fontSize: "28px",
    fontWeight: 700,
    color: "#ffffff",
    margin: "0 0 12px",
  },
  ctaText: {
    fontSize: "16px",
    color: "#94a3b8",
    margin: "0 0 28px",
  },
  ctaButtons: {
    display: "flex",
    gap: "12px",
    justifyContent: "center",
    flexWrap: "wrap",
  },
  ctaPrimary: {
    display: "inline-flex",
    alignItems: "center",
    gap: "8px",
    background: "linear-gradient(135deg, #10b981, #059669)",
    color: "#ffffff",
    padding: "14px 28px",
    borderRadius: "12px",
    fontWeight: 600,
    fontSize: "15px",
    textDecoration: "none",
    transition: "all 0.2s ease",
    boxShadow: "0 4px 14px rgba(16, 185, 129, 0.35)",
  },
  ctaSecondary: {
    display: "inline-flex",
    alignItems: "center",
    padding: "14px 28px",
    borderRadius: "12px",
    border: "1px solid rgba(255,255,255,0.2)",
    color: "#ffffff",
    fontWeight: 600,
    fontSize: "15px",
    textDecoration: "none",
    transition: "all 0.2s ease",
    background: "transparent",
  },
  contactSection: {
    padding: "32px 0 0",
  },
  contactGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    gap: "24px",
  },
  contactItem: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "16px",
    background: "#f8fafc",
    borderRadius: "12px",
    border: "1px solid #e2e8f0",
  },
  contactIcon: {
    color: "#10b981",
  },
  contactLabel: {
    fontSize: "12px",
    color: "#64748b",
    textTransform: "uppercase",
    letterSpacing: "0.05em",
    marginBottom: "2px",
  },
  contactValue: {
    fontSize: "14px",
    fontWeight: 600,
    color: "#0f172a",
  },
};
