import React from "react";
import RiskCard from "../components/RiskCard";
import { formatDate, normalizeRisk, prettyRisk } from "../utils";

function Dashboard({ stats, documents, onNavigate, onQuickUpload, canUpload }) {
  const high = Number(stats?.risk_breakdown?.high) || 0;
  const medium = Number(stats?.risk_breakdown?.medium) || 0;
  const low = Number(stats?.risk_breakdown?.low) || 0;
  const total = high + medium + low || 1;

  const slices = [
    { label: "High", value: high, color: "#f87171" },
    { label: "Medium", value: medium, color: "#fbbf24" },
    { label: "Low", value: low, color: "#34d399" },
  ];

  const recent = [...documents].slice(0, 5);

  return (
    <section className="page-stack dashboard-page">
      <div className="stats-grid">
        <RiskCard label="Total Documents" value={stats?.total_documents ?? 0} />
        <RiskCard label="High Risk" value={high} risk="high" />
        <RiskCard label="Medium Risk" value={medium} risk="medium" />
        <RiskCard label="Low Risk" value={low} risk="low" />
      </div>

      <div className="two-col">
        <article className="glass-card panel">
          <div className="panel-head">
            <h3>Risk Distribution</h3>
          </div>

          <svg viewBox="0 0 40 40" className="pie-chart pie-draw" aria-label="Risk distribution">
            {(() => {
              let offset = 0;
              return slices.map((slice) => {
                const ratio = slice.value / total;
                const segment = ratio * 100;
                const node = (
                  <circle
                    key={slice.label}
                    r="15.9"
                    cx="20"
                    cy="20"
                    fill="transparent"
                    stroke={slice.color}
                    strokeWidth="6"
                    strokeDasharray={`${segment} ${100 - segment}`}
                    strokeDashoffset={-offset}
                    style={{ "--dash": segment, "--gap": 100 - segment }}
                  />
                );
                offset += segment;
                return node;
              });
            })()}
          </svg>

          <div className="legend-grid">
            {slices.map((slice) => (
              <div key={slice.label} className="legend-item">
                <span style={{ backgroundColor: slice.color }} />
                <strong>{slice.label}</strong>
                <small>{slice.value}</small>
              </div>
            ))}
          </div>
        </article>

        <article className="glass-card panel">
          <div className="panel-head">
            <h3>Quick Actions</h3>
          </div>
          {canUpload && (
            <button className="primary-button" type="button" onClick={onQuickUpload}>
              Quick Upload
            </button>
          )}
          <button className="ghost-button" type="button" onClick={() => onNavigate("documents")}>
            Open Documents
          </button>
          <button className="ghost-button" type="button" onClick={() => onNavigate("analytics")}>
            View Analytics
          </button>
        </article>
      </div>

      <article className="glass-card panel">
        <div className="panel-head">
          <h3>Recent Documents</h3>
          <button type="button" className="ghost-button" onClick={() => onNavigate("documents")}>
            View All
          </button>
        </div>
        <div className="recent-list">
          {recent.length === 0 && <p className="muted">No documents yet.</p>}
          {recent.map((doc) => (
            <div key={doc.id} className="recent-row">
              <div>
                <strong>{doc.filename || "Unknown"}</strong>
                <p>{doc.title || "Untitled"}</p>
              </div>
              <div>
                <span className={`risk-pill risk-${normalizeRisk(doc.overall_risk_level)}`}>
                  {prettyRisk(doc.overall_risk_level)}
                </span>
                <small>{formatDate(doc.uploaded_at || doc.created_at)}</small>
              </div>
            </div>
          ))}
        </div>
      </article>
    </section>
  );
}

export default Dashboard;
