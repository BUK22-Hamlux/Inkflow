const API_BASE_URL = "http://localhost:5000/api";
const TOKEN_KEY = "inkflow_token";

const post = async (path, body) => {
  let response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
  } catch {
    throw new Error("Cannot reach Inkflow. Check that the backend is running.");
  }

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.error || "Authentication failed.");
  }
  return data;
};

export const register = (credentials) => post("/auth/register", credentials);
export const login = (credentials) => post("/auth/login", credentials);
export const saveToken = (token) => localStorage.setItem(TOKEN_KEY, token);
export const getToken = () => localStorage.getItem(TOKEN_KEY);
export const removeToken = () => localStorage.removeItem(TOKEN_KEY);
