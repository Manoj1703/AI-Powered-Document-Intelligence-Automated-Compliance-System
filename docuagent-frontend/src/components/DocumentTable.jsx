import React from "react";
import { normalizeRisk, prettyRisk } from "../utils";

function DocumentTable({ documents, loading, onView, onDelete }) {
  return (
    <div className="table-wrap glass-card">
      <table>
        <thead>
          <tr>
            <th>Filename</th>
            <th>Title</th>
            <th>Type</th>
            <th>Risk</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {loading && (
            <tr>
              <td colSpan="5" className="table-empty">Loading documents...</td>
            </tr>
          )}

          {!loading && documents.length === 0 && (
            <tr>
              <td colSpan="5" className="table-empty">No documents found.</td>
            </tr>
          )}

          {!loading &&
            documents.map((doc, index) => (
              <tr key={doc.id} className="doc-row-enter" style={{ animationDelay: `${index * 60}ms` }}>
                <td>{doc.filename || "Unknown"}</td>
                <td>{doc.title || "Unknown"}</td>
                <td>{doc.document_type || "Unknown"}</td>
                <td>
                  <span className={`risk-pill risk-${normalizeRisk(doc.overall_risk_level)}`}>
                    {prettyRisk(doc.overall_risk_level)}
                  </span>
                </td>
                <td>
                  <div className="row-actions">
                    <button type="button" className="ghost-button" onClick={() => onView(doc.id)}>
                      View
                    </button>
                    <button type="button" className="danger-button" onClick={() => onDelete(doc)}>
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
        </tbody>
      </table>
    </div>
  );
}

export default DocumentTable;
