import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import authService from "../services/authService";
import { useAuthStore } from "../store/authStore";

// ─────────────────────────────────────────────────────────────────────────────
// Context definition
// ─────────────────────────────────────────────────────────────────────────────
const AuthContext = createContext(null);

// Helper to read cookies
function getCookie(name) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(';').shift();
  return null;
}

// ─────────────────────────────────────────────────────────────────────────────
// Provider
// ─────────────────────────────────────────────────────────────────────────────
export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [csrfToken, setCsrfToken] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const setAuth = useAuthStore(state => state.setAuth);
    const logoutStore = useAuthStore(state => state.logout);
    const initializeAuth = useAuthStore(state => state.initializeAuth);

    // ── Rehydrate auth state on first mount ──────────────────────────
    useEffect(() => {
        const csrf = getCookie("csrf");

        // We cannot read httpOnly `token` cookie from JS, so validate via /api/me.
        // If it fails, we'll fall back to local cached profile (cb_user) and let API 401 handlers clear it.
        (async () => {
            try {
                const res = await authService.getCurrentUser();
                const fetchedUser = res?.user ?? res?.data?.user ?? null;
                if (fetchedUser) {
                    setUser(fetchedUser);
                    setCsrfToken(csrf);
                    setAuth(fetchedUser);
                    return;
                }
            } catch (e) {
                // If the cookie is missing/expired, just use cached user state.
                // Guard will redirect if backend rejects calls.
                console.warn("Auth rehydrate /api/me failed:", e?.message || e);
            }

            try {
                const cachedUserStr = localStorage.getItem("cb_user");
                if (cachedUserStr) {
                    const parsedUser = JSON.parse(cachedUserStr);
                    setUser(parsedUser);
                    setCsrfToken(csrf);
                    initializeAuth();
                }
            } catch {
                // Ignore cache parse errors
            } finally {
                setLoading(false);
            }
        })();
    }, [initializeAuth, setAuth]);

    // ── Derived helpers ──────────────────────────────────────────────────────
    const role = user?.role ?? null;
    const isAuthed = !!user;

    // ── Login ────────────────────────────────────────────────────────────────
    const login = useCallback(async (credentials) => {
        try {
            const data = await authService.login(credentials);
            const { csrfToken: newCsrf, user: newUser } = data;

            // Store only non-sensitive user profile client-side.
            localStorage.setItem("cb_user", JSON.stringify(newUser));

            setUser(newUser);
            setCsrfToken(newCsrf);
            
            // Also update authStore for RequireAuth guard
            setAuth(newUser);

            // Redirect based on role
            if (newUser.role === 'ADMIN') {
                navigate('/admin', { replace: true });
            } else {
                navigate('/dashboard', { replace: true });
            }

            return newUser;
        } catch (error) {
            console.error('Login failed:', error);
            throw error;
        }
    }, [navigate, setAuth]);

    // ── Google Login ───────────────────────────────────────────────────────
    const googleLogin = useCallback(async (credential) => {
        try {
            const data = await authService.googleLogin(credential);
            const { csrfToken: newCsrf, user: newUser } = data;

            localStorage.setItem("cb_user", JSON.stringify(newUser));

            setUser(newUser);
            setCsrfToken(newCsrf);
            
            // Also update authStore for RequireAuth guard
            setAuth(newUser);

            // Redirect based on role
            if (newUser.role === 'ADMIN') {
                navigate('/admin', { replace: true });
            } else {
                navigate('/dashboard', { replace: true });
            }

            return newUser;
        } catch (error) {
            console.error('Google login failed:', error);
            throw error;
        }
    }, [navigate, setAuth]);

    // ── Register ─────────────────────────────────────────────────────────────
    const register = useCallback(async (userData) => {
        try {
            const data = await authService.register(userData);
            return data;
        } catch (error) {
            console.error('Registration failed:', error);
            throw error;
        }
    }, []);

    // ── Logout ───────────────────────────────────────────────────────────────
    const logout = useCallback(async () => {
        try {
            await authService.logout();
        } catch (err) {
            console.error('Logout API error:', err);
        }
        // Always clear local state
        localStorage.removeItem("cb_user");
        setUser(null);
        setCsrfToken(null);
        logoutStore(); // Also clear authStore
        navigate('/login', { replace: true });
    }, [navigate, logoutStore]);

    // ── Context value ────────────────────────────────────────────────────────
    const value = {
        user,
        csrfToken,
        role,
        isAuthed,
        loading,
        login,
        googleLogin,
        register,
        logout,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// ─────────────────────────────────────────────────────────────────────────────
// Hook
// ─────────────────────────────────────────────────────────────────────────────
export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) {
        throw new Error("useAuth() must be used inside <AuthProvider>");
    }
    return ctx;
}

export default AuthContext;