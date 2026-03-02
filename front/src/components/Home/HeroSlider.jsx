import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { Link } from "react-router-dom";

// ─────────────────────────────────────────────────────────────
// UNIQUE images for every slide (no repeats), rich content
// ─────────────────────────────────────────────────────────────
const SLIDES = [
  {
    badge: "Welcome to CivilBridge",
    badgeIcon: "🏗️",
    title: ["Your Construction Journey,", "Digitally Mastered."],
    highlight: "Digitally Mastered.",
    desc: "Bridging the gap between architectural dreams and structural reality with smart, reliable workflows.",
    ctas: [
      { label: "Explore Marketplace", to: "/marketplace", variant: "primary" },
      { label: "How it Works",        to: "/#how-it-works", variant: "ghost"  },
    ],
    image: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=85&w=2400&auto=format&fit=crop",
    stat: { value: "18K+", label: "Projects estimated" },
  },
  {
    badge: "AI Studio (Beta)",
    badgeIcon: "🤖",
    title: ["Smarter Guidance.", "Real Decisions."],
    highlight: "Real Decisions.",
    desc: "Optional intelligence to support planning, budgeting, and next-step recommendations — without replacing your judgment.",
    ctas: [
      { label: "Open AI Studio", to: "/dashboard/ai-studio", variant: "primary" },
      { label: "Learn more",     to: "/intelligence",        variant: "ghost"  },
    ],
    image: "https://images.unsplash.com/photo-1677442136019-21780ecad995?q=85&w=2400&auto=format&fit=crop",
    stat: { value: "Beta", label: "Early access open" },
  },
  {
    badge: "Verified Experts",
    badgeIcon: "👷",
    title: ["Hire Trusted", "Engineering Talent."],
    highlight: "Engineering Talent.",
    desc: "Connect with vetted engineers, architects, and contractors — built for trust, compliance, and long-term projects.",
    ctas: [
      { label: "Browse Experts", to: "/experts",  variant: "primary" },
      { label: "Become an Expert", to: "/register", variant: "ghost" },
    ],
    image: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?q=85&w=2400&auto=format&fit=crop",
    stat: { value: "2,400+", label: "Active professionals" },
  },
  {
    badge: "Plans Library",
    badgeIcon: "📐",
    title: ["Ready-to-build Plans", "You Can Trust."],
    highlight: "You Can Trust.",
    desc: "Browse curated residential and commercial plans with estimated build ranges, compliance notes, and architect contacts.",
    ctas: [
      { label: "Explore Plans", to: "/plans",    variant: "primary" },
      { label: "Upload yours",  to: "/uploads",  variant: "ghost"   },
    ],
    image: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?q=85&w=2400&auto=format&fit=crop",
    stat: { value: "140+", label: "Plan templates" },
  },
  {
    badge: "Cost Control",
    badgeIcon: "📊",
    title: ["Real-time Estimation", "From Day One."],
    highlight: "From Day One.",
    desc: "Estimate project cost, materials, and timeline — transparently, accurately, and instantly. No spreadsheets needed.",
    ctas: [
      { label: "Get an Estimate", to: "/estimator", variant: "primary" },
      { label: "See sample",      to: "/estimator/sample", variant: "ghost" },
    ],
    // Unique image — construction cost/materials themed
    image: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?q=85&w=2400&auto=format&fit=crop",
    stat: { value: "97%", label: "Client satisfaction" },
  },
];

// ─────────────────────────────────────────────────────────────
// STYLES (all outside component — no recreation on render)
// ─────────────────────────────────────────────────────────────
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
    transition: "opacity 1800ms cubic-bezier(0.4, 0, 0.2, 1)",
    zIndex: active ? 2 : 1,
    pointerEvents: active ? "auto" : "none",
  }),
  bgImg: (src, active) => ({
    position: "absolute",
    inset: 0,
    backgroundImage: `url("${src}")`,
    backgroundSize: "cover",
    backgroundPosition: "center",
    transform: active ? "scale(1.12)" : "scale(1.04)",
    transition: active ? "transform 10000ms linear" : "none",
  }),
  overlay: {
    position: "absolute",
    inset: 0,
    background: [
      "linear-gradient(to right, rgba(7,11,20,0.97) 0%, rgba(7,11,20,0.55) 55%, rgba(7,11,20,0.15) 100%)",
      "linear-gradient(to top, rgba(7,11,20,0.7) 0%, transparent 40%)",
    ].join(", "),
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
    transform: active ? "translateY(0px)" : "translateY(48px)",
    opacity: active ? 1 : 0,
    transition: "all 1100ms cubic-bezier(0.16, 1, 0.3, 1) 300ms",
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
  badgeIcon: {
    fontSize: 14,
  },
  h1: {
    margin: "0 0 6px",
    fontSize: "clamp(34px, 6.5vw, 62px)",
    lineHeight: 1.06,
    fontWeight: 900,
    color: "#fff",
    letterSpacing: "-0.03em",
  },
  h1Highlight: {
    color: "#2a66ff",
    display: "block",
    marginBottom: 28,
  },
  desc: {
    margin: "0 0 36px",
    color: "rgba(255,255,255,0.62)",
    fontSize: 17,
    lineHeight: 1.7,
    maxWidth: 480,
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
    marginTop: 48,
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
    fontFamily: "'Sora', sans-serif",
    fontWeight: 900,
    fontSize: 20,
    color: "#fff",
    letterSpacing: "-0.02em",
  },
  statLabel: {
    fontFamily: "'DM Sans', sans-serif",
    fontSize: 13,
    color: "rgba(255,255,255,0.5)",
    fontWeight: 500,
  },
  statDivider: {
    width: 1,
    height: 24,
    background: "rgba(255,255,255,0.12)",
  },

  // Progress bar dots
  dotsBar: {
    position: "absolute",
    bottom: 36,
    left: "50%",
    transform: "translateX(-50%)",
    display: "flex",
    gap: 10,
    zIndex: 10,
    alignItems: "center",
  },
  dotWrap: (active) => ({
    display: "flex",
    alignItems: "center",
    gap: 8,
    cursor: "pointer",
    padding: "4px 0",
  }),
  dot: (active) => ({
    position: "relative",
    height: 4,
    width: active ? 40 : 8,
    borderRadius: 2,
    background: active ? "transparent" : "rgba(255,255,255,0.18)",
    overflow: "hidden",
    transition: "width 500ms cubic-bezier(0.4,0,0.2,1), background 300ms",
    flexShrink: 0,
  }),
  dotFill: {
    position: "absolute",
    inset: 0,
    background: "#2a66ff",
    transformOrigin: "left",
  },

  // Slide counter top-right
  counter: {
    position: "absolute",
    top: 28,
    right: 28,
    zIndex: 10,
    display: "flex",
    alignItems: "baseline",
    gap: 3,
    fontFamily: "'Sora', sans-serif",
  },
  counterCurrent: {
    fontSize: 28,
    fontWeight: 900,
    color: "#fff",
    letterSpacing: "-0.04em",
  },
  counterSep: {
    fontSize: 14,
    color: "rgba(255,255,255,0.25)",
    fontWeight: 400,
  },
  counterTotal: {
    fontSize: 14,
    color: "rgba(255,255,255,0.30)",
    fontWeight: 600,
  },

  // Arrow buttons
  arrowBtn: (side) => ({
    position: "absolute",
    top: "50%",
    [side]: 20,
    transform: "translateY(-50%)",
    zIndex: 10,
    width: 44,
    height: 44,
    borderRadius: 999,
    background: "rgba(255,255,255,0.08)",
    border: "1px solid rgba(255,255,255,0.12)",
    color: "#fff",
    fontSize: 18,
    cursor: "pointer",
    display: "grid",
    placeItems: "center",
    backdropFilter: "blur(6px)",
    transition: "background .2s, transform .2s",
  }),
};

// CTA button styles
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
        ? "0 16px 40px rgba(29,78,216,.50)"
        : "0 10px 28px rgba(29,78,216,.35)",
      transform: hovered ? "translateY(-2px)" : "translateY(0)",
    };
  }
  return {
    ...base,
    color: hovered ? "#fff" : "rgba(255,255,255,0.80)",
    background: hovered ? "rgba(255,255,255,0.12)" : "rgba(255,255,255,0.07)",
    border: "1px solid rgba(255,255,255,0.18)",
    backdropFilter: "blur(6px)",
    transform: hovered ? "translateY(-1px)" : "translateY(0)",
  };
}

// ─────────────────────────────────────────────────────────────
// COMPONENT
// ─────────────────────────────────────────────────────────────
export default function HeroSlider() {
  const [index, setIndex]         = useState(0);
  const [progress, setProgress]   = useState(0);
  const [hoveredCta, setHoveredCta] = useState(null); // "primary-N" | "ghost-N"
  const [hoveredArrow, setHoveredArrow] = useState(null);
  const timerRef    = useRef(null);
  const progressRef = useRef(null);
  const DURATION    = 5000;

  // Preload all images
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

  // Auto-advance timer
  useEffect(() => {
    clearInterval(timerRef.current);
    timerRef.current = setInterval(next, DURATION);
    return () => clearInterval(timerRef.current);
  }, [next]);

  // Progress ticker (60fps approx)
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

      {/* Slide counter */}
      <div style={S.counter}>
        <span style={S.counterCurrent}>
          {String(index + 1).padStart(2, "0")}
        </span>
        <span style={S.counterSep}>/</span>
        <span style={S.counterTotal}>
          {String(SLIDES.length).padStart(2, "0")}
        </span>
      </div>

      {/* Arrow navigation */}
      <button
        onClick={prev}
        style={{
          ...S.arrowBtn("left"),
          background: hoveredArrow === "prev"
            ? "rgba(255,255,255,0.15)"
            : "rgba(255,255,255,0.08)",
        }}
        onMouseEnter={() => setHoveredArrow("prev")}
        onMouseLeave={() => setHoveredArrow(null)}
        aria-label="Previous slide"
      >
        ‹
      </button>
      <button
        onClick={next}
        style={{
          ...S.arrowBtn("right"),
          background: hoveredArrow === "next"
            ? "rgba(255,255,255,0.15)"
            : "rgba(255,255,255,0.08)",
        }}
        onMouseEnter={() => setHoveredArrow("next")}
        onMouseLeave={() => setHoveredArrow(null)}
        aria-label="Next slide"
      >
        ›
      </button>

      {/* Slides */}
      {SLIDES.map((s, i) => {
        const active = i === index;
        const titleLines = s.title;
        const lastLine = titleLines[titleLines.length - 1];

        return (
          <div key={i} style={S.slideWrap(active)}>
            {/* Background image */}
            <div style={S.bgImg(s.image, active)} />

            {/* Gradient overlay */}
            <div style={S.overlay} />

            {/* Content */}
            <div style={S.contentArea}>
              <div style={S.textBlock(active)}>

                {/* Badge */}
                <div style={S.badge}>
                  <span style={S.badgeIcon}>{s.badgeIcon}</span>
                  {s.badge}
                </div>

                {/* Heading — last line gets accent color */}
                <h1 style={S.h1}>
                  {titleLines.map((line, li) =>
                    line === lastLine ? (
                      <span key={li} style={S.h1Highlight}>{line}</span>
                    ) : (
                      <span key={li} style={{ display: "block" }}>{line}</span>
                    )
                  )}
                </h1>

                {/* Description */}
                <p style={S.desc}>{s.desc}</p>

                {/* CTA buttons */}
                <div style={S.ctaRow}>
                  {s.ctas.map((cta, ci) => {
                    const hk = `${cta.variant}-${i}-${ci}`;
                    return (
                      <Link
                        key={ci}
                        to={cta.to}
                        style={ctaStyle(cta.variant, hoveredCta === hk)}
                        onMouseEnter={() => setHoveredCta(hk)}
                        onMouseLeave={() => setHoveredCta(null)}
                      >
                        {cta.label}
                        {cta.variant === "primary" && (
                          <span style={{ fontSize: 16, lineHeight: 1 }}>→</span>
                        )}
                      </Link>
                    );
                  })}
                </div>

                {/* Stat pill */}
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

      {/* Progress dots */}
      <div style={S.dotsBar}>
        {SLIDES.map((_, i) => {
          const active = i === index;
          return (
            <div
              key={i}
              onClick={() => goTo(i)}
              style={S.dotWrap(active)}
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
