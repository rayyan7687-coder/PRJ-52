const API_BASE = (import.meta.env && import.meta.env.VITE_API_URL)
  ? `${import.meta.env.VITE_API_URL.replace(/\/$/, '')}/api/v1`
  : '/api/v1';

let isRefreshing = false;

export const apiFetch = async (endpoint, options = {}) => {
  let token = localStorage.getItem('token');
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  let response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  // Handle 401 Unauthorized with token refresh mechanism
  if (response.status === 401 && !options._isRetry && !isRefreshing) {
    const refreshToken = localStorage.getItem('refreshToken');
    if (refreshToken && endpoint !== '/auth/login' && endpoint !== '/auth/refresh') {
      isRefreshing = true;
      try {
        const refreshResponse = await fetch(`${API_BASE}/auth/refresh`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refresh_token: refreshToken }),
        });

        if (refreshResponse.ok) {
          const data = await refreshResponse.json();
          localStorage.setItem('token', data.access_token);
          if (data.refresh_token) {
            localStorage.setItem('refreshToken', data.refresh_token);
          }
          token = data.access_token;
          headers['Authorization'] = `Bearer ${token}`;
          isRefreshing = false;

          // Retry original request
          response = await fetch(`${API_BASE}${endpoint}`, {
            ...options,
            _isRetry: true,
            headers,
          });
        } else {
          isRefreshing = false;
          localStorage.removeItem('token');
          localStorage.removeItem('refreshToken');
        }
      } catch (err) {
        isRefreshing = false;
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
      }
    }
  }

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ detail: 'An error occurred' }));
    throw new Error(errorData.detail || `Error ${response.status}`);
  }

  if (response.status === 204) return null;
  return response.json();
};
