import React, { useEffect, useMemo, useState } from "react";
import {
  deleteDocumentById,
  deleteUserById,
  fetchCurrentUser,
  fetchDashboardStats,
  fetchDocumentById,
  fetchDocuments,
  fetchHealth,
  fetchUsers,
  loginUser,
  logoutUser,
  registerUser,
  transferSuperAdmin,
  updateUserRole,
  uploadDocument,
} from "./api";
import Topbar from "./components/Topbar";
import DetailModal from "./components/DetailModal";
import CustomCursor from "./components/CustomCursor";
import Dashboard from "./pages/Dashboard";
import Upload from "./pages/Upload";
import Documents from "./pages/Documents";
import Analytics from "./pages/Analytics";
import Settings from "./pages/Settings";
import Activity from "./pages/Activity";
import Users from "./pages/Users";
import Login from "./pages/Login";
import { getNavItems, normalizeDetailPayload } from "./utils";

const SESSION_KEY = "docagent-session";

const PAGE_META = {
  dashboard: { title: "Dashboard", subtitle: "Portfolio command surface" },
  upload: { title: "Upload Document", subtitle: "Ingest, inspect, and route new legal material" },
  documents: { title: "All Documents", subtitle: "Searchable registry of analyzed legal files" },
  users: { title: "Users Management", subtitle: "Access control, role oversight, and ownership" },
  analytics: { title: "Risk Analytics", subtitle: "Exposure trends, category density, and portfolio motion" },
  activity: { title: "Activity Logs", subtitle: "Operational history across uploads, reviews, and admin actions" },
  settings: { title: "Settings", subtitle: "Workspace preferences and platform posture" },
};

function SidebarIcon({ itemKey }) {
  const common = {
    className: "exec-nav-icon",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "1.8",
    strokeLinecap: "round",
    strokeLinejoin: "round",
    "aria-hidden": "true",
  };

  if (itemKey === "dashboard") {
    return (
      <svg {...common}>
        <rect x="3" y="3" width="7" height="7" rx="2" />
        <rect x="14" y="3" width="7" height="5" rx="2" />
        <rect x="14" y="10" width="7" height="11" rx="2" />
        <rect x="3" y="14" width="7" height="7" rx="2" />
      </svg>
    );
  }
  if (itemKey === "documents") {
    return (
      <svg {...common}>
        <path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z" />
        <path d="M14 3v6h6" />
      </svg>
    );
  }
  if (itemKey === "upload") {
    return (
      <svg {...common}>
        <path d="M12 16V4" />
        <path d="m7 9 5-5 5 5" />
        <path d="M4 20h16" />
      </svg>
    );
  }
  if (itemKey === "users") {
    return (
      <svg {...common}>
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="3" />
        <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      </svg>
    );
  }
  if (itemKey === "analytics") {
    return (
      <svg {...common}>
        <path d="M3 3v18h18" />
        <path d="m7 14 3-3 3 2 4-5" />
      </svg>
    );
  }
  if (itemKey === "activity") {
    return (
      <svg {...common}>
        <path d="M22 12h-4l-3 7-4-14-3 7H2" />
      </svg>
    );
  }
  return (
    <svg {...common}>
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.6 1.6 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.6 1.6 0 0 0-1.8-.3" />
      <path d="M4.6 9a1.6 1.6 0 0 0-.3-1.8l-.1-.1a2 2 0 0 1 2.8-2.8l.1.1a1.6 1.6 0 0 0 1.8.3" />
    </svg>
  );
}

function App() {
  const [session, setSession] = useState(() => {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  });

  const [currentPage, setCurrentPage] = useState("dashboard");
  const [health, setHealth] = useState("Checking...");
  const [stats, setStats] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [uploadHistory, setUploadHistory] = useState([]);
  const [activityLog, setActivityLog] = useState([]);
  const [unreadNotifications, setUnreadNotifications] = useState(0);

  const [detailOpen, setDetailOpen] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState("");
  const [selectedDocument, setSelectedDocument] = useState(null);

  const [globalError, setGlobalError] = useState("");

  function addActivity(action, detail) {
    const now = Date.now();
    const item = {
      action,
      detail,
      created_at: now,
      time: new Date(now).toLocaleString(),
    };

    let added = false;
    setActivityLog((prev) => {
      const latest = prev[0];
      if (
        latest &&
        latest.action === action &&
        latest.detail === detail &&
        typeof latest.created_at === "number" &&
        now - latest.created_at < 5000
      ) {
        return prev;
      }
      added = true;
      return [item, ...prev];
    });
    if (added) {
      setUnreadNotifications((prev) => prev + 1);
    }
  }

  async function loadData() {
    if (!session?.user) return;

    setLoading(true);
    setGlobalError("");
    try {
      const [healthData, statsData, docsData] = await Promise.all([
        fetchHealth(),
        fetchDashboardStats(session.token),
        fetchDocuments(session.token),
      ]);
      setHealth(healthData?.status === "ok" ? "Online" : "Unknown");
      setStats(statsData);
      setDocuments(Array.isArray(docsData) ? docsData : []);

      if (session.user?.role === "admin" || session.user?.role === "super_admin") {
        const usersData = await fetchUsers(session.token);
        setUsers(Array.isArray(usersData) ? usersData : []);
      } else {
        setUsers([]);
      }
    } catch (err) {
      setHealth("Offline");
      setGlobalError(err.message || "Failed to load data");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    async function bootstrap() {
      try {
        const token = session?.token;
        const user = await fetchCurrentUser(token);
        setSession((prev) => ({
          token: prev?.token || token || "",
          user: {
            ...user,
            name: user.name || user.username || String(user.email || "User").split("@")[0],
          },
          remember: Boolean(prev?.remember),
        }));
      } catch {
        setSession(null);
        localStorage.removeItem(SESSION_KEY);
      }
    }
    bootstrap();
  }, []);

  useEffect(() => {
    loadData();
  }, [session?.token, session?.user?.role]);

  const navItems = useMemo(() => getNavItems(session?.user?.role), [session?.user?.role]);
  const isAdmin = session?.user?.role === "admin" || session?.user?.role === "super_admin";
  const isSuperAdmin = session?.user?.role === "super_admin";
  const allowedPages = useMemo(() => new Set(navItems.map((item) => item.key)), [navItems]);
  const pageMeta = PAGE_META[currentPage] || PAGE_META.dashboard;
  useEffect(() => {
    if (!allowedPages.has(currentPage)) {
      setCurrentPage("dashboard");
    }
  }, [allowedPages, currentPage]);

  useEffect(() => {
    if (!globalError) return;
    const timer = window.setTimeout(() => setGlobalError(""), 5000);
    return () => window.clearTimeout(timer);
  }, [globalError]);

  useEffect(() => {
    if (currentPage === "activity") {
      setUnreadNotifications(0);
    }
  }, [currentPage]);

  useEffect(() => {
    function handleShortcut(event) {
      const target = event.target;
      const isTyping =
        target instanceof HTMLElement &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.tagName === "SELECT" ||
          target.isContentEditable);

      if (isTyping) return;
      if (event.key.toLowerCase() === "u" && allowedPages.has("upload")) {
        event.preventDefault();
        setCurrentPage("upload");
      }
    }

    window.addEventListener("keydown", handleShortcut);
    return () => window.removeEventListener("keydown", handleShortcut);
  }, [allowedPages]);

  async function handleLogin(payload) {
    const email = String(payload.email || "").trim().toLowerCase();

    if (payload.mode === "register") {
      const registerResult = await registerUser({
        username: String(payload.username || "").trim(),
        email,
        password: payload.password,
        role: payload.role || "user",
        newAdminKey: payload.newAdminKey || "",
      });
      return {
        ...registerResult,
        justRegistered: true,
      };
    }

    const loginResult = await loginUser({
      identifier: payload.identifier,
      password: payload.password,
      turnstileToken: payload.turnstileToken,
    });
    const user = {
      ...loginResult.user,
      name: loginResult.user?.username || String(loginResult.user?.email || "User").split("@")[0],
    };
    const next = {
      token: loginResult.access_token || "",
      user,
      remember: payload.remember,
    };
    const deferSessionMs = Number(payload.deferSessionMs) || 0;
    if (deferSessionMs > 0) {
      await new Promise((resolve) => window.setTimeout(resolve, deferSessionMs));
    }
    setSession(next);
    if (payload.remember) {
      localStorage.setItem(
        SESSION_KEY,
        JSON.stringify({
          user: next.user,
          remember: true,
          token: "",
        }),
      );
    } else {
      localStorage.removeItem(SESSION_KEY);
    }
    addActivity("Login", `${user.email} signed in as ${user.role}`);
    return { justRegistered: false };
  }

  async function handleLogout() {
    try {
      await logoutUser();
    } catch {
      // Continue local cleanup even if backend logout fails.
    } finally {
      setSession(null);
      localStorage.removeItem(SESSION_KEY);
      setCurrentPage("dashboard");
      setStats(null);
      setDocuments([]);
      setUsers([]);
      setUploadHistory([]);
      setActivityLog([]);
      setUnreadNotifications(0);
    }
  }

  async function handleUpload(file) {
    setUploading(true);
    setGlobalError("");
    try {
      const result = await uploadDocument(file, session.token);
      setUploadHistory((prev) => [
        ...prev,
        {
          documentId: result.document_id || "",
          filename: result.filename || file.name,
          time: new Date().toLocaleString(),
        },
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
      const detail = await fetchDocumentById(docId, session.token);
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
      await deleteDocumentById(doc.id, session.token);
      addActivity("Delete Document", `Deleted ${doc.filename || doc.id}`);
      await loadData();
    } catch (err) {
      setGlobalError(err.message || "Delete failed");
      addActivity("Delete Failed", err.message || "Delete failed");
    }
  }

  async function handlePromoteUser(user) {
    if (!user?.id) return;
    try {
      await updateUserRole(user.id, "admin", session.token);
      addActivity("Role Updated", `Promoted ${user.email} to admin`);
      await loadData();
    } catch (err) {
      setGlobalError(err.message || "Failed to promote user");
      addActivity("Role Update Failed", err.message || "Failed to promote user");
    }
  }

  async function handleDemoteUser(user) {
    if (!user?.id) return;
    try {
      await updateUserRole(user.id, "user", session.token);
      addActivity("Role Updated", `Demoted ${user.email} to user`);
      await loadData();
    } catch (err) {
      setGlobalError(err.message || "Failed to demote user");
      addActivity("Role Update Failed", err.message || "Failed to demote user");
    }
  }

  async function handleDeleteUser(user) {
    if (!user?.id) return;
    const confirmed = window.confirm(`Delete user "${user.email}"?`);
    if (!confirmed) return;
    try {
      await deleteUserById(user.id, session.token);
      addActivity("User Deleted", `Deleted ${user.email}`);
      await loadData();
    } catch (err) {
      setGlobalError(err.message || "Failed to delete user");
      addActivity("User Delete Failed", err.message || "Failed to delete user");
    }
  }

  async function handleTransferSuperAdmin(user) {
    if (!user?.id) return;
    const confirmed = window.confirm(`Transfer super admin role to "${user.email}"?`);
    if (!confirmed) return;
    try {
      await transferSuperAdmin(user.id, session.token);
      addActivity("Role Transfer", `Transferred super admin to ${user.email}`);
      const refreshed = await fetchCurrentUser(session.token);
      setSession((prev) => ({
        ...(prev || {}),
        user: {
          ...refreshed,
          name: refreshed.name || refreshed.username || String(refreshed.email || "User").split("@")[0],
        },
      }));
      await loadData();
    } catch (err) {
      setGlobalError(err.message || "Failed to transfer super admin");
      addActivity("Role Transfer Failed", err.message || "Failed to transfer super admin");
    }
  }

  async function handleOpenUploadHistoryItem(item) {
    if (!item) return;
    setCurrentPage("documents");

    if (item.documentId) {
      await handleOpenDetails(item.documentId);
      return;
    }

    const matched = documents.find((doc) => doc.filename === item.filename);
    if (matched?.id) {
      await handleOpenDetails(matched.id);
      return;
    }

    try {
      const docsData = await fetchDocuments(session.token);
      const nextDocs = Array.isArray(docsData) ? docsData : [];
      setDocuments(nextDocs);
      const nextMatch = nextDocs.find((doc) => doc.filename === item.filename);
      if (nextMatch?.id) {
        await handleOpenDetails(nextMatch.id);
      } else {
        setGlobalError("Document not found in My Documents.");
      }
    } catch (err) {
      setGlobalError(err.message || "Failed to open document from history");
    }
  }

  function renderPage() {
    if (currentPage === "dashboard") {
      return (
        <Dashboard
          stats={stats}
          documents={documents}
          uploadHistory={uploadHistory}
          loading={loading}
          onNavigate={setCurrentPage}
          onQuickUpload={() => setCurrentPage("upload")}
          canUpload={allowedPages.has("upload")}
          isAdmin={isAdmin}
          onOpenDocument={handleOpenDetails}
        />
      );
    }

    if (currentPage === "upload") {
      return (
        <Upload
          uploading={uploading}
          onUpload={handleUpload}
          uploadHistory={uploadHistory}
          onOpenDocuments={() => setCurrentPage("documents")}
          onOpenHistoryItem={handleOpenUploadHistoryItem}
        />
      );
    }

    if (currentPage === "documents") {
      return <Documents documents={documents} loading={loading} onView={handleOpenDetails} onDelete={handleDeleteDocument} />;
    }

    if (currentPage === "users") {
      if (!isAdmin) {
        return (
          <section className="page-stack">
            <article className="hero-banner page-enter">
              <div className="ghost-word">TEAM</div>
              <div className="hero-banner-inner">
                <div className="hero-content">
                  <span className="hero-page-tag">Restricted Surface</span>
                  <h1 className="hero-headline">Access is limited for this workspace profile.</h1>
                  <p className="hero-desc">
                  This page is reserved for administrators with user-management privileges.
                  </p>
                </div>
              </div>
            </article>
          </section>
        );
      }
      return (
        <Users
          users={users}
          loading={loading}
          currentUser={session.user}
          canManageRoles={isSuperAdmin}
          onPromote={handlePromoteUser}
          onDemote={handleDemoteUser}
          onDeleteUser={handleDeleteUser}
          onTransferSuperAdmin={handleTransferSuperAdmin}
        />
      );
    }

    if (currentPage === "analytics") {
      return <Analytics stats={stats} documents={documents} />;
    }

    if (currentPage === "settings") {
      return <Settings user={session.user} />;
    }

    return <Activity items={activityLog} />;
  }

  if (!session) {
    return (
      <>
        <CustomCursor />
        <Login onLogin={handleLogin} />
      </>
    );
  }

  return (
    <>
      <CustomCursor />
      <div className="app-shell app-shell-light">
        <aside className="exec-sidebar">
          <div className="exec-brand">
            <div className="exec-brand-mark">DA</div>
            <div>
              <div className="exec-brand-name">DocAgent</div>
            </div>
          </div>

          <nav className="exec-sidebar-nav" aria-label="Primary navigation">
            {navItems.map((item) => (
              <button
                key={item.key}
                type="button"
                className={`exec-nav-item ${currentPage === item.key ? "is-active" : ""}`}
                onClick={() => setCurrentPage(item.key)}
              >
                <SidebarIcon itemKey={item.key} />
                <span>{item.label}</span>
              </button>
            ))}
          </nav>

          <div className="exec-sidebar-footer">
            <div className="exec-sidebar-status">
              <span className="exec-live-dot" aria-hidden="true" />
              {health}
            </div>
            <button type="button" className="exec-logout-btn" onClick={handleLogout}>
              Logout
            </button>
          </div>
        </aside>

        <div className="studio-main-shell">
          <Topbar
            title={pageMeta.title}
            subtitle={pageMeta.subtitle}
            backendHealth={health}
            user={session.user}
            onPrimaryAction={() => setCurrentPage(allowedPages.has("upload") ? "upload" : "documents")}
            onRefresh={loadData}
          />

          <main className="main-area">
            <div className="main-scroll">
              <div className="page-canvas">
                {globalError && <p className="error-banner">{globalError}</p>}
                <div key={currentPage} className="page-transition">
                  {renderPage()}
                </div>
              </div>
            </div>
          </main>
        </div>

        <DetailModal
          open={detailOpen}
          loading={detailLoading}
          error={detailError}
          document={selectedDocument}
          onClose={() => setDetailOpen(false)}
        />
      </div>
    </>
  );
}

export default App;
