import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import "./scrollStory.css";

// ─────────────────────────────────────────
// DATA
// ─────────────────────────────────────────

const TRUST_ITEMS = [
  "Verified Professionals",
  "BOQ-Based Estimation",
  "Compliance Ready",
  "End-to-End Workflow",
  "Real Estate Listings",
];

const STATS = [
  { num: "2,400", suffix: "+", label: "Registered Experts" },
  { num: "18K",   suffix: "+", label: "Projects Estimated" },
  { num: "97",    suffix: "%", label: "Client Satisfaction" },
  { num: "140",   suffix: "+", label: "Plan Templates" },
];

const HOW_STEPS = [
  {
    num: "01",
    title: "Create Project",
    desc: "Describe your build — type, size, location, and budget range.",
  },
  {
    num: "02",
    title: "Explore Plans",
    desc: "Browse curated residential and commercial architectural plans.",
  },
  {
    num: "03",
    title: "Get Estimate",
    desc: "Instant BOQ-based cost breakdown — materials, labour, timeline.",
  },
  {
    num: "04",
    title: "Hire Experts",
    desc: "Connect with verified engineers, architects, and contractors.",
  },
  {
    num: "05",
    title: "Start Building",
    desc: "Track compliance, manage documents, and monitor progress.",
  },
];

const FEATURES = [
  {
    icon: "🏗️",
    title: "Smart Estimation Engine",
    desc: "Rule-based BOQ system that generates accurate material and cost breakdowns — no AI required. Upload plans later to unlock faster takeoffs.",
  },
  {
    icon: "🗺️",
    title: "Real Estate Marketplace",
    desc: "Buy, sell, or discover verified plots and build-ready properties. Admin-verified listings with direct contact flows.",
  },
  {
    icon: "📐",
    title: "Plans Library",
    desc: "150+ curated residential and commercial designs. Filter by size, style, budget, and region. Download specs instantly.",
  },
  {
    icon: "👷",
    title: "Verified Expert Network",
    desc: "Engineers, architects, contractors, and suppliers — all verified. View portfolios, request quotes, and manage engagements.",
  },
  {
    icon: "⚖️",
    title: "Compliance Guidance",
    desc: "Step-by-step compliance workflows for permits and approvals. Know what's needed before you break ground.",
  },
  {
    icon: "🤖",
    title: "AI Studio (Beta)",
    desc: "Optional intelligence layer for planning, budgeting, and recommendations. Designed to support — not replace — your judgment.",
  },
];

const STORY_SECTIONS = [
  {
    eyebrow: "Technology meets construction",
    title: "Plan smarter, avoid costly mistakes",
    desc: "CivilBridge guides you from idea → plan → estimate → compliance → build. It works entirely without AI — intelligence is an optional layer you add when you're ready.",
    image: "https://images.unsplash.com/photo-1503387762-592dea58ef23?auto=format&fit=crop&w=1600&q=80",
    badge: "Trusted by 12,000+ professionals",
    cta: { label: "Browse Plans", to: "/plans" },
    ctaGhost: { label: "How it works", to: "/#how-it-works" },
    tone: "light",
  },
  {
    eyebrow: "Marketplace",
    title: "Verified land listings & build-ready real estate",
    desc: "Discover plots, properties, and development opportunities. Every listing is verified by our admin team — connect with owners and arrange site visits with confidence.",
    image: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=1600&q=80",
    badge: "New listings weekly",
    cta: { label: "Explore Marketplace", to: "/marketplace" },
    tone: "blue",
  },
  {
    eyebrow: "Estimator (MVP)",
    title: "Transparent cost estimation from day one",
    desc: "Input your project parameters and get an instant breakdown of materials, labour, and timeline. No guesswork. No surprises. Built on real construction data.",
    image: "https://images.unsplash.com/photo-1581094794329-c8112a89af12?auto=format&fit=crop&w=1600&q=80",
    badge: "BOQ-based accuracy",
    cta: { label: "Start Estimation", to: "/estimator" },
    ctaGhost: { label: "See sample report", to: "/estimator/sample" },
    tone: "dark",
  },
  {
    eyebrow: "Verified professionals",
    title: "Hire engineers, contractors & suppliers you can trust",
    desc: "Browse vetted professionals with verified credentials, active portfolios, and transparent project histories. Request quotes, review compliance status, and engage — all in one place.",
    image: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=1600&q=80",
    badge: "2,400+ active professionals",
    cta: { label: "Browse Experts", to: "/experts" },
    tone: "light",
  },
];

// ─────────────────────────────────────────
// COMPONENT
// ─────────────────────────────────────────

export default function ScrollStory() {
  const rootRef = useRef(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const items = root.querySelectorAll("[data-reveal]");
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) e.target.classList.add("is-visible");
        });
      },
      { threshold: 0.12 }
    );

    items.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  return (
    <div ref={rootRef} className="cb-story">

      {/* ── Trust Bar ── */}
      <div className="cb-trustBar">
        <div className="cb-wrap">
          <div className="cb-trustInner">
            {TRUST_ITEMS.map((t) => (
              <div className="cb-trustItem" key={t}>
                <div className="cb-trustDot" />
                <span className="cb-trustLabel">{t}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Stat Bar ── */}
      <section className="cb-statBar" data-reveal>
        <div className="cb-wrap">
          <div className="cb-statGrid">
            {STATS.map((s, i) => (
              <div className="cb-stat" key={i} data-reveal data-delay={i + 1}>
                <div className="cb-statNum">
                  {s.num}<span>{s.suffix}</span>
                </div>
                <div className="cb-statDesc">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Intro Band ── */}
      <section className="cb-band cb-bandSoft" data-reveal>
        <div className="cb-wrap">
          <div className="cb-bandGrid">
            <div>
              <div className="cb-kicker">CivilBridge Ecosystem</div>
              <h2 className="cb-h2">
                Everything you need —<br />from idea to move-in.
              </h2>
              <p className="cb-p" style={{ maxWidth: 520 }}>
                Marketplace + Plans + Estimation + Expert Network + Compliance, designed
                to be realistic today and expandable as you grow.
              </p>
              <div className="cb-actions" style={{ marginTop: 24 }}>
                <Link to="/register" className="cb-btnPrimary">Get started free</Link>
                <Link to="/plans" className="cb-btnGhost">Explore plans →</Link>
              </div>
            </div>

            <div className="cb-metrics">
              <div className="cb-metric" data-reveal data-delay="1">
                <div className="cb-metricNum">✓</div>
                <div className="cb-metricText">Verified listings & providers</div>
              </div>
              <div className="cb-metric" data-reveal data-delay="2">
                <div className="cb-metricNum">BOQ</div>
                <div className="cb-metricText">Rule-based cost estimation</div>
              </div>
              <div className="cb-metric" data-reveal data-delay="3">
                <div className="cb-metricNum">⚖</div>
                <div className="cb-metricText">Compliance guidance workflow</div>
              </div>
              <div className="cb-metric" data-reveal data-delay="4">
                <div className="cb-metricNum">🤖</div>
                <div className="cb-metricText">AI Studio (optional layer)</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── How It Works ── */}
      <section className="cb-howWorks" id="how-it-works" data-reveal>
        <div className="cb-wrap">
          <div className="cb-howHeader">
            <div className="cb-kicker" style={{ justifyContent: "center", margin: "0 auto 16px" }}>
              Simple process
            </div>
            <h2 className="cb-h2" style={{ textAlign: "center" }}>
              How CivilBridge works
            </h2>
            <p className="cb-p" style={{ textAlign: "center" }}>
              Five clear steps from concept to construction — each backed by tools, experts, and verified data.
            </p>
          </div>
          <div className="cb-howSteps">
            {HOW_STEPS.map((step, i) => (
              <div className="cb-step" key={i} data-reveal data-delay={i + 1}>
                <div className="cb-stepNum">{step.num}</div>
                <div className="cb-stepTitle">{step.title}</div>
                <div className="cb-stepDesc">{step.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Story Slices ── */}
      {STORY_SECTIONS.map((s, idx) => (
        <section key={idx} className={`cb-slice cb-${s.tone}`} data-reveal>
          <div className="cb-wrap">
            <div className={`cb-sliceGrid ${idx % 2 ? "reverse" : ""}`}>
              {/* Text */}
              <div className="cb-sliceText">
                <div className="cb-eyebrow">{s.eyebrow}</div>
                <h3 className="cb-h3">{s.title}</h3>
                <p className="cb-p">{s.desc}</p>
                <div className="cb-actions">
                  <Link to={s.cta.to} className="cb-btnPrimary">
                    {s.cta.label}
                  </Link>
                  {s.ctaGhost && (
                    <Link to={s.ctaGhost.to} className="cb-btnGhost">
                      {s.ctaGhost.label}
                    </Link>
                  )}
                </div>
              </div>

              {/* Media */}
              <div className="cb-mediaWrap">
                <div
                  className="cb-media"
                  style={{ backgroundImage: `url("${s.image}")` }}
                  role="img"
                  aria-label={s.title}
                />
                {s.badge && (
                  <div className="cb-mediaBadge">
                    <div className="cb-mediaBadgeDot" />
                    <span className="cb-mediaBadgeText">{s.badge}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
      ))}

      {/* ── Feature Grid ── */}
      <section className="cb-featureGrid" data-reveal>
        <div className="cb-wrap">
          <div className="cb-featureHeader">
            <div className="cb-kicker" style={{ justifyContent: "center", margin: "0 auto 16px" }}>
              Platform capabilities
            </div>
            <h2 className="cb-h2" style={{ textAlign: "center" }}>
              Everything under one roof
            </h2>
            <p className="cb-p" style={{ textAlign: "center" }}>
              CivilBridge is built to cover the full construction journey — not just one piece of it.
            </p>
          </div>
          <div className="cb-features">
            {FEATURES.map((f, i) => (
              <div className="cb-feature" key={i} data-reveal data-delay={(i % 3) + 1}>
                <div className="cb-featureIcon">{f.icon}</div>
                <p className="cb-featureTitle">{f.title}</p>
                <p className="cb-featureDesc">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Final CTA ── */}
      <section className="cb-ctaSection" data-reveal>
        <div className="cb-wrap">
          <div className="cb-ctaInner">
            <div className="cb-ctaText">
              <h2 className="cb-h2">Ready to start your project?</h2>
              <p className="cb-p">
                Estimate your cost, browse plans, and connect with verified professionals — all in one place.
              </p>
            </div>
            <div className="cb-ctaBtns">
              <Link to="/register" className="cb-btnPrimary">
                Join CivilBridge
              </Link>
              <Link to="/marketplace" className="cb-btnGhost">
                Explore Marketplace
              </Link>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
