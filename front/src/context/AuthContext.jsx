import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import authService from "../services/authService";

// ─────────────────────────────────────────────────────────────────────────────
// Context definition
// ─────────────────────────────────────────────────────────────────────────────
const AuthContext = createContext(null);

// ─────────────────────────────────────────────────────────────────────────────
// Provider
// ─────────────────────────────────────────────────────────────────────────────
export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(null);
    const [loading, setLoading] = useState(true); // true until rehydration done
    const navigate = useNavigate();

    // ── Rehydrate from localStorage on first mount ──────────────────────────
    useEffect(() => {
        const storedToken = localStorage.getItem("token");
        const storedUser = localStorage.getItem("user");
        
        if (storedToken && storedUser) {
            setToken(storedToken);
            setUser(JSON.parse(storedUser));
        }
        setLoading(false);
    }, []);

    // ── Derived helpers ──────────────────────────────────────────────────────
    const role = user?.role ?? null;
    const isAuthed = !!token;

    // ── Login ────────────────────────────────────────────────────────────────
    const login = useCallback(async (credentials) => {
        try {
            const data = await authService.login(credentials);
            const { token: newToken, user: newUser } = data;

            // Save to localStorage
            localStorage.setItem("token", newToken);
            localStorage.setItem("user", JSON.stringify(newUser));
            
            setToken(newToken);
            setUser(newUser);

            // Redirect based on role
            if (newUser.role === "ADMIN") {
                navigate("/admin", { replace: true });
            } else {
                navigate("/dashboard", { replace: true });
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
            const { token: newToken, user: newUser } = data;

            // Save to localStorage
            localStorage.setItem("token", newToken);
            localStorage.setItem("user", JSON.stringify(newUser));
            
            setToken(newToken);
            setUser(newUser);

            // Redirect based on role
            if (newUser.role === "ADMIN") {
                navigate("/admin", { replace: true });
            } else {
                navigate("/dashboard", { replace: true });
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
    const logout = useCallback(() => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setToken(null);
        setUser(null);
        navigate("/login", { replace: true });
    }, [navigate]);

    // ── Context value ────────────────────────────────────────────────────────
    const value = {
        user,
        token,
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
