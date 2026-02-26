import { useState } from "React";
import { useNavigate, Link } from "react-router-dom";
import { loginUser } from "../../services/authService";
import { setAuth } from "../../store/authStore";

export default function Login() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({ email: "", password: "" });
  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const data = await loginUser(form);
      setAuth({ token: data.token, user: data.user });
      navigate("/dashboard");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: 24, maxWidth: 520, margin: "0 auto" }}>
      <h1>Login</h1>
      <p style={{ color: "#555" }}>Welcome back to CivilBridge.</p>

      {error && (
        <div style={{ background: "#ffe6e6", padding: 10, borderRadius: 10 }}>
          {error}
        </div>
      )}

      <form onSubmit={onSubmit} style={{ display: "grid", gap: 12, marginTop: 16 }}>
        <input
          name="email"
          type="email"
          placeholder="Email"
          value={form.email}
          onChange={onChange}
          required
          style={inputStyle}
        />
        <input
          name="password"
          type="password"
          placeholder="Password"
          value={form.password}
          onChange={onChange}
          required
          style={inputStyle}
        />

        <button disabled={loading} style={btnStyle}>
          {loading ? "Logging in..." : "Login"}
        </button>
      </form>

      <p style={{ marginTop: 14 }}>
        Don’t have an account? <Link to="/register">Create one</Link>
      </p>
    </div>
  );
}

const inputStyle = {
  padding: 12,
  borderRadius: 12,
  border: "1px solid #ddd",
  outline: "none",
};

const btnStyle = {
  padding: 12,
  borderRadius: 12,
  border: "none",
  background: "#0c1220",
  color: "white",
  fontWeight: 800,
  cursor: "pointer",
};