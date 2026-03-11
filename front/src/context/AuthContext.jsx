import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import authService from "../services/authService";

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

    // ── Rehydrate from cookies on first mount ──────────────────────────
    useEffect(() => {
        const token = getCookie('token');
        const csrf = getCookie('csrf');
        const storedUser = localStorage.getItem('user'); // Keep user in localStorage for non-sensitive data
        
        if (token && storedUser) {
            setUser(JSON.parse(storedUser));
            setCsrfToken(csrf);
        }
        setLoading(false);
    }, []);

    // ── Derived helpers ──────────────────────────────────────────────────────
    const role = user?.role ?? null;
    const isAuthed = !!user;

    // ── Login ────────────────────────────────────────────────────────────────
    const login = useCallback(async (credentials) => {
        try {
            const data = await authService.login(credentials);
            const { csrfToken: newCsrf, user: newUser } = data;

            // Store user in localStorage (non-sensitive)
            localStorage.setItem('user', JSON.stringify(newUser));
            
            setUser(newUser);
            setCsrfToken(newCsrf);

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
    }, [navigate]);

    // ── Google Login ───────────────────────────────────────────────────────
    const googleLogin = useCallback(async (credential) => {
        try {
            const data = await authService.googleLogin(credential);
            const { csrfToken: newCsrf, user: newUser } = data;

            localStorage.setItem('user', JSON.stringify(newUser));
            
            setUser(newUser);
            setCsrfToken(newCsrf);

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
    }, [navigate]);

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
        localStorage.removeItem('user');
        setUser(null);
        setCsrfToken(null);
        navigate('/login', { replace: true });
    }, [navigate]);

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