const BASE_URL = "http://localhost:5001";

function getToken() {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('token');
  }
  return null;
}

async function apiFetch(endpoint, { method = 'GET', body, headers = {}, ...options } = {}) {
  const token = getToken();
  const config = {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
    ...options,
  };
  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`;
  }
  if (body) {
    config.body = JSON.stringify(body);
  }
  const res = await fetch(`${BASE_URL}${endpoint}`, config);
  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.message || 'API error');
  }
  if (res.status === 204) return null;
  return res.json();
}

export const api = {
  get: (endpoint, options) => apiFetch(endpoint, { ...options, method: 'GET' }),
  post: (endpoint, body, options) => apiFetch(endpoint, { ...options, method: 'POST', body }),
  patch: (endpoint, body, options) => apiFetch(endpoint, { ...options, method: 'PATCH', body }),
  delete: (endpoint, options) => apiFetch(endpoint, { ...options, method: 'DELETE' }),
}; 