import { create } from 'zustand';
import authService from '../services/authService';
import { disconnectSocket } from '../services/socketService';

export const useAuthStore = create((set) => ({
  user: JSON.parse(localStorage.getItem("cb_user")) || null,
  // JWT is stored server-side in an httpOnly cookie; keep no client-side token.
  token: null,
  isAuthenticated: !!localStorage.getItem("cb_user"),

  // Centralized login/register success handler
  setAuth: (user) => {
    localStorage.setItem("cb_user", JSON.stringify(user));
    set({ user, token: null, isAuthenticated: true });
  },

  login: async (credentials) => {
    const data = await authService.login(credentials);
    const { user } = data;
    useAuthStore.getState().setAuth(user);
    return user;
  },

  googleLogin: async (credential) => {
    const data = await authService.googleLogin(credential);
    const { user } = data;
    useAuthStore.getState().setAuth(user);
    return user;
  },

  register: async (userData) => {
    return await authService.register(userData);
  },

  logout: () => {
    disconnectSocket();
    localStorage.removeItem("cb_user");
    set({ user: null, token: null, isAuthenticated: false });
  },

  setUser: (userData) => {
    if (userData) {
      localStorage.setItem("cb_user", JSON.stringify(userData));
      set({ user: userData, isAuthenticated: true });
    } else {
      set({ user: null, isAuthenticated: false });
    }
  },

  initializeAuth: () => {
    const userStr = localStorage.getItem("cb_user");
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        set({ user, token: null, isAuthenticated: true });
      } catch (err) {
        console.error("Failed to parse user", err);
        set({ user: null, token: null, isAuthenticated: false });
      }
    }
  }
}));
