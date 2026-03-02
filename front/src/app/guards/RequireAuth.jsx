import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

/**
 * RequireAuth
 * Redirects unauthenticated users to /login.
 * Shows a loading spinner while the context rehydrates from localStorage.
 */
export default function RequireAuth({ children }) {
    const { isAuthed, loading } = useAuth();
    const location = useLocation();

    if (loading) {
        return (
            <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "60vh" }}>
                <div className="auth-spinner" />
            </div>
        );
    }

    if (!isAuthed) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    return children;
}
