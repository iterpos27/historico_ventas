const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

export const tokenStorageKey = 'ventas_token';

export const apiRequest = async (path, options = {}) => {
  const token = localStorage.getItem(tokenStorageKey);
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers
    }
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.message || 'Error en la solicitud');
  }
  return data;
};

export const api = {
  get: (path) => apiRequest(path),
  post: (path, body) => apiRequest(path, { method: 'POST', body: JSON.stringify(body) }),
  put: (path, body) => apiRequest(path, { method: 'PUT', body: JSON.stringify(body) }),
  patch: (path, body = {}) => apiRequest(path, { method: 'PATCH', body: JSON.stringify(body) })
};
