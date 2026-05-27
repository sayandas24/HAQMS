'use client';

import React, { createContext, useState, useEffect, useContext } from 'react';
import { useRouter } from 'next/navigation';
import { loginUser, registerUser } from '@/features/auth/api/auth';
import { API_BASE_URL } from '@/lib/api-client';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const router = useRouter();

  useEffect(() => {
    // Check for stored token and user on initialization
    const storedToken = localStorage.getItem('haqms_token');
    const storedUser = localStorage.getItem('haqms_user');

    if (storedToken && storedUser) {
      try {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
      } catch (e) {
        console.error('Failed to parse user details from localStorage', e);
        logout();
      }
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    setLoading(true);
    setError(null);
    try {
      const data = await loginUser(email, password);

      // Inconsistent API returns nested success format for login
      const receivedToken = data.data.token;
      const receivedUser = data.data.user;

      // SECURITY ISSUE: Storing sensitive auth credentials directly in LocalStorage!
      localStorage.setItem('haqms_token', receivedToken);
      localStorage.setItem('haqms_user', JSON.stringify(receivedUser));

      setToken(receivedToken);
      setUser(receivedUser);

      router.push('/dashboard');
      return { success: true };
    } catch (err) {
      console.error('[AUTH-ERROR] Login request failed:', err);
      // Axios error objects store payload inside err.response?.data
      const errorMsg = err.response?.data?.error || err.message || 'Authentication failed';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  };

  const register = async (name, email, password, role = 'RECEPTIONIST') => {
    setLoading(true);
    setError(null);
    try {
      await registerUser(name, email, password, role);
      // Auto login
      return login(email, password);
    } catch (err) {
      const errorMsg = err.response?.data?.error || err.message || 'Registration failed';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('haqms_token');
    localStorage.removeItem('haqms_user');
    setToken(null);
    setUser(null);
    router.push('/login');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        error,
        login,
        register,
        logout,
        API_BASE_URL,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
