const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8002";
export async function fetchHealth() {
  const response = await fetch(`${API_BASE_URL}/`);
  if (!response.ok) {
    throw new Error(`Health API failed: ${response.status}`);
  }
  return response.json();
}
export async function fetchDashboardStats() {
  const response = await fetch(`${API_BASE_URL}/api/dashboard/stats`);
  if (!response.ok) {
    throw new Error(`Dashboard API failed: ${response.status}`);
  }
  return response.json();
}

export async function fetchDocuments() {
  const response = await fetch(`${API_BASE_URL}/api/documents`);
  if (!response.ok) {
    throw new Error(`Documents API failed: ${response.status}`);
  }
  return response.json();
}

export async function uploadDocument(file) {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(`${API_BASE_URL}/api/upload`, {
    method: "POST",
    body: formData,
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.detail || `Upload failed: ${response.status}`);
  }

  return data;
}

export async function fetchDocumentById(docId) {
  const response = await fetch(`${API_BASE_URL}/api/documents/${docId}`);
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.detail || `Document detail API failed: ${response.status}`);
  }
  return data;
}

export async function deleteDocumentById(docId) {
  const response = await fetch(`${API_BASE_URL}/api/documents/${docId}`, {
    method: "DELETE",
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.detail || `Delete API failed: ${response.status}`);
  }
  return data;
}
