import { useEffect, useRef, useState, useCallback } from "react";
import { Link } from "react-router-dom";

// Use local uploaded images from /public or src/assets
const SLIDES = [
  {
    badge: "Welcome to CivilBridge",
    badgeIcon: "🏗️",
    title: ["Your Construction Journey,", "Digitally Mastered."],
    desc: "Bridging the gap between architectural dreams and structural reality with smart, reliable workflows.",
    ctas: [
      { label: "Explore Marketplace", to: "/marketplace", variant: "primary" },
      { label: "How it Works", to: "/#how-it-works", variant: "ghost" },
    ],
    image: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=85&w=2400&auto=format&fit=cropimport",
    stat: { value: "18K+", label: "Projects estimated" },
  },
  {
    badge: "AI Studio (Beta)",
    badgeIcon: "🤖",
    title: ["Smarter Guidance.", "Real Decisions."],
    desc: "Optional intelligence to support planning, budgeting, and next-step recommendations — without replacing your judgment.",
    ctas: [
      { label: "Open AI Studio", to: "/dashboard/ai-studio", variant: "primary" },
      { label: "Learn more", to: "/intelligence", variant: "ghost" },
    ],
    image: "https://images.unsplash.com/photo-1633356305829-0c70a1d5a8e0?q=85&w=2400&auto=format&fit=cropimport",
    stat: { value: "Beta", label: "Early access open" },
  },
  {
    badge: "Verified Experts",
    badgeIcon: "👷",
    title: ["Hire Trusted", "Engineering Talent."],
    desc: "Connect with vetted engineers, architects, and contractors — built for trust, compliance, and long-term projects.",
    ctas: [
      { label: "Browse Experts", to: "/experts", variant: "primary" },
      { label: "Become an Expert", to: "/register", variant: "ghost" },
    ],
    image: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?q=85&w=2400&auto=format&fit=cropimport",
    stat: { value: "2,400+", label: "Active professionals" },
  },
  {
    badge: "Plans Library",
    badgeIcon: "📐",
    title: ["Ready-to-build Plans", "You Can Trust."],
    desc: "Browse curated residential and commercial plans with estimated build ranges, compliance notes, and architect contacts.",
    ctas: [
      { label: "Explore Plans", to: "/plans", variant: "primary" },
      { label: "Upload yours", to: "/uploads", variant: "ghost" },
    ],
    image: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?q=85&w=2400&auto=format&fit=cropimport",
    stat: { value: "140+", label: "Plan templates" },
  },
  {
    badge: "Cost Control",
    badgeIcon: "📊",
    title: ["Real-time Estimation", "From Day One."],
    desc: "Estimate project cost, materials, and timeline — transparently, accurately, and instantly.",
    ctas: [
      { label: "Get an Estimate", to: "/estimator", variant: "primary" },
      { label: "See sample", to: "/estimator", variant: "ghost" },
    ],
    image: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?q=85&w=2400&auto=format&fit=cropimport",
    stat: { value: "97%", label: "Client satisfaction" },
  },
];

const DURATION = 5000;

const S = {
  section: {
    position: "relative",
    height: "calc(100vh - 72px)",
    minHeight: 640,
    overflow: "hidden",
    backgroundColor: "#070b14",
    fontFamily: "'Sora', sans-serif",
  },
  slideWrap: (active) => ({
    position: "absolute",
    inset: 0,
    opacity: active ? 1 : 0,
    transition: "opacity 900ms ease",
    pointerEvents: active ? "auto" : "none",
  }),
  bgImg: (src, active) => ({
    position: "absolute",
    inset: 0,
    backgroundImage: `url("${src}")`,
    backgroundSize: "cover",
    backgroundPosition: "center",
    transform: active ? "scale(1.08)" : "scale(1.02)",
    transition: "transform 7000ms linear",
  }),
  overlay: {
    position: "absolute",
    inset: 0,
    background:
      "linear-gradient(to right, rgba(7,11,20,0.96) 0%, rgba(7,11,20,0.72) 55%, rgba(7,11,20,0.45) 100%), linear-gradient(to top, rgba(7,11,20,0.65) 0%, transparent 40%)",
  },
  contentArea: {
    position: "relative",
    zIndex: 3,
    maxWidth: 1200,
    margin: "0 auto",
    padding: "0 28px",
    height: "100%",
    display: "flex",
    alignItems: "center",
  },
  textBlock: (active) => ({
    maxWidth: 660,
    transform: active ? "translateY(0px)" : "translateY(40px)",
    opacity: active ? 1 : 0,
    transition: "all 1000ms cubic-bezier(0.16, 1, 0.3, 1) 200ms",
  }),
  badge: {
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
    padding: "7px 14px",
    borderRadius: 999,
    background: "rgba(42,102,255,0.18)",
    border: "1px solid rgba(42,102,255,0.35)",
    color: "#93bbff",
    fontWeight: 700,
    fontSize: 12,
    letterSpacing: "0.06em",
    textTransform: "uppercase",
    marginBottom: 22,
    fontFamily: "'DM Sans', sans-serif",
    backdropFilter: "blur(6px)",
  },
  h1: {
    margin: "0 0 8px",
    fontSize: "clamp(34px, 6.5vw, 64px)",
    lineHeight: 1.03,
    fontWeight: 900,
    color: "#fff",
    letterSpacing: "-0.04em",
  },
  h1Highlight: {
    color: "#2a66ff",
    display: "block",
  },
  desc: {
    margin: "0 0 36px",
    color: "rgba(255,255,255,0.68)",
    fontSize: 17,
    lineHeight: 1.7,
    maxWidth: 500,
    fontFamily: "'DM Sans', sans-serif",
    fontWeight: 400,
  },
  ctaRow: {
    display: "flex",
    gap: 14,
    flexWrap: "wrap",
    alignItems: "center",
  },
  statPill: {
    marginTop: 44,
    display: "inline-flex",
    alignItems: "center",
    gap: 10,
    padding: "10px 18px",
    borderRadius: 12,
    background: "rgba(255,255,255,0.06)",
    border: "1px solid rgba(255,255,255,0.10)",
    backdropFilter: "blur(8px)",
  },
  statValue: {
    fontWeight: 900,
    fontSize: 20,
    color: "#fff",
    letterSpacing: "-0.02em",
  },
  statLabel: {
    fontFamily: "'DM Sans', sans-serif",
    fontSize: 13,
    color: "rgba(255,255,255,0.55)",
    fontWeight: 500,
  },
  statDivider: {
    width: 1,
    height: 24,
    background: "rgba(255,255,255,0.12)",
  },
  dotsBar: {
    position: "absolute",
    bottom: 28,
    left: "50%",
    transform: "translateX(-50%)",
    display: "flex",
    gap: 10,
    zIndex: 10,
    alignItems: "center",
  },
  dotWrap: {
    display: "flex",
    alignItems: "center",
    cursor: "pointer",
  },
  dot: (active) => ({
    position: "relative",
    height: 4,
    width: active ? 42 : 10,
    borderRadius: 999,
    background: active ? "rgba(255,255,255,0.14)" : "rgba(255,255,255,0.18)",
    overflow: "hidden",
    transition: "width 350ms ease, background 300ms ease",
  }),
  dotFill: {
    position: "absolute",
    inset: 0,
    background: "#2a66ff",
    transformOrigin: "left",
  },
  counter: {
    position: "absolute",
    top: 28,
    right: 28,
    zIndex: 10,
    display: "flex",
    alignItems: "baseline",
    gap: 4,
  },
  counterCurrent: {
    fontSize: 28,
    fontWeight: 900,
    color: "#fff",
    letterSpacing: "-0.04em",
  },
  counterSep: {
    fontSize: 14,
    color: "rgba(255,255,255,0.28)",
  },
  counterTotal: {
    fontSize: 14,
    color: "rgba(255,255,255,0.35)",
    fontWeight: 700,
  },
  arrowBtn: (side, hovered) => ({
    position: "absolute",
    top: "50%",
    [side]: 20,
    transform: "translateY(-50%)",
    zIndex: 10,
    width: 46,
    height: 46,
    borderRadius: 999,
    background: hovered ? "rgba(255,255,255,0.15)" : "rgba(255,255,255,0.08)",
    border: "1px solid rgba(255,255,255,0.12)",
    color: "#fff",
    fontSize: 22,
    cursor: "pointer",
    display: "grid",
    placeItems: "center",
    backdropFilter: "blur(6px)",
    transition: "background .2s ease",
  }),
};

function ctaStyle(variant, hovered) {
  const base = {
    textDecoration: "none",
    fontFamily: "'DM Sans', sans-serif",
    fontWeight: 800,
    fontSize: 15,
    padding: "14px 28px",
    borderRadius: 10,
    transition: "all .25s ease",
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
    letterSpacing: "0.01em",
  };

  if (variant === "primary") {
    return {
      ...base,
      color: "#fff",
      background: hovered
        ? "linear-gradient(135deg,#3d78ff,#2a66ff)"
        : "linear-gradient(135deg,#2a66ff,#1d4ed8)",
      boxShadow: hovered
        ? "0 12px 28px rgba(29,78,216,.25)"
        : "0 8px 20px rgba(29,78,216,.15)",
      transform: hovered ? "translateY(-2px)" : "translateY(0)",
    };
  }

  return {
    ...base,
    color: hovered ? "#fff" : "rgba(255,255,255,0.82)",
    background: hovered ? "rgba(255,255,255,0.12)" : "rgba(255,255,255,0.07)",
    border: "1px solid rgba(255,255,255,0.18)",
    backdropFilter: "blur(6px)",
    transform: hovered ? "translateY(-1px)" : "translateY(0)",
  };
}

export default function HeroSlider() {
  const [index, setIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [hoveredCta, setHoveredCta] = useState(null);
  const [hoveredArrow, setHoveredArrow] = useState(null);

  const timerRef = useRef(null);
  const progressRef = useRef(null);

  useEffect(() => {
    SLIDES.forEach((s) => {
      const img = new Image();
      img.src = s.image;
    });
  }, []);

  const goTo = useCallback((i) => {
    setIndex(i);
    setProgress(0);
  }, []);

  const next = useCallback(() => {
    setIndex((p) => (p + 1) % SLIDES.length);
    setProgress(0);
  }, []);

  const prev = useCallback(() => {
    setIndex((p) => (p - 1 + SLIDES.length) % SLIDES.length);
    setProgress(0);
  }, []);

  useEffect(() => {
    clearInterval(timerRef.current);
    timerRef.current = setInterval(next, DURATION);
    return () => clearInterval(timerRef.current);
  }, [next]);

  useEffect(() => {
    clearInterval(progressRef.current);
    setProgress(0);

    const tick = 50;
    progressRef.current = setInterval(() => {
      setProgress((p) => Math.min(p + (tick / DURATION) * 100, 100));
    }, tick);

    return () => clearInterval(progressRef.current);
  }, [index]);

  return (
    <section style={S.section}>
      <div style={S.counter}>
        <span style={S.counterCurrent}>{String(index + 1).padStart(2, "0")}</span>
        <span style={S.counterSep}>/</span>
        <span style={S.counterTotal}>{String(SLIDES.length).padStart(2, "0")}</span>
      </div>

      <button
        onClick={prev}
        style={S.arrowBtn("left", hoveredArrow === "prev")}
        onMouseEnter={() => setHoveredArrow("prev")}
        onMouseLeave={() => setHoveredArrow(null)}
        aria-label="Previous slide"
      >
        ‹
      </button>

      <button
        onClick={next}
        style={S.arrowBtn("right", hoveredArrow === "next")}
        onMouseEnter={() => setHoveredArrow("next")}
        onMouseLeave={() => setHoveredArrow(null)}
        aria-label="Next slide"
      >
        ›
      </button>

      {SLIDES.map((s, i) => {
        const active = i === index;
        const lastLine = s.title[s.title.length - 1];

        return (
          <div key={i} style={S.slideWrap(active)}>
            <div style={S.bgImg(s.image, active)} />
            <div style={S.overlay} />

            <div style={S.contentArea}>
              <div style={S.textBlock(active)}>
                <div style={S.badge}>
                  <span>{s.badgeIcon}</span>
                  {s.badge}
                </div>

                <h1 style={S.h1}>
                  {s.title.map((line, li) =>
                    line === lastLine ? (
                      <span key={li} style={S.h1Highlight}>{line}</span>
                    ) : (
                      <span key={li} style={{ display: "block" }}>{line}</span>
                    )
                  )}
                </h1>

                <p style={S.desc}>{s.desc}</p>

                <div style={S.ctaRow}>
                  {s.ctas.map((cta, ci) => {
                    const key = `${cta.variant}-${i}-${ci}`;
                    return (
                      <Link
                        key={ci}
                        to={cta.to}
                        style={ctaStyle(cta.variant, hoveredCta === key)}
                        onMouseEnter={() => setHoveredCta(key)}
                        onMouseLeave={() => setHoveredCta(null)}
                      >
                        {cta.label}
                        {cta.variant === "primary" && <span>→</span>}
                      </Link>
                    );
                  })}
                </div>

                <div style={S.statPill}>
                  <span style={S.statValue}>{s.stat.value}</span>
                  <span style={S.statDivider} />
                  <span style={S.statLabel}>{s.stat.label}</span>
                </div>
              </div>
            </div>
          </div>
        );
      })}

      <div style={S.dotsBar}>
        {SLIDES.map((_, i) => {
          const active = i === index;
          return (
            <div
              key={i}
              onClick={() => goTo(i)}
              style={S.dotWrap}
              role="button"
              aria-label={`Go to slide ${i + 1}`}
            >
              <div style={S.dot(active)}>
                {active && (
                  <div
                    style={{
                      ...S.dotFill,
                      transform: `scaleX(${progress / 100})`,
                      transition: "transform 50ms linear",
                    }}
                  />
                )}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}