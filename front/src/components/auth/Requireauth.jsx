import { Navigate } from "react-router-dom";
import { isAuthed } from "../../store/authStore";

export default function RequireAuth({ children }) {
  if (!isAuthed()) return <Navigate to="/login" replace />;
  return children;
}