import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import api, { setAccessToken, getAccessToken } from '../config/axios';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchMe = useCallback(async () => {
    try {
      const { data } = await api.get('/auth/me');
      setUser(data.data);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const refreshToken = localStorage.getItem('az-refresh');
    if (refreshToken) {
      api.post('/auth/refresh', { refreshToken })
        .then(({ data }) => {
          setAccessToken(data.data.accessToken);
          localStorage.setItem('az-refresh', data.data.refreshToken);
          return fetchMe();
        })
        .catch(() => {
          localStorage.removeItem('az-refresh');
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, [fetchMe]);

  const login = useCallback(async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password });
    setAccessToken(data.data.accessToken);
    localStorage.setItem('az-refresh', data.data.refreshToken);
    setUser(data.data.user);
    return data.data.user;
  }, []);

  const register = useCallback(async (payload) => {
    const { data } = await api.post('/auth/register', payload);
    setAccessToken(data.data.accessToken);
    localStorage.setItem('az-refresh', data.data.refreshToken);
    setUser(data.data.user);
    return data.data.user;
  }, []);

  const logout = useCallback(async () => {
    try {
      const refreshToken = localStorage.getItem('az-refresh');
      if (refreshToken) {
        await api.post('/auth/logout', { refreshToken });
      }
    } catch {
      // ignore logout errors
    } finally {
      setAccessToken(null);
      localStorage.removeItem('az-refresh');
      setUser(null);
    }
  }, []);

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin',
    isStaff: user?.role === 'staff',
    isUser: user?.role === 'user',
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
