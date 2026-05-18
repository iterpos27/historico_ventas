import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { api, tokenStorageKey } from '../api/client';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem(tokenStorageKey);
    if (!token) {
      setLoading(false);
      return;
    }
    api.get('/me')
      .then(setUser)
      .catch(() => localStorage.removeItem(tokenStorageKey))
      .finally(() => setLoading(false));
  }, []);

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
