import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Layout from '../components/Layout';
import { 
  FaSignInAlt, 
  FaUserPlus, 
  FaBrain, 
  FaLock, 
  FaUser, 
  FaArrowLeft, 
  FaExclamationCircle
} from 'react-icons/fa';
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
  
  useEffect(() => {
    if (user) {
      router.push('/sessions');
    }
  }, [user, router]);

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
    // إعادة تعيين الحقول
    setUsername('');
    setPassword('');
    setConfirmPassword('');
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    
    if (!username.trim() || !password.trim()) {
      setError('الرجاء إدخال اسم المستخدم وكلمة المرور');
      return;
    }
    
    setIsSubmitting(true);
    try {
      await login(username, password);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    
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
    
    if (password !== confirmPassword) {
      setError('كلمة المرور وتأكيدها غير متطابقين');
      return;
    }
    
    setIsSubmitting(true);
    try {
      await register(username, password);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (typeof window !== 'undefined' && user) {
    return null; // لا تظهر شيء أثناء التحويل
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
            <p className="welcome-text">
              PredictBattle هي منصة تفاعلية تتيح لك مشاركة توقعاتك حول مختلف المواضيع والتحديات،
              والتنافس مع أصدقائك ومستخدمين آخرين في جو من المتعة والتحدي الفكري.
            </p>
            
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
            {error && (
              <div className="alert alert-error">
                <FaExclamationCircle />
                <span>{error}</span>
              </div>
            )}
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
                    autoFocus
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
                  <span>جاري تسجيل الدخول...</span>
                ) : (
                  <>
                    <FaSignInAlt /> تسجيل الدخول
                  </>
                )}
              </button>
            </form>
            <div className="back-to-auth" onClick={handleBackClick}>
              <FaArrowLeft /> العودة للصفحة الرئيسية
            </div>
          </div>
        </div>
      )}

      {/* نموذج التسجيل */}
      {showRegisterForm && (
        <div className="card fade-in">
          <div className="card-header">
            <h1>إنشاء حساب جديد</h1>
            <p className="subtitle">أنشئ حسابك للمشاركة في جلسات التوقعات التفاعلية</p>
          </div>
          <div className="card-body">
            {error && (
              <div className="alert alert-error">
                <FaExclamationCircle />
                <span>{error}</span>
              </div>
            )}
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
                    placeholder="أدخل اسم المستخدم (3 أحرف على الأقل)"
                    disabled={isSubmitting}
                    autoFocus
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
                  <span>جاري إنشاء الحساب...</span>
                ) : (
                  <>
                    <FaUserPlus /> إنشاء حساب
                  </>
                )}
              </button>
            </form>
            <div className="back-to-auth" onClick={handleBackClick}>
              <FaArrowLeft /> العودة للصفحة الرئيسية
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}