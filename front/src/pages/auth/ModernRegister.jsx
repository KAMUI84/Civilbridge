import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { authService } from '../../services/authService.js';
import { gsap } from 'gsap';

export default function ModernRegister() {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1); // 1: form, 2: otp verification
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // GSAP animations
  useEffect(() => {
    const tl = gsap.timeline();
    
    tl.from('.register-container', {
      opacity: 0,
      y: 30,
      duration: 0.8,
      ease: 'power3.out'
    })
    .from('.step-indicator', {
      opacity: 0,
      scale: 0.8,
      duration: 0.5,
      ease: 'back.out(1.7)'
    }, '-=0.4')
    .from('.form-group', {
      opacity: 0,
      x: -20,
      duration: 0.6,
      stagger: 0.1,
      ease: 'power2.out'
    }, '-=0.2');

    return () => tl.kill();
  }, []);

  useEffect(() => {
    if (step === 2) {
      gsap.from('.otp-container', {
        opacity: 0,
        scale: 0.9,
        duration: 0.5,
        ease: 'back.out(1.7)'
      });
    }
  }, [step]);

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setErr("");
    setLoading(true);

    try {
      // Validation
      if (!formData.full_name || !formData.email || !formData.password) {
        throw new Error("Please fill in all required fields");
      }

      if (formData.password.length < 6) {
        throw new Error("Password must be at least 6 characters long");
      }

      if (formData.password !== formData.confirmPassword) {
        throw new Error("Passwords do not match");
      }

      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        throw new Error("Please enter a valid email address");
      }

      // Send OTP
      await authService.requestRegisterOtp({ 
        email: formData.email, 
        phone: formData.phone 
      });
      
      setOtpSent(true);
      setStep(2);
    } catch (error) {
      setErr(error?.message || "Failed to send OTP");
      
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

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setErr("");
    setLoading(true);

    try {
      if (!otp || otp.length !== 6) {
        throw new Error("Please enter a valid 6-digit OTP");
      }

      await register({
        full_name: formData.full_name,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
        otp
      });

      // Success animation
      gsap.to('.register-container', {
        scale: 1.05,
        duration: 0.3,
        ease: 'power2.out',
        yoyo: true,
        repeat: 1
      });
    } catch (error) {
      setErr(error?.message || "Registration failed");
      
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

  const handleResendOtp = async () => {
    setErr("");
    setLoading(true);

    try {
      await authService.requestRegisterOtp({ 
        email: formData.email, 
        phone: formData.phone 
      });
      
      setOtpSent(true);
      setOtp('');
    } catch (error) {
      setErr(error?.message || "Failed to resend OTP");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute w-96 h-96 bg-purple-500 rounded-full blur-3xl opacity-20 -top-48 -right-48"></div>
        <div className="absolute w-96 h-96 bg-blue-500 rounded-full blur-3xl opacity-20 -bottom-48 -left-48"></div>
      </div>

      <div className="register-container relative z-10 w-full max-w-md">
        {/* Logo/Brand */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-500 to-blue-600 rounded-2xl mb-4">
            <span className="text-2xl font-bold text-white">🏗️</span>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Join CivilBridge</h1>
          <p className="text-gray-300">Start your construction journey today</p>
        </div>

        {/* Step Indicator */}
        <div className="step-indicator mb-6">
          <div className="flex items-center justify-center space-x-4">
            <div className={`flex items-center ${step === 1 ? 'text-white' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step === 1 ? 'bg-purple-500' : 'bg-gray-600'}`}>
                1
              </div>
              <span className="ml-2 text-sm">Account Info</span>
            </div>
            <div className={`w-8 h-0.5 ${step === 2 ? 'bg-purple-500' : 'bg-gray-600'}`}></div>
            <div className={`flex items-center ${step === 2 ? 'text-white' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step === 2 ? 'bg-purple-500' : 'bg-gray-600'}`}>
                2
              </div>
              <span className="ml-2 text-sm">Verify</span>
            </div>
          </div>
        </div>

        {/* Registration Form */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20">
          {step === 1 ? (
            <>
              <h2 className="text-2xl font-semibold text-white mb-6">Create Account</h2>
              
              {err && (
                <div className="error-message mb-4 p-3 bg-red-500/20 border border-red-500/30 rounded-lg text-red-200 text-sm">
                  {err}
                </div>
              )}

              <form onSubmit={handleSendOtp} className="space-y-4">
                {/* Full Name */}
                <div className="form-group">
                  <label className="block text-sm font-medium text-gray-200 mb-2">
                    Full Name *
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      name="full_name"
                      value={formData.full_name}
                      onChange={handleInputChange}
                      placeholder="John Doe"
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                      required
                    />
                    <div className="absolute right-3 top-3.5 text-gray-400">
                      👤
                    </div>
                  </div>
                </div>

                {/* Email */}
                <div className="form-group">
                  <label className="block text-sm font-medium text-gray-200 mb-2">
                    Email Address *
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="name@example.com"
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                      required
                    />
                    <div className="absolute right-3 top-3.5 text-gray-400">
                      📧
                    </div>
                  </div>
                </div>

                {/* Phone */}
                <div className="form-group">
                  <label className="block text-sm font-medium text-gray-200 mb-2">
                    Phone Number
                  </label>
                  <div className="relative">
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      placeholder="+250 7XX XXX XXX"
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                    />
                    <div className="absolute right-3 top-3.5 text-gray-400">
                      📱
                    </div>
                  </div>
                </div>

                {/* Password */}
                <div className="form-group">
                  <label className="block text-sm font-medium text-gray-200 mb-2">
                    Password *
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      placeholder="Create a strong password"
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
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

                {/* Confirm Password */}
                <div className="form-group">
                  <label className="block text-sm font-medium text-gray-200 mb-2">
                    Confirm Password *
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      placeholder="Re-enter your password"
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-3.5 text-gray-400 hover:text-white transition-colors"
                    >
                      {showConfirmPassword ? '👁️' : '👁️‍🗨️'}
                    </button>
                  </div>
                </div>

                {/* Terms */}
                <div className="flex items-start">
                  <input
                    type="checkbox"
                    required
                    className="w-4 h-4 mt-1 bg-white/10 border border-white/20 rounded focus:ring-2 focus:ring-purple-500 text-purple-500"
                  />
                  <span className="ml-2 text-sm text-gray-300">
                    I agree to the{' '}
                    <Link to="/terms" className="text-purple-400 hover:text-purple-300">
                      Terms of Service
                    </Link>{' '}
                    and{' '}
                    <Link to="/privacy" className="text-purple-400 hover:text-purple-300">
                      Privacy Policy
                    </Link>
                  </span>
                </div>

                {/* Send OTP Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 px-4 bg-gradient-to-r from-purple-500 to-blue-600 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <span className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Sending OTP...
                    </span>
                  ) : 'Send Verification Code'}
                </button>
              </form>
            </>
          ) : (
            <div className="otp-container">
              <h2 className="text-2xl font-semibold text-white mb-6">Verify Email</h2>
              <p className="text-gray-300 mb-6 text-center">
                We've sent a 6-digit verification code to<br />
                <span className="text-purple-400 font-medium">{formData.email}</span>
              </p>

              {err && (
                <div className="error-message mb-4 p-3 bg-red-500/20 border border-red-500/30 rounded-lg text-red-200 text-sm">
                  {err}
                </div>
              )}

              <form onSubmit={handleVerifyOtp} className="space-y-4">
                {/* OTP Input */}
                <div className="form-group">
                  <label className="block text-sm font-medium text-gray-200 mb-2">
                    Enter 6-digit code
                  </label>
                  <div className="flex justify-center space-x-2">
                    {[0, 1, 2, 3, 4, 5].map((index) => (
                      <input
                        key={index}
                        type="text"
                        maxLength="1"
                        value={otp[index] || ''}
                        onChange={(e) => {
                          const newOtp = otp.split('');
                          newOtp[index] = e.target.value;
                          setOtp(newOtp.join(''));
                          
                          // Auto-focus next input
                          if (e.target.value && index < 5) {
                            const inputs = document.querySelectorAll('input[maxlength="1"]');
                            inputs[index + 1]?.focus();
                          }
                        }}
                        className="w-12 h-12 text-center bg-white/10 border border-white/20 rounded-lg text-white text-xl font-semibold focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                        required
                      />
                    ))}
                  </div>
                </div>

                {/* Verify Button */}
                <button
                  type="submit"
                  disabled={loading || otp.length !== 6}
                  className="w-full py-3 px-4 bg-gradient-to-r from-purple-500 to-blue-600 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <span className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Verifying...
                    </span>
                  ) : 'Verify & Create Account'}
                </button>

                {/* Resend OTP */}
                <div className="text-center">
                  <button
                    type="button"
                    onClick={handleResendOtp}
                    disabled={loading}
                    className="text-purple-400 hover:text-purple-300 text-sm transition-colors disabled:opacity-50"
                  >
                    Didn't receive the code? Resend
                  </button>
                </div>

                {/* Back Button */}
                <div className="text-center">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="text-gray-400 hover:text-gray-300 text-sm transition-colors"
                  >
                    ← Back to account info
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Sign In Link */}
          {step === 1 && (
            <div className="mt-6 text-center">
              <p className="text-gray-300">
                Already have an account?{' '}
                <Link to="/login" className="text-purple-400 hover:text-purple-300 font-medium transition-colors">
                  Sign in
                </Link>
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-sm text-gray-400">
          <p>&copy; 2024 CivilBridge. Building Rwanda's Future.</p>
        </div>
      </div>
    </div>
  );
}
