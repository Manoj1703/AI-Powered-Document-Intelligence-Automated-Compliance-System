import React, { useMemo } from "react";
import { formatDate, normalizeRisk, prettyRisk } from "../utils";

function toDate(value) {
  const date = new Date(value || 0);
  return Number.isNaN(date.getTime()) ? null : date;
}

function startOfToday() {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  return start.getTime();
}

function MetricSpark() {
  return (
    <div className="exec-metric-spark" aria-hidden="true">
      <span style={{ height: "10px" }} />
      <span style={{ height: "14px" }} />
      <span style={{ height: "12px" }} />
      <span style={{ height: "18px" }} />
      <span style={{ height: "22px" }} />
    </div>
  );
}

function Dashboard({ documents, uploadHistory = [], loading, onNavigate, onQuickUpload, canUpload, isAdmin, onOpenDocument }) {
  const recentDocuments = useMemo(
    () =>
      [...documents]
        .sort((a, b) => new Date(b.uploaded_at || b.created_at || 0).getTime() - new Date(a.uploaded_at || a.created_at || 0).getTime())
        .slice(0, 5),
    [documents],
  );

  const documentsProcessed = documents.length;
  const documentsToday = documents.filter((doc) => {
    const date = toDate(doc.uploaded_at || doc.created_at);
    return date ? date.getTime() >= startOfToday() : false;
  }).length;

  const high = documents.filter((doc) => normalizeRisk(doc.overall_risk_level) === "high").length;
  const medium = documents.filter((doc) => normalizeRisk(doc.overall_risk_level) === "medium").length;
  const low = documents.filter((doc) => normalizeRisk(doc.overall_risk_level) === "low").length;
  const reviewed = high + medium + low;
  const queueStatus = Math.max(0, documents.length - reviewed);
  const riskScore = reviewed ? Math.round(((low * 1 + medium * 0.62 + high * 0.28) / reviewed) * 100) : 0;

  const uploadedCount = documents.length;
  const processingCount = queueStatus;
  const reviewedCount = reviewed;
  const pipelineTotal = Math.max(uploadedCount + processingCount + reviewedCount, 1);

  const recentUploads = [...uploadHistory].slice(-4).reverse();
  const riskTone = riskScore >= 70 ? "Low-risk posture" : riskScore >= 45 ? "Moderate posture" : "Elevated review posture";
  const attentionCount = high + queueStatus;
  const riskBreakdown = [
    { label: "High risk", value: high, tone: "high", percent: reviewed ? Math.round((high / reviewed) * 100) : 0 },
    { label: "Medium risk", value: medium, tone: "medium", percent: reviewed ? Math.round((medium / reviewed) * 100) : 0 },
    { label: "Low risk", value: low, tone: "low", percent: reviewed ? Math.round((low / reviewed) * 100) : 0 },
  ];

  return (
    <section className="page-stack exec-dashboard">
      <div className="exec-dashboard-surface">
        <section className="exec-command-grid page-enter">
          <article className="exec-spotlight-card">
            <div className="exec-eyebrow exec-eyebrow--inverse">Operations Deck</div>
            <h1 className="exec-spotlight-title">Review faster. Escalate smarter.</h1>
            <p className="exec-spotlight-text">
              A sharper command surface for live uploads, review throughput, and risk escalation across the document pipeline.
            </p>

            <div className="exec-spotlight-actions">
              <button type="button" className="exec-primary-btn" onClick={onQuickUpload} disabled={!canUpload}>
                {canUpload ? "Upload New File" : "Upload Disabled"}
              </button>
              <button type="button" className="exec-secondary-btn is-contrast" onClick={() => onNavigate("documents")}>
                Open Review Queue
              </button>
              {isAdmin && (
                <button type="button" className="exec-secondary-btn is-contrast" onClick={() => onNavigate("users")}>
                  Manage Workspace
                </button>
              )}
            </div>

            <div className="exec-spotlight-band">
              <div className="exec-band-metric">
                <span>Processed</span>
                <strong>{documentsProcessed}</strong>
              </div>
              <div className="exec-band-metric">
                <span>Needs attention</span>
                <strong>{attentionCount}</strong>
              </div>
              <div className="exec-band-metric">
                <span>Risk posture</span>
                <strong>{riskTone}</strong>
              </div>
            </div>
          </article>

          <div className="exec-summary-stack">
            <article className="exec-summary-card">
              <div className="exec-eyebrow">Workspace Pulse</div>
              <h2 className="exec-summary-title">Current snapshot</h2>
              <div className="exec-summary-grid">
                <div className="exec-summary-item">
                  <span>Documents today</span>
                  <strong>{documentsToday}</strong>
                </div>
                <div className="exec-summary-item">
                  <span>Risk score</span>
                  <strong>{riskScore}</strong>
                </div>
                <div className="exec-summary-item">
                  <span>In queue</span>
                  <strong>{queueStatus}</strong>
                </div>
                <div className="exec-summary-item">
                  <span>Reviewed</span>
                  <strong>{reviewedCount}</strong>
                </div>
              </div>
            </article>

            <article className="exec-summary-card">
              <div className="exec-eyebrow">Risk Posture</div>
              <h2 className="exec-summary-title">{riskTone}</h2>
              <div className="exec-risk-meter" aria-hidden="true">
                {riskBreakdown.map((item) => (
                  <span
                    key={item.label}
                    className={`exec-risk-fill ${item.tone}`}
                    style={{ width: `${reviewed ? Math.max(item.percent, item.value ? 10 : 0) : 0}%` }}
                  />
                ))}
              </div>
              <div className="exec-risk-legend">
                {riskBreakdown.map((item) => (
                  <div key={item.label} className="exec-risk-row">
                    <span className={`exec-risk-dot ${item.tone}`} aria-hidden="true" />
                    <div>
                      <strong>{item.label}</strong>
                      <small>{item.percent}% of reviewed files</small>
                    </div>
                    <span>{item.value}</span>
                  </div>
                ))}
              </div>
            </article>
          </div>
        </section>

        <section className="page-section page-enter">
          <div className="exec-section-header">
            <div>
              <div className="exec-eyebrow">Live Metrics</div>
              <h2 className="exec-section-title">Priority signals</h2>
            </div>
          </div>

          <div className="exec-metric-row">
            <article className="exec-metric-card tone-indigo">
              <div className="exec-metric-top">
                <div>
                  <span className="exec-metric-label">Documents processed</span>
                  <strong className="exec-metric-value">{documentsProcessed}</strong>
                </div>
                <MetricSpark />
              </div>
              <div className="exec-metric-bottom">
                <span className="exec-metric-chip tone-indigo">
                  <span>now</span>
                  <span>+{documentsToday} today</span>
                </span>
                <span className="exec-metric-note">active throughput</span>
              </div>
            </article>

            <article className="exec-metric-card tone-amber">
              <div className="exec-metric-top">
                <div>
                  <span className="exec-metric-label">Documents today</span>
                  <strong className="exec-metric-value">{documentsToday}</strong>
                </div>
                <MetricSpark />
              </div>
              <div className="exec-metric-bottom">
                <span className="exec-metric-chip tone-amber">
                  <span>fresh</span>
                  <span>new intake</span>
                </span>
                <span className="exec-metric-note">files entered today</span>
              </div>
            </article>

            <article className="exec-metric-card tone-danger">
              <div className="exec-metric-top">
                <div>
                  <span className="exec-metric-label">Attention items</span>
                  <strong className="exec-metric-value">{attentionCount}</strong>
                </div>
                <MetricSpark />
              </div>
              <div className="exec-metric-bottom">
                <span className="exec-metric-chip tone-danger">
                  <span>alert</span>
                  <span>{high} high risk</span>
                </span>
                <span className="exec-metric-note">queue plus escalation</span>
              </div>
            </article>

            <article className="exec-metric-card tone-success">
              <div className="exec-metric-top">
                <div>
                  <span className="exec-metric-label">Review cleared</span>
                  <strong className="exec-metric-value">{reviewedCount}</strong>
                </div>
                <MetricSpark />
              </div>
              <div className="exec-metric-bottom">
                <span className="exec-metric-chip tone-success">
                  <span>ready</span>
                  <span>{queueStatus} waiting</span>
                </span>
                <span className="exec-metric-note">completed classifications</span>
              </div>
            </article>
          </div>
        </section>

        <section className="exec-operations-grid exec-operations-grid--single page-enter">
          <article className="exec-panel-card">
            <div className="exec-section-header">
              <div>
                <div className="exec-eyebrow">Pipeline</div>
                <h2 className="exec-section-title">Document flow</h2>
              </div>
              <div className="exec-section-hint">Uploaded, queued, and reviewed in one operational line.</div>
            </div>

            <div className="exec-pipeline-track" aria-hidden="true">
              <div className="exec-pipeline-segment uploaded" style={{ width: `${Math.max((uploadedCount / pipelineTotal) * 100, 18)}%` }} />
              <div className="exec-pipeline-segment processing" style={{ width: `${Math.max((processingCount / pipelineTotal) * 100, processingCount ? 14 : 0)}%` }} />
              <div className="exec-pipeline-segment reviewed" style={{ width: `${Math.max((reviewedCount / pipelineTotal) * 100, reviewedCount ? 18 : 0)}%` }} />
            </div>

            <div className="exec-pipeline-stats">
              <div className="exec-pipeline-item">
                <span>Uploaded</span>
                <strong>{uploadedCount}</strong>
              </div>
              <div className="exec-pipeline-item">
                <span>Processing</span>
                <strong>{processingCount}</strong>
              </div>
              <div className="exec-pipeline-item">
                <span>Reviewed</span>
                <strong>{reviewedCount}</strong>
              </div>
            </div>

            <div className="exec-process-notes">
              <div className="exec-note-card">
                <span>Fast lane</span>
                <strong>{low} low-risk files moving cleanly</strong>
              </div>
              <div className="exec-note-card">
                <span>Watch list</span>
                <strong>{medium} medium-risk files need validation</strong>
              </div>
              <div className="exec-note-card">
                <span>Escalation</span>
                <strong>{high} high-risk files should be reviewed first</strong>
              </div>
            </div>
          </article>
        </section>

        <section className="exec-library-grid page-enter">
          <div className="doc-table exec-doc-table">
            <div className="doc-table-head">
              <div>
                <div className="exec-eyebrow">Review Queue</div>
                <div className="exec-section-title">Latest documents</div>
              </div>
              <button type="button" className="exec-secondary-btn" onClick={() => onNavigate("documents")}>
                Open All Documents
              </button>
            </div>

            {loading && (
              <>
                <div className="exec-skeleton-row" />
                <div className="exec-skeleton-row" />
                <div className="exec-skeleton-row" />
              </>
            )}

            {!loading && recentDocuments.length === 0 && <div className="empty-state">No documents yet.</div>}

            {recentDocuments.map((doc) => (
              <div key={doc.id} className="doc-row exec-doc-row">
                <div className="doc-row-info">
                  <div className="doc-row-name">{doc.filename || "Unknown"}</div>
                  <div className="doc-row-sub">
                    {doc.title || "Untitled"} / {doc.document_type || "Unknown"}
                  </div>
                </div>
                <div className="doc-row-meta">
                  <span className={`risk-badge ${normalizeRisk(doc.overall_risk_level)}`}>{prettyRisk(doc.overall_risk_level)}</span>
                  <span className="doc-timestamp">{formatDate(doc.uploaded_at || doc.created_at)}</span>
                  <button type="button" className="exec-primary-btn small" onClick={() => onOpenDocument?.(doc.id)}>
                    Inspect
                  </button>
                </div>
              </div>
            ))}
          </div>

          <article className="exec-panel-card">
            <div className="exec-eyebrow">Session Uploads</div>
            <h2 className="exec-section-title">Recent intake</h2>
            <div className="exec-upload-list">
              {recentUploads.length === 0 && <div className="empty-state">No uploads in this session yet.</div>}
              {recentUploads.map((item, index) => (
                <div key={`${item.filename}-${index}`} className="exec-upload-item">
                  <strong>{item.filename}</strong>
                  <small>{item.time}</small>
                </div>
              ))}
            </div>
          </article>
        </section>
      </div>
    </section>
  );
}

export default Dashboard;
