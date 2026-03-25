import { create } from 'zustand';
import authService from '../services/authService';

export const useAuthStore = create((set) => ({
  user: JSON.parse(localStorage.getItem("cb_user")) || null,
  token: localStorage.getItem("cb_token") || null,
  isAuthenticated: !!localStorage.getItem("cb_token"),

  // Centralized login/register success handler
  setAuth: (user, token) => {
    localStorage.setItem("cb_token", token || "session");
    localStorage.setItem("cb_user", JSON.stringify(user));
    set({ user, token: token || "session", isAuthenticated: true });
  },

  login: async (credentials) => {
    const data = await authService.login(credentials);
    const { token, user } = data;
    useAuthStore.getState().setAuth(user, token);
    return user;
  },

  googleLogin: async (credential) => {
    const data = await authService.googleLogin(credential);
    const { token, user } = data;
    useAuthStore.getState().setAuth(user, token);
    return user;
  },

  register: async (userData) => {
    return await authService.register(userData);
  },

  logout: () => {
    localStorage.removeItem("cb_token");
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
    const token = localStorage.getItem("cb_token");
    const userStr = localStorage.getItem("cb_user");
    if (token && userStr) {
      try {
        const user = JSON.parse(userStr);
        set({ user, token, isAuthenticated: true });
      } catch (err) {
        console.error("Failed to parse user", err);
        set({ user: null, token: null, isAuthenticated: false });
      }
    }
  }
}));