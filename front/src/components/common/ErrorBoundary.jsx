import React from "react";
import { Link } from "react-router-dom";

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, eventId: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    console.error("[ErrorBoundary]", error, info);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <div style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "var(--color-background, #0a0a0a)",
        padding: 24,
      }}>
        <div style={{ maxWidth: 480, textAlign: "center" }}>
          <div style={{ fontSize: 64, marginBottom: 16 }}>💥</div>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: "var(--color-text-primary, #fff)", marginBottom: 8 }}>
            Something went wrong
          </h1>
          <p style={{ fontSize: 15, color: "#9ca3af", marginBottom: 8, lineHeight: 1.6 }}>
            An unexpected error occurred. The team has been notified.
          </p>
          {this.state.error?.message && (
            <pre style={{
              fontSize: 12, color: "#6b7280",
              background: "rgba(255,255,255,0.04)",
              borderRadius: 8, padding: "10px 14px",
              textAlign: "left", overflowX: "auto",
              marginBottom: 24, whiteSpace: "pre-wrap",
              border: "1px solid rgba(255,255,255,0.08)",
            }}>
              {this.state.error.message}
            </pre>
          )}
          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            <button
              onClick={this.handleReset}
              style={{
                padding: "10px 24px", borderRadius: 10, border: "none",
                background: "#3b82f6", color: "#fff", fontWeight: 700,
                fontSize: 14, cursor: "pointer",
              }}
            >
              Try again
            </button>
            <Link
              to="/"
              onClick={this.handleReset}
              style={{
                padding: "10px 24px", borderRadius: 10,
                border: "1px solid rgba(255,255,255,0.1)",
                color: "#9ca3af", fontWeight: 600,
                fontSize: 14, textDecoration: "none",
                display: "inline-block",
              }}
            >
              Go home
            </Link>
          </div>
        </div>
      </div>
    );
  }
}
