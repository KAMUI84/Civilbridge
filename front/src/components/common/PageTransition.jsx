import { motion, AnimatePresence } from "framer-motion";
import { useLocation } from "react-router-dom";

const MotionDiv = motion.div;

const variants = {
  initial: { opacity: 0, y: 14 },
  animate: { opacity: 1, y: 0 },
  exit:    { opacity: 0, y: -8 },
};

/**
 * Wraps page content with a fade-slide animation.
 * Uses the pathname as key so navigating between routes triggers re-animation.
 */
const PageTransition = ({ children }) => {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait" initial={false}>
      <MotionDiv
        key={location.pathname}
        variants={variants}
        initial="initial"
        animate="animate"
        exit="exit"
        transition={{ duration: 0.25, ease: "easeOut" }}
        style={{ width: "100%", minHeight: "100%" }}
      >
        {children}
      </MotionDiv>
    </AnimatePresence>
  );
};

export default PageTransition;
