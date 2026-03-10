import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { gsap } from 'gsap';

export default function TestHome() {
  const heroRef = useRef();
  const titleRef = useRef();
  const buttonRef = useRef();

  useEffect(() => {
    // Simple GSAP animations
    gsap.from(titleRef.current, {
      opacity: 0,
      y: -50,
      duration: 1,
      ease: 'power3.out'
    });

    gsap.from(buttonRef.current, {
      opacity: 0,
      scale: 0,
      duration: 0.8,
      ease: 'back.out(1.7)',
      delay: 0.5
    });

    // Continuous animation
    gsap.to('.floating', {
      y: -20,
      duration: 2,
      repeat: -1,
      yoyo: true,
      ease: 'power1.inOut'
    });
  }, []);

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'Arial, sans-serif'
    }}>
      <div ref={heroRef} style={{
        textAlign: 'center',
        color: 'white',
        padding: '2rem',
        maxWidth: '800px'
      }}>
        <h1 ref={titleRef} style={{
          fontSize: '4rem',
          fontWeight: 'bold',
          marginBottom: '1rem',
          textShadow: '0 4px 6px rgba(0, 0, 0, 0.3)',
          background: 'linear-gradient(45deg, #FFD700, #FFA500)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text'
        }}>
          CivilBridge
        </h1>
        
        <p style={{
          fontSize: '1.5rem',
          marginBottom: '2rem',
          opacity: 0.9,
          textShadow: '0 2px 4px rgba(0, 0, 0, 0.3)'
        }}>
          Your Construction Project Partner
        </p>

        <div className="floating" style={{
          display: 'inline-block',
          padding: '1rem 2rem',
          marginBottom: '2rem',
          fontSize: '3rem',
          animation: 'pulse 2s infinite'
        }}>
          🏗️
        </div>

        <div style={{
          display: 'flex',
          gap: '1rem',
          justifyContent: 'center',
          flexWrap: 'wrap'
        }}>
          <Link
            ref={buttonRef}
            to="/register"
            style={{
              display: 'inline-block',
              padding: '1rem 2rem',
              background: 'linear-gradient(45deg, #FFD700, #FFA500)',
              color: '#1a1a1a',
              textDecoration: 'none',
              borderRadius: '50px',
              fontWeight: 'bold',
              fontSize: '1.1rem',
              boxShadow: '0 10px 30px rgba(255, 215, 0, 0.3)',
              transition: 'all 0.3s ease',
              transform: 'translateY(0)'
            }}
            onMouseOver={(e) => {
              e.target.style.transform = 'translateY(-3px)';
              e.target.style.boxShadow = '0 15px 40px rgba(255, 215, 0, 0.4)';
            }}
            onMouseOut={(e) => {
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = '0 10px 30px rgba(255, 215, 0, 0.3)';
            }}
          >
            Get Started Free
          </Link>

          <Link
            to="/login"
            style={{
              display: 'inline-block',
              padding: '1rem 2rem',
              background: 'rgba(255, 255, 255, 0.2)',
              color: 'white',
              textDecoration: 'none',
              borderRadius: '50px',
              fontWeight: 'bold',
              fontSize: '1.1rem',
              border: '2px solid rgba(255, 255, 255, 0.3)',
              backdropFilter: 'blur(10px)',
              transition: 'all 0.3s ease',
              transform: 'translateY(0)'
            }}
            onMouseOver={(e) => {
              e.target.style.background = 'rgba(255, 255, 255, 0.3)';
              e.target.style.transform = 'translateY(-3px)';
            }}
            onMouseOut={(e) => {
              e.target.style.background = 'rgba(255, 255, 255, 0.2)';
              e.target.style.transform = 'translateY(0)';
            }}
          >
            Sign In
          </Link>
        </div>

        <div style={{
          marginTop: '3rem',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '2rem',
          textAlign: 'center'
        }}>
          <div style={{
            background: 'rgba(255, 255, 255, 0.1)',
            padding: '1.5rem',
            borderRadius: '15px',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.2)'
          }}>
            <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🤖</div>
            <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>AI Assistant</h3>
            <p style={{ opacity: 0.8, fontSize: '0.9rem' }}>Smart construction guidance</p>
          </div>

          <div style={{
            background: 'rgba(255, 255, 255, 0.1)',
            padding: '1.5rem',
            borderRadius: '15px',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.2)'
          }}>
            <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>💰</div>
            <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>Budget Tools</h3>
            <p style={{ opacity: 0.8, fontSize: '0.9rem' }}>Real-time cost estimates</p>
          </div>

          <div style={{
            background: 'rgba(255, 255, 255, 0.1)',
            padding: '1.5rem',
            borderRadius: '15px',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.2)'
          }}>
            <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>👥</div>
            <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>Expert Network</h3>
            <p style={{ opacity: 0.8, fontSize: '0.9rem' }}>Verified professionals</p>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes pulse {
          0%, 100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.1);
          }
        }
      `}</style>
    </div>
  );
}
