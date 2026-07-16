import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: { 'Content-Type': 'application/json' },
});

let accessToken = null;
let refreshPromise = null;

export const setAccessToken = (token) => {
  accessToken = token;
};

export const getAccessToken = () => accessToken;

api.interceptors.request.use((config) => {
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;
    if (error.response?.status === 401 && !original._retry) {
      original._retry = true;
      try {
        if (!refreshPromise) {
          const refreshToken = localStorage.getItem('az-refresh');
          refreshPromise = axios.post(
            `${import.meta.env.VITE_API_URL || '/api'}/auth/refresh`,
            { refreshToken }
          );
        }
        const { data } = await refreshPromise;
        refreshPromise = null;
        accessToken = data.data.accessToken;
        localStorage.setItem('az-refresh', data.data.refreshToken);
        original.headers.Authorization = `Bearer ${accessToken}`;
        return api(original);
      } catch {
        refreshPromise = null;
        accessToken = null;
        localStorage.removeItem('az-refresh');
        window.location.href = '/login';
        return Promise.reject(error);
      }
    }
    return Promise.reject(error);
  }
);

export default api;
