import React, { useState } from "react";

function Login({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);
  const [role, setRole] = useState("Legal Analyst");

  function handleSubmit(event) {
    event.preventDefault();
    if (!email.trim() || !password.trim()) return;

    onLogin({
      email,
      remember,
      role,
      name: email.split("@")[0] || "User",
    });
  }

  return (
    <div className="login-shell">
      <div className="login-bg" />
      <form className="login-card glass-card" onSubmit={handleSubmit}>
        <div className="login-brand">
          <div className="brand-logo">DA</div>
          <h1>DocAgent</h1>
          <p>Secure legal risk intelligence workspace</p>
        </div>

        <label>
          Email
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </label>

        <label>
          Password
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </label>

        <label>
          Role
          <select value={role} onChange={(e) => setRole(e.target.value)}>
            <option>Admin</option>
            <option>Legal Analyst</option>
            <option>User</option>
          </select>
        </label>

        <div className="login-meta">
          <label className="inline-check">
            <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} />
            Remember me
          </label>
          <a href="#" onClick={(e) => e.preventDefault()}>
            Forgot password?
          </a>
        </div>

        <button type="submit" className="primary-button">
          Login
        </button>
      </form>
    </div>
  );
}

export default Login;
