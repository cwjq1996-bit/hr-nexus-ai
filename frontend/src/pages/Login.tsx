import { useState } from "react";
import type { FormEvent } from "react";
import { Navigate, useLocation } from "react-router-dom";

import { errorMessage } from "../api/client";
import { useAuth } from "../auth/useAuth";

// Only follow a redirect that stays inside this app.
function redirectTarget(state: unknown): string {
  if (typeof state === "object" && state !== null && "from" in state) {
    const from = (state as { from: unknown }).from;
    if (
      typeof from === "string" &&
      from.startsWith("/") &&
      !from.startsWith("//") &&
      from !== "/login"
    ) {
      return from;
    }
  }
  return "/";
}

const inputStyle = {
  width: "100%",
  boxSizing: "border-box",
  padding: "10px 12px",
  fontSize: "15px",
  border: "1px solid #cbd5e1",
  borderRadius: "8px",
  color: "#0f172a",
  backgroundColor: "white",
} as const;

const labelStyle = {
  display: "block",
  fontSize: "14px",
  fontWeight: 500,
  color: "#334155",
  marginBottom: "6px",
} as const;

function Login() {
  const { user, sessionExpired, login } = useAuth();
  const location = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Already signed in, or just signed in: go where the user was heading.
  if (user) return <Navigate to={redirectTarget(location.state)} replace />;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting) return;
    setError(null);
    setSubmitting(true);
    try {
      await login(email, password);
      // Success sets the user, and the redirect above takes over.
    } catch (caught) {
      setError(errorMessage(caught));
      setPassword("");
      setSubmitting(false);
    }
  }

  const canSubmit = email.trim() !== "" && password !== "" && !submitting;

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#f4f7fc",
        padding: "24px",
      }}
    >
      <form
        onSubmit={handleSubmit}
        style={{
          width: "100%",
          maxWidth: "380px",
          backgroundColor: "white",
          borderRadius: "12px",
          boxShadow: "0 1px 3px rgba(15, 23, 42, 0.1)",
          padding: "32px",
          textAlign: "left",
        }}
      >
        <h1 style={{ fontSize: "24px", margin: "0 0 4px", color: "#0f172a" }}>
          Sign in
        </h1>
        <p style={{ fontSize: "14px", color: "#64748b", margin: "0 0 24px" }}>
          Agentic AI HR Management System
        </p>

        {sessionExpired && !error ? (
          <p
            role="status"
            style={{
              fontSize: "14px",
              color: "#92400e",
              backgroundColor: "#fffbeb",
              border: "1px solid #fde68a",
              borderRadius: "8px",
              padding: "10px 12px",
              margin: "0 0 16px",
            }}
          >
            Your session has ended. Please sign in again.
          </p>
        ) : null}

        {error ? (
          <p
            role="alert"
            style={{
              fontSize: "14px",
              color: "#b91c1c",
              backgroundColor: "#fef2f2",
              border: "1px solid #fecaca",
              borderRadius: "8px",
              padding: "10px 12px",
              margin: "0 0 16px",
            }}
          >
            {error}
          </p>
        ) : null}

        <div style={{ marginBottom: "16px" }}>
          <label htmlFor="login-email" style={labelStyle}>
            Email
          </label>
          <input
            id="login-email"
            type="email"
            autoComplete="username"
            autoFocus
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            style={inputStyle}
          />
        </div>

        <div style={{ marginBottom: "24px" }}>
          <label htmlFor="login-password" style={labelStyle}>
            Password
          </label>
          <input
            id="login-password"
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            style={inputStyle}
          />
        </div>

        <button
          type="submit"
          disabled={!canSubmit}
          style={{
            width: "100%",
            padding: "10px 12px",
            fontSize: "15px",
            fontWeight: 600,
            color: "white",
            backgroundColor: canSubmit ? "#1d4ed8" : "#93c5fd",
            border: "none",
            borderRadius: "8px",
            cursor: canSubmit ? "pointer" : "not-allowed",
          }}
        >
          {submitting ? "Signing in…" : "Sign in"}
        </button>
      </form>
    </div>
  );
}

export default Login;
