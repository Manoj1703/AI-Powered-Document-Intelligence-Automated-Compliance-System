import React from "react";
import { formatBytes, formatDate, hasItems, normalizeRisk, prettyRisk } from "../utils";

function DetailModal({ open, loading, error, document, onClose }) {
  if (!open) return null;
  const hasExtraDetails =
    document &&
    String(document.detailed_summary || "").trim() &&
    String(document.detailed_summary || "").trim() !== String(document.summary || "").trim();

  return (
    <div className="modal-root">
      <button type="button" className="modal-backdrop" aria-label="Close" onClick={onClose} />
      <section className="modal-panel glass-card">
        <div className="modal-head">
          <h3>Document Insights</h3>
          <button type="button" className="ghost-button" onClick={onClose}>
            Close
          </button>
        </div>

        {loading && <p className="muted">Loading document insights...</p>}
        {error && <p className="error-text">{error}</p>}

        {!loading && !error && document && (
          <div className="detail-grid">
            <article className="glass-card mini-card">
              <h4>{document.title}</h4>
              <p className="muted">{document.document_type}</p>
              <p>
                Risk Level: <span className={`risk-pill risk-${normalizeRisk(document.overall_risk_level)}`}>{prettyRisk(document.overall_risk_level)}</span>
              </p>
              <p>AI Confidence: {document.confidence}%</p>
            </article>

            <article className="glass-card mini-card">
              <h4>Metadata</h4>
              <p>Filename: {document.filename}</p>
              <p>Author: {document.author}</p>
              <p>Date: {document.date || "Not Available"}</p>
              <p>Uploaded: {formatDate(document.uploaded_at)}</p>
              <p>Size: {formatBytes(document.content_length)}</p>
            </article>

            <article className="glass-card mini-card full-row">
              <h4>AI Summary</h4>
              <p>{document.summary}</p>
              {hasExtraDetails && (
                <details>
                  <summary>Detailed Summary</summary>
                  <p>{document.detailed_summary}</p>
                </details>
              )}
            </article>

            <article className="glass-card mini-card">
              <h4>Clause Extraction</h4>
              {hasItems(document.key_clauses) ? (
                <ul>
                  {document.key_clauses.map((item, index) => (
                    <li key={`${index}-${String(item)}`}>{String(item)}</li>
                  ))}
                </ul>
              ) : (
                <p className="muted">No clauses extracted.</p>
              )}
            </article>

            <article className="glass-card mini-card">
              <h4>Risk Keywords</h4>
              {hasItems(document.risk_types) ? (
                <div className="tag-wrap">
                  {document.risk_types.map((item, index) => (
                    <span className="tag" key={`${index}-${String(item)}`}>
                      {String(item)}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="muted">No risk keywords.</p>
              )}
            </article>

            <article className="glass-card mini-card">
              <h4>Key Topics</h4>
              {hasItems(document.key_topics) ? (
                <div className="tag-wrap">
                  {document.key_topics.map((item, index) => (
                    <span className="tag" key={`${index}-${String(item)}`}>
                      {String(item)}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="muted">No key topics.</p>
              )}
            </article>

            <article className="glass-card mini-card">
              <h4>Obligations</h4>
              {hasItems(document.obligations) ? (
                <ul>
                  {document.obligations.map((item, index) => (
                    <li key={`${index}-${String(item)}`}>{String(item)}</li>
                  ))}
                </ul>
              ) : (
                <p className="muted">No obligations found.</p>
              )}
            </article>

            <article className="glass-card mini-card full-row">
              <h4>Compliance Issues</h4>
              {hasItems(document.compliance_issues) ? (
                <ul>
                  {document.compliance_issues.map((item, index) => (
                    <li key={`${index}-${String(item)}`}>{String(item)}</li>
                  ))}
                </ul>
              ) : (
                <p className="muted">No compliance issues found.</p>
              )}
            </article>

            <article className="glass-card mini-card full-row">
              <h4>Risk Analysis</h4>
              {hasItems(document.risks) ? (
                <div className="risk-grid">
                  {document.risks.map((risk, index) => (
                    <div className="risk-item" key={`${index}-${String(risk?.risk_type || "risk")}`}>
                      <div className="risk-item-head">
                        <strong>{risk?.risk_type || "General Risk"}</strong>
                        <span className={`risk-pill risk-${normalizeRisk(risk?.severity)}`}>
                          {prettyRisk(risk?.severity)}
                        </span>
                      </div>
                      <p>{risk?.description || "No description."}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="muted">No structured risk entries available.</p>
              )}
            </article>
          </div>
        )}
      </section>
    </div>
  );
}

export default DetailModal;
