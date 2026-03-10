import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { gsap } from 'gsap';

export default function ResetPassword() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [err, setErr] = useState('');
  const [tokenValid, setTokenValid] = useState(null);

  // GSAP animations
  useEffect(() => {
    const tl = gsap.timeline();
    
    tl.from('.reset-container', {
      opacity: 0,
      y: 30,
      duration: 0.8,
      ease: 'power3.out'
    });

    return () => tl.kill();
  }, []);

  // Validate token on mount
  useEffect(() => {
    if (!token) {
      setErr('Invalid or missing reset token');
      return;
    }

    const validateToken = async () => {
      try {
        const response = await fetch(`http://localhost:3000/api/password-reset/validate/${token}`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Invalid token');
        }

        setTokenValid(true);
      } catch (error) {
        setErr(error.message);
        setTokenValid(false);
      }
    };

    validateToken();
  }, [token]);

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErr('');
    setLoading(true);

    try {
      if (!formData.password || !formData.confirmPassword) {
        throw new Error('Please fill in all fields');
      }

      if (formData.password.length < 6) {
        throw new Error('Password must be at least 6 characters long');
      }

      if (formData.password !== formData.confirmPassword) {
        throw new Error('Passwords do not match');
      }

      const response = await fetch('http://localhost:3000/api/password-reset/reset', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token,
          newPassword: formData.password
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to reset password');
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

  if (tokenValid === null) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-white">Validating reset token...</p>
        </div>
      </div>
    );
  }

  if (tokenValid === false) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-red-900 to-slate-900 flex items-center justify-center p-4">
        <div className="text-center bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20 max-w-md">
          <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-white mb-4">Invalid Reset Link</h1>
          <p className="text-gray-300 mb-6">{err}</p>
          <button
            onClick={() => navigate('/forgot-password')}
            className="px-6 py-3 bg-red-500 text-white font-semibold rounded-lg hover:bg-red-600 transition-colors"
          >
            Request New Link
          </button>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-green-900 to-slate-900 flex items-center justify-center p-4">
        {/* Background decoration */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute w-96 h-96 bg-green-500 rounded-full blur-3xl opacity-20 -top-48 -left-48"></div>
          <div className="absolute w-96 h-96 bg-blue-500 rounded-full blur-3xl opacity-20 -bottom-48 -right-48"></div>
        </div>

        <div className="reset-container relative z-10 w-full max-w-md">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-green-500 to-blue-600 rounded-2xl mb-4">
              <span className="text-2xl font-bold text-white">🎉</span>
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">Password Reset!</h1>
            <p className="text-gray-300">Your password has been updated</p>
          </div>

          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
              </div>
              <h2 className="text-2xl font-semibold text-white mb-4">Success!</h2>
              <p className="text-gray-300 mb-6">
                Your password has been successfully reset. You can now login with your new password.
              </p>
              
              <button
                onClick={() => navigate('/login')}
                className="w-full py-3 px-4 bg-gradient-to-r from-green-500 to-blue-600 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
              >
                Continue to Login
              </button>
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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center p-4">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute w-96 h-96 bg-blue-500 rounded-full blur-3xl opacity-20 -top-48 -right-48"></div>
        <div className="absolute w-96 h-96 bg-purple-500 rounded-full blur-3xl opacity-20 -bottom-48 -left-48"></div>
      </div>

      <div className="reset-container relative z-10 w-full max-w-md">
        {/* Logo/Brand */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl mb-4">
            <span className="text-2xl font-bold text-white">🔐</span>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Reset Password</h1>
          <p className="text-gray-300">Create your new password</p>
        </div>

        {/* Reset Form */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20">
          <h2 className="text-2xl font-semibold text-white mb-6">New Password</h2>

          {err && (
            <div className="error-message mb-4 p-3 bg-red-500/20 border border-red-500/30 rounded-lg text-red-200 text-sm">
              {err}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* New Password */}
            <div className="form-group">
              <label className="block text-sm font-medium text-gray-200 mb-2">
                New Password
              </label>
              <div className="relative">
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="Enter your new password"
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  required
                />
                <div className="absolute right-3 top-3.5 text-gray-400">
                  🔒
                </div>
              </div>
              <p className="text-xs text-gray-400 mt-1">Must be at least 6 characters long</p>
            </div>

            {/* Confirm Password */}
            <div className="form-group">
              <label className="block text-sm font-medium text-gray-200 mb-2">
                Confirm New Password
              </label>
              <div className="relative">
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  placeholder="Confirm your new password"
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  required
                />
                <div className="absolute right-3 top-3.5 text-gray-400">
                  🔒
                </div>
              </div>
            </div>

            {/* Password Strength Indicator */}
            <div className="space-y-2">
              <p className="text-sm text-gray-300">Password strength:</p>
              <div className="flex space-x-1">
                {[1, 2, 3, 4].map((level) => (
                  <div
                    key={level}
                    className={`h-2 flex-1 rounded-full transition-colors ${
                      formData.password.length >= level * 2
                        ? formData.password.length >= 8
                          ? 'bg-green-500'
                          : formData.password.length >= 6
                          ? 'bg-yellow-500'
                          : 'bg-red-500'
                        : 'bg-gray-600'
                    }`}
                  />
                ))}
              </div>
              <p className="text-xs text-gray-400">
                {formData.password.length === 0
                  ? 'Enter a password'
                  : formData.password.length < 6
                  ? 'Weak'
                  : formData.password.length < 8
                  ? 'Fair'
                  : 'Strong'}
              </p>
            </div>

            {/* Reset Password Button */}
            <button
              type="submit"
              disabled={loading || formData.password.length < 6 || formData.password !== formData.confirmPassword}
              className="w-full py-3 px-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Resetting...
                </span>
              ) : 'Reset Password'}
            </button>
          </form>

          {/* Back to Login */}
          <div className="mt-6 text-center">
            <p className="text-gray-300">
              Remember your password?{' '}
              <button
                onClick={() => navigate('/login')}
                className="text-blue-400 hover:text-blue-300 font-medium transition-colors"
              >
                Back to Login
              </button>
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
