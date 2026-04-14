import { create } from 'zustand';
import authService from '../services/authService';
import { disconnectSocket } from '../services/socketService';

export const useAuthStore = create((set) => ({
  // Start unauthenticated — /api/me must confirm the session before we trust any cached data.
  user: null,
  // JWT is stored server-side in an httpOnly cookie; keep no client-side token.
  token: null,
  isAuthenticated: false,

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

  // Called only after a successful /api/me — sets auth state from the verified server response.
  initializeAuth: (verifiedUser) => {
    if (verifiedUser) {
      localStorage.setItem("cb_user", JSON.stringify(verifiedUser));
      set({ user: verifiedUser, token: null, isAuthenticated: true });
    } else {
      localStorage.removeItem("cb_user");
      set({ user: null, token: null, isAuthenticated: false });
    }
  },

  // Clears all auth state and the localStorage cache (called on 401 or failed rehydration).
  clearAuth: () => {
    localStorage.removeItem("cb_user");
    set({ user: null, token: null, isAuthenticated: false });
  }
}));
