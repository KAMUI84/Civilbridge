import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const PageTransition = ({ children }) => {
  const containerRef = useRef();

  useEffect(() => {
    // Scroll-triggered reveals only (no page-blocking opacity animation)
    gsap.utils.toArray('.smooth-scroll').forEach(element => {
      gsap.fromTo(element,
        { y: 40, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.7,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: element,
            start: 'top 85%',
            once: true
          }
        }
      );
    });

    // Floating elements animation
    gsap.utils.toArray('.float-animation').forEach(element => {
      gsap.to(element, {
        y: -10,
        duration: 2,
        repeat: -1,
        yoyo: true,
        ease: 'power1.inOut'
      });
    });

    return () => {
      ScrollTrigger.getAll().forEach(trigger => trigger.kill());
    };
  }, []);

  return (
    <div ref={containerRef} className="page-transition" style={{ opacity: 1 }}>
      {children}
    </div>
  );
};

export default PageTransition;
