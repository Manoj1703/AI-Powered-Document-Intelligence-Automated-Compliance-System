import React from "react";

function Settings({ theme, onThemeToggle, user }) {
  const roleLabel = String(user?.role || "user")
    .replace("_", " ")
    .replace(/\b\w/g, (ch) => ch.toUpperCase());

  return (
    <section className="page-stack">
      <article className="glass-card panel settings-shell">
        <div className="panel-head">
          <div>
            <p className="micro-label">Workspace Controls</p>
            <h3>Workspace Settings</h3>
          </div>
          <div className="settings-theme-pill">
            <span className="micro-label">Theme</span>
            <strong>{theme === "dark" ? "Dark" : "Light"}</strong>
          </div>
        </div>

        <div className="settings-grid">
          <div className="settings-card">
            <p className="muted">Current Theme</p>
            <strong>{theme === "dark" ? "Dark Mode" : "Light Mode"}</strong>
            <p className="settings-note">Switch the ambient shell treatment and panel contrast across the workspace.</p>
            <button type="button" className="ghost-button settings-action" onClick={onThemeToggle}>
              Switch to {theme === "dark" ? "Light" : "Dark"}
            </button>
          </div>
          <div className="settings-card">
            <p className="muted">Role</p>
            <strong>{roleLabel}</strong>
            <p className="settings-note">Your current access level controls which admin and audit actions are available.</p>
          </div>
          <div className="settings-card">
            <p className="muted">Notification Policy</p>
            <strong>Critical risks + failed uploads</strong>
            <p className="settings-note">Alerts stay focused on operationally important events to reduce noise.</p>
          </div>
        </div>
      </article>
    </section>
  );
}

export default Settings;
