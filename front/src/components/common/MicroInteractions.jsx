import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';

export const ButtonHover = ({ children, className = '', ...props }) => {
  const buttonRef = useRef();

  useEffect(() => {
    const button = buttonRef.current;
    
    const handleMouseEnter = () => {
      gsap.to(button, {
        scale: 1.05,
        duration: 0.2,
        ease: 'power2.out'
      });
    };

    const handleMouseLeave = () => {
      gsap.to(button, {
        scale: 1,
        duration: 0.2,
        ease: 'power2.out'
      });
    };

    const handleMouseDown = () => {
      gsap.to(button, {
        scale: 0.95,
        duration: 0.1,
        ease: 'power2.out'
      });
    };

    const handleMouseUp = () => {
      gsap.to(button, {
        scale: 1.05,
        duration: 0.1,
        ease: 'power2.out'
      });
    };

    button.addEventListener('mouseenter', handleMouseEnter);
    button.addEventListener('mouseleave', handleMouseLeave);
    button.addEventListener('mousedown', handleMouseDown);
    button.addEventListener('mouseup', handleMouseUp);

    return () => {
      button.removeEventListener('mouseenter', handleMouseEnter);
      button.removeEventListener('mouseleave', handleMouseLeave);
      button.removeEventListener('mousedown', handleMouseDown);
      button.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);

  return (
    <button ref={buttonRef} className={`micro-interaction-button ${className}`} {...props}>
      {children}
    </button>
  );
};

export const CardHover = ({ children, className = '', ...props }) => {
  const cardRef = useRef();

  useEffect(() => {
    const card = cardRef.current;
    
    const handleMouseEnter = () => {
      gsap.to(card, {
        y: -5,
        scale: 1.02,
        duration: 0.3,
        ease: 'power2.out',
        boxShadow: '0 20px 40px rgba(0,0,0,0.1)'
      });
    };

    const handleMouseLeave = () => {
      gsap.to(card, {
        y: 0,
        scale: 1,
        duration: 0.3,
        ease: 'power2.out',
        boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
      });
    };

    card.addEventListener('mouseenter', handleMouseEnter);
    card.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      card.removeEventListener('mouseenter', handleMouseEnter);
      card.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);

  return (
    <div ref={cardRef} className={`micro-interaction-card ${className}`} {...props}>
      {children}
    </div>
  );
};

export const InputFocus = ({ children, className = '', ...props }) => {
  const inputRef = useRef();

  useEffect(() => {
    const input = inputRef.current;
    
    const handleFocus = () => {
      gsap.to(input, {
        scale: 1.02,
        duration: 0.2,
        ease: 'power2.out'
      });
    };

    const handleBlur = () => {
      gsap.to(input, {
        scale: 1,
        duration: 0.2,
        ease: 'power2.out'
      });
    };

    input.addEventListener('focus', handleFocus);
    input.addEventListener('blur', handleBlur);

    return () => {
      input.removeEventListener('focus', handleFocus);
      input.removeEventListener('blur', handleBlur);
    };
  }, []);

  return (
    <div ref={inputRef} className={`micro-interaction-input ${className}`} {...props}>
      {children}
    </div>
  );
};

export const LoadingSpinner = ({ size = 'medium', className = '' }) => {
  const spinnerRef = useRef();

  useEffect(() => {
    const spinner = spinnerRef.current;
    
    gsap.to(spinner, {
      rotation: 360,
      duration: 1,
      repeat: -1,
      ease: 'none'
    });
  }, []);

  const sizeClasses = {
    small: 'w-4 h-4',
    medium: 'w-6 h-6',
    large: 'w-8 h-8'
  };

  return (
    <svg
      ref={spinnerRef}
      className={`animate-spin ${sizeClasses[size]} ${className}`}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      ></circle>
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      ></path>
    </svg>
  );
};

export const FadeIn = ({ children, delay = 0, duration = 0.6, className = '' }) => {
  const elementRef = useRef();

  useEffect(() => {
    const element = elementRef.current;
    
    gsap.fromTo(element,
      { opacity: 0, y: 20 },
      { 
        opacity: 1, 
        y: 0, 
        duration, 
        delay,
        ease: 'power2.out'
      }
    );
  }, [delay, duration]);

  return (
    <div ref={elementRef} className={`fade-in ${className}`}>
      {children}
    </div>
  );
};

export const SlideIn = ({ children, direction = 'left', delay = 0, duration = 0.6, className = '' }) => {
  const elementRef = useRef();

  useEffect(() => {
    const element = elementRef.current;
    const directionProps = {
      left: { x: -50, y: 0 },
      right: { x: 50, y: 0 },
      top: { x: 0, y: -50 },
      bottom: { x: 0, y: 50 }
    };
    
    gsap.fromTo(element,
      { opacity: 0, ...directionProps[direction] },
      { 
        opacity: 1, 
        x: 0, 
        y: 0, 
        duration, 
        delay,
        ease: 'power2.out'
      }
    );
  }, [direction, delay, duration]);

  return (
    <div ref={elementRef} className={`slide-in ${className}`}>
      {children}
    </div>
  );
};

export default {
  ButtonHover,
  CardHover,
  InputFocus,
  LoadingSpinner,
  FadeIn,
  SlideIn
};
