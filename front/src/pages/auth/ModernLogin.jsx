import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import GoogleButton from '../../components/auth/GoogleButton';
import { gsap } from 'gsap';

export default function ModernLogin() {
  const navigate = useNavigate();
  const { login, googleLogin } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // GSAP animations
  useEffect(() => {
    const tl = gsap.timeline();
    
    tl.from('.login-container', {
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
    .from('.login-button', {
      opacity: 0,
      scale: 0.8,
      duration: 0.5,
      ease: 'back.out(1.7)'
    }, '-=0.2')
    .from('.google-button', {
      opacity: 0,
      y: 20,
      duration: 0.6,
      ease: 'power2.out'
    }, '-=0.3');
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setErr("");
    setLoading(true);

    try {
      if (!email || !password) throw new Error("Enter email and password.");
      await login({ email, password });
    } catch (error) {
      setErr(error?.message || "Login failed");
      
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

  const handleGoogleLogin = async (credential) => {
    setErr("");
    setLoading(true);

    try {
      await googleLogin(credential);
    } catch (error) {
      setErr(error?.message || "Google login failed");
      
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

  const handleForgotPassword = () => {
    navigate('/forgot-password');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center p-4">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute w-96 h-96 bg-blue-500 rounded-full blur-3xl opacity-20 -top-48 -left-48"></div>
        <div className="absolute w-96 h-96 bg-purple-500 rounded-full blur-3xl opacity-20 -bottom-48 -right-48"></div>
      </div>

      <div className="login-container relative z-10 w-full max-w-md">
        {/* Logo/Brand */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl mb-4">
            <span className="text-2xl font-bold text-white">🏗️</span>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">CivilBridge</h1>
          <p className="text-gray-300">Your Construction Project Partner</p>
        </div>

        {/* Login Form */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20">
          <h2 className="text-2xl font-semibold text-white mb-6">Welcome Back</h2>
          
          {err && (
            <div className="error-message mb-4 p-3 bg-red-500/20 border border-red-500/30 rounded-lg text-red-200 text-sm">
              {err}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
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
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  required
                />
                <div className="absolute right-3 top-3.5 text-gray-400">
                  📧
                </div>
              </div>
            </div>

            {/* Password */}
            <div className="form-group">
              <label className="block text-sm font-medium text-gray-200 mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3.5 text-gray-400 hover:text-white transition-colors"
                >
                  {showPassword ? '👁️' : '👁️‍🗨️'}
                </button>
              </div>
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  className="w-4 h-4 bg-white/10 border border-white/20 rounded focus:ring-2 focus:ring-blue-500 text-blue-500"
                />
                <span className="ml-2 text-sm text-gray-300">Remember me</span>
              </label>
              <button
                type="button"
                onClick={handleForgotPassword}
                className="text-sm text-blue-400 hover:text-blue-300 transition-colors"
              >
                Forgot password?
              </button>
            </div>

            {/* Login Button */}
            <button
              type="submit"
              disabled={loading}
              className="login-button w-full py-3 px-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Signing in...
                </span>
              ) : 'Sign In'}
            </button>
          </form>

          {/* Divider */}
          <div className="my-6 flex items-center">
            <div className="flex-1 h-px bg-white/20"></div>
            <span className="px-4 text-sm text-gray-400">or continue with</span>
            <div className="flex-1 h-px bg-white/20"></div>
          </div>

          {/* Google Login */}
          <div className="google-button">
            <GoogleButton onCredential={handleGoogleLogin} />
          </div>

          {/* Sign Up Link */}
          <div className="mt-6 text-center">
            <p className="text-gray-300">
              Don't have an account?{' '}
              <Link to="/register" className="text-blue-400 hover:text-blue-300 font-medium transition-colors">
                Sign up
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
