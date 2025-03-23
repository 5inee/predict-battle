import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Layout from '../../components/Layout';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import {
  FaUsers,
  FaCalendarAlt,
  FaGamepad,
  FaPlusCircle,
  FaSearch,
  FaArrowRight,
  FaSignOutAlt,
  FaExclamationTriangle,
  FaCheckCircle,
  FaSpinner,
  FaQuestion
} from 'react-icons/fa';

export default function Sessions() {
  const [activeTab, setActiveTab] = useState('join-tab');
  const [gameCode, setGameCode] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [userSessions, setUserSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [question, setQuestion] = useState('');
  const [maxPlayers, setMaxPlayers] = useState(5);
  const [secretCode, setSecretCode] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { user, logout } = useAuth();
  const router = useRouter();

  // دالة لتسجيل الخروج
  const handleLogout = () => {
    logout();
    router.push('/');
  };

  // التحقق من تسجيل الدخول
  useEffect(() => {
    if (typeof window !== 'undefined' && !user) {
      router.push('/');
    }
  }, [user, router]);

  // جلب جلسات المستخدم
  useEffect(() => {
    const fetchUserSessions = async () => {
      try {
        setLoading(true);
        const response = await api.get('/sessions/user');
        setUserSessions(response.data);
        setLoading(false);
      } catch (err) {
        setError('فشل في تحميل الجلسات');
        setLoading(false);
      }
    };

    if (user) {
      fetchUserSessions();
    }
  }, [user]);

  // مسح الرسائل بعد فترة زمنية
  useEffect(() => {
    if (error || success) {
      const timer = setTimeout(() => {
        setError(null);
        setSuccess(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error, success]);

  // تغيير التبويب النشط
  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    // عند التبديل بين التبويبات، نقوم بإعادة تعيين بعض الحالات
    setError(null);
    setSuccess(null);
    setShowCreateForm(false);
  };

  // الانضمام إلى جلسة
  const handleJoinSession = async (e) => {
    e.preventDefault();
    if (!gameCode.trim()) {
      setError('الرجاء إدخال كود اللعبة');
      return;
    }

    try {
      setIsSubmitting(true);
      await api.post(`/sessions/join/${gameCode}`);
      setSuccess('تم الانضمام إلى اللعبة بنجاح!');
      setTimeout(() => {
        router.push(`/sessions/${gameCode}`);
      }, 1000);
    } catch (err) {
      setError(err.response?.data?.message || 'فشل في الانضمام إلى الجلسة');
      setIsSubmitting(false);
    }
  };

  // إنشاء جلسة جديدة
  const handleCreateSession = async (e) => {
    e.preventDefault();
    if (!question.trim()) {
      setError('الرجاء إدخال سؤال التحدي');
      return;
    }
    if (secretCode !== '021') {
      setError('الرمز السري غير صحيح');
      return;
    }

    try {
      setIsSubmitting(true);
      const response = await api.post('/sessions', {
        question,
        maxPlayers: parseInt(maxPlayers),
        secretCode
      });
      
      setSuccess('تم إنشاء اللعبة بنجاح! جاري توجيهك إليها...');
      setTimeout(() => {
        router.push(`/sessions/${response.data.code}`);
      }, 1000);
    } catch (err) {
      setError(err.response?.data?.message || 'فشل في إنشاء الجلسة');
      setIsSubmitting(false);
    }
  };

  // فتح نموذج إنشاء جلسة جديدة
  const toggleCreateForm = () => {
    setShowCreateForm(!showCreateForm);
    setError(null);
    setSuccess(null);
  };

  // تصفية الجلسات حسب مصطلح البحث
  const filteredSessions = userSessions.filter(session =>
    session.question.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // تنسيق التاريخ
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ar-SA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // الحصول على ترجمة لحالة الجلسة
  const getStatusText = (status) => {
    switch (status) {
      case 'waiting': return 'في الانتظار';
      case 'active': return 'نشطة';
      case 'completed': return 'مكتملة';
      default: return 'غير معروفة';
    }
  };

  // الحصول على تصنيف CSS لحالة الجلسة
  const getStatusClass = (status) => {
    switch (status) {
      case 'waiting': return 'status-badge-waiting';
      case 'active': return 'status-badge-active';
      case 'completed': return 'status-badge-completed';
      default: return '';
    }
  };

  // الحصول على أيقونة لحالة الجلسة
  const getStatusIcon = (status) => {
    switch (status) {
      case 'waiting': return <FaExclamationTriangle />;
      case 'active': return <FaCheckCircle />;
      case 'completed': return <FaCheckCircle />;
      default: return <FaQuestion />;
    }
  };

  // التحقق من وجود user قبل العرض
  if (!user) {
    return null;
  }

  return (
    <Layout title="PredictBattle - الجلسات">
      <div className="card">
        <div className="card-header">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h1>الجلسات والتحديات</h1>
            {user && (
              <button 
                onClick={handleLogout}
                className="logout-button"
              >
                <FaSignOutAlt />
                <span>تسجيل الخروج</span>
              </button>
            )}
          </div>
          <p className="subtitle">انضم إلى جلسة موجودة أو قم بإنشاء تحدي جديد</p>
          
          {/* نظام التبويبات */}
          <div className="tabs-container">
            <div
              className={`tab ${activeTab === 'join-tab' ? 'active' : ''}`}
              onClick={() => handleTabChange('join-tab')}
            >
              انضمام للعبة
            </div>
            <div
              className={`tab ${activeTab === 'my-sessions-tab' ? 'active' : ''}`}
              onClick={() => handleTabChange('my-sessions-tab')}
            >
              جلساتي
            </div>
            <div className={`tab-indicator ${activeTab === 'my-sessions-tab' ? 'second' : ''}`}></div>
          </div>
        </div>
        <div className="card-body">
          {error && (
            <div className="alert alert-error">
              <FaExclamationTriangle /> {error}
            </div>
          )}
          
          {success && (
            <div className="alert alert-success">
              <FaCheckCircle /> {success}
            </div>
          )}
          
          {/* محتوى تبويب الانضمام */}
          {activeTab === 'join-tab' && (
            <div className="tab-content active" id="join-tab">
              {!showCreateForm ? (
                <>
                  <form onSubmit={handleJoinSession}>
                    <div className="form-group">
                      <label htmlFor="gameId">كود اللعبة</label>
                      <div className="input-wrapper">
                        <input
                          type="text"
                          id="gameId"
                          value={gameCode}
                          onChange={(e) => setGameCode(e.target.value)}
                          placeholder="أدخل كود اللعبة المكون من 6 أحرف"
                          disabled={isSubmitting}
                          maxLength={6}
                        />
                        <FaGamepad className="input-icon" />
                      </div>
                    </div>
                    <button 
                      type="submit" 
                      className="btn btn-primary full-width"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <>
                          <FaSpinner className="spin" /> جاري الانضمام...
                        </>
                      ) : (
                        <>
                          <FaUsers /> انضم إلى اللعبة
                        </>
                      )}
                    </button>
                  </form>
                  
                  <div className="separator">
                    <span>أو</span>
                  </div>
                  
                  <button 
                    onClick={toggleCreateForm} 
                    className="btn btn-secondary full-width"
                    disabled={isSubmitting}
                  >
                    <FaPlusCircle /> إنشاء تحدي جديد
                  </button>
                </>
              ) : (
                <>
                  <form onSubmit={handleCreateSession}>
                    <div className="form-group">
                      <label htmlFor="question">سؤال التحدي</label>
                      <div className="input-wrapper">
                        <textarea
                          id="question"
                          value={question}
                          onChange={(e) => setQuestion(e.target.value)}
                          placeholder="مثال: ما هي أكبر ثلاث تقنيات ستغير العالم في السنوات الخمس القادمة؟"
                          disabled={isSubmitting}
                        />
                      </div>
                    </div>
                    <div className="form-group">
                      <label htmlFor="maxPlayers">عدد المشاركين</label>
                      <div className="input-wrapper">
                        <input
                          type="number"
                          id="maxPlayers"
                          value={maxPlayers}
                          onChange={(e) => setMaxPlayers(e.target.value)}
                          min="2"
                          max="20"
                          disabled={isSubmitting}
                        />
                        <FaUsers className="input-icon" />
                      </div>
                    </div>
                    <div className="form-group">
                      <label htmlFor="secretCode">الرمز السري</label>
                      <div className="input-wrapper">
                        <input
                          type="password"
                          id="secretCode"
                          value={secretCode}
                          onChange={(e) => setSecretCode(e.target.value)}
                          placeholder="أدخل الرمز السري للسماح بإنشاء جلسة"
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
                      {isSubmitting ? (
                        <>
                          <FaSpinner className="spin" /> جاري إنشاء التحدي...
                        </>
                      ) : (
                        <>
                          <FaPlusCircle /> إنشاء التحدي
                        </>
                      )}
                    </button>
                  </form>
                  
                  <div className="back-link" onClick={toggleCreateForm}>
                    <FaArrowRight /> العودة إلى الانضمام
                  </div>
                </>
              )}
            </div>
          )}
          
          {/* محتوى تبويب جلساتي */}
          {activeTab === 'my-sessions-tab' && (
            <div className="tab-content active" id="my-sessions-tab">
              <div className="search-bar">
                <div className="input-wrapper">
                  <input
                    type="text"
                    placeholder="ابحث في التحديات..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  <FaSearch className="input-icon" />
                </div>
              </div>
              
              <div className="sessions-list">
                {loading ? (
                  <div className="no-sessions">
                    <FaSpinner className="spin" /> جاري تحميل الجلسات...
                  </div>
                ) : filteredSessions.length > 0 ? (
                  filteredSessions.map((session) => (
                    <div
                      key={session._id}
                      className="session-card"
                      onClick={() => router.push(`/sessions/${session.code}`)}
                    >
                      <div className="session-title">
                        {session.question}
                      </div>
                      <div className="session-meta">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <div className="session-date">
                            <FaCalendarAlt />
                            <span>{formatDate(session.createdAt)}</span>
                          </div>
                          <div className={`status-badge ${getStatusClass(session.status)}`}>
                            {getStatusIcon(session.status)}
                            <span>{getStatusText(session.status)}</span>
                          </div>
                        </div>
                        <div className="session-players">
                          <FaUsers />
                          <span>
                            {session.participants.length}/{session.maxPlayers}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="no-sessions">
                    لا توجد جلسات متاحة. قم بإنشاء جلسة جديدة أو انضم إلى جلسة موجودة.
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}