import React, { useEffect, useMemo, useState } from "react";
import {
  deleteDocumentById,
  fetchDashboardStats,
  fetchDocumentById,
  fetchDocuments,
  fetchHealth,
  uploadDocument,
} from "./api";

const RISK_FILTERS = ["All", "High", "Medium", "Low", "Unknown"];

function normalizeRisk(value) {
  const parsed = String(value || "Unknown").toLowerCase();
  if (parsed === "high" || parsed === "medium" || parsed === "low") return parsed;
  return "unknown";
}

function prettyRisk(value) {
  const parsed = normalizeRisk(value);
  return parsed[0].toUpperCase() + parsed.slice(1);
}

function hasItems(items) {
  return Array.isArray(items) && items.length > 0;
}

function formatDate(value) {
  if (!value) return "Not Available";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toLocaleString();
}

function formatBytes(value) {
  const bytes = Number(value);
  if (!Number.isFinite(bytes) || bytes <= 0) return "Not Available";
  const kb = bytes / 1024;
  if (kb < 1024) return `${kb.toFixed(1)} KB`;
  return `${(kb / 1024).toFixed(2)} MB`;
}

function normalizeDetailPayload(response) {
  const base = response && typeof response === "object" ? response : {};
  const analysis =
    base.analysis && typeof base.analysis === "object" && !Array.isArray(base.analysis)
      ? base.analysis
      : null;
  const source = analysis ?? base;
  const metadata =
    source.metadata && typeof source.metadata === "object" && !Array.isArray(source.metadata)
      ? source.metadata
      : {};

  return {
    id: base.id || "Not Available",
    filename: base.filename || "Not Available",
    uploaded_at: base.uploaded_at || null,
    created_at: base.created_at || null,
    content_length: base.content_length,
    title: source.title || "Not Available",
    document_type: source.document_type || metadata.document_type || "Not Available",
    author: source.author || "Not Available",
    date: source.date || "Not Available",
    summary: source.summary || "Not Available",
    detailed_summary: source.detailed_summary || "Not Available",
    key_topics: hasItems(metadata.key_topics) ? metadata.key_topics : [],
    key_clauses: hasItems(source.key_clauses) ? source.key_clauses : [],
    obligations: hasItems(source.obligations) ? source.obligations : [],
    compliance_issues: hasItems(source.compliance_issues) ? source.compliance_issues : [],
    risks: hasItems(source.risks) ? source.risks : [],
    risk_types: hasItems(source.risk_types) ? source.risk_types : [],
    overall_risk_level: source.overall_risk_level || base.overall_risk_level || "Unknown",
  };
}

function App() {
  const [theme, setTheme] = useState(() => localStorage.getItem("docuagent-theme") || "light");
  const [health, setHealth] = useState("Checking...");
  const [stats, setStats] = useState(null);
  const [documents, setDocuments] = useState([]);

  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const [search, setSearch] = useState("");
  const [riskFilter, setRiskFilter] = useState("All");
  const [docIdInput, setDocIdInput] = useState("");

  const [selectedDocument, setSelectedDocument] = useState(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState("");

  const [toast, setToast] = useState(null);
  const [deletingDocId, setDeletingDocId] = useState("");

  async function loadData() {
    setLoading(true);
    setError("");

    try {
      const [healthData, statsData, docsData] = await Promise.all([
        fetchHealth(),
        fetchDashboardStats(),
        fetchDocuments(),
      ]);

      setHealth(healthData?.status === "ok" ? "Online" : "Unknown");
      setStats(statsData);
      setDocuments(Array.isArray(docsData) ? docsData : []);
    } catch (err) {
      setHealth("Offline");
      setError(err.message || "Failed to load data");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (!toast) return undefined;
    const timer = setTimeout(() => setToast(null), 2800);
    return () => clearTimeout(timer);
  }, [toast]);

  useEffect(() => {
    localStorage.setItem("docuagent-theme", theme);
    document.body.setAttribute("data-theme", theme);
  }, [theme]);

  async function onUpload(event) {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError("");
    setMessage("");

    try {
      const result = await uploadDocument(file);
      setMessage(`Uploaded: ${result.filename}`);
      await loadData();
    } catch (err) {
      setError(err.message || "Upload failed");
    } finally {
      setUploading(false);
      event.target.value = "";
    }
  }

  async function openDocumentDetailById(docId) {
    if (!docId) return;

    setDetailLoading(true);
    setDetailError("");
    setSelectedDocument(null);
    setDetailOpen(true);

    try {
      const detail = await fetchDocumentById(docId);
      setSelectedDocument(normalizeDetailPayload(detail));
    } catch (err) {
      setDetailError(err.message || "Failed to load document detail");
    } finally {
      setDetailLoading(false);
    }
  }

  async function onFetchById() {
    const id = docIdInput.trim();
    if (!id) {
      setToast({ type: "error", text: "Enter a document ID." });
      return;
    }

    setDetailLoading(true);
    setDetailError("");
    setSelectedDocument(null);
    setDetailOpen(true);

    try {
      const detail = await fetchDocumentById(id);
      setSelectedDocument(normalizeDetailPayload(detail));
      setToast({ type: "success", text: "Document loaded." });
    } catch (err) {
      setDetailError(err.message || "Invalid ID");
      setToast({ type: "error", text: "Invalid document ID." });
    } finally {
      setDetailLoading(false);
    }
  }

  async function onDeleteDocument(doc) {
    if (!doc?.id) return;

    const confirmed = window.confirm(`Delete "${doc.filename || "this document"}"?`);
    if (!confirmed) return;

    setDeletingDocId(doc.id);
    setError("");
    setMessage("");

    try {
      await deleteDocumentById(doc.id);

      setDocuments((prev) => prev.filter((item) => item.id !== doc.id));
      setStats((prev) => {
        if (!prev) return prev;

        const currentTotal = Number(prev.total_documents) || 0;
        const normalizedRisk = normalizeRisk(doc.overall_risk_level);
        const currentRiskCount = Number(prev.risk_breakdown?.[normalizedRisk]) || 0;

        return {
          ...prev,
          total_documents: Math.max(0, currentTotal - 1),
          risk_breakdown: {
            ...(prev.risk_breakdown || {}),
            [normalizedRisk]: Math.max(0, currentRiskCount - 1),
          },
        };
      });

      if (selectedDocument?.id === doc.id) {
        setDetailOpen(false);
        setSelectedDocument(null);
      }

      setToast({ type: "success", text: "Document deleted." });
    } catch (err) {
      setToast({ type: "error", text: err.message || "Delete failed." });
    } finally {
      setDeletingDocId("");
    }
  }

  const filteredDocuments = useMemo(() => {
    return documents.filter((doc) => {
      const normalizedRisk = prettyRisk(doc.overall_risk_level);
      const passRisk = riskFilter === "All" || normalizedRisk === riskFilter;

      const q = search.trim().toLowerCase();
      const passSearch =
        !q ||
        String(doc.filename || "").toLowerCase().includes(q) ||
        String(doc.title || "").toLowerCase().includes(q) ||
        String(doc.document_type || "").toLowerCase().includes(q);

      return passRisk && passSearch;
    });
  }, [documents, riskFilter, search]);

  const healthClass = health === "Online" ? "online" : health === "Offline" ? "offline" : "unknown";

  return (
    <div className="app-shell" data-theme={theme}>
      <div className="bg-orb orb-purple" />
      <div className="bg-orb orb-blue" />
      <div className="bg-orb orb-orange" />

      <nav className="top-nav card">
        <div className="brand-wrap">
          <div className="brand-dot" />
          <span className="brand-text">DocuAgent</span>
        </div>
        <div className="nav-right">
          <span className={`health-chip ${healthClass}`}>
            <span className="dot" />
            Backend: {health}
          </span>
          <button
            className="theme-button"
            type="button"
            onClick={() => setTheme((prev) => (prev === "dark" ? "light" : "dark"))}
          >
            {theme === "dark" ? "Theme: Dark" : "Theme: Light"}
          </button>
          <button className="avatar-button" type="button" aria-label="User menu">
            DK
          </button>
        </div>
      </nav>

      <header className="hero">
        <p className="eyebrow">Legal Document Intelligence</p>
        <h1>Enterprise Contract Risk Dashboard</h1>
        <p className="subtitle">
          Upload, assess, and inspect document intelligence with structured risk analysis.
        </p>
      </header>

      <main className="dashboard-grid">
        <section className="card grid-span-12 action-row">
          <label className="primary-button">
            <input type="file" onChange={onUpload} disabled={uploading} />
            {uploading ? "Uploading..." : "Upload Document"}
          </label>
          <button className="secondary-button" onClick={loadData} disabled={loading || uploading}>
            {loading ? "Refreshing..." : "Refresh Data"}
          </button>
          {message && <p className="success">{message}</p>}
          {error && <p className="error">{error}</p>}
        </section>

        <article className="card stat-card stat-total grid-span-3">
          <p>Total Documents</p>
          <h2>{stats?.total_documents ?? (loading ? "..." : 0)}</h2>
        </article>
        <article className="card stat-card stat-high grid-span-3">
          <p>High Risk</p>
          <h2>{stats?.risk_breakdown?.high ?? (loading ? "..." : 0)}</h2>
        </article>
        <article className="card stat-card stat-medium grid-span-3">
          <p>Medium Risk</p>
          <h2>{stats?.risk_breakdown?.medium ?? (loading ? "..." : 0)}</h2>
        </article>
        <article className="card stat-card stat-low grid-span-3">
          <p>Low Risk</p>
          <h2>{stats?.risk_breakdown?.low ?? (loading ? "..." : 0)}</h2>
        </article>

        <section className="card grid-span-12 fetch-card">
          <div>
            <h3 className="section-title" data-icon="◈">
              Fetch Document by ID
            </h3>
            <p className="muted">Use a Mongo document id to instantly open detailed analysis.</p>
          </div>
          <div className="fetch-controls">
            <input
              className="text-input"
              placeholder="Enter doc_id"
              value={docIdInput}
              onChange={(e) => setDocIdInput(e.target.value)}
            />
            <button className="secondary-button" onClick={onFetchById}>
              Fetch
            </button>
          </div>
        </section>

        <section className="card grid-span-12">
          <div className="table-header">
            <h3 className="section-title" data-icon="▣">
              Documents
            </h3>
            <span className="muted">{filteredDocuments.length} matching files</span>
          </div>
          <div className="filters">
            <input
              className="text-input"
              placeholder="Search by file, title, or type..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <select value={riskFilter} onChange={(e) => setRiskFilter(e.target.value)}>
              {RISK_FILTERS.map((filter) => (
                <option key={filter} value={filter}>
                  {filter}
                </option>
              ))}
            </select>
          </div>

          <div className="table-wrap">
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
                {loading &&
                  Array.from({ length: 6 }).map((_, index) => (
                    <tr key={`skeleton-${index}`} className="skeleton-row">
                      <td colSpan="5">
                        <div className="skeleton-line" />
                      </td>
                    </tr>
                  ))}

                {!loading && filteredDocuments.length === 0 && (
                  <tr>
                    <td colSpan="5">
                      <div className="empty-state">
                        <p>No documents found</p>
                        <span>Upload a file or adjust your search/filter.</span>
                      </div>
                    </td>
                  </tr>
                )}

                {!loading &&
                  filteredDocuments.map((doc) => (
                    <tr key={doc.id} className="data-row">
                      <td>{doc.filename || "Unknown"}</td>
                      <td>{doc.title || "Unknown"}</td>
                      <td>{doc.document_type || "Unknown"}</td>
                      <td>
                        <span className={`risk-pill risk-${normalizeRisk(doc.overall_risk_level)}`}>
                          {prettyRisk(doc.overall_risk_level)}
                        </span>
                      </td>
                      <td>
                        <div className="action-buttons">
                          <button
                            className="primary-ghost-button"
                            onClick={() => openDocumentDetailById(doc.id)}
                            disabled={deletingDocId === doc.id}
                          >
                            View Details
                          </button>
                          <button
                            className="danger-ghost-button"
                            onClick={() => onDeleteDocument(doc)}
                            disabled={deletingDocId === doc.id}
                          >
                            {deletingDocId === doc.id ? "Deleting..." : "Delete"}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </section>
      </main>

      {detailOpen && (
        <>
          <button
            className="drawer-backdrop"
            onClick={() => setDetailOpen(false)}
            aria-label="Close details"
          />
          <aside className="drawer">
            <div className="drawer-header">
              <h3 className="section-title" data-icon="◧">
                Document Details
              </h3>
              <button className="close-button" onClick={() => setDetailOpen(false)}>
                Close
              </button>
            </div>

            {detailLoading && (
              <div className="drawer-loading">
                <div className="skeleton-block" />
                <div className="skeleton-block" />
                <div className="skeleton-block" />
              </div>
            )}

            {detailError && <p className="error">{detailError}</p>}

            {!detailLoading && selectedDocument && (
              <div className="detail-stack">
                <article className="detail-card">
                  <div className="detail-title-row">
                    <div>
                      <h4>{selectedDocument.title}</h4>
                      <p className="muted">{selectedDocument.document_type}</p>
                    </div>
                    <span className={`risk-pill risk-${normalizeRisk(selectedDocument.overall_risk_level)}`}>
                      {prettyRisk(selectedDocument.overall_risk_level)}
                    </span>
                  </div>
                  <small className="muted">ID: {selectedDocument.id}</small>
                </article>

                <article className="detail-card">
                  <h4 className="section-title" data-icon="◎">
                    Metadata
                  </h4>
                  <ul className="meta-list">
                    <li>
                      <span>Filename</span>
                      <strong>{selectedDocument.filename}</strong>
                    </li>
                    <li>
                      <span>Author</span>
                      <strong>{selectedDocument.author}</strong>
                    </li>
                    <li>
                      <span>Date</span>
                      <strong>{selectedDocument.date}</strong>
                    </li>
                    <li>
                      <span>Uploaded At</span>
                      <strong>{formatDate(selectedDocument.uploaded_at)}</strong>
                    </li>
                    <li>
                      <span>Created At</span>
                      <strong>{formatDate(selectedDocument.created_at)}</strong>
                    </li>
                    <li>
                      <span>Content Length</span>
                      <strong>{formatBytes(selectedDocument.content_length)}</strong>
                    </li>
                  </ul>
                </article>

                <article className="detail-card">
                  <h4 className="section-title" data-icon="◍">
                    Summary
                  </h4>
                  <p>{selectedDocument.summary}</p>
                  <details>
                    <summary>Detailed summary</summary>
                    <p>{selectedDocument.detailed_summary}</p>
                  </details>
                </article>

                <article className="detail-card">
                  <h4 className="section-title" data-icon="✦">
                    Key Topics
                  </h4>
                  {hasItems(selectedDocument.key_topics) ? (
                    <div className="topic-tags">
                      {selectedDocument.key_topics.map((topic, index) => (
                        <span className="topic-tag" key={`${index}-${String(topic)}`}>
                          {String(topic)}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="muted">Not Available</p>
                  )}
                </article>

                <article className="detail-card">
                  <h4 className="section-title" data-icon="◉">
                    Key Clauses
                  </h4>
                  {hasItems(selectedDocument.key_clauses) ? (
                    <ul>
                      {selectedDocument.key_clauses.map((item, index) => (
                        <li key={`${index}-${String(item)}`}>{String(item)}</li>
                      ))}
                    </ul>
                  ) : (
                    <p className="muted">Not Available</p>
                  )}
                </article>

                <article className="detail-card">
                  <h4 className="section-title" data-icon="◍">
                    Obligations
                  </h4>
                  {hasItems(selectedDocument.obligations) ? (
                    <ul>
                      {selectedDocument.obligations.map((item, index) => (
                        <li key={`${index}-${String(item)}`}>{String(item)}</li>
                      ))}
                    </ul>
                  ) : (
                    <p className="muted">Not Available</p>
                  )}
                </article>

                <article className="detail-card warning-box">
                  <h4 className="section-title" data-icon="⚑">
                    Compliance Issues
                  </h4>
                  {hasItems(selectedDocument.compliance_issues) ? (
                    <ul>
                      {selectedDocument.compliance_issues.map((item, index) => (
                        <li key={`${index}-${String(item)}`}>{String(item)}</li>
                      ))}
                    </ul>
                  ) : (
                    <p className="muted">Not Available</p>
                  )}
                </article>

                <article className="detail-card">
                  <h4 className="section-title" data-icon="◬">
                    Risk Analysis
                  </h4>
                  {hasItems(selectedDocument.risks) ? (
                    <div className="risk-analysis-grid">
                      {selectedDocument.risks.map((risk, index) => (
                        <div className="risk-analysis-card" key={`${index}-${String(risk?.risk_type)}`}>
                          <p>{risk?.risk_type || "General Risk"}</p>
                          <span className={`risk-pill risk-${normalizeRisk(risk?.severity)}`}>
                            {prettyRisk(risk?.severity)}
                          </span>
                          <small>{risk?.description || "Not Available"}</small>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <>
                      <p className="muted">No structured risk entries available.</p>
                      {hasItems(selectedDocument.risk_types) && (
                        <div className="topic-tags">
                          {selectedDocument.risk_types.map((type, index) => (
                            <span className="topic-tag" key={`${index}-${String(type)}`}>
                              {String(type)}
                            </span>
                          ))}
                        </div>
                      )}
                    </>
                  )}
                </article>
              </div>
            )}

            {!detailLoading && !selectedDocument && !detailError && (
              <p className="muted">Select a document to inspect analysis.</p>
            )}
          </aside>
        </>
      )}

      {toast && (
        <div className={`toast toast-${toast.type}`} role="status">
          {toast.text}
        </div>
      )}
    </div>
  );
}

export default App;
