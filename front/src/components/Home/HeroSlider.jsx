import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";

export default function HeroSlider() {
  const slides = useMemo(
    () => [
      {
        badge: "Welcome to CivilBridge",
        title: (
          <>
            Your Construction Journey, <br />
            <span style={{ color: "#2a66ff" }}>Digitally Mastered.</span>
          </>
        ),
        desc:
          "Bridging the gap between architectural dreams and structural reality with smart, reliable workflows.",
        ctas: [
          { label: "Explore Marketplace", to: "/marketplace", variant: "primary" },
          { label: "How it Works", to: "/#how-it-works", variant: "ghost" },
        ],
        image:
          "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=2000&q=80",
      },
      {
        badge: "AI Studio (Beta)",
        title: (
          <>
            Smarter Guidance. <br />
            Real Decisions.
          </>
        ),
        desc:
          "Use optional intelligence to support planning, budgeting, and next-step recommendations.",
        ctas: [{ label: "Open Intelligence", to: "/dashboard/ai-studio", variant: "primary" }],
        image:
          "https://images.unsplash.com/photo-1581094794329-c8112a89af12?auto=format&fit=crop&w=2000&q=80",
      },
      {
        badge: "Verified Experts",
        title: (
          <>
            Hire Trusted <br />
            Engineering Talent.
          </>
        ),
        desc:
          "Connect with vetted engineers, surveyors, architects, and contractors—built for trust and compliance.",
        ctas: [{ label: "Browse Experts", to: "/experts", variant: "primary" }],
        image:
          "https://images.unsplash.com/photo-1503387762-592dea58ef23?auto=format&fit=crop&w=2000&q=80",
      },
      {
        badge: "Plans Library",
        title: (
          <>
            Ready-to-build Plans <br />
            You Can Trust.
          </>
        ),
        desc:
          "Browse curated residential, commercial, and industrial plans with estimated build ranges.",
        ctas: [{ label: "Explore Plans", to: "/plans", variant: "primary" }],
        image:
          "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=2000&q=80",
      },
      {
        badge: "Cost Control",
        title: (
          <>
            Real-time Estimation <br />
            From Day 1.
          </>
        ),
        desc:
          "Estimate project cost, materials, and timeline—without depending on AI as a requirement.",
        ctas: [{ label: "Get an Estimate", to: "/estimator", variant: "primary" }],
        image:
          "https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=2000&q=80",
      },
    ],
    []
  );

  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const timerRef = useRef(null);

  const go = (next) => {
    setIndex((prev) => {
      const n = typeof next === "number" ? next : prev + next;
      if (n < 0) return slides.length - 1;
      if (n >= slides.length) return 0;
      return n;
    });
  };

  useEffect(() => {
    if (paused) return;
    timerRef.current = setInterval(() => go(1), 5000);
    return () => clearInterval(timerRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paused, slides.length]);

  return (
    <section
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      style={{
        position: "relative",
        height: "calc(100vh - 72px)", // accounts for navbar height
        minHeight: 620,
        overflow: "hidden",
      }}
    >
      {/* Slides */}
      {slides.map((s, i) => {
        const active = i === index;
        return (
          <div
            key={i}
            aria-hidden={!active}
            style={{
              position: "absolute",
              inset: 0,
              opacity: active ? 1 : 0,
              transition: "opacity 700ms ease",
              pointerEvents: active ? "auto" : "none",
            }}
          >
            {/* Background image with subtle zoom */}
            <div
              style={{
                position: "absolute",
                inset: 0,
                backgroundImage: `url("${s.image}")`,
                backgroundSize: "cover",
                backgroundPosition: "center",
                transform: active ? "scale(1.06)" : "scale(1)",
                transition: "transform 5000ms ease",
              }}
            />
            {/* Overlay */}
            <div
              style={{
                position: "absolute",
                inset: 0,
                background:
                  "linear-gradient(90deg, rgba(12,18,32,0.82) 0%, rgba(12,18,32,0.55) 45%, rgba(12,18,32,0.15) 100%)",
              }}
            />

            {/* Content */}
            <div
              style={{
                position: "relative",
                zIndex: 2,
                maxWidth: 1200,
                margin: "0 auto",
                padding: "70px 18px",
                height: "100%",
                display: "grid",
                alignItems: "center",
              }}
            >
              <div
                style={{
                  maxWidth: 640,
                  transform: active ? "translateY(0px)" : "translateY(10px)",
                  opacity: active ? 1 : 0,
                  transition: "all 700ms ease",
                }}
              >
                <div
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 10,
                    padding: "8px 12px",
                    borderRadius: 999,
                    background: "rgba(255,255,255,0.12)",
                    border: "1px solid rgba(255,255,255,0.18)",
                    color: "rgba(255,255,255,0.92)",
                    fontWeight: 850,
                    letterSpacing: "0.02em",
                    fontSize: 12,
                  }}
                >
                  {s.badge}
                </div>

                <h1
                  style={{
                    margin: "16px 0 10px",
                    fontSize: 54,
                    lineHeight: 1.05,
                    letterSpacing: "-0.03em",
                    color: "#fff",
                  }}
                >
                  {s.title}
                </h1>

                <p
                  style={{
                    margin: 0,
                    color: "rgba(255,255,255,0.82)",
                    fontWeight: 650,
                    fontSize: 16,
                    lineHeight: 1.6,
                    maxWidth: 560,
                  }}
                >
                  {s.desc}
                </p>

                <div style={{ display: "flex", gap: 10, marginTop: 18, flexWrap: "wrap" }}>
                  {s.ctas.map((cta, idx) => (
                    <Link
                      key={idx}
                      to={cta.to}
                      style={ctaStyle(cta.variant)}
                    >
                      {cta.label}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );
      })}

      {/* Controls */}
      <div style={{ position: "absolute", left: 16, right: 16, bottom: 22, zIndex: 3 }}>
        <div
          style={{
            maxWidth: 1200,
            margin: "0 auto",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 12,
          }}
        >
          {/* Dots */}
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            {slides.map((_, i) => (
              <button
                key={i}
                onClick={() => setIndex(i)}
                aria-label={`Go to slide ${i + 1}`}
                style={{
                  width: i === index ? 26 : 10,
                  height: 10,
                  borderRadius: 999,
                  border: "1px solid rgba(255,255,255,0.28)",
                  background: i === index ? "rgba(255,255,255,0.9)" : "rgba(255,255,255,0.22)",
                  transition: "all .2s ease",
                  cursor: "pointer",
                }}
              />
            ))}
          </div>

          {/* Arrows */}
          <div style={{ display: "flex", gap: 10 }}>
            <button onClick={() => go(-1)} style={arrowBtnStyle} aria-label="Previous slide">
              <ArrowLeft />
            </button>
            <button onClick={() => go(1)} style={arrowBtnStyle} aria-label="Next slide">
              <ArrowRight />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

function ctaStyle(variant) {
  const base = {
    textDecoration: "none",
    fontWeight: 950,
    padding: "12px 14px",
    borderRadius: 12,
    transition: "all .2s ease",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
  };

  if (variant === "primary") {
    return {
      ...base,
      color: "#fff",
      background: "linear-gradient(135deg,#2a66ff,#1d4ed8)",
      border: "1px solid rgba(29,78,216,0.2)",
      boxShadow: "0 14px 26px rgba(29,78,216,.22)",
    };
  }

  // ghost
  return {
    ...base,
    color: "#fff",
    background: "rgba(255,255,255,0.10)",
    border: "1px solid rgba(255,255,255,0.20)",
  };
}

const arrowBtnStyle = {
  width: 44,
  height: 44,
  borderRadius: 14,
  border: "1px solid rgba(255,255,255,0.22)",
  background: "rgba(12,18,32,0.35)",
  backdropFilter: "blur(8px)",
  color: "#fff",
  cursor: "pointer",
  display: "grid",
  placeItems: "center",
  transition: "all .2s ease",
};

function ArrowLeft() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path
        d="M15 18 9 12l6-6"
        stroke="currentColor"
        strokeWidth="1.9"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
function ArrowRight() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path
        d="M9 6l6 6-6 6"
        stroke="currentColor"
        strokeWidth="1.9"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}