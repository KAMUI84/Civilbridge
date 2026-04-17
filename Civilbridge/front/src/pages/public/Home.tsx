import { ImageWithFallback } from "../../components/figma/ImageWithFallback";
import {
  ArrowRight,
  Calculator,
  CheckCircle,
  FileText,
  Layers,
  MapPin,
  Shield,
  Sparkles,
  TrendingUp,
  Users,
  Zap,
  LayoutDashboard,
  X,
} from "lucide-react";
import { useEffect, useRef, useState, useCallback } from "react";
import { Link } from "react-router";
import { useAuthStore } from "../../store/authStore";

const SLIDES = [
  {
    badge: "Welcome to CivilBridge",
    badgeIcon: "🏗️",
    title: ["Building Dreams", "Into Reality"],
    desc: "Transform your architectural vision into stunning structures with our comprehensive construction management platform.",
    ctas: [
      { label: "Explore Marketplace", to: "/marketplace", variant: "primary" },
      { label: "How it Works", to: "/#how-it-works", variant: "ghost" },
    ],
    image:
      "https://images.unsplash.com/photo-1560518883-ce09059eeffa?q=85&w=2400&auto=format&fit=crop",
    stat: { value: "Live", label: "marketplace and planning workspace" },
  },
  {
    badge: "AI-Powered Planning",
    badgeIcon: "🤖",
    title: ["Smart Construction", "Intelligent Solutions"],
    desc: "Leverage cutting-edge AI technology for precise cost estimation, project planning, and resource optimization.",
    ctas: [
      { label: "Try AI Studio", to: "/intelligence", variant: "primary" },
      { label: "Learn More", to: "/intelligence", variant: "ghost" },
    ],
    image:
      "https://images.unsplash.com/photo-1518770660439-4636190af475?q=85&w=2400&auto=format&fit=crop",
    stat: { value: "Ready", label: "for user-driven planning" },
  },
  {
    badge: "Expert Network",
    badgeIcon: "👷",
    title: ["Connect with", "Verified Professionals"],
    desc: "Access a curated network of architects, engineers, and contractors vetted for excellence and reliability.",
    ctas: [
      { label: "Find Experts", to: "/experts", variant: "primary" },
      { label: "Join Network", to: "/register", variant: "ghost" },
    ],
    image:
      "https://images.unsplash.com/photo-1581094794329-c8112a89af12?q=85&w=2400&auto=format&fit=crop",
    stat: { value: "Verified", label: "expert review workflow" },
  },
  {
    badge: "Blueprint Library",
    badgeIcon: "📐",
    title: ["Professional Plans", "Ready to Build"],
    desc: "Browse our extensive collection of architectural blueprints with detailed specifications and compliance information.",
    ctas: [
      { label: "Browse Plans", to: "/plans", variant: "primary" },
      { label: "Upload Plans", to: "/uploads", variant: "ghost" },
    ],
    image:
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=85&w=2400&auto=format&fit=crop",
    stat: { value: "Current", label: "library and plan workflow" },
  },
  {
    badge: "Cost Control",
    badgeIcon: "📊",
    title: ["Real-time Estimation", "From Day One."],
    desc: "Estimate project cost, materials, and timeline — transparently, accurately, and instantly.",
    ctas: [
      { label: "Get an Estimate", to: "/estimator", variant: "primary" },
      { label: "Open estimator", to: "/estimator", variant: "ghost" },
    ],
    image:
      "https://images.unsplash.com/photo-1504307651254-35680f356dfd?q=85&w=2400&auto=format&fit=crop",
    stat: { value: "Real", label: "inputs from your project" },
  },
] as const;

const DURATION = 5000;

const S = {
  section: {
    position: "relative" as const,
    height: "calc(100vh)",
    minHeight: 640,
    overflow: "hidden" as const,
    backgroundColor: "#070b14",
    fontFamily: "'Sora', sans-serif",
  },
  slideWrap: (active: boolean) => ({
    position: "absolute" as const,
    inset: 0,
    opacity: active ? 1 : 0,
    transition: "opacity 900ms ease",
    pointerEvents: active ? ("auto" as const) : ("none" as const),
  }),
  bgImg: (src: string, active: boolean) => ({
    position: "absolute" as const,
    inset: 0,
    backgroundImage: `url("${src}")`,
    backgroundSize: "cover",
    backgroundPosition: "center",
    transform: active ? "scale(1.08)" : "scale(1.02)",
    transition: "transform 7000ms linear",
  }),
  overlay: {
    position: "absolute" as const,
    inset: 0,
    background:
      "linear-gradient(to right, rgba(7,11,20,0.96) 0%, rgba(7,11,20,0.72) 55%, rgba(7,11,20,0.45) 100%), linear-gradient(to top, rgba(7,11,20,0.65) 0%, transparent 40%)",
  },
  contentArea: {
    position: "relative" as const,
    zIndex: 3,
    maxWidth: 1200,
    margin: "0 auto",
    padding: "0 28px",
    height: "100%",
    display: "flex",
    alignItems: "center",
  },
  textBlock: (active: boolean) => ({
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
    textTransform: "uppercase" as const,
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
    flexWrap: "wrap" as const,
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
    position: "absolute" as const,
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
  dot: (active: boolean) => ({
    position: "relative" as const,
    height: 4,
    width: active ? 42 : 10,
    borderRadius: 999,
    background: active ? "rgba(255,255,255,0.14)" : "rgba(255,255,255,0.18)",
    overflow: "hidden" as const,
    transition: "width 350ms ease, background 300ms ease",
  }),
  dotFill: {
    position: "absolute" as const,
    inset: 0,
    background: "#2a66ff",
    transformOrigin: "left",
  },
  counter: {
    position: "absolute" as const,
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
  arrowBtn: (side: "left" | "right", hovered: boolean) => ({
    position: "absolute" as const,
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

function ctaStyle(variant: string, hovered: boolean) {
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

function HeroSlider() {
  const [index, setIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [hoveredCta, setHoveredCta] = useState<string | null>(null);
  const [hoveredArrow, setHoveredArrow] = useState<"prev" | "next" | null>(null);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const progressRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    SLIDES.forEach((s) => {
      const img = new Image();
      img.src = s.image;
    });
  }, []);

  const goTo = useCallback((i: number) => {
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
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(next, DURATION);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [next]);

  useEffect(() => {
    if (progressRef.current) clearInterval(progressRef.current);

    const tick = 50;
    progressRef.current = setInterval(() => {
      setProgress((p) => Math.min(p + (tick / DURATION) * 100, 100));
    }, tick);

    return () => {
      if (progressRef.current) clearInterval(progressRef.current);
    };
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
                      <span key={li} style={S.h1Highlight}>
                        {line}
                      </span>
                    ) : (
                      <span key={li} style={{ display: "block" }}>
                        {line}
                      </span>
                    ),
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

function WelcomeBanner() {
  const { user, isAuthenticated } = useAuthStore();
  const [dismissed, setDismissed] = useState(false);

  if (!isAuthenticated || !user || dismissed) return null;

  const firstName = (user.fullName || user.full_name || user.name || "")
    .split(" ")[0] || user.email?.split("@")[0] || "there";

  const roleGreetings: Record<string, string> = {
    SUPER_ADMIN: "Admin panel is ready for you.",
    ADMIN: "Admin panel is ready for you.",
    ENGINEER: "Your project queue and files are waiting.",
    ARCHITECT: "Your design projects and files are waiting.",
    CONTRACTOR: "Your active projects and assignments are ready.",
    CLIENT: "Your dashboard is personalised and ready.",
    HOME_BUILDER: "Your build tracker is ready to go.",
  };
  const sub = roleGreetings[user.role] || "Your personalised dashboard is ready.";

  return (
    <div className="fixed top-[72px] left-0 right-0 z-30 bg-gradient-to-r from-emerald-600 to-teal-600 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <div className="h-7 w-7 rounded-lg bg-white/20 flex items-center justify-center text-xs font-bold flex-shrink-0">
            {firstName[0]?.toUpperCase()}
          </div>
          <p className="text-sm font-medium truncate">
            Welcome back, <span className="font-bold">{firstName}</span>! {sub}
          </p>
        </div>
        <div className="flex items-center gap-3 flex-shrink-0">
          <Link
            to="/dashboard"
            className="flex items-center gap-1.5 text-xs font-semibold bg-white text-emerald-700 px-3 py-1.5 rounded-lg hover:bg-emerald-50 transition-colors"
          >
            <LayoutDashboard className="h-3.5 w-3.5" />
            Dashboard
          </Link>
          <button
            onClick={() => setDismissed(true)}
            className="p-1 rounded-lg hover:bg-white/20 transition-colors"
            aria-label="Dismiss"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  const { user, isAuthenticated } = useAuthStore();
  const properties = [
    {
      image:
        "https://images.unsplash.com/photo-1747555094127-9a922d56a64c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjByZXNpZGVudGlhbCUyMGJ1aWxkaW5nfGVufDF8fHx8MTc3NjE5Mzk5MXww&ixlib=rb-4.1.0&q=80&w=1080",
      title: "Modern Residential Complex",
    },
    {
      image:
        "https://images.unsplash.com/photo-1694465990855-e78110c345af?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsdXh1cnklMjBhZnJpY2FuJTIwaG9tZXxlbnwxfHx8fDE3NzYxOTM5OTB8MA&ixlib=rb-4.1.0&q=80&w=1080",
      title: "Luxury Family Home",
    },
    {
      image:
        "https://images.unsplash.com/photo-1758304481219-fc230bf1e6a6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxyZXNpZGVudGlhbCUyMHByb3BlcnR5JTIwYWVyaWFsJTIwdmlld3xlbnwxfHx8fDE3NzYxOTM5OTB8MA&ixlib=rb-4.1.0&q=80&w=1080",
      title: "Estate Development",
    },
    {
      image:
        "https://images.unsplash.com/photo-1773215023063-e662ea91a69c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsYW5kJTIwcGxvdCUyMGRldmVsb3BtZW50fGVufDF8fHx8MTc3NjE5Mzk5MXww&ixlib=rb-4.1.0&q=80&w=1080",
      title: "Prime Land Plots",
    },
    {
      image:
        "https://images.unsplash.com/photo-1591609168402-7e1714687067?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjBhZnJpY2FuJTIwaG91c2UlMjBjb25zdHJ1Y3Rpb258ZW58MXx8fHwxNzc2MTkzOTg4fDA&ixlib=rb-4.1.0&q=80&w=1080",
      title: "New Construction",
    },
  ];

  const firstName = (user?.fullName || user?.full_name || user?.name || "")
    .split(" ")[0] || user?.email?.split("@")[0] || "";

  return (
    <div className="min-h-screen bg-white">
      <WelcomeBanner />
      <HeroSlider />

      <section id="how-it-works" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">How CivilBridge Helps You</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              We transform construction uncertainty into clear, actionable insights through intelligent tools and expert validation.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="p-8 bg-gradient-to-br from-emerald-50 to-white rounded-xl border border-emerald-100 hover:shadow-lg transition-shadow">
              <div className="h-12 w-12 bg-emerald-600 rounded-lg flex items-center justify-center mb-6">
                <Calculator className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Accurate Cost Estimation</h3>
              <p className="text-gray-600">
                Get realistic construction cost estimates based on Rwanda-specific pricing, materials, and labor rates. Make financially safe decisions from day one.
              </p>
            </div>

            <div className="p-8 bg-gradient-to-br from-teal-50 to-white rounded-xl border border-teal-100 hover:shadow-lg transition-shadow">
              <div className="h-12 w-12 bg-teal-600 rounded-lg flex items-center justify-center mb-6">
                <Shield className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Expert Verification</h3>
              <p className="text-gray-600">
                Every plan and estimate can be reviewed by verified engineers and architects. AI accelerates, professionals validate.
              </p>
            </div>

            <div className="p-8 bg-gradient-to-br from-blue-50 to-white rounded-xl border border-blue-100 hover:shadow-lg transition-shadow">
              <div className="h-12 w-12 bg-blue-600 rounded-lg flex items-center justify-center mb-6">
                <TrendingUp className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Full Project Journey</h3>
              <p className="text-gray-600">
                From initial budget analysis to completed construction, track every phase with transparency and professional oversight.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-gradient-to-br from-gray-50 to-emerald-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-bold text-gray-900 mb-6">Smart Cost Estimation</h2>
              <p className="text-lg text-gray-600 mb-8">
                Our AI-powered estimator analyzes your project requirements and generates detailed cost breakdowns including materials, labor, and timelines.
              </p>

              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="flex-shrink-0 h-10 w-10 bg-emerald-600 rounded-lg flex items-center justify-center">
                    <Sparkles className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Upload or Describe</h4>
                    <p className="text-gray-600">Upload existing plans or describe your vision conversationally.</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-shrink-0 h-10 w-10 bg-emerald-600 rounded-lg flex items-center justify-center">
                    <Zap className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">AI Analysis</h4>
                    <p className="text-gray-600">Intelligent processing generates Bill of Quantities and cost estimates.</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-shrink-0 h-10 w-10 bg-emerald-600 rounded-lg flex items-center justify-center">
                    <CheckCircle className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Professional Review</h4>
                    <p className="text-gray-600">Get expert validation and approval before execution.</p>
                  </div>
                </div>
              </div>

              <Link
                to="/estimator"
                className="mt-8 inline-flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
              >
                Try the Estimator
                <ArrowRight className="h-5 w-5" />
              </Link>
            </div>

            <div className="relative">
              <ImageWithFallback
                src="https://images.unsplash.com/photo-1774600166818-e554a4d4c376?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhcmNoaXRlY3QlMjBlbmdpbmVlciUyMGJsdWVwcmludHxlbnwxfHx8fDE3NzYxOTM5ODl8MA&ixlib=rb-4.1.0&q=80&w=1080"
                alt="Cost estimation"
                className="rounded-2xl shadow-2xl"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Discover Properties & Connect with Experts
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Browse verified properties, land plots, and connect with trusted engineers, architects, and contractors.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 mb-12">
            <div className="p-8 bg-gradient-to-br from-emerald-600 to-teal-600 text-white rounded-2xl">
              <MapPin className="h-12 w-12 mb-4" />
              <h3 className="text-2xl font-bold mb-4">Property Marketplace</h3>
              <p className="mb-6">
                Explore houses, commercial properties, and land plots across Rwanda. Filter by location, price, and type.
              </p>
              <Link
                to="/marketplace"
                className="inline-flex items-center gap-2 text-white hover:text-emerald-100 transition-colors"
              >
                Browse Properties
                <ArrowRight className="h-5 w-5" />
              </Link>
            </div>

            <div className="p-8 bg-gradient-to-br from-blue-600 to-indigo-600 text-white rounded-2xl">
              <Users className="h-12 w-12 mb-4" />
              <h3 className="text-2xl font-bold mb-4">Expert Directory</h3>
              <p className="mb-6">
                Find and connect with verified construction professionals. Read reviews and book consultations.
              </p>
              <Link
                to="/experts"
                className="inline-flex items-center gap-2 text-white hover:text-blue-100 transition-colors"
              >
                Find Experts
                <ArrowRight className="h-5 w-5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-gradient-to-br from-teal-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="order-2 md:order-1">
              <ImageWithFallback
                src="https://images.unsplash.com/photo-1591609168402-7e1714687067?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjBhZnJpY2FuJTIwaG91c2UlMjBjb25zdHJ1Y3Rpb258ZW58MXx8fHwxNzc2MTkzOTg4fDA&ixlib=rb-4.1.0&q=80&w=1080"
                alt="Construction plans"
                className="rounded-2xl shadow-2xl"
              />
            </div>

            <div className="order-1 md:order-2">
              <h2 className="text-4xl font-bold text-gray-900 mb-6">Ready-Made & Custom Plans</h2>
              <p className="text-lg text-gray-600 mb-8">
                Browse our library of professionally designed building plans or generate custom designs using AI based on your budget, land, and preferences.
              </p>

              <div className="space-y-4 mb-8">
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-6 w-6 text-emerald-600 flex-shrink-0 mt-1" />
                  <p className="text-gray-700">Pre-designed plans for common building types</p>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-6 w-6 text-emerald-600 flex-shrink-0 mt-1" />
                  <p className="text-gray-700">AI-generated custom designs based on your requirements</p>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-6 w-6 text-emerald-600 flex-shrink-0 mt-1" />
                  <p className="text-gray-700">Professional review and approval workflow</p>
                </div>
              </div>

              <Link
                to="/plans"
                className="inline-flex items-center gap-2 px-6 py-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
              >
                View Plans
                <ArrowRight className="h-5 w-5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-bold text-gray-900 mb-6">
                AI-Powered Construction Intelligence
              </h2>
              <p className="text-lg text-gray-600 mb-8">
                Our AI Studio helps you make smarter decisions with conversational planning, feasibility analysis, and intelligent recommendations tailored to the Rwandan market.
              </p>

              <div className="grid grid-cols-2 gap-4 mb-8">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <FileText className="h-8 w-8 text-emerald-600 mb-2" />
                  <h4 className="font-semibold text-gray-900 mb-1">Document Generation</h4>
                  <p className="text-sm text-gray-600">Auto-generate project packages</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <Layers className="h-8 w-8 text-emerald-600 mb-2" />
                  <h4 className="font-semibold text-gray-900 mb-1">Feasibility Analysis</h4>
                  <p className="text-sm text-gray-600">Budget vs. requirements check</p>
                </div>
              </div>

              <Link
                to="/intelligence"
                className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
              >
                Open AI Studio
                <ArrowRight className="h-5 w-5" />
              </Link>
            </div>

            <div>
              <ImageWithFallback
                src="https://images.unsplash.com/photo-1671917057275-c5014a6addcd?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhZnJpY2FuJTIwYXJjaGl0ZWN0JTIwd29tYW58ZW58MXx8fHwxNzc2MTkzOTkxfDA&ixlib=rb-4.1.0&q=80&w=1080"
                alt="AI Intelligence"
                className="rounded-2xl shadow-2xl"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-gradient-to-br from-gray-900 to-emerald-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Built on Trust & Quality</h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              CivilBridge is designed specifically for Rwanda with local expertise, verified professionals, and realistic cost intelligence.
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-4xl font-bold text-emerald-400 mb-2">500+</div>
              <p className="text-gray-300">Verified Professionals</p>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-emerald-400 mb-2">1,200+</div>
              <p className="text-gray-300">Projects Estimated</p>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-emerald-400 mb-2">95%</div>
              <p className="text-gray-300">Cost Accuracy Rate</p>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-emerald-400 mb-2">24/7</div>
              <p className="text-gray-300">Platform Access</p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4 text-center">
            Featured Properties & Developments
          </h2>
          <p className="text-xl text-gray-600 text-center">
            Explore a selection of quality properties across Rwanda
          </p>
        </div>

        <div className="relative">
          <div className="flex gap-6 animate-scroll">
            {[...properties, ...properties].map((property, index) => (
              <div
                key={index}
                className="flex-shrink-0 w-80 h-64 rounded-xl overflow-hidden shadow-lg relative group"
              >
                <ImageWithFallback
                  src={property.image}
                  alt={property.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end p-6">
                  <h3 className="text-xl font-semibold text-white">{property.title}</h3>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-gradient-to-r from-emerald-600 to-teal-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          {isAuthenticated && user ? (
            /* ── Logged-in CTA ── */
            <>
              <div className="inline-flex items-center gap-2 bg-white/15 text-white text-sm font-semibold px-4 py-2 rounded-full mb-6">
                <span className="h-5 w-5 rounded-md bg-white/25 flex items-center justify-center text-xs font-bold">
                  {firstName[0]?.toUpperCase()}
                </span>
                Signed in as {firstName}
              </div>
              <h2 className="text-4xl font-bold text-white mb-4">
                Welcome Back, {firstName}!
              </h2>
              <p className="text-xl text-emerald-50 mb-8">
                Pick up where you left off or explore something new on your dashboard.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  to="/dashboard"
                  className="px-8 py-4 bg-white text-emerald-600 font-semibold rounded-lg hover:bg-emerald-50 transition-colors inline-flex items-center justify-center gap-2"
                >
                  <LayoutDashboard className="h-5 w-5" />
                  Go to Dashboard
                </Link>
                <Link
                  to="/estimator"
                  className="px-8 py-4 bg-emerald-700 text-white border-2 border-white/50 rounded-lg hover:bg-emerald-800 transition-colors inline-flex items-center justify-center gap-2"
                >
                  New Estimate
                  <ArrowRight className="h-5 w-5" />
                </Link>
              </div>
            </>
          ) : (
            /* ── Guest CTA ── */
            <>
              <h2 className="text-4xl font-bold text-white mb-6">
                Ready to Start Your Construction Journey?
              </h2>
              <p className="text-xl text-emerald-50 mb-8">
                Join thousands of Rwandans building smarter with CivilBridge. Get your free cost estimate today.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  to="/estimator"
                  className="px-8 py-4 bg-white text-emerald-600 font-semibold rounded-lg hover:bg-emerald-50 transition-colors inline-flex items-center justify-center gap-2"
                >
                  Get Free Estimate
                  <ArrowRight className="h-5 w-5" />
                </Link>
                <Link
                  to="/register"
                  className="px-8 py-4 bg-emerald-700 text-white border-2 border-white/50 rounded-lg hover:bg-emerald-800 transition-colors"
                >
                  Create Free Account
                </Link>
              </div>
            </>
          )}
        </div>
      </section>

      <style>{`
        @keyframes scroll {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }

        .animate-scroll {
          animation: scroll 30s linear infinite;
        }

        .animate-scroll:hover {
          animation-play-state: paused;
        }
      `}</style>
    </div>
  );
}
