const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8003";
const FALLBACK_API_BASE_URL = API_BASE_URL.includes("localhost")
  ? API_BASE_URL.replace("localhost", "127.0.0.1")
  : API_BASE_URL.includes("127.0.0.1")
    ? API_BASE_URL.replace("127.0.0.1", "localhost")
    : "";

function authHeaders(token) {
  return token ? { Authorization: `Bearer ${token}` } : {};
}

function _networkError(baseUrl) {
  const port = (() => {
    try {
      return new URL(baseUrl).port || "default";
    } catch {
      return "configured";
    }
  })();
  return new Error(
    `Cannot reach backend at ${baseUrl}. Start backend on port ${port} and verify DNS/network connectivity.`,
  );
}

async function _tryFetch(baseUrl, path, options = {}) {
  try {
    return await fetch(`${baseUrl}${path}`, {
      credentials: "include",
      ...options,
    });
  } catch {
    throw _networkError(baseUrl);
  }
}

async function apiFetch(path, options = {}) {
  try {
    return await _tryFetch(API_BASE_URL, path, options);
  } catch (err) {
    if (!FALLBACK_API_BASE_URL || FALLBACK_API_BASE_URL === API_BASE_URL) throw err;
    return _tryFetch(FALLBACK_API_BASE_URL, path, options);
  }
}

async function authFetch(path, token, options = {}) {
  const headers = { ...(options.headers || {}), ...authHeaders(token) };
  const response = await apiFetch(path, { ...options, headers });
  if (response.status === 401 && token) {
    // Retry once without Authorization header so cookie auth can take precedence.
    return apiFetch(path, options);
  }
  return response;
}

function toErrorMessage(data, fallbackPrefix, status) {
  const detail = data?.detail;
  if (typeof detail === "string" && detail.trim()) return detail;
  if (Array.isArray(detail) && detail.length > 0) {
    const parts = detail
      .map((item) => {
        if (typeof item === "string") return item;
        if (item && typeof item === "object") {
          const field = Array.isArray(item.loc) ? item.loc.slice(1).join(".") : "";
          const msg = item.msg || "";
          return field ? `${field}: ${msg}` : msg;
        }
        return "";
      })
      .filter(Boolean);
    if (parts.length > 0) return parts.join("; ");
  }
  if (detail && typeof detail === "object") return JSON.stringify(detail);
  return `${fallbackPrefix}: ${status}`;
}

async function parseOrThrow(response, fallbackPrefix) {
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(toErrorMessage(data, fallbackPrefix, response.status));
  }
  return data;
}

export async function fetchHealth() {
  const response = await apiFetch("/");
  return parseOrThrow(response, "Health API failed");
}

export async function fetchSignupMeta() {
  const response = await apiFetch("/api/auth/signup-meta");
  return parseOrThrow(response, "Signup meta failed");
}

export async function registerUser({ username, email, password, role, adminKey, newAdminKey }) {
  const payload = { username, email, password, role };
  if (adminKey && String(adminKey).trim()) payload.admin_key = String(adminKey).trim();
  if (newAdminKey && String(newAdminKey).trim()) payload.new_admin_key = String(newAdminKey).trim();
  const response = await apiFetch("/api/auth/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return parseOrThrow(response, "Register failed");
}

export async function loginUser({ identifier, password }) {
  const response = await apiFetch("/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ identifier, password }),
  });
  return parseOrThrow(response, "Login failed");
}

export async function fetchCurrentUser(token) {
  const response = await authFetch("/api/auth/me", token);
  return parseOrThrow(response, "Auth check failed");
}

export async function fetchDashboardStats(token) {
  const response = await authFetch("/api/dashboard/stats", token);
  return parseOrThrow(response, "Dashboard API failed");
}

export async function fetchDocuments(token) {
  const response = await authFetch("/api/documents", token);
  return parseOrThrow(response, "Documents API failed");
}

export async function fetchUsers(token) {
  const response = await authFetch("/api/users", token);
  return parseOrThrow(response, "Users API failed");
}

export async function uploadDocument(file, token) {
  const formData = new FormData();
  formData.append("file", file);

  const response = await authFetch("/api/upload", token, {
    method: "POST",
    body: formData,
  });

  return parseOrThrow(response, "Upload failed");
}

export async function fetchDocumentById(docId, token) {
  const response = await authFetch(`/api/documents/${docId}`, token);
  return parseOrThrow(response, "Document detail API failed");
}

export async function deleteDocumentById(docId, token) {
  const response = await authFetch(`/api/documents/${docId}`, token, {
    method: "DELETE",
  });
  return parseOrThrow(response, "Delete API failed");
}

export async function logoutUser() {
  const response = await apiFetch("/api/auth/logout", { method: "POST" });
  return parseOrThrow(response, "Logout failed");
}
