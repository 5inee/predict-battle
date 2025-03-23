import { useState } from 'react';
import { useRouter } from 'next/router';
import Layout from '../components/Layout';
import { FaSignInAlt, FaUserPlus, FaBrain, FaLock, FaUser, FaArrowRight } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';

export default function Home() {
  const [showAuthCard, setShowAuthCard] = useState(true);
  const [showLoginForm, setShowLoginForm] = useState(false);
  const [showRegisterForm, setShowRegisterForm] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login, register, error, setError } = useAuth();
  const router = useRouter();

  // التحقق مما إذا كان المستخدم قد قام بتسجيل الدخول
  const { user } = useAuth();
  if (typeof window !== 'undefined' && user) {
    router.push('/sessions');
    return null;
  }

  const handleLoginClick = () => {
    setShowAuthCard(false);
    setShowLoginForm(true);
    setShowRegisterForm(false);
    setError(null);
  };

  const handleRegisterClick = () => {
    setShowAuthCard(false);
    setShowLoginForm(false);
    setShowRegisterForm(true);
    setError(null);
  };

  const handleBackClick = () => {
    setShowAuthCard(true);
    setShowLoginForm(false);
    setShowRegisterForm(false);
    setError(null);
    // إعادة تعيين حقول النموذج
    setUsername('');
    setPassword('');
    setConfirmPassword('');
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      setError('الرجاء إدخال اسم المستخدم وكلمة المرور');
      return;
    }
    
    try {
      setIsSubmitting(true);
      await login(username, password);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      setError('الرجاء إدخال اسم المستخدم وكلمة المرور');
      return;
    }
    if (username.length < 3) {
      setError('يجب أن يكون اسم المستخدم 3 أحرف على الأقل');
      return;
    }
    if (password.length < 6) {
      setError('يجب أن تكون كلمة المرور 6 أحرف على الأقل');
      return;
    }
    // التحقق من تطابق كلمة المرور مع تأكيدها
    if (password !== confirmPassword) {
      setError('كلمة المرور وتأكيدها غير متطابقين');
      return;
    }
    
    try {
      setIsSubmitting(true);
      await register(username, password);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Layout title="PredictBattle - تحدي التوقعات">
      {/* بطاقة تسجيل الدخول/التسجيل */}
      {showAuthCard && (
        <div className="card fade-in">
          <div className="card-header">
            <h1>مرحباً بك في PredictBattle</h1>
            <p className="subtitle">منصة تحدي التوقعات والمنافسة في المعرفة والتخمين</p>
          </div>
          <div className="card-body">
            <div className="welcome-icon">
              <FaBrain />
            </div>
            <p className="welcome-text">
              في PredictBattle، يمكنك إنشاء تحديات وجلسات تخمين لأصدقائك وزملائك، 
              أو الانضمام إلى جلسات موجودة. قم بوضع توقعاتك وتنافس مع الآخرين في أجواء من التحدي والمرح!
            </p>
            
            <button onClick={handleLoginClick} className="btn btn-primary full-width">
              <FaSignInAlt /> تسجيل الدخول
            </button>
            
            <div className="separator">
              <span>أو</span>
            </div>
            
            <button onClick={handleRegisterClick} className="btn btn-secondary full-width">
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
            <p className="subtitle">أدخل بيانات حسابك للوصول إلى منصة PredictBattle</p>
          </div>
          <div className="card-body">
            {error && (
              <div className="alert alert-error">
                <FaLock /> {error}
              </div>
            )}
            <form onSubmit={handleLoginSubmit}>
              <div className="form-group">
                <label htmlFor="username">اسم المستخدم</label>
                <div className="input-wrapper">
                  <input
                    type="text"
                    id="username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="أدخل اسم المستخدم"
                    disabled={isSubmitting}
                  />
                  <FaUser className="input-icon" />
                </div>
              </div>
              <div className="form-group">
                <label htmlFor="password">كلمة المرور</label>
                <div className="input-wrapper">
                  <input
                    type="password"
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="أدخل كلمة المرور"
                    disabled={isSubmitting}
                  />
                  <FaLock className="input-icon" />
                </div>
              </div>
              <button 
                type="submit" 
                className="btn btn-primary full-width"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'جاري تسجيل الدخول...' : (
                  <>
                    <FaSignInAlt /> تسجيل الدخول
                  </>
                )}
              </button>
            </form>
            <div className="back-link" onClick={handleBackClick}>
              <FaArrowRight /> العودة إلى الصفحة الرئيسية
            </div>
          </div>
        </div>
      )}

      {/* نموذج التسجيل */}
      {showRegisterForm && (
        <div className="card fade-in">
          <div className="card-header">
            <h1>إنشاء حساب جديد</h1>
            <p className="subtitle">سجل حسابك للمشاركة في جلسات التوقعات والتحديات</p>
          </div>
          <div className="card-body">
            {error && (
              <div className="alert alert-error">
                <FaLock /> {error}
              </div>
            )}
            <form onSubmit={handleRegisterSubmit}>
              <div className="form-group">
                <label htmlFor="reg-username">اسم المستخدم</label>
                <div className="input-wrapper">
                  <input
                    type="text"
                    id="reg-username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="أدخل اسم المستخدم (3 أحرف على الأقل)"
                    disabled={isSubmitting}
                  />
                  <FaUser className="input-icon" />
                </div>
              </div>
              <div className="form-group">
                <label htmlFor="reg-password">كلمة المرور</label>
                <div className="input-wrapper">
                  <input
                    type="password"
                    id="reg-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="أدخل كلمة المرور (6 أحرف على الأقل)"
                    disabled={isSubmitting}
                  />
                  <FaLock className="input-icon" />
                </div>
              </div>
              <div className="form-group">
                <label htmlFor="reg-confirm-password">تأكيد كلمة المرور</label>
                <div className="input-wrapper">
                  <input
                    type="password"
                    id="reg-confirm-password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="أعد إدخال كلمة المرور للتأكيد"
                    disabled={isSubmitting}
                  />
                  <FaLock className="input-icon" />
                </div>
              </div>
              <button 
                type="submit" 
                className="btn btn-primary full-width"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'جاري إنشاء الحساب...' : (
                  <>
                    <FaUserPlus /> إنشاء حساب
                  </>
                )}
              </button>
            </form>
            <div className="back-link" onClick={handleBackClick}>
              <FaArrowRight /> العودة إلى الصفحة الرئيسية
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}