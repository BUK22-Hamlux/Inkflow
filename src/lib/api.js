const API_BASE_URL = "http://localhost:5000/api";
const TOKEN_KEY = "inkflow_token";

const request = async (path, { method = "GET", body, authenticated = false } = {}) => {
  let response;
  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), 15000);
  try {
    const headers = {};
    if (body !== undefined) headers["Content-Type"] = "application/json";
    if (authenticated) {
      const token = getToken();
      if (!token) throw new Error("Please sign in to access your account documents.");
      headers.Authorization = `Bearer ${token}`;
    }

    response = await fetch(`${API_BASE_URL}${path}`, {
      method,
      headers,
      signal: controller.signal,
      ...(body === undefined ? {} : { body: JSON.stringify(body) }),
    });
  } catch (error) {
    if (error instanceof Error && error.message.startsWith("Please sign in")) {
      throw error;
    }
    throw new Error("Cannot reach Inkflow. Check that the backend is running.");
  } finally {
    window.clearTimeout(timeout);
  }

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error(data.error || "The request could not be completed.");
    error.status = response.status;
    error.data = data;
    throw error;
  }
  return data;
};

export const register = (credentials) =>
  request("/auth/register", { method: "POST", body: credentials });
export const login = (credentials) =>
  request("/auth/login", { method: "POST", body: credentials });

export const listAccountDocuments = async () => {
  const data = await request("/documents", { authenticated: true });
  return data.documents;
};

export const createAccountDocument = async (document) => {
  const data = await request("/documents", {
    method: "POST",
    body: document,
    authenticated: true,
  });
  return data.document;
};

export const getAccountDocument = async (id) => {
  const data = await request(`/documents/${encodeURIComponent(id)}`, {
    authenticated: true,
  });
  return data.document;
};

export const saveAccountDocument = async (id, document) => {
  const data = await request(`/documents/${encodeURIComponent(id)}`, {
    method: "PUT",
    body: document,
    authenticated: true,
  });
  return data.document;
};

export const syncAccountDocument = async (document) => {
  const data = await request("/documents/sync", {
    method: "POST",
    body: document,
    authenticated: true,
  });
  return data.document;
};

export const deleteAccountDocument = (id, options = {}) =>
  request(`/documents/${encodeURIComponent(id)}`, {
    method: "DELETE",
    body: options,
    authenticated: true,
  });

export const saveToken = (token) => localStorage.setItem(TOKEN_KEY, token);
export const getToken = () => localStorage.getItem(TOKEN_KEY);
export const removeToken = () => localStorage.removeItem(TOKEN_KEY);
