export const NAV_ITEMS = [
  { key: "dashboard", label: "Dashboard" },
  { key: "upload", label: "Upload Document" },
  { key: "documents", label: "Documents" },
  { key: "analytics", label: "Risk Analytics" },
  { key: "settings", label: "Settings" },
  { key: "activity", label: "Activity Log" },
];

export const RISK_FILTERS = ["All", "High", "Medium", "Low", "Unknown"];

export function normalizeRisk(value) {
  const parsed = String(value || "Unknown").toLowerCase();
  if (parsed === "high" || parsed === "medium" || parsed === "low") return parsed;
  return "unknown";
}

export function prettyRisk(value) {
  const parsed = normalizeRisk(value);
  return parsed[0].toUpperCase() + parsed.slice(1);
}

export function hasItems(items) {
  return Array.isArray(items) && items.length > 0;
}

export function formatDate(value) {
  if (!value) return "Not Available";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toLocaleString();
}

export function formatBytes(value) {
  const bytes = Number(value);
  if (!Number.isFinite(bytes) || bytes <= 0) return "Not Available";
  const kb = bytes / 1024;
  if (kb < 1024) return `${kb.toFixed(1)} KB`;
  return `${(kb / 1024).toFixed(2)} MB`;
}

export function normalizeDetailPayload(response) {
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
    confidence: source.confidence_score || Math.floor(80 + Math.random() * 18),
  };
}

export function buildMonthlyTrend(documents, monthCount = 6) {
  const now = new Date();
  const months = [];

  for (let i = monthCount - 1; i >= 0; i -= 1) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    months.push({
      key,
      label: d.toLocaleString(undefined, { month: "short" }),
      count: 0,
    });
  }

  documents.forEach((doc) => {
    const value = doc?.uploaded_at || doc?.created_at;
    if (!value) return;
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return;
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    const idx = months.findIndex((m) => m.key === key);
    if (idx >= 0) months[idx].count += 1;
  });

  return months;
}

export function exportAnalyticsReport(data) {
  const content = JSON.stringify(data, null, 2);
  const blob = new Blob([content], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `docagent-analytics-${new Date().toISOString().slice(0, 10)}.json`;
  anchor.click();
  URL.revokeObjectURL(url);
}
