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
        background: "#ffffff",
        padding: 24,
      }}>
        <div style={{ maxWidth: 480, textAlign: "center", padding: 28, borderRadius: 22, border: "1px solid #e8eef5", background: "#ffffff", boxShadow: "0 16px 34px rgba(15,23,42,0.06)" }}>
          <div style={{ fontSize: 64, marginBottom: 16 }}>💥</div>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: "#0f172a", marginBottom: 8 }}>
            Something went wrong
          </h1>
          <p style={{ fontSize: 15, color: "#64748b", marginBottom: 8, lineHeight: 1.6 }}>
            An unexpected error occurred. The team has been notified.
          </p>
          {this.state.error?.message && (
            <pre style={{
              fontSize: 12, color: "#64748b",
              background: "#f8fbff",
              borderRadius: 8, padding: "10px 14px",
              textAlign: "left", overflowX: "auto",
              marginBottom: 24, whiteSpace: "pre-wrap",
              border: "1px solid #e8eef5",
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
                border: "1px solid #e6ecf4",
                color: "#0f172a", fontWeight: 600,
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
