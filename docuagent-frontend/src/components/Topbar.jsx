import React from "react";

function Topbar({ theme, onThemeToggle, backendHealth, user, notifications, onNotificationsClick }) {
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
        <button
          className={`ghost-button ${notifications > 0 ? "notif-pulse" : ""}`}
          type="button"
          aria-label="Notifications"
          onClick={onNotificationsClick}
        >
          Notifications ({notifications})
        </button>
        <button
          className={`ghost-button theme-toggle ${theme === "dark" ? "dark" : "light"}`}
          type="button"
          onClick={onThemeToggle}
        >
          <span className="theme-icon" aria-hidden="true">
            {theme === "dark" ? "O" : "o"}
          </span>
          Theme: {theme === "dark" ? "Dark" : "Light"}
        </button>
        <div className="profile-chip profile-enter">
          <strong>{user?.name || "User"}</strong>
          <span className={`role-badge role-${user?.role || "user"}`}>{user?.role || "user"}</span>
        </div>
      </div>
    </header>
  );
}

export default Topbar;
