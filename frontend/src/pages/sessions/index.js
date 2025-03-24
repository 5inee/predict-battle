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
  FaExclamationTriangle,
  FaQuestion,
  FaCode,
  FaLock,
  FaUserSecret,
  FaSignInAlt,
  FaUserPlus
} from 'react-icons/fa';

export default function Sessions() {
  const [activeTab, setActiveTab] = useState('join-tab');
  const [gameCode, setGameCode] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [userSessions, setUserSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [question, setQuestion] = useState('');
  const [maxPlayers, setMaxPlayers] = useState(5);
  const [secretCode, setSecretCode] = useState('');
  const [isJoining, setIsJoining] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  
  const { isAuthenticated, isRegisteredUser, initialized, isGuest, user } = useAuth();
  const router = useRouter();

  // التحقق من تسجيل الدخول
  useEffect(() => {
    if (initialized && !isAuthenticated()) {
      router.push('/');
    }
  }, [initialized, isAuthenticated, router]);

  // جلب جلسات المستخدم
  useEffect(() => {
    const fetchUserSessions = async () => {
      if (!initialized || !isAuthenticated() || isGuest) {
        setLoading(false);
        return;
      }
      
      try {
        setLoading(true);
        const response = await api.get('/sessions/user');
        setUserSessions(response.data);
        setLoading(false);
      } catch (err) {
        setError('حدث خطأ أثناء تحميل الجلسات، يرجى المحاولة مرة أخرى.');
        setLoading(false);
      }
    };

    if (initialized && isAuthenticated() && !isGuest) {
      fetchUserSessions();
    }
  }, [initialized, isAuthenticated, isGuest]);

  // تغيير التبويب النشط
  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    setError(null);
  };

  // الانضمام إلى جلسة
  const handleJoinSession = async (e) => {
    e.preventDefault();
    if (!gameCode.trim()) {
      setError('الرجاء إدخال كود اللعبة');
      return;
    }

    try {
      setIsJoining(true);
      console.log('Attempting to join session with code:', gameCode);
      
      // للمستخدمين الضيوف، نتخطى الانضمام عبر API ونذهب مباشرة إلى صفحة الجلسة
      if (isGuest) {
        console.log('Guest user - redirecting directly to session page');
        router.push(`/sessions/${gameCode}`);
        return;
      }
      
      // للمستخدمين المسجلين، نقوم بالانضمام عبر API أولاً
      console.log('Registered user - joining via API');
      await api.post(`/sessions/join/${gameCode}`);
      router.push(`/sessions/${gameCode}`);
    } catch (err) {
      console.error('Error joining session:', err);
      setError(err.response?.data?.message || 'فشل في الانضمام إلى الجلسة، تأكد من صحة الكود والمحاولة مرة أخرى.');
      setIsJoining(false);
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
      setIsCreating(true);
      const response = await api.post('/sessions', {
        question,
        maxPlayers: parseInt(maxPlayers),
        secretCode
      });
      
      router.push(`/sessions/${response.data.code}`);
    } catch (err) {
      setError(err.response?.data?.message || 'فشل في إنشاء الجلسة، يرجى المحاولة مرة أخرى.');
      setIsCreating(false);
    }
  };

  // فتح نموذج إنشاء جلسة جديدة
  const toggleCreateForm = () => {
    if (isGuest) {
      setError('للأسف، لا يمكن للضيوف إنشاء جلسات جديدة. الرجاء تسجيل الدخول أو إنشاء حساب أولاً.');
      return;
    }
    setShowCreateForm(!showCreateForm);
    setError(null);
  };

  // توجيه المستخدم إلى صفحة تسجيل الدخول
  const redirectToLogin = () => {
    router.push('/');
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

  if (!initialized) {
    return (
      <Layout title="PredictBattle - جار التحميل">
        <div className="card">
          <div className="card-body">
            <div className="loading-text">
              <div className="loading"></div>
              <span>جارِ تحميل الجلسات...</span>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (initialized && !isAuthenticated()) {
    return (
      <Layout title="PredictBattle - غير مصرح">
        <div className="card">
          <div className="card-body">
            <div className="alert alert-error">
              <FaExclamationTriangle /> يجب تسجيل الدخول للوصول إلى هذه الصفحة
            </div>
            <button onClick={() => router.push('/')} className="btn btn-primary">
              <FaArrowRight /> العودة إلى صفحة تسجيل الدخول
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="PredictBattle - الجلسات">
      <div className="card">
        <div className="card-header">
          <h1>جلسات التوقعات</h1>
          <p className="subtitle">انضم إلى جلسة موجودة أو قم بإنشاء جلسة جديدة</p>
          
          {isGuest && (
            <div className="guest-banner">
              <FaUserSecret style={{ color: 'white', fontSize: '18px' }} />
              <span>أنت تتصفح كضيف. بعض الميزات محدودة.</span>
            </div>
          )}
          
          {/* نظام التبويبات */}
          <div className="tabs-container">
            <div
              className={`tab ${activeTab === 'join-tab' ? 'active' : ''}`}
              onClick={() => handleTabChange('join-tab')}
            >
              <FaGamepad style={{ marginLeft: '6px' }} /> انضمام للعبة
            </div>
            <div
              className={`tab ${activeTab === 'my-sessions-tab' ? 'active' : ''}`}
              onClick={() => isGuest ? handleTabChange('join-tab') : handleTabChange('my-sessions-tab')}
              style={{ opacity: isGuest ? 0.6 : 1, cursor: isGuest ? 'not-allowed' : 'pointer' }}
            >
              <FaUsers style={{ marginLeft: '6px' }} /> جلساتي
              {isGuest && <span style={{ fontSize: '11px', marginRight: '5px', opacity: 0.8 }}>(للمسجلين فقط)</span>}
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
          
          {/* محتوى تبويب الانضمام */}
          {activeTab === 'join-tab' && (
            <div className="tab-content active" id="join-tab">
              {!showCreateForm ? (
                <>
                  <form onSubmit={handleJoinSession}>
                    <div className="form-group">
                      <label htmlFor="gameId">كود اللعبة</label>
                      <div className="input-wrapper">
                        <FaCode className="input-icon" />
                        <input
                          type="text"
                          id="gameId"
                          value={gameCode}
                          onChange={(e) => setGameCode(e.target.value.toUpperCase())}
                          placeholder="أدخل كود اللعبة المكون من 6 أحرف"
                          maxLength={6}
                          disabled={isJoining}
                        />
                      </div>
                    </div>
                    <button type="submit" className="btn btn-primary" disabled={isJoining}>
                      {isJoining ? (
                        <>
                          <div className="loading"></div>
                          <span>جار الانضمام...</span>
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
                  
                  <button onClick={toggleCreateForm} className="btn btn-secondary">
                    <FaPlusCircle /> إنشاء لعبة جديدة
                  </button>
                  
                  {isGuest && (
                    <div className="guest-notice">
                      <FaUserSecret style={{ marginLeft: '5px' }} />
                      للاستفادة من جميع الميزات، يمكنك <span className="link" onClick={redirectToLogin} style={{ fontWeight: 'bold', color: 'var(--primary)', cursor: 'pointer' }}>تسجيل الدخول أو إنشاء حساب</span>
                    </div>
                  )}
                </>
              ) : (
                <>
                  <form onSubmit={handleCreateSession}>
                    <div className="form-group">
                      <label htmlFor="question">سؤال التحدي</label>
                      <div className="input-wrapper">
                        <FaQuestion className="input-icon" />
                        <input
                          type="text"
                          id="question"
                          value={question}
                          onChange={(e) => setQuestion(e.target.value)}
                          placeholder="مثال: ما هي أكبر ثلاث تقنيات ستغير العالم في السنوات الخمس القادمة؟"
                          disabled={isCreating}
                        />
                      </div>
                    </div>
                    <div className="form-group">
                      <label htmlFor="maxPlayers">عدد المشاركين (2-20)</label>
                      <div className="input-wrapper">
                        <FaUsers className="input-icon" />
                        <input
                          type="number"
                          id="maxPlayers"
                          value={maxPlayers}
                          onChange={(e) => setMaxPlayers(Math.min(20, Math.max(2, parseInt(e.target.value) || 2)))}
                          min="2"
                          max="20"
                          disabled={isCreating}
                        />
                      </div>
                    </div>
                    <div className="form-group">
                      <label htmlFor="secretCode">الرمز السري</label>
                      <div className="input-wrapper">
                        <FaLock className="input-icon" />
                        <input
                          type="password"
                          id="secretCode"
                          value={secretCode}
                          onChange={(e) => setSecretCode(e.target.value)}
                          placeholder="أدخل الرمز السري للسماح بإنشاء جلسة"
                          disabled={isCreating}
                        />
                      </div>
                    </div>
                    <button type="submit" className="btn btn-primary" disabled={isCreating}>
                      {isCreating ? (
                        <>
                          <div className="loading"></div>
                          <span>جار إنشاء الجلسة...</span>
                        </>
                      ) : (
                        <>
                          <FaPlusCircle /> ابدأ الجلسة
                        </>
                      )}
                    </button>
                  </form>
                  
                  <div className="back-to-auth" onClick={toggleCreateForm}>
                    <FaArrowRight /> العودة
                  </div>
                </>
              )}
            </div>
          )}
          
          {/* محتوى تبويب جلساتي */}
          {activeTab === 'my-sessions-tab' && !isGuest && (
            <div className="tab-content active" id="my-sessions-tab">
              <div className="search-bar">
                <div className="input-wrapper">
                  <FaSearch className="input-icon" />
                  <input
                    type="text"
                    placeholder="ابحث في جلساتك..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
              
              <div className="sessions-list">
                {loading ? (
                  <div className="loading-text">
                    <div className="loading"></div>
                    <span>جارِ تحميل الجلسات...</span>
                  </div>
                ) : filteredSessions.length > 0 ? (
                  filteredSessions.map((session) => (
                    <div
                      key={session._id}
                      className="session-card"
                      onClick={() => router.push(`/sessions/${session.code}`)}
                    >
                      <div className="session-title">{session.question}</div>
                      <div className="session-code">
                        <FaCode /> كود الجلسة: {session.code}
                      </div>
                      <div className="session-meta">
                        <div className="session-date">
                          <FaCalendarAlt />
                          <span>{formatDate(session.createdAt)}</span>
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
                    <FaExclamationTriangle style={{ fontSize: '24px', marginBottom: '10px' }} />
                    <p>لم تنضم لأي جلسات حتى الآن</p>
                    <p style={{ fontSize: '14px', marginTop: '5px' }}>انضم إلى جلسة موجودة أو قم بإنشاء جلسة جديدة</p>
                  </div>
                )}
              </div>
            </div>
          )}
          
          {/* محتوى خاص بالضيوف عندما يحاولون الوصول إلى تبويب "جلساتي" */}
          {activeTab === 'my-sessions-tab' && isGuest && (
            <div className="tab-content active" id="guest-notice">
              <div className="guest-sessions-notice">
                <div className="notice-icon">
                  <FaUserSecret />
                </div>
                <h3>ميزة محدودة للضيوف</h3>
                <p>عرض الجلسات السابقة متاح فقط للمستخدمين المسجلين. قم بإنشاء حساب للاستفادة من جميع ميزات المنصة!</p>
                
                <div className="guest-action-buttons">
                  <button onClick={() => router.push('/')} className="btn btn-primary">
                    <FaSignInAlt /> تسجيل الدخول
                  </button>
                  <button onClick={() => router.push('/')} className="btn btn-secondary">
                    <FaUserPlus /> إنشاء حساب جديد
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}