import React from "react";

function Topbar({ theme, onThemeToggle, backendHealth, user, notifications }) {
  const healthClass =
    backendHealth === "Online" ? "online" : backendHealth === "Offline" ? "offline" : "unknown";

  return (
    <header className="topbar glass-card">
      <div>
        <h1>DocAgent Platform</h1>
        <p>AI-powered Legal Document Risk Intelligence Platform</p>
      </div>

      <div className="topbar-actions">
        <span className={`status-chip ${healthClass}`}>Backend: {backendHealth}</span>
        <button className="ghost-button" type="button" aria-label="Notifications">
          Notifications ({notifications})
        </button>
        <button className="ghost-button" type="button" onClick={onThemeToggle}>
          Theme: {theme === "dark" ? "Dark" : "Light"}
        </button>
        <div className="profile-chip">
          <strong>{user?.name || "User"}</strong>
          <span>{user?.role || "Analyst"}</span>
        </div>
      </div>
    </header>
  );
}

export default Topbar;
