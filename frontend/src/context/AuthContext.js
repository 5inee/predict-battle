import { createContext, useState, useEffect, useContext, useCallback } from 'react';
import { useRouter } from 'next/router';
import api, { apiService } from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [initialized, setInitialized] = useState(false);
  const [isGuest, setIsGuest] = useState(false);
  const router = useRouter();

  // تحميل المستخدم من التخزين المحلي عند تحميل الصفحة
  useEffect(() => {
    const initAuth = async () => {
      try {
        // تأكد من تنفيذ هذا فقط في المتصفح
        if (typeof window === 'undefined') {
          setLoading(false);
          setInitialized(true);
          return;
        }

        const storedUser = localStorage.getItem('user');
        const storedToken = localStorage.getItem('token');
        const storedGuest = localStorage.getItem('guest');

        if (storedGuest) {
          // استعادة بيانات المستخدم الضيف
          setUser(JSON.parse(storedGuest));
          setIsGuest(true);
        } else if (storedUser && storedToken) {
          setUser(JSON.parse(storedUser));
          setToken(storedToken);
          setIsGuest(false);
          api.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
          
          // التحقق من صحة التوكن (اختياري)
          try {
            await apiService.auth.getProfile();
          } catch (err) {
            // إذا كان هناك خطأ في الطلب، قم بتسجيل الخروج تلقائيًا
            if (err.response?.status === 401) {
              logout();
              setError('انتهت صلاحية الجلسة. الرجاء تسجيل الدخول مرة أخرى.');
            }
          }
        }

        setLoading(false);
        setInitialized(true);
      } catch (err) {
        console.error('Error initializing auth:', err);
        setLoading(false);
        setInitialized(true);
      }
    };

    initAuth();
  }, []);

  // دالة محسنة لتسجيل الدخول
  const login = useCallback(async (username, password) => {
    try {
      setError(null);
      const data = await apiService.auth.login(username, password);
      
      const { token, user } = data;
      
      localStorage.removeItem('guest');
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      
      setUser(user);
      setToken(token);
      setIsGuest(false);
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      router.push('/sessions');
      return true;
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'حدث خطأ أثناء تسجيل الدخول';
      setError(errorMessage);
      return false;
    }
  }, [router]);

  // دالة محسنة للتسجيل
  const register = useCallback(async (username, password) => {
    try {
      setError(null);
      const data = await apiService.auth.register(username, password);
      
      const { token, user } = data;
      
      localStorage.removeItem('guest');
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      
      setUser(user);
      setToken(token);
      setIsGuest(false);
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      router.push('/sessions');
      return true;
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'حدث خطأ أثناء إنشاء الحساب';
      setError(errorMessage);
      return false;
    }
  }, [router]);

  // دالة جديدة للدخول كضيف
  const loginAsGuest = useCallback((guestName) => {
    try {
      if (!guestName || guestName.trim() === '') {
        setError('الرجاء إدخال اسمك');
        return false;
      }

      const guestUser = {
        id: `guest-${Date.now()}`,
        username: guestName.trim(),
        isGuest: true
      };

      // حفظ بيانات الضيف في التخزين المحلي
      localStorage.setItem('guest', JSON.stringify(guestUser));
      
      // إزالة أي بيانات مستخدم سابقة
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      delete api.defaults.headers.common['Authorization'];

      setUser(guestUser);
      setToken(null);
      setIsGuest(true);
      
      router.push('/sessions');
      return true;
    } catch (err) {
      console.error('Error logging in as guest:', err);
      setError('حدث خطأ أثناء الدخول كضيف');
      return false;
    }
  }, [router]);

  // دالة محسنة لتسجيل الخروج
  const logout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('guest');
    
    setUser(null);
    setToken(null);
    setIsGuest(false);
    delete api.defaults.headers.common['Authorization'];
    
    router.push('/');
  }, [router]);

  // تحقق ما إذا كان المستخدم قد قام بتسجيل الدخول
  const isAuthenticated = useCallback(() => {
    return !!token || isGuest;
  }, [token, isGuest]);

  // إعادة تعيين الخطأ
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // قيمة السياق
  const value = {
    user,
    loading,
    error,
    initialized,
    isGuest,
    login,
    register,
    loginAsGuest,
    logout,
    isAuthenticated,
    setError,
    clearError
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;