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
  FaCloudUploadAlt,
  FaExclamationCircle,
  FaSyncAlt,
  FaKey,
  FaQuestion,
  FaChevronRight,
  FaInfoCircle,
  FaClipboard,
  FaHourglassHalf,
  FaBoxOpen
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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  
  const { user, logout } = useAuth();
  const router = useRouter();

  // التحقق من تسجيل الدخول
  useEffect(() => {
    if (typeof window !== 'undefined' && !user) {
      router.push('/');
    }
  }, [user, router]);

  // جلب جلسات المستخدم
  useEffect(() => {
    const fetchUserSessions = async () => {
      if (!user) return; // تأكد من وجود المستخدم قبل جلب الجلسات
      
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

  // تسجيل الخروج
  const handleLogout = () => {
    if (typeof window === 'undefined') return; // تأكد من وجود window
    
    logout();
    router.push('/');
  };

  // تحديث الجلسات
  const refreshSessions = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const response = await api.get('/sessions/user');
      setUserSessions(response.data);
      setLoading(false);
    } catch (err) {
      setError('فشل في تحديث الجلسات');
      setLoading(false);
    }
  };

  // تغيير التبويب النشط
  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    setError(null);
  };

  // الانضمام إلى جلسة
  const handleJoinSession = async (e) => {
    e.preventDefault();
    setError(null);
    
    if (!gameCode.trim()) {
      setError('الرجاء إدخال كود اللعبة');
      return;
    }

    setIsSubmitting(true);
    try {
      await api.post(`/sessions/join/${gameCode}`);
      router.push(`/sessions/${gameCode}`);
    } catch (err) {
      setError(err.response?.data?.message || 'فشل في الانضمام إلى الجلسة');
      setIsSubmitting(false);
    }
  };

  // إنشاء جلسة جديدة
  const handleCreateSession = async (e) => {
    e.preventDefault();
    setError(null);
    
    if (!question.trim()) {
      setError('الرجاء إدخال سؤال التحدي');
      return;
    }
    
    if (secretCode !== '021') {
      setError('الرمز السري غير صحيح');
      return;
    }

    // تحويل maxPlayers إلى رقم صحيح في حالة كونه نص
    const maxPlayerValue = parseInt(maxPlayers, 10);
    if (isNaN(maxPlayerValue) || maxPlayerValue < 2 || maxPlayerValue > 20) {
      setError('عدد اللاعبين يجب أن يكون بين 2 و 20');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await api.post('/sessions', {
        question,
        maxPlayers: maxPlayerValue,
        secretCode
      });
      
      router.push(`/sessions/${response.data.code}`);
    } catch (err) {
      setError(err.response?.data?.message || 'فشل في إنشاء الجلسة');
      setIsSubmitting(false);
    }
  };

  // فتح نموذج إنشاء جلسة جديدة
  const toggleCreateForm = () => {
    setShowCreateForm(!showCreateForm);
    setError(null);
  };

  // نسخ كود الجلسة
  const copyToClipboard = (code) => {
    if (typeof navigator === 'undefined') return; // تأكد من وجود navigator
    
    navigator.clipboard.writeText(code);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  };

  // تصفية الجلسات حسب مصطلح البحث
  const filteredSessions = userSessions.filter(session =>
    session.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
    session.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // تنسيق التاريخ
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('ar-SA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(date);
  };

  // حالة الجلسة
  const getSessionStatus = (session) => {
    if (session.status === 'completed') {
      return { text: 'مكتملة', color: 'var(--success)' };
    } else if (session.participants.length < session.maxPlayers) {
      return { text: 'في انتظار اللاعبين', color: 'var(--warning)' };
    } else {
      return { text: 'نشطة', color: 'var(--info)' };
    }
  };

  // التحقق من وجود user قبل العرض
  if (typeof window !== 'undefined' && !user) {
    return null;
  }

  return (
    <Layout title="PredictBattle - الجلسات">
      <div className="card">
        <div className="card-header">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h1>جلسات التوقعات</h1>
            <button 
              onClick={handleLogout}
              className="logout-button"
            >
              <FaSignOutAlt />
              <span>تسجيل الخروج</span>
            </button>
          </div>
          <p className="subtitle">انضم إلى جلسة توقعات موجودة أو قم بإنشاء جلسة جديدة</p>
          
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
              <FaExclamationCircle />
              <span>{error}</span>
            </div>
          )}
          
          {copySuccess && (
            <div className="alert alert-success">
              <FaClipboard />
              <span>تم نسخ كود الجلسة بنجاح!</span>
            </div>
          )}
          
          {/* محتوى تبويب الانضمام */}
          {activeTab === 'join-tab' && (
            <div className="tab-content active" id="join-tab">
              {!showCreateForm ? (
                <>
                  <form onSubmit={handleJoinSession}>
                    <div className="form-group">
                      <label htmlFor="gameId">كود الجلسة</label>
                      <div className="input-wrapper">
                        <FaGamepad className="input-icon" />
                        <input
                          type="text"
                          id="gameId"
                          value={gameCode}
                          onChange={(e) => setGameCode(e.target.value.toUpperCase())}
                          placeholder="أدخل كود الجلسة المكون من 6 أحرف"
                          autoFocus
                          disabled={isSubmitting}
                        />
                      </div>
                    </div>
                    <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                      {isSubmitting ? (
                        <span>جاري الانضمام...</span>
                      ) : (
                        <>
                          <FaUsers /> انضم إلى الجلسة
                        </>
                      )}
                    </button>
                  </form>
                  
                  <div className="separator">
                    <span>أو</span>
                  </div>
                  
                  <button onClick={toggleCreateForm} className="btn btn-secondary">
                    <FaPlusCircle /> إنشاء جلسة جديدة
                  </button>
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
                          autoFocus
                          disabled={isSubmitting}
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
                          onChange={(e) => {
                            const value = parseInt(e.target.value, 10);
                            if (!isNaN(value)) {
                              setMaxPlayers(Math.min(20, Math.max(2, value)));
                            }
                          }}
                          min="2"
                          max="20"
                          disabled={isSubmitting}
                        />
                      </div>
                    </div>
                    
                    <div className="form-group">
                      <label htmlFor="secretCode">الرمز السري</label>
                      <div className="input-wrapper">
                        <FaKey className="input-icon" />
                        <input
                          type="password"
                          id="secretCode"
                          value={secretCode}
                          onChange={(e) => setSecretCode(e.target.value)}
                          placeholder="أدخل الرمز السري للسماح بإنشاء جلسة"
                          disabled={isSubmitting}
                        />
                      </div>
                      <div style={{
                        fontSize: '13px',
                        marginTop: '8px',
                        color: 'var(--medium)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '5px'
                      }}>
                        <FaInfoCircle />
                        <span>الرمز السري هو 021 (مطلوب لإنشاء جلسات جديدة)</span>
                      </div>
                    </div>
                    
                    <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                      {isSubmitting ? (
                        <span>جاري إنشاء الجلسة...</span>
                      ) : (
                        <>
                          <FaCloudUploadAlt /> إنشاء الجلسة
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
          {activeTab === 'my-sessions-tab' && (
            <div className="tab-content active" id="my-sessions-tab">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                <div className="search-bar" style={{ flex: 1, marginLeft: '10px' }}>
                  <div className="input-wrapper">
                    <FaSearch className="input-icon" />
                    <input
                      type="text"
                      placeholder="ابحث عن جلسة..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>
                
                <button 
                  onClick={refreshSessions} 
                  style={{
                    background: 'transparent',
                    border: '1px solid #e2e8f0',
                    borderRadius: 'var(--border-radius-md)',
                    padding: '10px',
                    cursor: 'pointer',
                    color: 'var(--medium)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'var(--transition-normal)'
                  }}
                  title="تحديث الجلسات"
                  disabled={loading}
                >
                  <FaSyncAlt style={{ transform: loading ? 'rotate(360deg)' : 'none', transition: 'transform 1s' }} />
                </button>
              </div>
              
              <div className="sessions-list">
                {loading ? (
                  <div className="no-sessions">
                    <FaHourglassHalf size={40} style={{ marginBottom: '15px', opacity: 0.5 }} />
                    جاري تحميل الجلسات...
                  </div>
                ) : filteredSessions.length > 0 ? (
                  filteredSessions.map((session) => {
                    const statusInfo = getSessionStatus(session);
                    
                    return (
                      <div
                        key={session._id}
                        className="session-card"
                        onClick={() => router.push(`/sessions/${session.code}`)}
                        style={{ borderRight: `4px solid ${statusInfo.color}` }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                          <div className="session-title">{session.question}</div>
                          <div 
                            style={{
                              cursor: 'pointer',
                              padding: '3px 7px',
                              borderRadius: '4px',
                              fontSize: '13px',
                              color: 'var(--primary)',
                              background: 'rgba(99, 102, 241, 0.1)',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '5px',
                              marginRight: '10px'
                            }}
                            onClick={(e) => {
                              e.stopPropagation();
                              copyToClipboard(session.code);
                            }}
                            title="نسخ كود الجلسة"
                          >
                            <span>{session.code}</span>
                            <FaClipboard size={12} />
                          </div>
                        </div>
                        
                        <div style={{ 
                          fontSize: '13px', 
                          marginTop: '5px', 
                          marginBottom: '12px',
                          display: 'inline-block',
                          padding: '3px 8px',
                          borderRadius: '4px',
                          background: `${statusInfo.color}20`,
                          color: statusInfo.color
                        }}>
                          {statusInfo.text}
                        </div>
                        
                        <div className="session-meta">
                          <div className="session-date">
                            <FaCalendarAlt size={14} />
                            <span>{formatDate(session.createdAt)}</span>
                          </div>
                          <div className="session-players">
                            <FaUsers size={14} />
                            <span>
                              {session.participants.length}/{session.maxPlayers} لاعبين
                            </span>
                          </div>
                          <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '3px',
                            marginRight: 'auto'
                          }}>
                            <FaChevronRight size={12} />
                          </div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="no-sessions">
                    <FaBoxOpen size={50} style={{ marginBottom: '15px', opacity: 0.5 }} />
                    <p>لا توجد جلسات متاحة</p>
                    <button 
                      onClick={() => {
                        setActiveTab('join-tab');
                        setShowCreateForm(true);
                      }} 
                      className="btn btn-primary" 
                      style={{ maxWidth: '250px', marginTop: '15px' }}
                    >
                      <FaPlusCircle /> إنشاء جلسة جديدة
                    </button>
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