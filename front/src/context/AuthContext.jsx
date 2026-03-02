import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {  logout, getUser } from "../store/authstore";
import { apiFetch } from "../services/apiClientService";

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
    const [auth, setAuth] = useState(null);
    const [loading, setLoading] = useState(true); // true until rehydration done
    const navigate = useNavigate();

    // ── Rehydrate from localStorage on first mount ──────────────────────────
    useEffect(() => {
        const storedToken = localStorage.getItem("token");
        const storedUser = getUser();
        if (storedToken && storedUser) {
            setToken(storedToken);
            setUser(storedUser);
        }
        setLoading(false);
    }, []);

    // ── Derived helpers ──────────────────────────────────────────────────────
    const role = user?.role ?? null;
    const isAuthed = !!token;

    // ── Login ────────────────────────────────────────────────────────────────
    const login = useCallback(async (credentials) => {
        // credentials = { email?, phone?, password }
        const data = await apiFetch("/api/auth/login", {
            method: "POST",
            body: JSON.stringify(credentials),
        });
        const { token: newToken, user: newUser } = data;

        setAuth({ token: newToken, user: newUser });
        setToken(newToken);
        setUser(newUser);

        // Redirect based on role
        if (newUser.role === "ADMIN") {
            navigate("/admin", { replace: true });
        } else {
            navigate("/dashboard", { replace: true });
        }

        return newUser;
    }, [navigate]);

    // ── Logout ───────────────────────────────────────────────────────────────
    const logout = useCallback(() => {
        clearAuth();
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
        setAuth,
        auth,
        loading,
        login,
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
