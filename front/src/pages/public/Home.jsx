import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import "./home.css";

const slides = [
  {
    title: "Real Estate & Land Marketplace",
    subtitle: "Explore verified properties and build-ready plots.",
    image:
      "https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=2000&q=80",
  },
  {
    title: "Plans Library",
    subtitle: "View modern plans with renders and quick estimates.",
    image:
      "https://images.unsplash.com/photo-1503387762-592dea58ef23?auto=format&fit=crop&w=2000&q=80",
  },
  {
    title: "Estimator & BOQ Tools",
    subtitle: "Generate cost breakdowns and documents—no AI required.",
    image:
      "https://images.unsplash.com/photo-1581094794329-c8112a89af12?auto=format&fit=crop&w=2000&q=80",
  },
];

export default function Home() {
  const [active, setActive] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setActive((prev) => (prev + 1) % slides.length);
    }, 4500);
    return () => clearInterval(id);
  }, []);

  const current = useMemo(() => slides[active], [active]);

  return (
    <div className="cb-home">
      <section className="cb-hero">
        <div className="cb-heroLeft">
          <div className="cb-badge">CivilBridge Global • Full Ecosystem</div>

          <h1 className="cb-title">
            Build, Buy, and Manage construction in one trusted platform.
          </h1>

          <p className="cb-subtitle">
            CivilBridge connects real estate & land listings, plan templates,
            cost estimation, verified experts, and compliance guidance — designed
            to work today, and grow with AI later.
          </p>

          <div className="cb-ctaRow">
            <Link className="cb-btn primary" to="/marketplace">
              Explore Marketplace
            </Link>
            <Link className="cb-btn ghost" to="/estimator">
              Start Estimation
            </Link>
            <Link className="cb-btn ghost" to="/plans">
              Browse Plans
            </Link>
          </div>

          <div className="cb-trustRow">
            <div className="cb-trustItem">Verified Providers</div>
            <div className="cb-trustItem">BOQ & Feasibility</div>
            <div className="cb-trustItem">Permit Guidance</div>
          </div>
        </div>

        {/* Animated Intro Area */}
        <div className="cb-heroRight">
          <div className="cb-slide">
            <div
              className="cb-slideImage"
              style={{ backgroundImage: `url(${current.image})` }}
              key={current.image}
            />
            <div className="cb-slideOverlay">
              <div className="cb-slideTitle">{current.title}</div>
              <div className="cb-slideSub">{current.subtitle}</div>
            </div>

            <div className="cb-dots">
              {slides.map((_, i) => (
                <button
                  key={i}
                  className={`cb-dot ${i === active ? "active" : ""}`}
                  onClick={() => setActive(i)}
                  aria-label={`Go to slide ${i + 1}`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="cb-pillars" id="how-it-works">
        <h2 className="cb-sectionTitle">The CivilBridge Ecosystem</h2>
        <p className="cb-sectionSub">
          Everything you need to go from idea → plan → cost → compliance → build
          → move-in.
        </p>

        <div className="cb-grid">
          <Pillar
            title="Real Estate & Land"
            desc="List and discover properties and build-ready plots. Request visits and full details."
          />
          <Pillar
            title="Plans Library"
            desc="Pre-designed architectural & structural templates with renders and project previews."
          />
          <Pillar
            title="Estimator & BOQ"
            desc="Rule-based estimation, BOQ generation, feasibility reports—works without AI."
          />
          <Pillar
            title="Verified Experts"
            desc="Contractors, engineers, architects, suppliers—verified profiles with ratings."
          />
          <Pillar
            title="Permits & Compliance"
            desc="Region-based permit guidance, checklists, document tracking."
          />
          <Pillar
            title="Intelligence Layer"
            desc="ROI tools and optional AI Studio (Beta) to guide decisions."
          />
        </div>
      </section>

      <section className="cb-preview">
        <div className="cb-previewHead">
          <h2 className="cb-sectionTitle">Start with what matters most</h2>
          <p className="cb-sectionSub">
            Browse, estimate, and plan your next project in minutes.
          </p>
        </div>

        <div className="cb-previewGrid">
          <PreviewCard
            title="Marketplace"
            desc="Properties & Land listings"
            cta="View Marketplace"
            to="/marketplace"
          />
          <PreviewCard
            title="Plans"
            desc="Residential, commercial, industrial templates"
            cta="View Plans"
            to="/plans"
          />
          <PreviewCard
            title="Estimator"
            desc="Cost breakdown + BOQ (MVP)"
            cta="Start Estimation"
            to="/estimator"
          />
        </div>
      </section>

      <section className="cb-footCTA">
        <div className="cb-footBox">
          <div>
            <h3 className="cb-footTitle">Ready to start a project?</h3>
            <p className="cb-footSub">
              Create an estimate, upload a plan for reference, and generate
              professional documents.
            </p>
          </div>
          <Link className="cb-btn primary" to="/register">
            Create an Account
          </Link>
        </div>
      </section>
    </div>
  );
}

function Pillar({ title, desc }) {
  return (
    <div className="cb-card">
      <div className="cb-cardTitle">{title}</div>
      <div className="cb-cardDesc">{desc}</div>
    </div>
  );
}

function PreviewCard({ title, desc, cta, to }) {
  return (
    <div className="cb-previewCard">
      <div className="cb-previewTitle">{title}</div>
      <div className="cb-previewDesc">{desc}</div>
      <Link className="cb-link" to={to}>
        {cta} →
      </Link>
    </div>
  );
}   