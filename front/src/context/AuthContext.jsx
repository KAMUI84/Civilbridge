import React, { createContext, useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import authService from "../services/authService";
import { useAuthStore } from "../store/authStore";
import { getPostLoginRoute } from "../utils/roles";

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
    const clearAuth = useAuthStore(state => state.clearAuth);

    // ── Rehydrate auth state on first mount ──────────────────────────
    useEffect(() => {
        const csrf = getCookie("csrf");

        // The httpOnly token cookie cannot be read from JS — validate via /api/me.
        // Only trust the session if the server confirms it. On any failure, clear
        // the localStorage cache and set unauthenticated state to prevent ghost sessions.
        (async () => {
            try {
                const res = await authService.getCurrentUser();
                const fetchedUser = res?.user ?? res?.data?.user ?? null;
                if (fetchedUser) {
                    setUser(fetchedUser);
                    setCsrfToken(csrf);
                    // Persist the verified user to localStorage as a display cache only.
                    initializeAuth(fetchedUser);
                } else {
                    // /api/me returned 200 but no user — treat as unauthenticated.
                    setUser(null);
                    clearAuth();
                }
            } catch (e) {
                // 401, network error, or any other failure: the session is invalid.
                // Clear stale localStorage data so the user is not shown as logged in.
                console.warn("Auth rehydrate /api/me failed — clearing cached auth:", e?.message || e);
                setUser(null);
                clearAuth();
            } finally {
                setLoading(false);
            }
        })();
    }, [initializeAuth, clearAuth]);

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

            navigate(getPostLoginRoute(newUser.role), { replace: true });

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

            navigate(getPostLoginRoute(newUser.role), { replace: true });

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
export default AuthContext;
