import { Navigate } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";
import { getPostLoginRoute } from "../../utils/roles";

export default function RequireRole({ allowedRoles = [], children }) {
    const { isAuthenticated, user } = useAuthStore();

    if (!isAuthenticated) return <Navigate to="/login" replace />;

    if (!user || !allowedRoles.includes(user.role)) {
        const fallback = getPostLoginRoute(user?.role);
        return <Navigate to={fallback} replace />;
    }

    return children;
}
