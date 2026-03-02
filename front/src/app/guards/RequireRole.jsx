import { Navigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

/**
 * RequireRole
 * Props:
 *   allowedRoles – string[] of roles that may access this route
 *                  e.g. allowedRoles={["ADMIN"]}
 *
 * Flow:
 *   1. Not authed → /login
 *   2. Authed but wrong role → /unauthorized  (or /dashboard as fallback)
 *   3. Role matches → render children
 */
export default function RequireRole({ allowedRoles = [], children }) {
    const { isAuthed, role, loading } = useAuth();

    if (loading) return null;

    if (!isAuthed) return <Navigate to="/login" replace />;

    if (!allowedRoles.includes(role)) {
        // Admin tried to reach a user route or vice versa
        const fallback = role === "ADMIN" ? "/admin" : "/dashboard";
        return <Navigate to={fallback} replace />;
    }

    return children;
}
