/**
 * MicroInteractions — framer-motion–based (replaces GSAP which is not installed).
 * All components are drop-in wrappers; they render the same DOM shape as before.
 */
import { motion } from "framer-motion";

const MotionButton = motion.button;
const MotionDiv = motion.div;

/** Button with scale press + hover feedback */
export const ButtonHover = ({ children, className = "", style, ...props }) => (
  <MotionButton
    className={`micro-interaction-button ${className}`}
    style={style}
    whileHover={{ scale: 1.04 }}
    whileTap={{ scale: 0.96 }}
    transition={{ type: "spring", stiffness: 400, damping: 20 }}
    {...props}
  >
    {children}
  </MotionButton>
);

/** Card with lift + shadow on hover */
export const CardHover = ({ children, className = "", style, ...props }) => (
  <MotionDiv
    className={`micro-interaction-card ${className}`}
    style={style}
    whileHover={{ y: -4, scale: 1.015 }}
    transition={{ type: "spring", stiffness: 300, damping: 22 }}
    {...props}
  >
    {children}
  </MotionDiv>
);

/** Input wrapper with subtle scale on focus — wrap an <input> inside */
export const InputFocus = ({ children, className = "", style, ...props }) => (
  <MotionDiv
    className={`micro-interaction-input ${className}`}
    style={style}
    whileFocusWithin={{ scale: 1.015 }}
    transition={{ type: "spring", stiffness: 400, damping: 22 }}
    {...props}
  >
    {children}
  </MotionDiv>
);

/** Spinning loader — CSS-only, no JS animation overhead */
export const LoadingSpinner = ({ size = "medium", className = "" }) => {
  const dim = { small: 16, medium: 24, large: 32 }[size] ?? 24;
  return (
    <svg
      width={dim} height={dim}
      viewBox="0 0 24 24"
      className={className}
      style={{ animation: "cb-spin 0.9s linear infinite" }}
      fill="none"
    >
      <style>{`@keyframes cb-spin { to { transform: rotate(360deg); } }`}</style>
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" opacity="0.2" />
      <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
};

/** Fade in from below on mount */
export const FadeIn = ({ children, delay = 0, duration = 0.5, className = "", style }) => (
  <MotionDiv
    className={`fade-in ${className}`}
    style={style}
    initial={{ opacity: 0, y: 16 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration, delay, ease: "easeOut" }}
  >
    {children}
  </MotionDiv>
);

/** Slide in from a direction on mount */
export const SlideIn = ({ children, direction = "left", delay = 0, duration = 0.5, className = "", style }) => {
  const from = { left: { x: -40, y: 0 }, right: { x: 40, y: 0 }, top: { x: 0, y: -40 }, bottom: { x: 0, y: 40 } };
  const initial = { opacity: 0, ...(from[direction] ?? from.left) };
  return (
    <MotionDiv
      className={`slide-in ${className}`}
      style={style}
      initial={initial}
      animate={{ opacity: 1, x: 0, y: 0 }}
      transition={{ duration, delay, ease: "easeOut" }}
    >
      {children}
    </MotionDiv>
  );
};

export default { ButtonHover, CardHover, InputFocus, LoadingSpinner, FadeIn, SlideIn };
