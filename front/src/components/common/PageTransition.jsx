import React, { useEffect, useRef } from "react";

const PageTransition = ({ children }) => {
  const containerRef = useRef();

  useEffect(() => {
    // Simple fade-in animation without GSAP
    const container = containerRef.current;
    if (container) {
      container.style.opacity = "0";
      container.style.transform = "translateY(20px)";
      
      const timer = setTimeout(() => {
        container.style.transition = "all 0.6s ease";
        container.style.opacity = "1";
        container.style.transform = "translateY(0)";
      }, 100);
      
      return () => clearTimeout(timer);
    }
  }, []);

  return (
    <div ref={containerRef} style={{ width: "100%", height: "100%" }}>
      {children}
    </div>
  );
};

export default PageTransition;
