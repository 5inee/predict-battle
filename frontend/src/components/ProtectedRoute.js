// frontend/src/components/ProtectedRoute.js
import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = () => {
  const { isAuthenticated, loading } = useAuth();

  // عرض رسالة تحميل أثناء التحقق
  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>جاري التحميل...</p>
      </div>
    );
  }

  // إعادة التوجيه إلى صفحة تسجيل الدخول إذا لم يكن المستخدم مصادقًا
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  // عرض محتوى المسار المحمي
  return <Outlet />;
};

export default ProtectedRoute;