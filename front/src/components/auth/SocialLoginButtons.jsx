import React from 'react';
import { useGoogleLogin } from '@react-oauth/google';
import { useAuthStore } from '../../store/authStore';
import { useNavigate } from 'react-router-dom';

const SocialLoginButtons = ({ loading, setLoading, setError }) => {
  const googleLogin = useAuthStore(state => state.googleLogin);
  const navigate = useNavigate();

  const googleSignIn = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setLoading(true);
      setError('');
      
      try {
        const user = await googleLogin(tokenResponse.access_token);
        if (user?.role === "ADMIN") navigate('/admin', { replace: true });
        else navigate('/dashboard', { replace: true });
      } catch (error) {
        setError('Google login failed. Please try again.');
      } finally {
        setLoading(false);
      }
    },
    onError: () => {
      setError('Google login failed. Please try again.');
      setLoading(false);
    },
    flow: 'implicit',
  });

  const handleGoogleLogin = () => {
    if (!loading) {
      setLoading(true);
      googleSignIn();
    }
  };

  return (
    <div className="social-login-container">
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-white/20"></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-4 bg-transparent text-gray-400 font-medium">Or continue with</span>
        </div>
      </div>

      <div className="mt-6 space-y-3">
        {/* Google Login Button */}
        <button
          onClick={handleGoogleLogin}
          disabled={loading}
          className="social-button w-full flex items-center justify-center px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white font-medium hover:bg-white/20 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed group"
        >
          <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
          <span className="group-hover:text-blue-400 transition-colors">Continue with Google</span>
        </button>

        {/* Future: Add other social providers */}
        {/* 
        <button className="social-button w-full flex items-center justify-center px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white font-medium hover:bg-white/20 transition-all duration-300">
          <svg className="w-5 h-5 mr-3" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
          </svg>
          <span>Continue with GitHub</span>
        </button>

        <button className="social-button w-full flex items-center justify-center px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white font-medium hover:bg-white/20 transition-all duration-300">
          <svg className="w-5 h-5 mr-3" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zM5.838 12c0-3.403 2.759-6.162 6.162-6.162s6.162 2.759 6.162 6.162-2.759 6.162-6.162 6.162-6.162-2.759-6.162-6.162zm1.621 0c0 2.507 2.034 4.541 4.541 4.541s4.541-2.034 4.541-4.541-2.034-4.541-4.541-4.541-4.541 2.034-4.541 4.541zm9.877-6.193c0 .795-.646 1.44-1.44 1.44s-1.44-.646-1.44-1.44.646-1.44 1.44-1.44 1.44.646 1.44 1.44z"/>
          </svg>
          <span>Continue with Instagram</span>
        </button>
        */}
      </div>

      <div className="mt-6 text-center">
        <p className="text-xs text-gray-400">
          By continuing, you agree to our{' '}
          <a href="/terms" className="text-blue-400 hover:text-blue-300 transition-colors">
            Terms of Service
          </a>{' '}
          and{' '}
          <a href="/privacy" className="text-blue-400 hover:text-blue-300 transition-colors">
            Privacy Policy
          </a>
        </p>
      </div>
    </div>
  );
};

export default SocialLoginButtons;
