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
  FaArrowRight
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
  
  const { isAuthenticated } = useAuth();
  const router = useRouter();

  // التحقق من تسجيل الدخول
  useEffect(() => {
    if (typeof window !== 'undefined' && !isAuthenticated()) {
      router.push('/');
    }
  }, [isAuthenticated, router]);

  // جلب جلسات المستخدم
  useEffect(() => {
    const fetchUserSessions = async () => {
      try {
        setLoading(true);
        const response = await api.get('/sessions/user');
        setUserSessions(response.data);
        setLoading(false);
      } catch (error) {
        setError('فشل في تحميل الجلسات');
        setLoading(false);
      }
    };

    if (isAuthenticated()) {
      fetchUserSessions();
    }
  }, [isAuthenticated]);

  // تغيير التبويب النشط
  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
  };

  // الانضمام إلى جلسة
  const handleJoinSession = async (e) => {
    e.preventDefault();
    if (!gameCode.trim()) {
      setError('الرجاء إدخال كود اللعبة');
      return;
    }

    try {
      await api.post(`/sessions/join/${gameCode}`);
      router.push(`/sessions/${gameCode}`);
    } catch (error) {
      setError(error.response?.data?.message || 'فشل في الانضمام إلى الجلسة');
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
      const response = await api.post('/sessions', {
        question,
        maxPlayers: parseInt(maxPlayers),
        secretCode
      });
      
      router.push(`/sessions/${response.data.code}`);
    } catch (error) {
      setError(error.response?.data?.message || 'فشل في إنشاء الجلسة');
    }
  };

  // فتح نموذج إنشاء جلسة جديدة
  const toggleCreateForm = () => {
    setShowCreateForm(!showCreateForm);
    setError(null);
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

  if (!isAuthenticated()) {
    return null;
  }

  return (
    <Layout title="PredictBattle - الجلسات">
      <div className="card">
        <div className="card-header">
          <h1>انضم إلى جلسة توقعات</h1>
          <p className="subtitle">ادخل كود لعبة موجود أو قم بإنشاء لعبتك الخاصة</p>
          
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
          {error && <div className="alert alert-error">{error}</div>}
          
          {/* محتوى تبويب الانضمام */}
          {activeTab === 'join-tab' && (
            <div className="tab-content active" id="join-tab">
              {!showCreateForm ? (
                <>
                  <form onSubmit={handleJoinSession}>
                    <div className="form-group">
                      <label htmlFor="gameId">كود اللعبة</label>
                      <div className="input-wrapper">
                        <FaGamepad className="input-icon" />
                        <input
                          type="text"
                          id="gameId"
                          value={gameCode}
                          onChange={(e) => setGameCode(e.target.value)}
                          placeholder="أدخل كود اللعبة المكون من 6 أحرف"
                        />
                      </div>
                    </div>
                    <button type="submit" className="btn btn-primary">
                      <FaUsers /> انضم إلى اللعبة
                    </button>
                  </form>
                  
                  <div className="separator">
                    <span>أو</span>
                  </div>
                  
                  <button onClick={toggleCreateForm} className="btn btn-secondary">
                    <FaPlusCircle /> إنشاء لعبة جديدة
                  </button>
                </>
              ) : (
                <>
                  <form onSubmit={handleCreateSession}>
                    <div className="form-group">
                      <label htmlFor="question">سؤال التحدي</label>
                      <div className="input-wrapper">
                        <input
                          type="text"
                          id="question"
                          value={question}
                          onChange={(e) => setQuestion(e.target.value)}
                          placeholder="مثال: ما هي أكبر ثلاث تقنيات ستغير العالم في السنوات الخمس القادمة؟"
                        />
                      </div>
                    </div>
                    <div className="form-group">
                      <label htmlFor="maxPlayers">عدد المشاركين</label>
                      <div className="input-wrapper">
                        <FaUsers className="input-icon" />
                        <input
                          type="number"
                          id="maxPlayers"
                          value={maxPlayers}
                          onChange={(e) => setMaxPlayers(e.target.value)}
                          min="2"
                          max="20"
                        />
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
                        />
                      </div>
                    </div>
                    <button type="submit" className="btn btn-primary">
                      <FaPlusCircle /> ابدأ الجلسة
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
                  <div className="no-sessions">جاري التحميل...</div>
                ) : filteredSessions.length > 0 ? (
                  filteredSessions.map((session) => (
                    <div
                      key={session._id}
                      className="session-card"
                      onClick={() => router.push(`/sessions/${session.code}`)}
                    >
                      <div className="session-title">{session.question}</div>
                      <div className="session-meta">
                        <div className="session-date">
                          <FaCalendarAlt />
                          <span>{formatDate(session.createdAt)}</span>
                        </div>
                        <div className="session-players">
                          <FaUsers />
                          <span>
                            {session.participants.length}/{session.maxPlayers} لاعبين
                          </span>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="no-sessions">لا توجد جلسات متاحة</div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}