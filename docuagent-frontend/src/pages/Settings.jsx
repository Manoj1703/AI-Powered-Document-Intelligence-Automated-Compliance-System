import React from "react";

function Settings({ user }) {
  const roleLabel = String(user?.role || "user")
    .replace(/_/g, " ")
    .replace(/\b\w/g, (ch) => ch.toUpperCase());

  return (
    <section className="page-stack settings-page">
      <article className="settings-hero page-enter">
        <div className="settings-hero-shell">
          <div className="settings-hero-copy">
            <h1 className="settings-title">Shape workspace posture with a clearer operations command layer.</h1>
          </div>

          <div className="settings-metric-grid">
            <article className="settings-metric-card is-strong">
              <span className="settings-metric-label">Role posture</span>
              <strong className="settings-metric-value settings-metric-value--text">{roleLabel}</strong>
            </article>
            <article className="settings-metric-card">
              <span className="settings-metric-label">Alert policy</span>
              <strong className="settings-metric-value">02</strong>
            </article>
            <article className="settings-metric-card">
              <span className="settings-metric-label">Interface mode</span>
              <strong className="settings-metric-value settings-metric-value--text">Curated</strong>
            </article>
            <article className="settings-metric-card">
              <span className="settings-metric-label">Environment</span>
              <strong className="settings-metric-value settings-metric-value--text">Live</strong>
            </article>
          </div>
        </div>
      </article>

      <section className="page-section page-enter">
        <article className="settings-detail-board">
          <div className="settings-board-head">
            <div>
              <div className="section-label">Workspace Controls</div>
              <div className="section-title">Core environment settings</div>
            </div>
          </div>

          <div className="settings-detail-grid">
            <article className="settings-detail-card">
              <span className="settings-detail-label">Current Role</span>
              <strong className="settings-detail-value">{roleLabel}</strong>
            </article>

            <article className="settings-detail-card">
              <span className="settings-detail-label">Notification Policy</span>
              <strong className="settings-detail-value">Critical + Admin</strong>
            </article>

            <article className="settings-detail-card">
              <span className="settings-detail-label">Experience Profile</span>
              <strong className="settings-detail-value">Creative Ops Interface</strong>
            </article>
          </div>
        </article>
      </section>
    </section>
  );
}

export default Settings;
