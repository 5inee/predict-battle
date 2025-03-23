import { useState } from 'react';
import { useRouter } from 'next/router';
import Layout from '../components/Layout';
import { FaSignInAlt, FaUserPlus, FaBrain } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';

export default function Home() {
  const [showAuthCard, setShowAuthCard] = useState(true);
  const [showLoginForm, setShowLoginForm] = useState(false);
  const [showRegisterForm, setShowRegisterForm] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const { login, register, error, setError } = useAuth();
  const router = useRouter();

  // التحقق مما إذا كان المستخدم قد قام بتسجيل الدخول
  const { isAuthenticated } = useAuth();
  if (typeof window !== 'undefined' && isAuthenticated()) {
    router.push('/sessions');
    return null;
  }

  const handleLoginClick = () => {
    setShowAuthCard(false);
    setShowLoginForm(true);
    setShowRegisterForm(false);
  };

  const handleRegisterClick = () => {
    setShowAuthCard(false);
    setShowLoginForm(false);
    setShowRegisterForm(true);
  };

  const handleBackClick = () => {
    setShowAuthCard(true);
    setShowLoginForm(false);
    setShowRegisterForm(false);
    setError(null);
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      setError('الرجاء إدخال اسم المستخدم وكلمة المرور');
      return;
    }
    await login(username, password);
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      setError('الرجاء إدخال اسم المستخدم وكلمة المرور');
      return;
    }
    if (password.length < 6) {
      setError('يجب أن تكون كلمة المرور 6 أحرف على الأقل');
      return;
    }
    await register(username, password);
  };

  return (
    <Layout title="PredictBattle - الصفحة الرئيسية">
      {/* بطاقة تسجيل الدخول/التسجيل */}
      {showAuthCard && (
        <div className="card fade-in">
          <div className="card-header">
            <h1>مرحباً بك في PredictBattle</h1>
            <p className="subtitle">سجل الدخول أو أنشئ حساب جديد للاستمرار</p>
          </div>
          <div className="card-body">
            <div className="welcome-icon">
              <FaBrain />
            </div>
            <p className="welcome-text">شارك توقعاتك وتحدى الآخرين في لعبة تفاعلية ممتعة</p>
            
            <button onClick={handleLoginClick} className="btn btn-primary">
              <FaSignInAlt /> تسجيل الدخول
            </button>
            
            <div className="separator">
              <span>أو</span>
            </div>
            
            <button onClick={handleRegisterClick} className="btn btn-secondary">
              <FaUserPlus /> إنشاء حساب جديد
            </button>
          </div>
        </div>
      )}

      {/* نموذج تسجيل الدخول */}
      {showLoginForm && (
        <div className="card fade-in">
          <div className="card-header">
            <h1>تسجيل الدخول</h1>
            <p className="subtitle">أدخل بيانات حسابك للاستمرار</p>
          </div>
          <div className="card-body">
            {error && <div className="alert alert-error">{error}</div>}
            <form onSubmit={handleLoginSubmit}>
              <div className="form-group">
                <label htmlFor="username">اسم المستخدم</label>
                <div className="input-wrapper">
                  <FaUserPlus className="input-icon" />
                  <input
                    type="text"
                    id="username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="أدخل اسم المستخدم"
                  />
                </div>
              </div>
              <div className="form-group">
                <label htmlFor="password">كلمة المرور</label>
                <div className="input-wrapper">
                  <FaSignInAlt className="input-icon" />
                  <input
                    type="password"
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="أدخل كلمة المرور"
                  />
                </div>
              </div>
              <button type="submit" className="btn btn-primary">
                <FaSignInAlt /> تسجيل الدخول
              </button>
            </form>
            <div className="back-to-auth" onClick={handleBackClick}>
              العودة
            </div>
          </div>
        </div>
      )}

      {/* نموذج التسجيل */}
      {showRegisterForm && (
        <div className="card fade-in">
          <div className="card-header">
            <h1>إنشاء حساب جديد</h1>
            <p className="subtitle">أنشئ حسابك للمشاركة في جلسات التوقعات</p>
          </div>
          <div className="card-body">
            {error && <div className="alert alert-error">{error}</div>}
            <form onSubmit={handleRegisterSubmit}>
              <div className="form-group">
                <label htmlFor="reg-username">اسم المستخدم</label>
                <div className="input-wrapper">
                  <FaUserPlus className="input-icon" />
                  <input
                    type="text"
                    id="reg-username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="أدخل اسم المستخدم"
                  />
                </div>
              </div>
              <div className="form-group">
                <label htmlFor="reg-password">كلمة المرور</label>
                <div className="input-wrapper">
                  <FaSignInAlt className="input-icon" />
                  <input
                    type="password"
                    id="reg-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="أدخل كلمة المرور (6 أحرف على الأقل)"
                  />
                </div>
              </div>
              <button type="submit" className="btn btn-primary">
                <FaUserPlus /> إنشاء حساب
              </button>
            </form>
            <div className="back-to-auth" onClick={handleBackClick}>
              العودة
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}