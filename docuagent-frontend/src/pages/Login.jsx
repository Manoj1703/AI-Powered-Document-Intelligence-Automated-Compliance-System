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

function getPasswordStrength(password) {
  const value = String(password || "");
  if (!value) return { label: "None", level: "none", width: "0%" };
  let score = 0;
  if (value.length >= 8) score += 1;
  if (/[A-Z]/.test(value)) score += 1;
  if (/[a-z]/.test(value)) score += 1;
  if (/[0-9]/.test(value)) score += 1;
  if (/[^A-Za-z0-9]/.test(value)) score += 1;
  if (score <= 2) return { label: "Weak", level: "weak", width: "40%" };
  if (score <= 4) return { label: "Medium", level: "medium", width: "70%" };
  return { label: "Strong", level: "strong", width: "100%" };
}

function Login({ onLogin }) {
  const [identifier, setIdentifier] = useState("");
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState("user");
  const [newAdminKey, setNewAdminKey] = useState("");
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showNewAdminKey, setShowNewAdminKey] = useState(false);
  const [remember, setRemember] = useState(true);
  const [mode, setMode] = useState("login");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [signupMeta, setSignupMeta] = useState({
    admin_exists: false,
    admin_key_initialized: false,
  });

  useEffect(() => {
    async function loadSignupMeta() {
      try {
        const data = await fetchSignupMeta();
        setSignupMeta({
          admin_exists: Boolean(data?.admin_exists),
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
    setShowLoginPassword(false);
    setShowRegisterPassword(false);
    setShowConfirmPassword(false);
    setShowNewAdminKey(false);
  }, [mode]);

  useEffect(() => {
    if (signupMeta.admin_exists && role === "admin") {
      setRole("user");
    }
  }, [signupMeta.admin_exists, role]);

  function validateForm() {
    if (!password.trim()) return "Password is required.";
    if (mode === "login" && !identifier.trim()) return "Email or username is required.";
    if (mode === "register" && !username.trim()) return "Username is required.";
    if (mode === "register" && !email.trim()) return "Email is required.";
    if (mode === "register" && password !== confirmPassword) return "Password and Confirm Password do not match.";
    if (mode === "register" && role === "admin" && signupMeta.admin_exists) {
      return "Admin self-registration is disabled. Super admin must promote users.";
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

  const strength = getPasswordStrength(password);

  function EyeIcon({ visible }) {
    return (
      <svg className={`eye-icon ${visible ? "is-visible" : ""}`} width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
        <path className="eye-outline" d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6-10-6-10-6z" />
        <circle className="eye-pupil" cx="12" cy="12" r="2.2" />
        <path className="eye-slash" d="M4 4l16 16" />
      </svg>
    );
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
              <span className="password-field">
                <input
                  className="auth-input"
                  type={showLoginPassword ? "text" : "password"}
                  name="login_password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  className="password-toggle"
                  aria-label={showLoginPassword ? "Hide password" : "Show password"}
                  onClick={() => setShowLoginPassword((prev) => !prev)}
                >
                  <EyeIcon visible={showLoginPassword} />
                </button>
              </span>
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
              <span className="password-field">
                <input
                  className="auth-input"
                  type={showRegisterPassword ? "text" : "password"}
                  name="register_password"
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  className="password-toggle"
                  aria-label={showRegisterPassword ? "Hide password" : "Show password"}
                  onClick={() => setShowRegisterPassword((prev) => !prev)}
                >
                  <EyeIcon visible={showRegisterPassword} />
                </button>
              </span>
            </label>

            <div className="password-strength">
              <small>Password Strength: {strength.label}</small>
              <div className={`strength-bar ${strength.level}`} style={{ "--strength": strength.width }} />
            </div>

            <label className="auth-label">
              Confirm Password
              <span className="password-field">
                <input
                  className="auth-input"
                  type={showConfirmPassword ? "text" : "password"}
                  name="register_confirm_password"
                  autoComplete="new-password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  className="password-toggle"
                  aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                  onClick={() => setShowConfirmPassword((prev) => !prev)}
                >
                  <EyeIcon visible={showConfirmPassword} />
                </button>
              </span>
            </label>

            <p className="password-hint">Use 8+ chars with uppercase, lowercase, number, and special character.</p>

            <label className="auth-label">
              Role
              <select className="auth-input" value={role} onChange={(e) => setRole(e.target.value)}>
                <option value="user">User</option>
                {!signupMeta.admin_exists && <option value="admin">Legal Admin</option>}
              </select>
            </label>

            {role === "admin" && (
              <>
                <p className="password-hint">
                  {signupMeta.admin_exists
                    ? "Admin self-registration is disabled."
                    : "You are the first admin. You will become Super Admin. Create Admin Creation Key now."}
                </p>

                {signupMeta.admin_exists && !signupMeta.admin_key_initialized && (
                  <p className="error-text">Admin key is not initialized. Login as an existing admin and rotate admin key.</p>
                )}

                {!signupMeta.admin_exists && (
                  <label className="auth-label">
                    Create Admin Creation Key
                    <span className="password-field">
                      <input
                        className="auth-input"
                        type={showNewAdminKey ? "text" : "password"}
                        name="register_new_admin_key"
                        autoComplete="new-password"
                        value={newAdminKey}
                        onChange={(e) => setNewAdminKey(e.target.value)}
                        required
                      />
                      <button
                        type="button"
                        className="password-toggle"
                        aria-label={showNewAdminKey ? "Hide password" : "Show password"}
                        onClick={() => setShowNewAdminKey((prev) => !prev)}
                      >
                        <EyeIcon visible={showNewAdminKey} />
                      </button>
                    </span>
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
