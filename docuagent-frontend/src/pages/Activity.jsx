import React from "react";

function Activity({ items }) {
  const latest = items[0] || null;

  return (
    <section className="page-stack">
      <article className="glass-card panel activity-shell">
        <div className="panel-head">
          <div>
            <p className="micro-label">Operations Timeline</p>
            <h3>Activity Log</h3>
          </div>
          <div className="activity-summary-chip">
            <span className="micro-label">Events</span>
            <strong>{items.length}</strong>
          </div>
        </div>

        {latest && (
          <div className="activity-highlight">
            <span className="micro-label">Latest Event</span>
            <strong>{latest.action}</strong>
            <p>{latest.detail}</p>
            <small>{latest.time}</small>
          </div>
        )}

        <div className="activity-list activity-stack-smooth">
          {items.length === 0 && <p className="muted">No activity recorded yet.</p>}
          {items.map((item, idx) => (
            <div className="activity-row smooth-row" key={`${item.time}-${idx}`} style={{ animationDelay: `${Math.min(idx, 8) * 45}ms` }}>
              <div className="activity-row-main">
                <strong>{item.action}</strong>
                <p>{item.detail}</p>
              </div>
              <span>{item.time}</span>
            </div>
          ))}
        </div>
      </article>
    </section>
  );
}

export default Activity;
