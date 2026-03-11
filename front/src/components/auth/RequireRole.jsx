import { Navigate } from "react-router-dom";
import { getUser, isAuthed } from "../../store/userStore";

export default function RequireRole({ roles = [], children }) {
  if (!isAuthed()) return <Navigate to="/login" replace />;
  const user = getUser();
  if (!roles.includes(user?.role)) return <Navigate to="/" replace />;
  return children;
}