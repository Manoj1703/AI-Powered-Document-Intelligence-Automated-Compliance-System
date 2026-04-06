import React, { memo } from "react";
import { formatDate, normalizeRisk, prettyRisk } from "../utils";

const DocumentRow = memo(function DocumentRow({ doc, index, onView, onDelete }) {
  const riskTone = normalizeRisk(doc.overall_risk_level);

  return (
    <div className={`doc-row page-enter doc-row-${index + 1}`}>
      <div className="doc-row-info">
        <div className="doc-row-name">{doc.filename || "Unknown"}</div>
        <div className="doc-row-sub">
          {doc.title || "Untitled"} / {doc.document_type || "Unknown"}
        </div>
      </div>

      <div className="doc-row-meta">
        <span className={`risk-badge ${riskTone}`}>{prettyRisk(doc.overall_risk_level)}</span>
        <span className="doc-timestamp">{formatDate(doc.uploaded_at || doc.created_at)}</span>
        <div className="docs-row-actions">
          <button
            type="button"
            className="exec-primary-btn small"
            onClick={() => onView(doc.id)}
            aria-label={`View ${doc.filename || "document"}`}
          >
            Inspect
          </button>
          <button
            type="button"
            className="exec-secondary-btn"
            onClick={() => onDelete(doc)}
            aria-label={`Delete ${doc.filename || "document"}`}
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
});

function DocumentTable({ documents, loading, onView, onDelete }) {
  return (
    <div className="doc-table docs-table page-enter" aria-label="Documents table">
      <div className="doc-table-head docs-table-head">
        <div>
          <p className="section-label">Document Registry</p>
          <p className="section-title">Live review inventory</p>
        </div>
        <p className="section-hint">Inspect details, review timestamps, and act on risk posture from one curated list.</p>
      </div>
      <div className="doc-table-list">
        {loading && <p className="empty-state">Loading documents...</p>}
        {!loading && documents.length === 0 && <p className="empty-state">No documents found.</p>}
        {!loading &&
          documents.map((doc, index) => (
            <DocumentRow key={doc.id || `${doc.filename || "doc"}-${index}`} doc={doc} index={index} onView={onView} onDelete={onDelete} />
          ))}
      </div>
    </div>
  );
}

export default DocumentTable;
