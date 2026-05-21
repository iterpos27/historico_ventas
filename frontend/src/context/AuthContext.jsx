import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { api, authExpiredEvent, tokenStorageKey } from '../api/client';

const AuthContext = createContext(null);

const getTokenExpirationMs = (token) => {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.exp ? payload.exp * 1000 : null;
  } catch {
    return null;
  }
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem(tokenStorageKey);
    if (!token) {
      setLoading(false);
      return;
    }

    const expiresAt = getTokenExpirationMs(token);
    if (expiresAt && expiresAt <= Date.now()) {
      localStorage.removeItem(tokenStorageKey);
      setLoading(false);
      return;
    }

    api.get('/me')
      .then(setUser)
      .catch(() => localStorage.removeItem(tokenStorageKey))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const closeExpiredSession = () => {
      localStorage.removeItem(tokenStorageKey);
      setUser(null);
    };

    window.addEventListener(authExpiredEvent, closeExpiredSession);
    return () => window.removeEventListener(authExpiredEvent, closeExpiredSession);
  }, []);

  useEffect(() => {
    const token = localStorage.getItem(tokenStorageKey);
    if (!token || !user) return undefined;

    const expiresAt = getTokenExpirationMs(token);
    if (!expiresAt) return undefined;

    const timeout = window.setTimeout(() => {
      localStorage.removeItem(tokenStorageKey);
      setUser(null);
    }, Math.max(expiresAt - Date.now(), 0));

    return () => window.clearTimeout(timeout);
  }, [user]);

  const login = async (email, password) => {
    const data = await api.post('/auth/login', { email, password });
    localStorage.setItem(tokenStorageKey, data.token);
    setUser(data.user);
  };

  const logout = () => {
    localStorage.removeItem(tokenStorageKey);
    setUser(null);
  };

  const value = useMemo(() => ({ user, loading, login, logout }), [user, loading]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
