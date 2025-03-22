// frontend/src/context/AuthContext.js
import React, { createContext, useState, useEffect, useContext } from 'react';
import { authAPI } from '../api/api';

// إنشاء السياق
const AuthContext = createContext();

// مزود السياق
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // التحقق من حالة المصادقة عند تحميل التطبيق
  useEffect(() => {
    const loadUser = async () => {
      if (token) {
        try {
          const res = await authAPI.getMe();
          setUser(res.data.user);
        } catch (err) {
          console.error('خطأ في تحميل بيانات المستخدم:', err);
          localStorage.removeItem('token');
          setToken(null);
          setUser(null);
        }
      }
      setLoading(false);
    };

    loadUser();
  }, [token]);

  // تسجيل مستخدم جديد
  const register = async (username, password) => {
    try {
      setError(null);
      const res = await authAPI.register({ username, password });
      localStorage.setItem('token', res.data.token);
      setToken(res.data.token);
      setUser(res.data.user);
      return res.data;
    } catch (err) {
      setError(err.response?.data?.message || 'حدث خطأ في التسجيل');
      throw err;
    }
  };

  // تسجيل الدخول
  const login = async (username, password) => {
    try {
      setError(null);
      const res = await authAPI.login({ username, password });
      localStorage.setItem('token', res.data.token);
      setToken(res.data.token);
      setUser(res.data.user);
      return res.data;
    } catch (err) {
      setError(err.response?.data?.message || 'خطأ في تسجيل الدخول');
      throw err;
    }
  };

  // تسجيل الخروج
  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  };

  // قيم السياق
  const value = {
    user,
    token,
    loading,
    error,
    register,
    login,
    logout,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// تصدير أداة استعمال السياق
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth يجب استخدامه داخل AuthProvider');
  }
  return context;
};