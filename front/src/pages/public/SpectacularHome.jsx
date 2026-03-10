import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export default function SpectacularHome() {
  const heroRef = useRef();
  const featuresRef = useRef();
  const statsRef = useRef();
  const showcaseRef = useRef();
  const ctaRef = useRef();

  useEffect(() => {
    // Clear any existing ScrollTriggers
    ScrollTrigger.getAll().forEach(trigger => trigger.kill());

    // HERO SECTION - Multiple animation styles
    const heroTl = gsap.timeline();
    
    // Title animation with stagger
    heroTl.from('.hero-title .word', {
      opacity: 0,
      y: 100,
      rotationX: -90,
      transformPerspective: 1000,
      duration: 1.2,
      stagger: 0.2,
      ease: 'power3.out'
    })
    .from('.hero-subtitle', {
      opacity: 0,
      x: -100,
      duration: 1,
      ease: 'power3.out'
    }, '-=0.8')
    .from('.hero-buttons .btn', {
      opacity: 0,
      scale: 0,
      rotation: 180,
      duration: 0.8,
      stagger: 0.2,
      ease: 'back.out(1.7)'
    }, '-=0.6')
    .from('.hero-image', {
      opacity: 0,
      scale: 0.3,
      rotation: 15,
      duration: 1.5,
      ease: 'power3.out'
    }, '-=1');

    // Continuous floating animations with different speeds
    gsap.to('.floating-1', {
      y: -30,
      x: 20,
      rotation: 5,
      duration: 4,
      repeat: -1,
      yoyo: true,
      ease: 'sine.inOut'
    });

    gsap.to('.floating-2', {
      y: -25,
      x: -15,
      rotation: -3,
      duration: 3.5,
      repeat: -1,
      yoyo: true,
      ease: 'sine.inOut',
      delay: 0.5
    });

    gsap.to('.floating-3', {
      y: -20,
      x: 10,
      rotation: 2,
      duration: 3,
      repeat: -1,
      yoyo: true,
      ease: 'sine.inOut',
      delay: 1
    });

    // Pulse animation for CTA buttons
    gsap.to('.pulse-btn', {
      scale: 1.05,
      duration: 2,
      repeat: -1,
      yoyo: true,
      ease: 'power2.inOut'
    });

    // FEATURES SECTION - Scroll animations
    ScrollTrigger.create({
      trigger: featuresRef.current,
      start: 'top 80%',
      onEnter: () => {
        gsap.from('.feature-card', {
          opacity: 0,
          y: 100,
          rotationY: 45,
          transformPerspective: 1000,
          duration: 1,
          stagger: 0.15,
          ease: 'power3.out'
        });

        // Icon animations
        gsap.from('.feature-icon', {
          scale: 0,
          rotation: 360,
          duration: 0.8,
          stagger: 0.1,
          ease: 'back.out(1.7)',
          delay: 0.3
        });
      }
    });

    // STATS SECTION - Number counting and animations
    ScrollTrigger.create({
      trigger: statsRef.current,
      start: 'top 80%',
      onEnter: () => {
        // Card flip animation
        gsap.from('.stat-card', {
          opacity: 0,
          rotationY: 180,
          transformPerspective: 1000,
          duration: 1,
          stagger: 0.2,
          ease: 'power3.out'
        });

        // Number counting animation
        const statNumbers = document.querySelectorAll('.stat-number');
        statNumbers.forEach(num => {
          const finalValue = parseInt(num.getAttribute('data-final'));
          const obj = { value: 0 };
          
          gsap.to(obj, {
            value: finalValue,
            duration: 2,
            ease: 'power2.out',
            onUpdate: () => {
              num.textContent = Math.round(obj.value);
            }
          });
        });

        // Progress bars
        gsap.from('.progress-bar', {
          width: 0,
          duration: 1.5,
          stagger: 0.2,
          ease: 'power2.out',
          delay: 0.5
        });
      }
    });

    // SHOWCASE SECTION - Complex animations
    ScrollTrigger.create({
      trigger: showcaseRef.current,
      start: 'top 80%',
      onEnter: () => {
        // Staggered reveal
        gsap.from('.showcase-item', {
          opacity: 0,
          scale: 0.5,
          rotation: 10,
          duration: 1,
          stagger: 0.2,
          ease: 'back.out(1.7)'
        });

        // Continuous rotation for showcase elements
        gsap.to('.rotate-slow', {
          rotation: 360,
          duration: 20,
          repeat: -1,
          ease: 'none'
        });

        gsap.to('.rotate-fast', {
          rotation: -360,
          duration: 10,
          repeat: -1,
          ease: 'none'
        });
      }
    });

    // CTA SECTION - Final animations
    ScrollTrigger.create({
      trigger: ctaRef.current,
      start: 'top 80%',
      onEnter: () => {
        gsap.from('.cta-content', {
          opacity: 0,
          y: 50,
          scale: 0.9,
          duration: 1,
          ease: 'power3.out'
        });

        // Bounce animation for CTA buttons
        gsap.from('.cta-btn', {
          opacity: 0,
          y: 100,
          duration: 0.8,
          stagger: 0.2,
          ease: 'bounce.out'
        });
      }
    });

    // Parallax effect on scroll
    gsap.to('.parallax-bg', {
      yPercent: -50,
      ease: 'none',
      scrollTrigger: {
        trigger: heroRef.current,
        start: 'top top',
        end: 'bottom top',
        scrub: true
      }
    });

    // Mouse move effect for interactive elements
    const handleMouseMove = (e) => {
      const cards = document.querySelectorAll('.interactive-card');
      cards.forEach(card => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;
        
        gsap.to(card, {
          rotationY: x / 10,
          rotationX: -y / 10,
          duration: 0.5,
          ease: 'power2.out'
        });
      });
    };

    document.addEventListener('mousemove', handleMouseMove);

    return () => {
      ScrollTrigger.getAll().forEach(trigger => trigger.kill());
      document.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-blue-900 to-purple-900">
      {/* HERO SECTION */}
      <section ref={heroRef} className="relative min-h-screen flex items-center overflow-hidden">
        {/* Animated background */}
        <div className="parallax-bg absolute inset-0">
          <div className="floating-1 absolute w-96 h-96 bg-blue-500/20 rounded-full blur-3xl top-20 left-20"></div>
          <div className="floating-2 absolute w-64 h-64 bg-purple-500/20 rounded-full blur-2xl bottom-20 right-32"></div>
          <div className="floating-3 absolute w-48 h-48 bg-pink-500/20 rounded-full blur-xl top-1/2 left-1/2"></div>
        </div>

        <div className="relative z-10 container mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="hero-title text-6xl lg:text-8xl font-bold text-white mb-6 leading-tight">
                <span className="word block">Build Your</span>
                <span className="word block text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500">Dream Project</span>
                <span className="word block">With CivilBridge</span>
              </h1>
              <p className="hero-subtitle text-xl lg:text-2xl mb-8 text-blue-100 max-w-lg">
                Connect with verified experts, get AI-powered insights, and manage your construction projects seamlessly across Rwanda.
              </p>
              <div className="hero-buttons flex flex-col sm:flex-row gap-4">
                <Link
                  to="/register"
                  className="btn pulse-btn px-8 py-4 bg-gradient-to-r from-yellow-400 to-orange-500 text-gray-900 font-bold rounded-lg shadow-2xl hover:shadow-3xl transform hover:scale-105 transition-all duration-300"
                >
                  Start Building Now
                </Link>
                <Link
                  to="/dashboard/budget-analysis"
                  className="btn px-8 py-4 bg-white/20 backdrop-blur-sm text-white font-semibold rounded-lg border-2 border-white/30 hover:bg-white/30 transition-all duration-300"
                >
                  Try AI Calculator
                </Link>
              </div>

              {/* Animated trust indicators */}
              <div className="mt-12 flex items-center gap-8">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="text-white text-sm">500+ Projects</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-blue-400 rounded-full animate-pulse delay-75"></div>
                  <span className="text-white text-sm">200+ Experts</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-purple-400 rounded-full animate-pulse delay-150"></div>
                  <span className="text-white text-sm">98% Success</span>
                </div>
              </div>
            </div>

            <div className="hero-image relative">
              <img
                src="https://images.unsplash.com/photo-1541888946425-d81bb1929f45?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
                alt="Construction project"
                className="rounded-2xl shadow-2xl transform hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute -bottom-6 -left-6 bg-white rounded-xl shadow-xl p-4 interactive-card">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                    <span className="text-2xl">🏗️</span>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">Active Projects</p>
                    <p className="text-2xl font-bold text-blue-600">47</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES SECTION */}
      <section ref={featuresRef} className="py-20 bg-gradient-to-b from-purple-900 to-slate-900">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-bold text-white mb-4">
              Everything You Need
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              From planning to completion, we've got you covered with cutting-edge tools
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="feature-card bg-white/10 backdrop-blur-lg rounded-xl p-8 border border-white/20 hover:bg-white/20 transition-all duration-300">
              <div className="feature-icon w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mb-6">
                <span className="text-4xl">🤖</span>
              </div>
              <h3 className="text-2xl font-semibold text-white mb-4">AI Assistant</h3>
              <p className="text-gray-300 mb-4">
                Get intelligent insights and recommendations powered by advanced AI
              </p>
              <Link to="/dashboard/intelligence/ai" className="text-blue-400 font-semibold hover:text-blue-300">
                Try AI →
              </Link>
            </div>

            <div className="feature-card bg-white/10 backdrop-blur-lg rounded-xl p-8 border border-white/20 hover:bg-white/20 transition-all duration-300">
              <div className="feature-icon w-20 h-20 bg-gradient-to-br from-green-500 to-blue-600 rounded-full flex items-center justify-center mb-6">
                <span className="text-4xl">💰</span>
              </div>
              <h3 className="text-2xl font-semibold text-white mb-4">Smart Budgeting</h3>
              <p className="text-gray-300 mb-4">
                Real-time cost calculations based on current market prices
              </p>
              <Link to="/dashboard/budget-analysis" className="text-green-400 font-semibold hover:text-green-300">
                Calculate →
              </Link>
            </div>

            <div className="feature-card bg-white/10 backdrop-blur-lg rounded-xl p-8 border border-white/20 hover:bg-white/20 transition-all duration-300">
              <div className="feature-icon w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center mb-6">
                <span className="text-4xl">👥</span>
              </div>
              <h3 className="text-2xl font-semibold text-white mb-4">Expert Network</h3>
              <p className="text-gray-300 mb-4">
                Connect with verified professionals for your project needs
              </p>
              <Link to="/experts" className="text-purple-400 font-semibold hover:text-purple-300">
                Connect →
              </Link>
            </div>

            <div className="feature-card bg-white/10 backdrop-blur-lg rounded-xl p-8 border border-white/20 hover:bg-white/20 transition-all duration-300">
              <div className="feature-icon w-20 h-20 bg-gradient-to-br from-orange-500 to-red-600 rounded-full flex items-center justify-center mb-6">
                <span className="text-4xl">📋</span>
              </div>
              <h3 className="text-2xl font-semibold text-white mb-4">Project Tools</h3>
              <p className="text-gray-300 mb-4">
                Manage timelines, track progress, and coordinate teams
              </p>
              <Link to="/dashboard/projects" className="text-orange-400 font-semibold hover:text-orange-300">
                Manage →
              </Link>
            </div>

            <div className="feature-card bg-white/10 backdrop-blur-lg rounded-xl p-8 border border-white/20 hover:bg-white/20 transition-all duration-300">
              <div className="feature-icon w-20 h-20 bg-gradient-to-br from-red-500 to-yellow-600 rounded-full flex items-center justify-center mb-6">
                <span className="text-4xl">📐</span>
              </div>
              <h3 className="text-2xl font-semibold text-white mb-4">Building Plans</h3>
              <p className="text-gray-300 mb-4">
                Access architectural designs and custom planning services
              </p>
              <Link to="/plans" className="text-red-400 font-semibold hover:text-red-300">
                Browse →
              </Link>
            </div>

            <div className="feature-card bg-white/10 backdrop-blur-lg rounded-xl p-8 border border-white/20 hover:bg-white/20 transition-all duration-300">
              <div className="feature-icon w-20 h-20 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center mb-6">
                <span className="text-4xl">🛒</span>
              </div>
              <h3 className="text-2xl font-semibold text-white mb-4">Marketplace</h3>
              <p className="text-gray-300 mb-4">
                Source materials and services from verified suppliers
              </p>
              <Link to="/marketplace" className="text-indigo-400 font-semibold hover:text-indigo-300">
                Shop →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* STATS SECTION */}
      <section ref={statsRef} className="py-20 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-white mb-4">Trusted by Rwanda's Leaders</h2>
            <p className="text-xl text-blue-100">Join thousands of successful projects</p>
          </div>

          <div className="grid md:grid-cols-4 gap-8">
            <div className="stat-card bg-white/10 backdrop-blur-lg rounded-xl p-6 text-center">
              <div className="stat-number text-5xl font-bold text-white mb-2" data-final="500">0</div>
              <p className="text-blue-100">Projects Completed</p>
              <div className="progress-bar w-full bg-white/20 rounded-full h-2 mt-3">
                <div className="bg-green-400 h-2 rounded-full" style={{width: '85%'}}></div>
              </div>
            </div>
            <div className="stat-card bg-white/10 backdrop-blur-lg rounded-xl p-6 text-center">
              <div className="stat-number text-5xl font-bold text-white mb-2" data-final="200">0</div>
              <p className="text-blue-100">Verified Experts</p>
              <div className="progress-bar w-full bg-white/20 rounded-full h-2 mt-3">
                <div className="bg-blue-400 h-2 rounded-full" style={{width: '92%'}}></div>
              </div>
            </div>
            <div className="stat-card bg-white/10 backdrop-blur-lg rounded-xl p-6 text-center">
              <div className="stat-number text-5xl font-bold text-white mb-2" data-final="50">0</div>
              <p className="text-blue-100">Million RWF Saved</p>
              <div className="progress-bar w-full bg-white/20 rounded-full h-2 mt-3">
                <div className="bg-purple-400 h-2 rounded-full" style={{width: '78%'}}></div>
              </div>
            </div>
            <div className="stat-card bg-white/10 backdrop-blur-lg rounded-xl p-6 text-center">
              <div className="stat-number text-5xl font-bold text-white mb-2" data-final="98">0</div>
              <p className="text-blue-100">% Satisfaction</p>
              <div className="progress-bar w-full bg-white/20 rounded-full h-2 mt-3">
                <div className="bg-yellow-400 h-2 rounded-full" style={{width: '98%'}}></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SHOWCASE SECTION */}
      <section ref={showcaseRef} className="py-20 bg-gradient-to-b from-purple-600 to-slate-900">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-bold text-white mb-4">See CivilBridge in Action</h2>
            <p className="text-xl text-gray-300">Experience the power of modern construction management</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="showcase-item bg-white/10 backdrop-blur-lg rounded-xl p-8 border border-white/20">
              <div className="rotate-slow w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mb-6 mx-auto">
                <span className="text-3xl">📊</span>
              </div>
              <h3 className="text-2xl font-semibold text-white mb-4">Real Analytics</h3>
              <p className="text-gray-300">Track every aspect of your project with detailed analytics and insights</p>
            </div>

            <div className="showcase-item bg-white/10 backdrop-blur-lg rounded-xl p-8 border border-white/20">
              <div className="rotate-fast w-16 h-16 bg-gradient-to-br from-green-500 to-blue-600 rounded-full flex items-center justify-center mb-6 mx-auto">
                <span className="text-3xl">🔄</span>
              </div>
              <h3 className="text-2xl font-semibold text-white mb-4">Live Updates</h3>
              <p className="text-gray-300">Get real-time updates on project progress and team activities</p>
            </div>

            <div className="showcase-item bg-white/10 backdrop-blur-lg rounded-xl p-8 border border-white/20">
              <div className="rotate-slow w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center mb-6 mx-auto">
                <span className="text-3xl">🎯</span>
              </div>
              <h3 className="text-2xl font-semibold text-white mb-4">Smart Planning</h3>
              <p className="text-gray-300">AI-powered planning tools that optimize your construction timeline</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA SECTION */}
      <section ref={ctaRef} className="py-20 bg-gradient-to-r from-orange-600 to-red-600">
        <div className="container mx-auto px-6">
          <div className="cta-content text-center">
            <h2 className="text-5xl font-bold text-white mb-4">Ready to Transform Construction?</h2>
            <p className="text-xl text-orange-100 mb-8 max-w-2xl mx-auto">
              Join the future of construction management in Rwanda
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/register"
                className="cta-btn px-8 py-4 bg-white text-orange-600 font-bold rounded-lg shadow-2xl hover:shadow-3xl transform hover:scale-105 transition-all duration-300"
              >
                Start Free Today
              </Link>
              <Link
                to="/contact"
                className="cta-btn px-8 py-4 bg-transparent border-2 border-white text-white font-semibold rounded-lg hover:bg-white hover:text-orange-600 transition-all duration-300"
              >
                Book Demo
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
