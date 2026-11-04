import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { apiClient } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sessionError, setSessionError] = useState('');

  const logout = useCallback(() => {
    sessionStorage.removeItem('accessToken');
    setUser(null);
  }, []);

  const login = useCallback(async (email, password) => {
    const response = await apiClient.post('/api/auth/login', { email, password });
    const { token, user: authenticatedUser } = response.data.data;
    sessionStorage.setItem('accessToken', token);
    setUser(authenticatedUser);
    setSessionError('');
    return authenticatedUser;
  }, []);

  useEffect(() => {
    const token = sessionStorage.getItem('accessToken');
    if (!token) {
      setLoading(false);
      return;
    }

    apiClient.get('/api/auth/me')
      .then((response) => setUser(response.data.data))
      .catch((requestError) => {
        if ([401, 403].includes(requestError.response?.status)) {
          sessionStorage.removeItem('accessToken');
        }
        setUser(null);
        setSessionError(requestError.response?.data?.message || requestError.message || 'Could not verify the saved staff session.');
      })
      .finally(() => setLoading(false));
  }, []);

  const value = useMemo(
    () => ({ user, loading, login, logout, sessionError }),
    [user, loading, login, logout, sessionError]
  );
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider.');
  return context;
};
