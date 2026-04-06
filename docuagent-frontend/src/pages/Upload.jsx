import React, { useMemo, useState } from "react";
import { prettyRisk } from "../utils";

function predictRisk(file) {
  const name = (file?.name || "").toLowerCase();
  if (name.includes("termination") || name.includes("penalty") || name.includes("liability")) return "High";
  if (name.includes("nda") || name.includes("service") || name.includes("agreement")) return "Medium";
  return "Low";
}

function Upload({ uploading, onUpload, uploadHistory = [], onOpenDocuments, onOpenHistoryItem }) {
  const [file, setFile] = useState(null);
  const [dragActive, setDragActive] = useState(false);

  const prediction = useMemo(() => {
    if (!file) return null;
    return predictRisk(file);
  }, [file]);

  function handleFile(nextFile) {
    if (!nextFile) return;
    setFile(nextFile);
  }

  async function handleAnalyze() {
    if (!file) return;
    await onUpload(file);
    setFile(null);
  }

  return (
    <section className="page-stack">
      <article className="hero-banner page-enter">
        <div className="ghost-word">LOAD</div>
        <div className="hero-banner-inner">
          <div className="hero-content">
            <span className="hero-page-tag">Document Intake</span>
            <h1 className="hero-headline">
              Bring new files into the <em>analysis pipeline</em> without leaving the review surface.
            </h1>
            <p className="hero-desc">
              Drag a file into the intake zone, confirm the pre-analysis preview, and route it into the portfolio.
            </p>
          </div>
          <div className="hero-stats-col">
            <div className="hero-stat-card">
              <div className="stat-block">
                <span className="stat-label">Session Uploads</span>
                <span className="stat-value">{uploadHistory.length}</span>
              </div>
            </div>
            <div className="hero-stat-card">
              <div className="stat-block">
                <span className="stat-label">Selection</span>
                <span className="stat-value">{file ? "Ready" : "None"}</span>
              </div>
            </div>
          </div>
        </div>
      </article>

      <section className="page-section page-enter">
        <article
          className={`hero-banner upload-zone ${dragActive ? "drag-active" : ""}`}
          onDragOver={(event) => {
            event.preventDefault();
            setDragActive(true);
          }}
          onDragLeave={() => setDragActive(false)}
          onDrop={(event) => {
            event.preventDefault();
            setDragActive(false);
            handleFile(event.dataTransfer.files?.[0]);
          }}
        >
          <div className="ghost-word">DROP</div>
          <div className="hero-banner-inner">
            <div className="hero-content">
              <span className="hero-page-tag">Dropzone</span>
              <h2 className="hero-headline">Drop a contract, policy, or report into the intake lane.</h2>
              <p className="hero-desc">Files are prepared for extraction and AI-assisted review as soon as you confirm the upload.</p>
              <div className="hero-actions">
                <label className="btn-primary file-select-button">
                  Select File
                  <input type="file" hidden onChange={(event) => handleFile(event.target.files?.[0])} />
                </label>
                <button type="button" className="btn-ghost" onClick={onOpenDocuments}>
                  Open Documents
                </button>
              </div>
            </div>
          </div>
        </article>
      </section>

      <section className="page-section page-enter">
        <div className="two-card-grid">
          <article className="card panel-card">
            <div className="section-label">File Preview</div>
            <div className="section-title">Selected metadata</div>
            {!file && <div className="empty-state inline">No file selected.</div>}
            {file && (
              <div className="preview-box">
                <div className="ai-stat-row">
                  <span className="ai-stat-key">Name</span>
                  <span className="ai-stat-value">{file.name}</span>
                </div>
                <div className="ai-stat-row">
                  <span className="ai-stat-key">Type</span>
                  <span className="ai-stat-value">{file.type || "Unknown"}</span>
                </div>
                <div className="ai-stat-row">
                  <span className="ai-stat-key">Size</span>
                  <span className="ai-stat-value">{(file.size / 1024).toFixed(1)} KB</span>
                </div>
              </div>
            )}
          </article>

          <article className="card panel-card">
            <div className="section-label">Prediction Preview</div>
            <div className="section-title">Estimated severity</div>
            {!prediction && <div className="empty-state inline">Select a file to preview estimated risk.</div>}
            {prediction && (
              <>
                <div className="ai-summary-box">Pre-analysis estimate: {prettyRisk(prediction)} risk based on filename signals.</div>
                <button type="button" className="btn-primary" disabled={uploading} onClick={handleAnalyze}>
                  {uploading ? "Uploading..." : "Upload & Analyze"}
                </button>
              </>
            )}
          </article>
        </div>
      </section>

      <section className="page-section page-enter">
        <div className="doc-table">
          <div className="doc-table-head">
            <div>
              <div className="section-label">Recent Uploads</div>
              <div className="section-title">Session history</div>
            </div>
            <button type="button" className="btn-ghost" onClick={onOpenDocuments}>
              Go to My Documents
            </button>
          </div>

          {uploadHistory.length === 0 && <div className="empty-state">No uploads yet.</div>}
          {uploadHistory.map((item, index) => (
            <div className="doc-row" key={`${item.filename}-${index}`}>
              <div className="doc-row-info">
                <div className="doc-row-name">{item.filename}</div>
                <div className="doc-row-sub">{item.time}</div>
              </div>
              <div className="doc-row-meta">
                <button type="button" className="btn-ghost" onClick={() => onOpenHistoryItem?.(item)}>
                  Open in Documents
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>
    </section>
  );
}

export default Upload;
