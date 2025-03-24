import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Layout from '../components/Layout';
import { FaSignInAlt, FaUserPlus, FaBrain, FaLock, FaUser, FaArrowRight, FaUserSecret } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';

export default function Home() {
  const [showAuthCard, setShowAuthCard] = useState(true);
  const [showLoginForm, setShowLoginForm] = useState(false);
  const [showRegisterForm, setShowRegisterForm] = useState(false);
  const [showGuestForm, setShowGuestForm] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [guestName, setGuestName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login, register, loginAsGuest, error, setError, clearError } = useAuth();
  const router = useRouter();

  // التحقق مما إذا كان المستخدم قد قام بتسجيل الدخول
  const { user, initialized } = useAuth();
  
  useEffect(() => {
    if (initialized && user) {
      router.push('/sessions');
    }
  }, [initialized, user, router]);

  const handleLoginClick = () => {
    clearError();
    setShowAuthCard(false);
    setShowLoginForm(true);
    setShowRegisterForm(false);
    setShowGuestForm(false);
  };

  const handleRegisterClick = () => {
    clearError();
    setShowAuthCard(false);
    setShowLoginForm(false);
    setShowRegisterForm(true);
    setShowGuestForm(false);
  };

  const handleGuestClick = () => {
    clearError();
    setShowAuthCard(false);
    setShowLoginForm(false);
    setShowRegisterForm(false);
    setShowGuestForm(true);
  };

  const handleBackClick = () => {
    clearError();
    setShowAuthCard(true);
    setShowLoginForm(false);
    setShowRegisterForm(false);
    setShowGuestForm(false);
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      setError('الرجاء إدخال اسم المستخدم وكلمة المرور');
      return;
    }
    
    setIsSubmitting(true);
    await login(username, password);
    setIsSubmitting(false);
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
    if (password !== confirmPassword) {
      setError('كلمة المرور وتأكيدها غير متطابقين');
      return;
    }
    
    setIsSubmitting(true);
    await register(username, password);
    setIsSubmitting(false);
  };

  const handleGuestSubmit = async (e) => {
    e.preventDefault();
    if (!guestName.trim()) {
      setError('الرجاء إدخال اسمك');
      return;
    }
    
    setIsSubmitting(true);
    const success = loginAsGuest(guestName);
    setIsSubmitting(false);
    
    if (!success) {
      setError('حدث خطأ أثناء تسجيل الدخول كضيف');
    }
  };

  // إذا لم يتم تهيئة السياق بعد، نعرض شاشة التحميل
  if (!initialized) {
    return (
      <Layout title="PredictBattle - جار التحميل">
        <div className="card">
          <div className="card-body">
            <div className="loading-text">
              <div className="loading"></div>
              <span>جارِ تحميل التطبيق...</span>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  // إذا كان المستخدم مسجل الدخول بالفعل، نعرض شاشة التحميل أثناء الانتقال
  if (user) {
    return (
      <Layout title="PredictBattle - جار التحميل">
        <div className="card">
          <div className="card-body">
            <div className="loading-text">
              <div className="loading"></div>
              <span>جارِ الانتقال إلى الجلسات...</span>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="PredictBattle - منصة التوقعات التفاعلية">
      {/* بطاقة تسجيل الدخول/التسجيل */}
      {showAuthCard && (
        <div className="card fade-in">
          <div className="card-header">
            <h1>مرحباً بك في PredictBattle</h1>
            <p className="subtitle">منصة التوقعات التفاعلية - شارك توقعاتك وتحدى الآخرين</p>
          </div>
          <div className="card-body">
            <div className="welcome-icon">
              <FaBrain />
            </div>
            <p className="welcome-text">هل تستطيع التنبؤ بالمستقبل؟ شارك توقعاتك وتنافس مع الآخرين في لعبة تفاعلية ممتعة!</p>
            
            <button onClick={handleLoginClick} className="btn btn-primary">
              <FaSignInAlt /> تسجيل الدخول
            </button>
            
            <button onClick={handleRegisterClick} className="btn btn-secondary">
              <FaUserPlus /> إنشاء حساب جديد
            </button>
            
            <button onClick={handleGuestClick} className="btn guest-btn">
              <FaUserSecret /> الدخول كضيف
            </button>
          </div>
        </div>
      )}

      {/* نموذج تسجيل الدخول */}
      {showLoginForm && (
        <div className="card fade-in">
          <div className="card-header">
            <h1>تسجيل الدخول</h1>
            <p className="subtitle">أدخل بيانات حسابك للوصول إلى جلسات التوقعات</p>
          </div>
          <div className="card-body">
            {error && <div className="alert alert-error"><FaLock /> {error}</div>}
            <form onSubmit={handleLoginSubmit}>
              <div className="form-group">
                <label htmlFor="username">اسم المستخدم</label>
                <div className="input-wrapper">
                  <FaUser className="input-icon" />
                  <input
                    type="text"
                    id="username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="أدخل اسم المستخدم"
                    disabled={isSubmitting}
                  />
                </div>
              </div>
              <div className="form-group">
                <label htmlFor="password">كلمة المرور</label>
                <div className="input-wrapper">
                  <FaLock className="input-icon" />
                  <input
                    type="password"
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="أدخل كلمة المرور"
                    disabled={isSubmitting}
                  />
                </div>
              </div>
              <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <div className="loading"></div>
                    <span>جار تسجيل الدخول...</span>
                  </>
                ) : (
                  <>
                    <FaSignInAlt /> تسجيل الدخول
                  </>
                )}
              </button>
            </form>
            <div className="back-to-auth" onClick={handleBackClick}>
              <FaArrowRight /> العودة
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
            {error && <div className="alert alert-error"><FaLock /> {error}</div>}
            <form onSubmit={handleRegisterSubmit}>
              <div className="form-group">
                <label htmlFor="reg-username">اسم المستخدم</label>
                <div className="input-wrapper">
                  <FaUser className="input-icon" />
                  <input
                    type="text"
                    id="reg-username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="أدخل اسم المستخدم"
                    disabled={isSubmitting}
                  />
                </div>
              </div>
              <div className="form-group">
                <label htmlFor="reg-password">كلمة المرور</label>
                <div className="input-wrapper">
                  <FaLock className="input-icon" />
                  <input
                    type="password"
                    id="reg-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="أدخل كلمة المرور (6 أحرف على الأقل)"
                    disabled={isSubmitting}
                  />
                </div>
              </div>
              <div className="form-group">
                <label htmlFor="reg-confirm-password">تأكيد كلمة المرور</label>
                <div className="input-wrapper">
                  <FaLock className="input-icon" />
                  <input
                    type="password"
                    id="reg-confirm-password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="أعد إدخال كلمة المرور للتأكيد"
                    disabled={isSubmitting}
                  />
                </div>
              </div>
              <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <div className="loading"></div>
                    <span>جار إنشاء الحساب...</span>
                  </>
                ) : (
                  <>
                    <FaUserPlus /> إنشاء حساب
                  </>
                )}
              </button>
            </form>
            <div className="back-to-auth" onClick={handleBackClick}>
              <FaArrowRight /> العودة
            </div>
          </div>
        </div>
      )}

      {/* نموذج الدخول كضيف */}
      {showGuestForm && (
        <div className="card fade-in">
          <div className="card-header">
            <h1>الدخول كضيف</h1>
            <p className="subtitle">أدخل اسمك للمشاركة بدون حساب</p>
          </div>
          <div className="card-body">
            {error && <div className="alert alert-error"><FaLock /> {error}</div>}
            <div className="alert alert-warning">
              <FaUserSecret /> ملاحظة: كضيف، ستتمكن من الانضمام للجلسات لكن لن تتمكن من إنشاء جلسات جديدة.
            </div>
            <form onSubmit={handleGuestSubmit}>
              <div className="form-group">
                <label htmlFor="guest-name">اسمك</label>
                <div className="input-wrapper">
                  <FaUser className="input-icon" />
                  <input
                    type="text"
                    id="guest-name"
                    value={guestName}
                    onChange={(e) => setGuestName(e.target.value)}
                    placeholder="أدخل اسمك الذي سيظهر للآخرين"
                    disabled={isSubmitting}
                  />
                </div>
              </div>
              <button type="submit" className="btn guest-btn" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <div className="loading"></div>
                    <span>جار الدخول كضيف...</span>
                  </>
                ) : (
                  <>
                    <FaUserSecret /> دخول كضيف
                  </>
                )}
              </button>
            </form>
            <div className="back-to-auth" onClick={handleBackClick}>
              <FaArrowRight /> العودة
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}