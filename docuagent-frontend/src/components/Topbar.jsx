import React from "react";

function initialsFor(name) {
  const words = String(name || "User")
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  return words.slice(0, 2).map((word) => word[0]).join("").toUpperCase() || "DA";
}

function Topbar({ title, subtitle, backendHealth, user, onPrimaryAction, onRefresh }) {
  const roleLabel = String(user?.role || "user")
    .replace(/_/g, " ")
    .replace(/\b\w/g, (ch) => ch.toUpperCase());
  const liveLabel = backendHealth === "Online" ? "Live" : backendHealth;

  return (
    <header className="exec-topbar">
      <div className="exec-topbar-shell">
        <div className="exec-topbar-primary">
          <div className="exec-topbar-kicker">Workspace Command</div>
          <div className="exec-topbar-title">
            <div className="exec-topbar-heading">{title}</div>
            <p className="exec-topbar-subtitle">{subtitle}</p>
          </div>
        </div>

        <div className="exec-topbar-actions">
          <div className={`exec-live-pill ${backendHealth === "Online" ? "is-online" : ""}`}>
            <span className="exec-live-dot" aria-hidden="true" />
            {liveLabel}
          </div>
          <button type="button" className="exec-primary-btn" onClick={onPrimaryAction}>
            Upload Document
          </button>
          <button type="button" className="exec-secondary-btn" onClick={onRefresh}>
            Refresh
          </button>
          <div className="exec-profile-chip">
            <span className="exec-profile-avatar" aria-hidden="true">
              {initialsFor(user?.name)}
            </span>
            <div>
              <div className="exec-profile-name">{user?.name || "User"}</div>
              <div className="exec-profile-role">{roleLabel}</div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

export default Topbar;
