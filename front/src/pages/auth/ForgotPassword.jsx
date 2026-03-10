import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { gsap } from 'gsap';

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [err, setErr] = useState('');

  // GSAP animations
  useEffect(() => {
    const tl = gsap.timeline();
    
    tl.from('.forgot-container', {
      opacity: 0,
      y: 30,
      duration: 0.8,
      ease: 'power3.out'
    })
    .from('.form-group', {
      opacity: 0,
      x: -20,
      duration: 0.6,
      stagger: 0.1,
      ease: 'power2.out'
    }, '-=0.4')
    .from('.reset-button', {
      opacity: 0,
      scale: 0.8,
      duration: 0.5,
      ease: 'back.out(1.7)'
    }, '-=0.2');

    return () => tl.kill();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErr('');
    setLoading(true);

    try {
      if (!email) {
        throw new Error('Email is required');
      }

      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        throw new Error('Please enter a valid email address');
      }

      const response = await fetch('http://localhost:3000/api/password-reset/request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send reset link');
      }

      setSuccess(true);
    } catch (error) {
      setErr(error.message);
      
      // Shake animation for error
      gsap.to('.error-message', {
        x: [-10, 10, -10, 10, 0],
        duration: 0.5,
        ease: 'power2.inOut'
      });
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-green-900 to-slate-900 flex items-center justify-center p-4">
        {/* Background decoration */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute w-96 h-96 bg-green-500 rounded-full blur-3xl opacity-20 -top-48 -left-48"></div>
          <div className="absolute w-96 h-96 bg-blue-500 rounded-full blur-3xl opacity-20 -bottom-48 -right-48"></div>
        </div>

        <div className="forgot-container relative z-10 w-full max-w-md">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-green-500 to-blue-600 rounded-2xl mb-4">
              <span className="text-2xl font-bold text-white">✉️</span>
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">Check Your Email</h1>
            <p className="text-gray-300">Reset link sent successfully</p>
          </div>

          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
              </div>
              <h2 className="text-2xl font-semibold text-white mb-4">Email Sent!</h2>
              <p className="text-gray-300 mb-6">
                We've sent a password reset link to<br />
                <span className="text-green-400 font-medium">{email}</span>
              </p>
              <p className="text-gray-400 text-sm mb-6">
                The link will expire in 15 minutes. If you don't see the email, check your spam folder.
              </p>
              
              <div className="space-y-3">
                <button
                  onClick={() => navigate('/login')}
                  className="w-full py-3 px-4 bg-gradient-to-r from-green-500 to-blue-600 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
                >
                  Back to Login
                </button>
                
                <button
                  onClick={() => {
                    setSuccess(false);
                    setEmail('');
                  }}
                  className="w-full py-3 px-4 bg-white/10 border border-white/20 text-white font-semibold rounded-lg hover:bg-white/20 transition-all duration-200"
                >
                  Send Another Link
                </button>
              </div>
            </div>
          </div>

          <div className="mt-8 text-center text-sm text-gray-400">
            <p>&copy; 2024 CivilBridge. Building Rwanda's Future.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-green-900 to-slate-900 flex items-center justify-center p-4">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute w-96 h-96 bg-green-500 rounded-full blur-3xl opacity-20 -top-48 -right-48"></div>
        <div className="absolute w-96 h-96 bg-blue-500 rounded-full blur-3xl opacity-20 -bottom-48 -left-48"></div>
      </div>

      <div className="forgot-container relative z-10 w-full max-w-md">
        {/* Logo/Brand */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-green-500 to-blue-600 rounded-2xl mb-4">
            <span className="text-2xl font-bold text-white">🔐</span>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Reset Password</h1>
          <p className="text-gray-300">We'll send you a reset link</p>
        </div>

        {/* Reset Form */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20">
          <h2 className="text-2xl font-semibold text-white mb-6">Forgot Password?</h2>
          <p className="text-gray-300 mb-6">
            No worries! Enter your email address below and we'll send you a link to reset your password.
          </p>

          {err && (
            <div className="error-message mb-4 p-3 bg-red-500/20 border border-red-500/30 rounded-lg text-red-200 text-sm">
              {err}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div className="form-group">
              <label className="block text-sm font-medium text-gray-200 mb-2">
                Email Address
              </label>
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                  required
                />
                <div className="absolute right-3 top-3.5 text-gray-400">
                  📧
                </div>
              </div>
            </div>

            {/* Send Reset Link Button */}
            <button
              type="submit"
              disabled={loading}
              className="reset-button w-full py-3 px-4 bg-gradient-to-r from-green-500 to-blue-600 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Sending...
                </span>
              ) : 'Send Reset Link'}
            </button>
          </form>

          {/* Back to Login */}
          <div className="mt-6 text-center">
            <p className="text-gray-300">
              Remember your password?{' '}
              <Link to="/login" className="text-green-400 hover:text-green-300 font-medium transition-colors">
                Back to Login
              </Link>
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-sm text-gray-400">
          <p>&copy; 2024 CivilBridge. Building Rwanda's Future.</p>
        </div>
      </div>
    </div>
  );
}
