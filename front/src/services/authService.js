import { api } from './apiClientService.js';

const authService = {
  // Register new user
  async register(userData) {
    const response = await api.post('/api/auth/register', userData);
    return response;
  },

  // Request OTP for registration
  async requestRegisterOtp(contactInfo) {
    const response = await api.post('/api/auth/register/request-otp', contactInfo);
    return response;
  },

  // Login user
  async login(credentials) {
    const response = await api.post('/api/auth/login', credentials);
    return response;
  },

  // Google login
  async googleLogin(credential) {
    const response = await api.post('/api/auth/google-login', { credential });
    return response;
  },

  // Logout user
  async logout() {
    const response = await api.post('/api/auth/logout');
    return response;
  },

  // Get current user info
  async getCurrentUser() {
    const response = await api.get('/api/me');
    return response;
  }
};

export default authService;