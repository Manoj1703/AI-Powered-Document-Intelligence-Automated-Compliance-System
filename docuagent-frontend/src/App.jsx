import React, { useEffect, useMemo, useState } from "react";
import {
  deleteDocumentById,
  fetchDashboardStats,
  fetchDocumentById,
  fetchDocuments,
  fetchHealth,
  uploadDocument,
} from "./api";
import Sidebar from "./components/Sidebar";
import Topbar from "./components/Topbar";
import DetailModal from "./components/DetailModal";
import Dashboard from "./pages/Dashboard";
import Upload from "./pages/Upload";
import Documents from "./pages/Documents";
import Analytics from "./pages/Analytics";
import Settings from "./pages/Settings";
import Activity from "./pages/Activity";
import Login from "./pages/Login";
import { NAV_ITEMS, normalizeDetailPayload } from "./utils";

const SESSION_KEY = "docagent-session";
const THEME_KEY = "docagent-theme";

function App() {
  const [theme, setTheme] = useState(() => localStorage.getItem(THEME_KEY) || "dark");
  const [session, setSession] = useState(() => {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  });

  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [currentPage, setCurrentPage] = useState("dashboard");

  const [health, setHealth] = useState("Checking...");
  const [stats, setStats] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [uploadHistory, setUploadHistory] = useState([]);
  const [activityLog, setActivityLog] = useState([]);

  const [detailOpen, setDetailOpen] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState("");
  const [selectedDocument, setSelectedDocument] = useState(null);

  const [globalError, setGlobalError] = useState("");

  function addActivity(action, detail) {
    setActivityLog((prev) => [
      {
        action,
        detail,
        time: new Date().toLocaleString(),
      },
      ...prev,
    ]);
  }

  async function loadData() {
    if (!session) return;

    setLoading(true);
    setGlobalError("");
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
      setGlobalError(err.message || "Failed to load data");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    document.body.setAttribute("data-theme", theme);
    localStorage.setItem(THEME_KEY, theme);
  }, [theme]);

  useEffect(() => {
    loadData();
  }, [session]);

  const notificationCount = useMemo(() => activityLog.slice(0, 5).length, [activityLog]);

  function handleLogin(payload) {
    const next = {
      name: payload.name,
      email: payload.email,
      role: payload.role,
      remember: payload.remember,
    };
    setSession(next);
    if (payload.remember) localStorage.setItem(SESSION_KEY, JSON.stringify(next));
    addActivity("Login", `${payload.email} signed in as ${payload.role}`);
  }

  function handleLogout() {
    setSession(null);
    localStorage.removeItem(SESSION_KEY);
    setCurrentPage("dashboard");
    setStats(null);
    setDocuments([]);
    setUploadHistory([]);
    setActivityLog([]);
  }

  async function handleUpload(file) {
    setUploading(true);
    setGlobalError("");
    try {
      const result = await uploadDocument(file);
      setUploadHistory((prev) => [
        {
          filename: result.filename || file.name,
          time: new Date().toLocaleString(),
        },
        ...prev,
      ]);
      addActivity("Upload", `Uploaded ${result.filename || file.name}`);
      await loadData();
    } catch (err) {
      setGlobalError(err.message || "Upload failed");
      addActivity("Upload Failed", err.message || "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  async function handleOpenDetails(docId) {
    setDetailOpen(true);
    setDetailLoading(true);
    setDetailError("");
    setSelectedDocument(null);

    try {
      const detail = await fetchDocumentById(docId);
      setSelectedDocument(normalizeDetailPayload(detail));
      addActivity("Inspect Document", `Opened detail view for ${docId}`);
    } catch (err) {
      setDetailError(err.message || "Failed to load document detail");
    } finally {
      setDetailLoading(false);
    }
  }

  async function handleDeleteDocument(doc) {
    if (!doc?.id) return;
    const confirmed = window.confirm(`Delete "${doc.filename || "this document"}"?`);
    if (!confirmed) return;

    try {
      await deleteDocumentById(doc.id);
      addActivity("Delete Document", `Deleted ${doc.filename || doc.id}`);
      await loadData();
    } catch (err) {
      setGlobalError(err.message || "Delete failed");
      addActivity("Delete Failed", err.message || "Delete failed");
    }
  }

  function renderPage() {
    if (currentPage === "dashboard") {
      return (
        <Dashboard
          stats={stats}
          documents={documents}
          onNavigate={setCurrentPage}
          onQuickUpload={() => setCurrentPage("upload")}
        />
      );
    }

    if (currentPage === "upload") {
      return <Upload uploading={uploading} onUpload={handleUpload} uploadHistory={uploadHistory} />;
    }

    if (currentPage === "documents") {
      return (
        <Documents
          documents={documents}
          loading={loading}
          onView={handleOpenDetails}
          onDelete={handleDeleteDocument}
        />
      );
    }

    if (currentPage === "analytics") {
      return <Analytics stats={stats} documents={documents} />;
    }

    if (currentPage === "settings") {
      return <Settings theme={theme} onThemeToggle={() => setTheme((p) => (p === "dark" ? "light" : "dark"))} user={session} />;
    }

    return <Activity items={activityLog} />;
  }

  if (!session) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <div className="app-shell">
      <Sidebar
        items={NAV_ITEMS}
        currentPage={currentPage}
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed((prev) => !prev)}
        onNavigate={setCurrentPage}
        onLogout={handleLogout}
      />

      <div className="content-shell">
        <Topbar
          theme={theme}
          onThemeToggle={() => setTheme((prev) => (prev === "dark" ? "light" : "dark"))}
          backendHealth={health}
          user={session}
          notifications={notificationCount}
        />

        {globalError && <p className="error-banner">{globalError}</p>}
        {renderPage()}
      </div>

      <DetailModal
        open={detailOpen}
        loading={detailLoading}
        error={detailError}
        document={selectedDocument}
        onClose={() => setDetailOpen(false)}
      />
    </div>
  );
}

export default App;
