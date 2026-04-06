import React, { useMemo } from "react";
import { buildMonthlyTrend, exportAnalyticsReport, normalizeRisk } from "../utils";

const DONUT_RADIUS = 72;
const DONUT_CIRCUMFERENCE = 2 * Math.PI * DONUT_RADIUS;

function arcStyle(value, total, offset) {
  const ratio = total > 0 ? value / total : 0;
  const length = DONUT_CIRCUMFERENCE * ratio;
  return {
    strokeDasharray: `${Math.max(length, 0)} ${Math.max(DONUT_CIRCUMFERENCE - length, 0)}`,
    strokeDashoffset: `${-offset}`,
  };
}

function Analytics({ stats, documents }) {
  const derivedRisk = useMemo(() => {
    const tally = documents.reduce(
      (acc, doc) => {
        acc[normalizeRisk(doc.overall_risk_level)] += 1;
        return acc;
      },
      { high: 0, medium: 0, low: 0, unknown: 0 },
    );

    return {
      high: Number(stats?.risk_breakdown?.high) || tally.high,
      medium: Number(stats?.risk_breakdown?.medium) || tally.medium,
      low: Number(stats?.risk_breakdown?.low) || tally.low,
    };
  }, [documents, stats]);

  const riskData = useMemo(
    () => [
      { label: "High", value: derivedRisk.high, tone: "high", accent: "#ef4444" },
      { label: "Medium", value: derivedRisk.medium, tone: "medium", accent: "#f59e0b" },
      { label: "Low", value: derivedRisk.low, tone: "low", accent: "#10b981" },
    ],
    [derivedRisk],
  );

  const trend = useMemo(() => buildMonthlyTrend(documents, 6), [documents]);
  const maxTrend = Math.max(...trend.map((item) => item.count), 1);
  const totalDocs = Math.max(documents.length, 1);
  const reviewedTotal = riskData.reduce((sum, item) => sum + item.value, 0);
  const dominant = [...riskData].sort((a, b) => b.value - a.value)[0] || riskData[0];
  const busiestMonth = [...trend].sort((a, b) => b.count - a.count)[0] || trend[0];
  const averageMonthly = trend.length > 0 ? (trend.reduce((sum, item) => sum + item.count, 0) / trend.length).toFixed(1) : "0.0";

  const categories = useMemo(() => {
    const map = new Map();
    documents.forEach((doc) => {
      const key = doc.document_type || "Unknown";
      map.set(key, (map.get(key) || 0) + 1);
    });
    return [...map.entries()].map(([label, count]) => ({ label, count })).sort((a, b) => b.count - a.count);
  }, [documents]);

  const topCategories = categories.slice(0, 6);
  const topCategory = topCategories[0]?.label || "None";
  const postureLabel =
    dominant?.tone === "high" ? "Elevated exposure" : dominant?.tone === "medium" ? "Balanced watch" : "Stabilized posture";
  const peakConcentration = Math.round((dominant.value / totalDocs) * 100);

  const donutSegments = useMemo(() => {
    let offset = 0;
    return riskData.map((item) => {
      const style = arcStyle(item.value, reviewedTotal, offset);
      offset += DONUT_CIRCUMFERENCE * (reviewedTotal > 0 ? item.value / reviewedTotal : 0);
      return { ...item, style };
    });
  }, [reviewedTotal, riskData]);

  function onExport() {
    exportAnalyticsReport({
      generated_at: new Date().toISOString(),
      risk_data: riskData,
      trend,
      categories,
    });
  }

  return (
    <section className="page-stack analytics-page">
      <article className="analytics-hero page-enter">
        <div className="analytics-hero-shell">
          <div className="analytics-hero-copy">
            <h1 className="analytics-title">See where portfolio risk is clustering before it becomes operational drag.</h1>
          </div>

          <div className="analytics-hero-metrics">
            <article className="analytics-metric-card is-strong">
              <span className="analytics-metric-label">Risk posture</span>
              <strong className="analytics-metric-value analytics-metric-value--text">{postureLabel}</strong>
            </article>
            <article className="analytics-metric-card">
              <span className="analytics-metric-label">Reviewed files</span>
              <strong className="analytics-metric-value">{reviewedTotal}</strong>
            </article>
            <article className="analytics-metric-card">
              <span className="analytics-metric-label">Busiest month</span>
              <strong className="analytics-metric-value analytics-metric-value--text">{busiestMonth?.label || "None"}</strong>
            </article>
            <article className="analytics-metric-card">
              <span className="analytics-metric-label">Average monthly intake</span>
              <strong className="analytics-metric-value">{averageMonthly}</strong>
            </article>
          </div>
        </div>
      </article>

      <section className="page-section page-enter">
        <div className="analytics-stage">
          <article className="analytics-risk-board">
            <div className="analytics-panel-head">
              <div>
                <div className="section-label">Risk Composition</div>
                <div className="section-title">Exposure by severity</div>
              </div>
              <button type="button" className="exec-primary-btn" onClick={onExport}>
                Export Report
              </button>
            </div>

            <div className="analytics-risk-layout">
              <div className="analytics-donut-shell" aria-hidden="true">
                <svg viewBox="0 0 220 220" className="analytics-donut">
                  <defs>
                    <linearGradient id="analyticsGlow" x1="0%" x2="100%" y1="0%" y2="100%">
                      <stop offset="0%" stopColor="#ffffff" stopOpacity="0.95" />
                      <stop offset="100%" stopColor="#e2e8f0" stopOpacity="0.42" />
                    </linearGradient>
                  </defs>
                  <circle cx="110" cy="110" r={DONUT_RADIUS} className="analytics-donut-track" />
                  {donutSegments.map((item) => (
                    <circle
                      key={item.label}
                      cx="110"
                      cy="110"
                      r={DONUT_RADIUS}
                      className={`analytics-donut-segment ${item.tone}`}
                      style={item.style}
                    />
                  ))}
                  <circle cx="110" cy="110" r="52" fill="url(#analyticsGlow)" className="analytics-donut-core" />
                </svg>
                <div className="analytics-donut-center">
                  <div className="analytics-donut-center-stack">
                    <strong>{documents.length}</strong>
                  </div>
                </div>
                <div className="analytics-donut-caption">Documents in scope</div>
              </div>

              <div className="analytics-risk-legend">
                {riskData.map((item) => {
                  const pct = Math.round((item.value / totalDocs) * 100);
                  return (
                    <article key={item.label} className={`analytics-risk-card tone-${item.tone}`}>
                      <div className="analytics-risk-card-head">
                        <span className="analytics-risk-dot" style={{ backgroundColor: item.accent }} />
                        <strong>{item.label}</strong>
                        <small>{pct}%</small>
                      </div>
                      <div className="analytics-risk-count">{item.value}</div>
                    </article>
                  );
                })}
              </div>
            </div>
          </article>

          <article className="analytics-insight-board">
            <div className="section-title">Portfolio readout</div>

            <div className="analytics-insight-list">
              <div className="analytics-insight-row">
                <span>Dominant severity</span>
                <strong>{dominant.label}</strong>
              </div>
              <div className="analytics-insight-row">
                <span>Top category</span>
                <strong>{topCategory}</strong>
              </div>
              <div className="analytics-insight-row">
                <span>Risk concentration</span>
                <strong>{Math.round((dominant.value / totalDocs) * 100)}%</strong>
              </div>
            </div>

            <div className="analytics-alert-strip">
              <div className="analytics-alert-chip tone-high">High {derivedRisk.high}</div>
              <div className="analytics-alert-chip tone-medium">Medium {derivedRisk.medium}</div>
              <div className="analytics-alert-chip tone-low">Low {derivedRisk.low}</div>
            </div>
          </article>
        </div>
      </section>

      <section className="page-section page-enter">
        <article className="analytics-trend-board">
          <div className="analytics-panel-head">
            <div>
              <div className="section-label">Trend View</div>
              <div className="section-title">Upload momentum</div>
            </div>
          </div>

          <div className="analytics-trend-layout">
            <div className="analytics-trend-columns">
              {trend.map((item) => (
                <div key={item.key} className="analytics-trend-col">
                  <div className="analytics-trend-count">{item.count}</div>
                  <div className="analytics-trend-track">
                    <div
                      className={`analytics-trend-fill ${item.count === maxTrend && item.count > 0 ? "is-peak" : ""}`}
                      style={{ height: `${Math.max((item.count / maxTrend) * 100, item.count > 0 ? 8 : 0)}%` }}
                    />
                  </div>
                  <div className="analytics-trend-label">{item.label}</div>
                </div>
              ))}
            </div>

            <div className="analytics-trend-summary">
              <div className="analytics-summary-tile">
                <span>Peak month</span>
                <strong>{busiestMonth?.label || "None"}</strong>
              </div>
              <div className="analytics-summary-tile">
                <span>Average pace</span>
                <strong>{averageMonthly}</strong>
              </div>
              <div className="analytics-summary-tile">
                <span>Current lead</span>
                <strong>{dominant.label}</strong>
              </div>
            </div>
          </div>
        </article>
      </section>

      <section className="page-section page-enter">
        <article className="analytics-category-board">
          <div className="analytics-panel-head">
            <div>
              <div className="section-label">Category Mix</div>
              <div className="section-title">Document composition</div>
            </div>
          </div>

          {topCategories.length === 0 && <div className="empty-state">No categories available.</div>}

          {topCategories.length > 0 && (
            <div className="analytics-category-grid">
              {topCategories.map((item, index) => (
                <article key={item.label} className={`analytics-category-card rank-${index + 1}`}>
                  <span className="analytics-category-rank">0{index + 1}</span>
                  <strong>{item.label}</strong>
                  <p>{Math.round((item.count / totalDocs) * 100)}% of the active document portfolio.</p>
                  <div className="analytics-category-foot">
                    <span>{item.count} files</span>
                    <div className="analytics-category-bar">
                      <div style={{ width: `${Math.max((item.count / totalDocs) * 100, 12)}%` }} />
                    </div>
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

export default Analytics;
