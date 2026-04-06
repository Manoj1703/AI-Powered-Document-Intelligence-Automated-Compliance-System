import React, { useMemo } from "react";

function classifyAction(action) {
  const text = String(action || "").toLowerCase();
  if (text.includes("upload")) return { tone: "upload", icon: "UP", lane: "Ingestion" };
  if (text.includes("inspect")) return { tone: "inspect", icon: "IN", lane: "Review" };
  if (text.includes("role") || text.includes("user")) return { tone: "governance", icon: "GV", lane: "Governance" };
  if (text.includes("delete")) return { tone: "destructive", icon: "DL", lane: "Deletion" };
  if (text.includes("login")) return { tone: "auth", icon: "AU", lane: "Access" };
  return { tone: "neutral", icon: "LG", lane: "General" };
}

function Activity({ items }) {
  const grouped = useMemo(() => {
    return items.map((item, index) => ({
      ...item,
      meta: classifyAction(item.action),
      orderLabel: String(index + 1).padStart(2, "0"),
    }));
  }, [items]);

  const totals = useMemo(() => {
    return grouped.reduce(
      (acc, item) => {
        acc[item.meta.tone] = (acc[item.meta.tone] || 0) + 1;
        return acc;
      },
      { upload: 0, governance: 0, inspect: 0, auth: 0, destructive: 0, neutral: 0 },
    );
  }, [grouped]);

  return (
    <section className="page-stack activity-page">
      <article className="activity-hero page-enter">
        <div className="activity-hero-shell">
          <div className="activity-hero-copy">
            <h1 className="activity-title">Track the full operational story, not just a stack of timestamps.</h1>
          </div>

          <div className="activity-metric-grid">
            <article className="activity-metric-card is-strong">
              <span className="activity-metric-label">Uploads</span>
              <strong className="activity-metric-value">{totals.upload || 0}</strong>
            </article>
            <article className="activity-metric-card">
              <span className="activity-metric-label">Governance</span>
              <strong className="activity-metric-value">{totals.governance || 0}</strong>
            </article>
            <article className="activity-metric-card">
              <span className="activity-metric-label">Inspections</span>
              <strong className="activity-metric-value">{totals.inspect || 0}</strong>
            </article>
            <article className="activity-metric-card">
              <span className="activity-metric-label">Access events</span>
              <strong className="activity-metric-value">{totals.auth || 0}</strong>
            </article>
          </div>
        </div>
      </article>

      <section className="page-section page-enter">
        <article className="activity-timeline-board">
          <div className="activity-timeline-head">
            <div className="section-title">Workspace activity feed</div>
          </div>

          {items.length === 0 && <div className="empty-state">No activity recorded yet.</div>}

          {items.length > 0 && (
            <div className="activity-timeline-list">
              {grouped.map((item) => (
                <article key={`${item.time}-${item.orderLabel}`} className={`activity-event-card tone-${item.meta.tone}`}>
                  <div className="activity-event-rail" aria-hidden="true">
                    <span className="activity-event-dot" />
                  </div>

                  <div className="activity-event-order">{item.orderLabel}</div>

                  <div className="activity-event-main">
                    <div className="activity-event-meta">
                      <span className="activity-event-lane">{item.meta.lane}</span>
                      <span className="activity-event-icon" aria-hidden="true">
                        {item.meta.icon}
                      </span>
                    </div>
                    <h3>{item.action}</h3>
                    <p>{item.detail}</p>
                  </div>

                  <div className="activity-event-time">
                    <strong>{item.time}</strong>
                    <span>{item.meta.tone}</span>
                  </div>
                </article>
              ))}
            </div>
          )}
        </article>
      </section>
    </section>
  );
}

export default Activity;
