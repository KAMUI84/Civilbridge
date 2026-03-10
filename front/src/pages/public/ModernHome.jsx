import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export default function ModernHome() {
  const heroRef = useRef();
  const featuresRef = useRef();
  const statsRef = useRef();
  const ctaRef = useRef();

  useEffect(() => {
    // Hero animations
    const heroTl = gsap.timeline();
    
    heroTl.from('.hero-title', {
      opacity: 0,
      y: 50,
      duration: 1,
      ease: 'power3.out'
    })
    .from('.hero-subtitle', {
      opacity: 0,
      y: 30,
      duration: 0.8,
      ease: 'power3.out'
    }, '-=0.6')
    .from('.hero-buttons', {
      opacity: 0,
      y: 30,
      duration: 0.8,
      ease: 'power3.out'
    }, '-=0.4')
    .from('.hero-image', {
      opacity: 0,
      scale: 0.8,
      duration: 1,
      ease: 'power3.out'
    }, '-=0.6');

    // Floating animation for hero elements
    gsap.to('.floating-element', {
      y: -20,
      duration: 3,
      repeat: -1,
      yoyo: true,
      ease: 'power1.inOut',
      stagger: 0.5
    });

    // Scroll animations
    ScrollTrigger.create({
      trigger: featuresRef.current,
      start: 'top 80%',
      onEnter: () => {
        gsap.from('.feature-card', {
          opacity: 0,
          y: 50,
          duration: 0.8,
          stagger: 0.2,
          ease: 'power3.out'
        });
      }
    });

    ScrollTrigger.create({
      trigger: statsRef.current,
      start: 'top 80%',
      onEnter: () => {
        gsap.from('.stat-item', {
          opacity: 0,
          scale: 0.8,
          duration: 0.6,
          stagger: 0.1,
          ease: 'back.out(1.7)'
        });

        // Animate numbers
        gsap.to('.stat-number', {
          innerHTML: (index, target) => {
            const finalValue = parseInt(target.getAttribute('data-final'));
            return finalValue;
          },
          duration: 2,
          stagger: 0.2,
          ease: 'power2.out',
          snap: { innerHTML: 1 }
        });
      }
    });

    ScrollTrigger.create({
      trigger: ctaRef.current,
      start: 'top 80%',
      onEnter: () => {
        gsap.from('.cta-content', {
          opacity: 0,
          y: 30,
          duration: 0.8,
          ease: 'power3.out'
        });
      }
    });

    return () => {
      ScrollTrigger.getAll().forEach(trigger => trigger.kill());
    };
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Hero Section */}
      <section ref={heroRef} className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-blue-700 to-purple-800 text-white">
        <div className="absolute inset-0 bg-black/20"></div>
        
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="floating-element absolute w-96 h-96 bg-white/10 rounded-full blur-3xl top-10 left-10"></div>
          <div className="floating-element absolute w-64 h-64 bg-white/10 rounded-full blur-2xl bottom-10 right-20"></div>
          <div className="floating-element absolute w-48 h-48 bg-white/10 rounded-full blur-xl top-1/2 left-1/3"></div>
        </div>

        <div className="relative z-10 container mx-auto px-6 py-24">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="hero-title text-5xl lg:text-6xl font-bold mb-6 leading-tight">
                Build Your Dream
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500">
                  Construction Project
                </span>
              </h1>
              <p className="hero-subtitle text-xl lg:text-2xl mb-8 text-blue-100 max-w-lg">
                CivilBridge connects you with verified experts, real-time cost estimates, and AI-powered project management for Rwanda's construction ecosystem.
              </p>
              <div className="hero-buttons flex flex-col sm:flex-row gap-4">
                <Link
                  to="/register"
                  className="px-8 py-4 bg-gradient-to-r from-yellow-400 to-orange-500 text-gray-900 font-bold rounded-lg shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300"
                >
                  Get Started Free
                </Link>
                <Link
                  to="/dashboard/budget-analysis"
                  className="px-8 py-4 bg-white/20 backdrop-blur-sm text-white font-semibold rounded-lg border border-white/30 hover:bg-white/30 transition-all duration-300"
                >
                  Try Budget Calculator
                </Link>
              </div>

              {/* Trust indicators */}
              <div className="mt-12 flex items-center gap-8 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <span>500+ Projects Completed</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <span>200+ Verified Experts</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <span>98% Satisfaction Rate</span>
                </div>
              </div>
            </div>

            <div className="hero-image relative">
              <div className="relative z-10">
                <img
                  src="https://images.unsplash.com/photo-1541888946425-d81bb1929f45?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
                  alt="Construction project"
                  className="rounded-2xl shadow-2xl"
                />
                <div className="absolute -bottom-6 -left-6 bg-white rounded-xl shadow-xl p-4 floating-element">
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
        </div>
      </section>

      {/* Features Section */}
      <section ref={featuresRef} className="py-20 bg-gray-50">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Everything You Need to Build
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              From initial planning to project completion, CivilBridge provides all the tools and expertise you need.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="feature-card bg-white rounded-xl shadow-lg p-8 hover:shadow-2xl transition-shadow duration-300">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-6">
                <span className="text-3xl">🤖</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">AI-Powered Analysis</h3>
              <p className="text-gray-600 mb-4">
                Get intelligent cost estimates, material recommendations, and project insights powered by advanced AI.
              </p>
              <Link to="/dashboard/intelligence/ai" className="text-blue-600 font-semibold hover:text-blue-700">
                Try AI Assistant →
              </Link>
            </div>

            <div className="feature-card bg-white rounded-xl shadow-lg p-8 hover:shadow-2xl transition-shadow duration-300">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-6">
                <span className="text-3xl">💰</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Real-Time Budgeting</h3>
              <p className="text-gray-600 mb-4">
                Accurate cost calculations based on current market prices and regional factors across Rwanda.
              </p>
              <Link to="/dashboard/budget-analysis" className="text-green-600 font-semibold hover:text-green-700">
                Calculate Budget →
              </Link>
            </div>

            <div className="feature-card bg-white rounded-xl shadow-lg p-8 hover:shadow-2xl transition-shadow duration-300">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mb-6">
                <span className="text-3xl">👥</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Verified Experts</h3>
              <p className="text-gray-600 mb-4">
                Connect with pre-vetted architects, engineers, and contractors for your specific project needs.
              </p>
              <Link to="/experts" className="text-purple-600 font-semibold hover:text-purple-700">
                Find Experts →
              </Link>
            </div>

            <div className="feature-card bg-white rounded-xl shadow-lg p-8 hover:shadow-2xl transition-shadow duration-300">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mb-6">
                <span className="text-3xl">📋</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Project Management</h3>
              <p className="text-gray-600 mb-4">
                Track progress, manage timelines, and coordinate with your team from a single dashboard.
              </p>
              <Link to="/dashboard/projects" className="text-orange-600 font-semibold hover:text-orange-700">
                Manage Projects →
              </Link>
            </div>

            <div className="feature-card bg-white rounded-xl shadow-lg p-8 hover:shadow-2xl transition-shadow duration-300">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-6">
                <span className="text-3xl">📐</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Architectural Plans</h3>
              <p className="text-gray-600 mb-4">
                Access a library of proven building plans and get custom designs tailored to your requirements.
              </p>
              <Link to="/plans" className="text-red-600 font-semibold hover:text-red-700">
                Browse Plans →
              </Link>
            </div>

            <div className="feature-card bg-white rounded-xl shadow-lg p-8 hover:shadow-2xl transition-shadow duration-300">
              <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mb-6">
                <span className="text-3xl">🛒</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Materials Marketplace</h3>
              <p className="text-gray-600 mb-4">
                Source quality materials and services from verified suppliers at competitive prices.
              </p>
              <Link to="/marketplace" className="text-indigo-600 font-semibold hover:text-indigo-700">
                Browse Marketplace →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section ref={statsRef} className="py-20 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Trusted by Rwanda's Construction Leaders</h2>
            <p className="text-xl text-blue-100">Join thousands of successful projects built with CivilBridge</p>
          </div>

          <div className="grid md:grid-cols-4 gap-8">
            <div className="stat-item text-center">
              <div className="stat-number text-5xl font-bold mb-2" data-final="500">0</div>
              <p className="text-blue-100">Projects Completed</p>
            </div>
            <div className="stat-item text-center">
              <div className="stat-number text-5xl font-bold mb-2" data-final="200">0</div>
              <p className="text-blue-100">Verified Experts</p>
            </div>
            <div className="stat-item text-center">
              <div className="stat-number text-5xl font-bold mb-2" data-final="50">0</div>
              <p className="text-blue-100">Million RWF Saved</p>
            </div>
            <div className="stat-item text-center">
              <div className="stat-number text-5xl font-bold mb-2" data-final="98">0</div>
              <p className="text-blue-100">% Satisfaction</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section ref={ctaRef} className="py-20 bg-gray-50">
        <div className="container mx-auto px-6">
          <div className="cta-content bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-12 text-center text-white">
            <h2 className="text-4xl font-bold mb-4">Ready to Start Building?</h2>
            <p className="text-xl mb-8 text-blue-100 max-w-2xl mx-auto">
              Join thousands of construction professionals and homeowners who trust CivilBridge for their projects.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/register"
                className="px-8 py-4 bg-white text-blue-600 font-bold rounded-lg shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300"
              >
                Start Free Trial
              </Link>
              <Link
                to="/contact"
                className="px-8 py-4 bg-transparent border-2 border-white text-white font-semibold rounded-lg hover:bg-white hover:text-blue-600 transition-all duration-300"
              >
                Schedule Demo
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
