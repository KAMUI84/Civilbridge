import { useState } from "React";
import { useNavigate, Link } from "react-router-dom";
import { registerUser } from "../../services/authService";
import { setAuth } from "../../store/authStore";

export default function Register() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    full_name: "",
    email: "",
    password: "",
    role: "HOME_BUILDER",
  });

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const data = await registerUser(form);
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
      <h1>Create Account</h1>
      <p style={{ color: "#555" }}>
        Start using CivilBridge for projects, estimation, and marketplace.
      </p>

      {error && (
        <div style={{ background: "#ffe6e6", padding: 10, borderRadius: 10 }}>
          {error}
        </div>
      )}

      <form onSubmit={onSubmit} style={{ display: "grid", gap: 12, marginTop: 16 }}>
        <input
          name="full_name"
          placeholder="Full name"
          value={form.full_name}
          onChange={onChange}
          required
          style={inputStyle}
        />
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

        <select name="role" value={form.role} onChange={onChange} style={inputStyle}>
          <option value="HOME_BUILDER">Home Builder</option>
          <option value="STUDENT">Student</option>
          <option value="ENGINEER">Engineer</option>
          <option value="CONTRACTOR">Contractor</option>
          <option value="SUPPLIER">Supplier</option>
        </select>

        <button disabled={loading} style={btnStyle}>
          {loading ? "Creating..." : "Create account"}
        </button>
      </form>

      <p style={{ marginTop: 14 }}>
        Already have an account? <Link to="/login">Login</Link>
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