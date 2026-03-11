import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";

/**
 * Shared login form card used by every role-specific login page.
 * Props:
 *   role        – display label e.g. "Engineer"
 *   accentColor – hex colour for branding
 *   icon        – emoji or small icon
 *   description – short role tagline
 */
export default function LoginCard({ role, accentColor = "#0c1220", icon = "🔑", description = "" }) {
    const login = useAuthStore(s => s.login);
    const navigate = useNavigate();
    const [form, setForm] = useState({ email: "", password: "" });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

    const onSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);
        try {
            const user = await login(form);
            if (user?.role === "ADMIN") {
                navigate("/admin", { replace: true });
            } else {
                navigate("/dashboard", { replace: true });
            }
        } catch (err) {
            setError(err.message || "Login failed. Check your credentials.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={styles.page}>
            {/* Accent gradient background blob */}
            <div style={{ ...styles.blob, background: accentColor }} />

            <div style={styles.card}>
                {/* Header */}
                <div style={styles.cardHeader}>
                    <div style={{ ...styles.iconBadge, background: accentColor + "18", border: `1.5px solid ${accentColor}30` }}>
                        <span style={{ fontSize: 28 }}>{icon}</span>
                    </div>
                    <h1 style={{ ...styles.title, color: accentColor }}>{role} Login</h1>
                    {description && <p style={styles.subtitle}>{description}</p>}
                </div>

                {/* Error */}
                {error && (
                    <div style={styles.errorBox}>
                        <span>⚠️</span> {error}
                    </div>
                )}

                {/* Form */}
                <form onSubmit={onSubmit} style={styles.form}>
                    <div style={styles.fieldGroup}>
                        <label style={styles.label}>Email address</label>
                        <input
                            name="email"
                            type="email"
                            placeholder="you@example.com"
                            value={form.email}
                            onChange={onChange}
                            required
                            style={styles.input}
                            onFocus={(e) => (e.target.style.borderColor = accentColor)}
                            onBlur={(e) => (e.target.style.borderColor = "#e5e7eb")}
                        />
                    </div>

                    <div style={styles.fieldGroup}>
                        <label style={styles.label}>Password</label>
                        <input
                            name="password"
                            type="password"
                            placeholder="••••••••"
                            value={form.password}
                            onChange={onChange}
                            required
                            style={styles.input}
                            onFocus={(e) => (e.target.style.borderColor = accentColor)}
                            onBlur={(e) => (e.target.style.borderColor = "#e5e7eb")}
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        style={{
                            ...styles.submitBtn,
                            background: loading ? "#9ca3af" : accentColor,
                            cursor: loading ? "not-allowed" : "pointer",
                        }}
                    >
                        {loading ? "Signing in…" : `Sign in as ${role}`}
                    </button>
                </form>

                {/* Footer links */}
                <div style={styles.footer}>
                    <p style={styles.footerText}>
                        Don&apos;t have an account?{" "}
                        <Link to="/register" style={{ color: accentColor, fontWeight: 700 }}>
                            Register here
                        </Link>
                    </p>
                    <Link to="/login" style={{ ...styles.backLink, color: accentColor }}>
                        ← Back to role selector
                    </Link>
                </div>
            </div>
        </div>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
const styles = {
    page: {
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)",
        position: "relative",
        overflow: "hidden",
        padding: "24px 16px",
    },
    blob: {
        position: "absolute",
        width: 480,
        height: 480,
        borderRadius: "50%",
        opacity: 0.08,
        top: -120,
        right: -120,
        filter: "blur(60px)",
        pointerEvents: "none",
    },
    card: {
        background: "#ffffff",
        borderRadius: 24,
        padding: "40px 36px",
        width: "100%",
        maxWidth: 460,
        boxShadow: "0 4px 40px rgba(0,0,0,0.10), 0 1px 3px rgba(0,0,0,0.06)",
        position: "relative",
        zIndex: 1,
    },
    cardHeader: {
        textAlign: "center",
        marginBottom: 28,
    },
    iconBadge: {
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        width: 64,
        height: 64,
        borderRadius: 16,
        marginBottom: 14,
    },
    title: {
        fontSize: 26,
        fontWeight: 800,
        margin: "0 0 6px",
        letterSpacing: "-0.4px",
    },
    subtitle: {
        color: "#6b7280",
        fontSize: 14,
        margin: 0,
        fontWeight: 500,
    },
    errorBox: {
        background: "#fef2f2",
        border: "1px solid #fecaca",
        color: "#dc2626",
        borderRadius: 10,
        padding: "10px 14px",
        fontSize: 14,
        marginBottom: 18,
        display: "flex",
        gap: 8,
        alignItems: "center",
    },
    form: {
        display: "grid",
        gap: 16,
    },
    fieldGroup: {
        display: "grid",
        gap: 6,
    },
    label: {
        fontSize: 13,
        fontWeight: 700,
        color: "#374151",
        letterSpacing: "0.2px",
    },
    input: {
        padding: "12px 14px",
        borderRadius: 12,
        border: "1.5px solid #e5e7eb",
        fontSize: 14,
        outline: "none",
        transition: "border-color 0.2s",
        fontFamily: "inherit",
        background: "#fafafa",
    },
    submitBtn: {
        padding: "14px",
        borderRadius: 14,
        border: "none",
        color: "#fff",
        fontWeight: 800,
        fontSize: 15,
        marginTop: 4,
        transition: "opacity 0.2s, transform 0.1s",
        letterSpacing: "0.1px",
    },
    footer: {
        textAlign: "center",
        marginTop: 24,
        display: "grid",
        gap: 8,
    },
    footerText: {
        fontSize: 14,
        color: "#6b7280",
        margin: 0,
    },
    backLink: {
        fontSize: 13,
        fontWeight: 600,
        textDecoration: "none",
        opacity: 0.8,
    },
};
