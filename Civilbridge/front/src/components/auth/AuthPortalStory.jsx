import { useEffect, useMemo, useState } from "react";

const STORY_SETS = {
  login: [
    {
      title: "Built on trust and reliability.",
      caption: "Access your space with confidence, clarity, and premium speed.",
      variant: "foundations",
    },
    {
      title: "Accelerating your potential.",
      caption: "Every sign-in begins a smoother, more powerful workflow.",
      variant: "action",
    },
    {
      title: "Bringing the evolution you deserve.",
      caption: "A refined portal experience for teams and builders alike.",
      variant: "evolution",
    },
  ],
  register: [
    {
      title: "Built on trust and reliability.",
      caption: "Create your account on a secure, professional foundation.",
      variant: "foundations",
    },
    {
      title: "Accelerating your potential.",
      caption: "Sign-up is seamless, fast, and ready for your next project.",
      variant: "action",
    },
    {
      title: "Bringing the evolution you deserve.",
      caption: "Start with a premium onboarding flow designed for growth.",
      variant: "evolution",
    },
  ],
};

const HERO_BANNERS = {
  login: {
    badge: "WELCOME BACK!",
    headline: "Your portal awaits",
    subtext: "Sign in to continue your project journey with premium access and momentum.",
  },
  register: {
    badge: "WELCOME BACK!",
    headline: "Build your future",
    subtext: "Create your account and join the next evolution of trusted construction workflows.",
  },
};

export default function AuthPortalStory({ variant = "login" }) {
  const slides = useMemo(() => STORY_SETS[variant] || STORY_SETS.login, [variant]);
  const [activeSlide, setActiveSlide] = useState(0);
  const hero = HERO_BANNERS[variant] || HERO_BANNERS.login;

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % slides.length);
    }, 7000);
    return () => clearInterval(timer);
  }, [slides.length]);

  return (
    <div className="portalStory">
      <div className="portalStoryIntro">
        <span className="storyBadge">{hero.badge}</span>
        <h2>{hero.headline}</h2>
        <p>{hero.subtext}</p>
      </div>

      <div className="portalSlides">
        {slides.map((slide, index) => (
          <div
            key={slide.title}
            className={`portalSlide portalSlide-${slide.variant} ${index === activeSlide ? "active" : ""}`}
            aria-hidden={index !== activeSlide}
          >
            <div className="portalSlideInner">
              <span className="slideNumber">0{index + 1}</span>
              <h3>{slide.title}</h3>
              <p>{slide.caption}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="portalSlideNavigation">
        {slides.map((_, index) => (
          <button
            key={index}
            type="button"
            className={index === activeSlide ? "slideDot active" : "slideDot"}
            onClick={() => setActiveSlide(index)}
            aria-label={`Show slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
