import React, { useDeferredValue, useEffect, useMemo, useState } from "react";
import DocumentTable from "../components/DocumentTable";
import { RISK_FILTERS, prettyRisk } from "../utils";

const PAGE_SIZE = 6;

function Documents({ documents, loading, onView, onDelete }) {
  const [query, setQuery] = useState("");
  const [risk, setRisk] = useState("All");
  const [page, setPage] = useState(1);
  const deferredQuery = useDeferredValue(query);

  const indexedDocuments = useMemo(
    () =>
      documents.map((doc) => ({
        doc,
        searchText: `${String(doc.filename || "")} ${String(doc.title || "")} ${String(doc.document_type || "")}`.toLowerCase(),
      })),
    [documents],
  );

  const filtered = useMemo(() => {
    const q = deferredQuery.trim().toLowerCase();
    return indexedDocuments
      .filter(({ doc, searchText }) => {
        const passRisk = risk === "All" || prettyRisk(doc.overall_risk_level) === risk;
        const passQuery = !q || searchText.includes(q);
        return passRisk && passQuery;
      })
      .map(({ doc }) => doc);
  }, [indexedDocuments, deferredQuery, risk]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const current = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const hasFilters = deferredQuery.trim().length > 0 || risk !== "All";

  const riskSnapshot = useMemo(() => {
    return documents.reduce(
      (acc, doc) => {
        const tone = prettyRisk(doc.overall_risk_level);
        if (tone === "High") acc.high += 1;
        else if (tone === "Medium") acc.medium += 1;
        else if (tone === "Low") acc.low += 1;
        return acc;
      },
      { high: 0, medium: 0, low: 0 },
    );
  }, [documents]);

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [page, totalPages]);

  return (
    <section className="page-stack docs-page">
      <article className="docs-hero page-enter">
        <div className="docs-hero-shell">
          <div className="docs-hero-copy">
            <h1 className="docs-title">Turn the registry into a fast, review-ready portfolio.</h1>
          </div>

          <div className="docs-metric-grid">
            <article className="docs-metric-card is-strong">
              <span className="docs-metric-label">Total registry</span>
              <strong className="docs-metric-value">{documents.length}</strong>
            </article>
            <article className="docs-metric-card">
              <span className="docs-metric-label">Visible now</span>
              <strong className="docs-metric-value">{filtered.length}</strong>
            </article>
            <article className="docs-metric-card">
              <span className="docs-metric-label">Risk focus</span>
              <strong className="docs-metric-value docs-metric-value--text">{risk === "All" ? "All levels" : risk}</strong>
            </article>
            <article className="docs-metric-card docs-metric-card--split">
              <div>
                <span className="docs-metric-label">High risk</span>
                <strong className="docs-metric-value">{riskSnapshot.high}</strong>
              </div>
              <div className="docs-priority-stack" aria-label="Risk distribution summary">
                <span className="tone-high">High {riskSnapshot.high}</span>
                <span className="tone-medium">Medium {riskSnapshot.medium}</span>
                <span className="tone-low">Low {riskSnapshot.low}</span>
              </div>
            </article>
          </div>
        </div>
      </article>

      <section className="page-section page-enter">
        <article className="docs-filter-shell">
          <div className="docs-filter-head">
            <div>
              <div className="section-label">Portfolio Filters</div>
              <div className="section-title">Refine the working set</div>
            </div>
            <div className="docs-results-meta">
              <span>{filtered.length} matching documents</span>
            </div>
          </div>

          <div className="docs-filter-grid">
            <label className="docs-field docs-field--search">
              <span>Search documents</span>
              <input
                aria-label="Search documents"
                value={query}
                onChange={(event) => {
                  setQuery(event.target.value);
                  setPage(1);
                }}
                placeholder="Search by filename, title, or type"
              />
            </label>

            <label className="docs-field docs-field--compact">
              <span>Risk level</span>
              <select
                aria-label="Filter by risk"
                value={risk}
                onChange={(event) => {
                  setRisk(event.target.value);
                  setPage(1);
                }}
              >
                {RISK_FILTERS.map((filter) => (
                  <option key={filter} value={filter}>
                    {filter}
                  </option>
                ))}
              </select>
            </label>

            <div className="docs-filter-actions">
              <button
                type="button"
                className="exec-secondary-btn"
                onClick={() => {
                  setQuery("");
                  setRisk("All");
                  setPage(1);
                }}
                disabled={!hasFilters}
              >
                Reset filters
              </button>
            </div>
          </div>
        </article>
      </section>

      <section className="page-section page-enter">
        <DocumentTable documents={current} loading={loading} onView={onView} onDelete={onDelete} />
      </section>

      <section className="page-section page-enter">
        <article className="docs-pagination">
          <button type="button" className="exec-secondary-btn" disabled={page <= 1} onClick={() => setPage((value) => value - 1)}>
            Previous
          </button>
          <div className="docs-pagination-copy">
            <strong>Page {page}</strong>
            <span>of {totalPages}</span>
          </div>
          <button type="button" className="exec-primary-btn" disabled={page >= totalPages} onClick={() => setPage((value) => value + 1)}>
            Next
          </button>
        </article>
      </section>
    </section>
  );
}

export default Documents;
