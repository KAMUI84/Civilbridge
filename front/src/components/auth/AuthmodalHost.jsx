import { useLocation, useNavigate } from "react-router-dom";
import AuthModal from "./Authmodal";
import LoginForm from "../../pages/public/Login";
import RegisterForm from "../../pages/public/Register";

export default function AuthModalHost() {
  const location = useLocation();
  const navigate = useNavigate();

  const isLogin = location.pathname === "/login";
  const isRegister = location.pathname === "/register";
  const open = isLogin || isRegister;

  const mode = isLogin ? "login" : "register";

  const close = () => navigate(-1);
  const switchMode = () => navigate(isLogin ? "/register" : "/login");

  if (!open) return null;

  return (
    <AuthModal open={open} onClose={close} mode={mode} onSwitchMode={switchMode}>
      {mode === "login" ? <LoginForm /> : <RegisterForm />}
    </AuthModal>
  );
}