// SANCTUM API Client Configuration
// Supports:
// 1. VITE_API_URL environment variable at build time (e.g. https://sanctum-api.onrender.com)
// 2. LocalStorage override ('sanctum_api_url') for dynamic configuration
// 3. Relative path fallback ('') for same-origin proxy

const ENV_API_URL = (import.meta.env.VITE_API_URL as string) || '';

export const getApiBaseUrl = (): string => {
  if (typeof window !== 'undefined') {
    const custom = localStorage.getItem('sanctum_api_url');
    if (custom && custom.trim()) {
      return custom.trim().replace(/\/+$/, '');
    }
  }
  return ENV_API_URL.replace(/\/+$/, '');
};

export const setCustomApiUrl = (url: string) => {
  if (typeof window !== 'undefined') {
    if (!url) {
      localStorage.removeItem('sanctum_api_url');
    } else {
      localStorage.setItem('sanctum_api_url', url.trim().replace(/\/+$/, ''));
    }
  }
};

export const apiUrl = (endpoint: string): string => {
  if (endpoint.startsWith('http://') || endpoint.startsWith('https://')) {
    return endpoint;
  }
  const base = getApiBaseUrl();
  const cleanPath = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  return `${base}${cleanPath}`;
};

export const apiFetch = (endpoint: string, init?: RequestInit): Promise<Response> => {
  return fetch(apiUrl(endpoint), init);
};
