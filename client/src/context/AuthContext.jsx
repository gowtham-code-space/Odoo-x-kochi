import React, { createContext, useState, useEffect, useCallback } from 'react';
import { getMe, login as apiLogin, register as apiRegister, logout as apiLogout } from '../services/auth.service.js';

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const checkAuth = useCallback(async () => {
    try {
      const currentUser = await getMe();
      setUser(currentUser);
    } catch {
      // Offline demo state is allowed only when it is deliberately enabled.
      const cached = sessionStorage.getItem('nexus_user');
      if (import.meta.env.VITE_DEMO_MODE === 'true' && cached) {
        try {
          setUser(JSON.parse(cached));
        } catch {
          setUser(null);
        }
      } else {
        setUser(null);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    checkAuth();

    const handleAuthExpired = () => {
      sessionStorage.removeItem('nexus_user');
      setUser(null);
    };

    window.addEventListener('auth:expired', handleAuthExpired);
    return () => window.removeEventListener('auth:expired', handleAuthExpired);
  }, [checkAuth]);

  const login = async (credentials) => {
    try {
      const loggedInUser = await apiLogin(credentials);
      setUser(loggedInUser);
      sessionStorage.setItem('nexus_user', JSON.stringify(loggedInUser));
      return loggedInUser;
    } catch (err) {
      if (import.meta.env.VITE_DEMO_MODE === 'true' && (!err.response || err.code === 'ERR_NETWORK' || err.response?.status >= 500)) {
        console.warn('Development demo mode is enabled; no account was authenticated by the server.');
        const fallbackUser = {
          id: 'usr_demo_882',
          name: credentials.email.includes('admin') ? 'Arjun Menon' : 'Priya Sharma',
          email: credentials.email || 'demo@nexus.io',
          role: credentials.email.includes('staff') ? 'STAFF' : 'ADMIN',
          isDemo: true,
          createdAt: new Date().toISOString(),
        };
        setUser(fallbackUser);
        sessionStorage.setItem('nexus_user', JSON.stringify(fallbackUser));
        return fallbackUser;
      }
      throw err;
    }
  };

  const register = async (data) => {
    try {
      const newUser = await apiRegister(data);
      setUser(newUser);
      sessionStorage.setItem('nexus_user', JSON.stringify(newUser));
      return newUser;
    } catch (err) {
      if (import.meta.env.VITE_DEMO_MODE === 'true' && (!err.response || err.code === 'ERR_NETWORK' || err.response?.status >= 500)) {
        console.warn('Development demo mode is enabled; registration was not saved to the server.');
        const fallbackUser = {
          id: 'usr_' + Math.random().toString(36).substring(2, 9),
          name: data.name || 'New Engineer',
          email: data.email,
          role: 'ADMIN',
          isDemo: true,
          createdAt: new Date().toISOString(),
        };
        setUser(fallbackUser);
        sessionStorage.setItem('nexus_user', JSON.stringify(fallbackUser));
        return fallbackUser;
      }
      throw err;
    }
  };

  const logout = async () => {
    try {
      await apiLogout();
    } catch {
      // ignore network errors on logout
    } finally {
      sessionStorage.removeItem('nexus_user');
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        loading,
        login,
        register,
        logout,
        refreshUser: checkAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
