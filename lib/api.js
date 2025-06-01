const BASE_URL = "http://3.75.238.30:5001";

function getToken() {
  if (typeof window !== "undefined") {
    return localStorage.getItem("accessToken") || localStorage.getItem("token");
  }
  return null;
}

async function apiFetch(
  endpoint,
  { method = "GET", body, headers = {}, ...options } = {}
) {
  const token = getToken();
  const config = {
    method,
    headers: {
      "Content-Type": "application/json",
      ...headers,
    },
    ...options,
  };
  if (token) {
    config.headers["Authorization"] = `Bearer ${token}`;
  }
  if (body) {
    config.body = JSON.stringify(body);
  }
  const res = await fetch(`${BASE_URL}${endpoint}`, config);
  const text = await res.text();
  if (!res.ok) {
    if (res.status === 401) {
      if (typeof window !== "undefined") {
        window.location.href = "/sign-in";
      }
      return;
    }
    let error = {};
    try {
      error = JSON.parse(text);
    } catch {}
    throw new Error(error.message || "API error");
  }
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

export const api = {
  get: (endpoint, options) => apiFetch(endpoint, { ...options, method: "GET" }),
  post: (endpoint, body, options) =>
    apiFetch(endpoint, { ...options, method: "POST", body }),
  patch: (endpoint, body, options) =>
    apiFetch(endpoint, { ...options, method: "PATCH", body }),
  delete: (endpoint, options) =>
    apiFetch(endpoint, { ...options, method: "DELETE" }),
};
