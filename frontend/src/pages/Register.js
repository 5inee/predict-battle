// frontend/src/pages/Register.js
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FormInput, SubmitButton, ErrorMessage } from '../components/FormComponents';

const Register = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [formError, setFormError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  
  const { register, loading, error } = useAuth();
  const navigate = useNavigate();

  const validateForm = () => {
    const errors = {};
    let isValid = true;

    if (!username.trim()) {
      errors.username = 'اسم المستخدم مطلوب';
      isValid = false;
    } else if (username.length < 3) {
      errors.username = 'يجب أن يكون اسم المستخدم 3 أحرف على الأقل';
      isValid = false;
    }

    if (!password) {
      errors.password = 'كلمة المرور مطلوبة';
      isValid = false;
    } else if (password.length < 6) {
      errors.password = 'يجب أن تكون كلمة المرور 6 أحرف على الأقل';
      isValid = false;
    }

    if (password !== confirmPassword) {
      errors.confirmPassword = 'كلمات المرور غير متطابقة';
      isValid = false;
    }

    setFieldErrors(errors);
    return isValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!validateForm()) {
      return;
    }

    try {
      await register(username, password);
      navigate('/dashboard');
    } catch (err) {
      setFormError(err.response?.data?.message || 'حدث خطأ أثناء التسجيل');
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-form">
        <h2>إنشاء حساب جديد</h2>
        
        <ErrorMessage message={formError || error} />
        
        <form onSubmit={handleSubmit}>
          <FormInput
            id="username"
            label="اسم المستخدم"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            error={fieldErrors.username}
          />
          
          <FormInput
            id="password"
            label="كلمة المرور"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            error={fieldErrors.password}
          />
          
          <FormInput
            id="confirmPassword"
            label="تأكيد كلمة المرور"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            error={fieldErrors.confirmPassword}
          />
          
          <SubmitButton text="إنشاء حساب" loading={loading} />
        </form>
        
        <div className="auth-links">
          <p>
            لديك حساب بالفعل؟ <Link to="/login">تسجيل الدخول</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;