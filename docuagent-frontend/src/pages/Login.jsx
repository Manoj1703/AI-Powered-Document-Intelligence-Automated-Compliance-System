import React, { useEffect, useState } from "react";
import { fetchSignupMeta } from "../api";

function getPasswordStrengthError(password) {
  const value = String(password || "");
  const checks = [
    value.length >= 8,
    /[A-Z]/.test(value),
    /[a-z]/.test(value),
    /[0-9]/.test(value),
    /[^A-Za-z0-9]/.test(value),
  ];
  if (checks.every(Boolean)) return "";
  return "Use 8+ chars with uppercase, lowercase, number, and special character.";
}

function Login({ onLogin }) {
  const [identifier, setIdentifier] = useState("");
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState("user");
  const [adminKey, setAdminKey] = useState("");
  const [newAdminKey, setNewAdminKey] = useState("");
  const [remember, setRemember] = useState(true);
  const [mode, setMode] = useState("login");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [signupMeta, setSignupMeta] = useState({
    admin_exists: false,
    admin_key_required_for_admin_signup: false,
    admin_key_initialized: false,
  });

  useEffect(() => {
    async function loadSignupMeta() {
      try {
        const data = await fetchSignupMeta();
        setSignupMeta({
          admin_exists: Boolean(data?.admin_exists),
          admin_key_required_for_admin_signup: Boolean(data?.admin_key_required_for_admin_signup),
          admin_key_initialized: Boolean(data?.admin_key_initialized),
        });
      } catch {
        // Keep defaults when API is unavailable.
      }
    }
    if (mode === "register") loadSignupMeta();
  }, [mode]);

  useEffect(() => {
    setError("");
    setInfo("");
  }, [mode]);

  function validateForm() {
    if (!password.trim()) return "Password is required.";
    if (mode === "login" && !identifier.trim()) return "Email or username is required.";
    if (mode === "register" && !username.trim()) return "Username is required.";
    if (mode === "register" && !email.trim()) return "Email is required.";
    if (mode === "register" && password !== confirmPassword) return "Password and Confirm Password do not match.";
    if (mode === "register" && role === "admin" && signupMeta.admin_exists && !adminKey.trim()) {
      return "Admin creation key is required to create additional admin accounts.";
    }
    if (mode === "register" && role === "admin" && !signupMeta.admin_exists && !newAdminKey.trim()) {
      return "As first admin, you must create an admin creation key.";
    }
    if (mode === "register") {
      return getPasswordStrengthError(password);
    }
    return "";
  }

  async function handleSubmit(event) {
    event.preventDefault();
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setSubmitting(true);
    setError("");
    setInfo("");

    try {
      const result = await onLogin({
        identifier: identifier.trim(),
        username,
        email,
        password,
        remember,
        mode,
        role,
        adminKey,
        newAdminKey,
        deferSessionMs: mode === "login" ? 360 : 0,
      });

      if (mode === "register") {
        const successParts = ["Account created successfully. Please login."];
        if (result?.admin_creation_key) {
          successParts.push(`Admin Creation Key (shown once): ${result.admin_creation_key}`);
        }
        setMode("login");
        setRole("user");
        setAdminKey("");
        setNewAdminKey("");
        setUsername("");
        setEmail("");
        setIdentifier("");
        setPassword("");
        setConfirmPassword("");
        setInfo(successParts.join(" "));
      }
    } catch (err) {
      setError(err.message || "Authentication failed");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="login-shell">
      <div className="login-bg" />
      <form className="login-card glass-card" onSubmit={handleSubmit} autoComplete="off">
        <input
          type="text"
          name="decoy_username"
          autoComplete="username"
          tabIndex={-1}
          aria-hidden="true"
          style={{ position: "absolute", opacity: 0, height: 0, width: 0, pointerEvents: "none" }}
        />
        <input
          type="password"
          name="decoy_password"
          autoComplete="current-password"
          tabIndex={-1}
          aria-hidden="true"
          style={{ position: "absolute", opacity: 0, height: 0, width: 0, pointerEvents: "none" }}
        />
        <div className="login-brand">
          <h1>DocAgent</h1>
          <p>Secure legal risk intelligence workspace</p>
        </div>

        <div className="auth-mode-switch">
          <span className={`tab-indicator ${mode === "register" ? "register" : "login"}`} aria-hidden="true" />
          <button type="button" className={`ghost-button ${mode === "login" ? "active-auth" : ""}`} onClick={() => setMode("login")}>
            Login
          </button>
          <button type="button" className={`ghost-button ${mode === "register" ? "active-auth" : ""}`} onClick={() => setMode("register")}>
            Register
          </button>
        </div>

        {mode === "login" && (
          <>
            <label className="auth-label">
              Email or Username
              <input
                className="auth-input"
                type="text"
                name="login_identifier"
                autoComplete="off"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                required
              />
            </label>

            <label className="auth-label">
              Password
              <input
                className="auth-input"
                type="password"
                name="login_password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </label>
          </>
        )}

        {mode === "register" && (
          <>
            <label className="auth-label">
              Email
              <input
                className="auth-input"
                type="email"
                name="register_email"
                autoComplete="off"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </label>

            <label className="auth-label">
              Username
              <input
                className="auth-input"
                type="text"
                name="register_username"
                autoComplete="off"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </label>

            <label className="auth-label">
              Password
              <input
                className="auth-input"
                type="password"
                name="register_password"
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </label>

            <label className="auth-label">
              Confirm Password
              <input
                className="auth-input"
                type="password"
                name="register_confirm_password"
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </label>

            <p className="password-hint">Use 8+ chars with uppercase, lowercase, number, and special character.</p>

            <label className="auth-label">
              Role
              <select className="auth-input" value={role} onChange={(e) => setRole(e.target.value)}>
                <option value="user">User</option>
                <option value="admin">Legal Admin</option>
              </select>
            </label>

            {role === "admin" && (
              <>
                <p className="password-hint">
                  {signupMeta.admin_exists
                    ? "Admin accounts require Admin Creation Key."
                    : "You are the first admin. Create Admin Creation Key now."}
                </p>

                {signupMeta.admin_exists && !signupMeta.admin_key_initialized && (
                  <p className="error-text">Admin key is not initialized. Login as an existing admin and rotate admin key.</p>
                )}

                {signupMeta.admin_exists && (
                  <label className="auth-label">
                    Admin Creation Key
                    <input
                      className="auth-input"
                      type="password"
                      name="register_admin_key"
                      autoComplete="new-password"
                      value={adminKey}
                      onChange={(e) => setAdminKey(e.target.value)}
                      required
                    />
                  </label>
                )}

                {!signupMeta.admin_exists && (
                  <label className="auth-label">
                    Create Admin Creation Key
                    <input
                      className="auth-input"
                      type="password"
                      name="register_new_admin_key"
                      autoComplete="new-password"
                      value={newAdminKey}
                      onChange={(e) => setNewAdminKey(e.target.value)}
                      required
                    />
                  </label>
                )}
              </>
            )}
          </>
        )}

        <div className="login-meta">
          <label className="inline-check">
            <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} />
            Remember me
          </label>
          <a className="forgot-link" href="#" onClick={(e) => e.preventDefault()}>
            Forgot password?
          </a>
        </div>

        <button type="submit" className="primary-button login-cta" disabled={submitting}>
          {mode === "register" ? (submitting ? "Securing..." : "Create Account") : submitting ? "Please wait..." : "Login"}
        </button>

        {error && <p className="error-text">{error}</p>}
        {info && <p className="success-text">{info}</p>}
      </form>
    </div>
  );
}

export default Login;
