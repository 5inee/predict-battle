// frontend/src/pages/Login.js
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FormInput, SubmitButton, ErrorMessage } from '../components/FormComponents';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [formError, setFormError] = useState('');
  
  const { login, loading, error } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!username.trim() || !password) {
      setFormError('الرجاء إدخال اسم المستخدم وكلمة المرور');
      return;
    }

    try {
      await login(username, password);
      navigate('/dashboard');
    } catch (err) {
      setFormError(err.response?.data?.message || 'خطأ في تسجيل الدخول');
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-form">
        <h2>تسجيل الدخول</h2>
        
        <ErrorMessage message={formError || error} />
        
        <form onSubmit={handleSubmit}>
          <FormInput
            id="username"
            label="اسم المستخدم"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          
          <FormInput
            id="password"
            label="كلمة المرور"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          
          <SubmitButton text="تسجيل الدخول" loading={loading} />
        </form>
        
        <div className="auth-links">
          <p>
            ليس لديك حساب؟ <Link to="/register">التسجيل</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;