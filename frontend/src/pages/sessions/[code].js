import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Layout from '../../components/Layout';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import {
  FaClock,
  FaPaperPlane,
  FaExclamationTriangle,
  FaCheck,
  FaUsers,
  FaArrowRight,
  FaCode,
  FaQuestion,
  FaUserSecret,
  FaSignInAlt,
  FaUserPlus
} from 'react-icons/fa';

export default function SessionDetail() {
  const [session, setSession] = useState(null);
  const [predictions, setPredictions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [prediction, setPrediction] = useState('');
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  
  const { user, isAuthenticated, initialized, isGuest, isRegisteredUser } = useAuth();
  const router = useRouter();
  const { code } = router.query;

  // التحقق من تسجيل الدخول
  useEffect(() => {
    if (initialized && !isAuthenticated()) {
      router.push('/');
    }
  }, [initialized, isAuthenticated, router]);

  // جلب تفاصيل الجلسة والتوقعات
// في ملف frontend/src/pages/sessions/[code].js

// جلب تفاصيل الجلسة والتوقعات
useEffect(() => {
  const fetchSessionDetails = async () => {
    if (!code || !initialized || !isAuthenticated()) {
      return;
    }
    
    try {
      setLoading(true);
      console.log('Fetching session details for code:', code);
      
      if (isRegisteredUser()) {
        // المستخدمين المسجلين
        console.log('Fetching as registered user');
        const response = await api.get(`/sessions/${code}`);
        if (response && response.data) {
          setSession(response.data.session);
          setPredictions(response.data.predictions || []);
          
          // التحقق مما إذا كان المستخدم قد قدم توقعًا
          if (response.data.predictions && response.data.predictions.some(p => p.user && p.user._id === user.id)) {
            setHasSubmitted(true);
          }
        }
      } else if (isGuest && user) {
        // الضيوف - نستخدم المسار العام
        console.log('Fetching as guest:', user.id, user.username);
        try {
          const response = await api.get(`/sessions/${code}/public`);
          if (response && response.data) {
            console.log('Public session data received:', response.data);
            setSession(response.data.session);
            setPredictions(response.data.predictions || []);
            
            // التحقق مما إذا كان الضيف قد قدم توقعًا
            if (response.data.predictions && response.data.predictions.some(p => p.guestId === user.id)) {
              setHasSubmitted(true);
            }
          }
        } catch (publicError) {
          console.error('Error fetching public session, falling back to fake session:', publicError);
          
          // إذا فشل الطلب، نقوم بإنشاء جلسة وهمية للضيف
          const fakeSession = {
            _id: `fake_${code}`,
            code: code,
            question: "جلسة توقعات",
            maxPlayers: 10,
            participants: [{ 
              guestId: user.id,
              guestName: user.username,
              joinedAt: new Date()
            }],
            status: 'active',
            createdAt: new Date()
          };
          
          setSession(fakeSession);
          setPredictions([]);
        }
      }
      
      setLoading(false);
    } catch (err) {
      console.error('Error fetching session details:', err);
      setError('فشل في تحميل تفاصيل الجلسة، يرجى المحاولة مرة أخرى.');
      setLoading(false);
    }
  };

  if (initialized && isAuthenticated()) {
    fetchSessionDetails();
  }
}, [code, initialized, isAuthenticated, user, isRegisteredUser, isGuest]);

  // إرسال التوقع
  const handleSubmitPrediction = async (e) => {
    e.preventDefault();
    
    // التحقق من صحة المدخلات
    if (!prediction || !prediction.trim()) {
      setError('الرجاء إدخال توقعك');
      return;
    }
    
    if (!session || !session._id) {
      setError('بيانات الجلسة غير متوفرة، يرجى تحديث الصفحة والمحاولة مرة أخرى');
      return;
    }

    try {
      setSubmitting(true);
      setError(null); // مسح أي خطأ سابق
      console.log('Submitting prediction for session:', session._id);
      
      let response;
      
      if (isRegisteredUser()) {
        // إرسال التوقع للمستخدمين المسجلين
        console.log('Submitting as registered user');
        response = await api.post('/predictions', {
          sessionId: session._id,
          content: prediction.trim()
        });
      } else if (isGuest && user) {
        // إرسال التوقع للضيوف
        console.log('Submitting as guest:', user.id, user.username);
        const guestQueryParams = `?guest=true&guestId=${user.id}&guestName=${encodeURIComponent(user.username)}`;
        response = await api.post(`/predictions${guestQueryParams}`, {
          sessionId: session._id,
          content: prediction.trim()
        });
      }
      
      if (response && response.data && response.data.predictions) {
        console.log('Prediction submitted successfully:', response.data);
        setPredictions(response.data.predictions);
      } else {
        // في حالة نجاح العملية ولكن بدون بيانات التوقعات
        console.log('Prediction submitted but no predictions returned');
        // نضيف توقع المستخدم محلياً مؤقتًا
        const localPrediction = {
          _id: `local_${Date.now()}`,
          user: isRegisteredUser() ? { _id: user.id, username: user.username } : null,
          guestId: isGuest ? user.id : null,
          guestName: isGuest ? user.username : null,
          content: prediction.trim(),
          submittedAt: new Date().toISOString()
        };
        
        setPredictions(prev => [...prev, localPrediction]);
      }
      
      setHasSubmitted(true);
      setPrediction(''); // مسح مربع الإدخال بعد الإرسال الناجح
      setSubmitting(false);
    } catch (err) {
      console.error('Error submitting prediction:', err);
      
      // معالجة مختلف أنواع الخطأ
      if (err.response) {
        // الخادم استجاب برمز حالة خارج نطاق 2xx
        if (err.response.status === 403) {
          setError('غير مصرّح لك بإرسال توقع في هذه الجلسة');
        } else if (err.response.status === 404) {
          setError('الجلسة غير موجودة أو تم حذفها');
        } else if (err.response.status === 400) {
          setError(err.response.data.message || 'بيانات غير صحيحة، يرجى التحقق من المدخلات');
        } else {
          setError(err.response.data.message || 'حدث خطأ في الخادم، يرجى المحاولة مرة أخرى لاحقًا');
        }
      } else if (err.request) {
        // تم إنشاء الطلب ولكن لم يتم استلام استجابة
        setError('لا يمكن الاتصال بالخادم، يرجى التحقق من اتصالك بالإنترنت والمحاولة مرة أخرى');
      } else {
        // حدث خطأ أثناء إعداد الطلب
        setError('حدث خطأ أثناء إرسال التوقع، يرجى المحاولة مرة أخرى');
      }
      
      setSubmitting(false);
    }
  };

  // تنسيق التاريخ والوقت
  const formatDateTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('ar-SA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // الحصول على الحرف الأول من اسم المستخدم
  const getInitial = (username) => {
    return username ? username.charAt(0).toUpperCase() : '?';
  };

  // توليد لون عشوائي ثابت لكل مستخدم
  const getRandomColor = (userId) => {
    const colors = [
      '#4F46E5', '#9333EA', '#0EA5E9', '#10B981', '#F59E0B', 
      '#6366F1', '#8B5CF6', '#EC4899', '#14B8A6', '#F97316'
    ];
    
    // استخدام رقم المستخدم لتحديد اللون
    const index = userId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % colors.length;
    return colors[index];
  };

  // التحقق مما إذا كان المستخدم ضيفًا
  const isUserGuest = (userId) => {
    return userId && userId.toString().startsWith('guest_');
  };

  if (!initialized) {
    return (
      <Layout title="PredictBattle - جار التحميل">
        <div className="card">
          <div className="card-body">
            <div className="loading-text">
              <div className="loading"></div>
              <span>جارِ تحميل البيانات...</span>
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

  if (loading) {
    return (
      <Layout title="PredictBattle - جار التحميل">
        <div className="card">
          <div className="card-body">
            <div className="loading-text">
              <div className="loading"></div>
              <span>جارِ تحميل تفاصيل الجلسة...</span>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout title="PredictBattle - خطأ">
        <div className="card">
          <div className="card-body">
            <div className="alert alert-error">
              <FaExclamationTriangle /> {error}
            </div>
            <button onClick={() => router.push('/sessions')} className="btn btn-primary">
              <FaArrowRight /> العودة إلى الجلسات
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  if (!session) {
    return (
      <Layout title="PredictBattle - غير موجود">
        <div className="card">
          <div className="card-body">
            <div className="alert alert-error">
              <FaExclamationTriangle /> الجلسة غير موجودة أو تم حذفها
            </div>
            <button onClick={() => router.push('/sessions')} className="btn btn-primary">
              <FaArrowRight /> العودة إلى الجلسات
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title={`PredictBattle - ${session.question}`}>
      {isGuest && (
        <div className="alert alert-warning" style={{ marginBottom: '20px' }}>
          <FaUserSecret /> أنت تتصفح كضيف. بعض الميزات قد تكون محدودة. 
          <span 
            onClick={() => router.push('/')} 
            style={{ cursor: 'pointer', fontWeight: 'bold', marginRight: '8px', textDecoration: 'underline' }}
          >
            قم بإنشاء حساب
          </span> 
          للحصول على تجربة كاملة.
        </div>
      )}
      
      <div className="card">
        <div className="card-header">
          <div style={{ 
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            marginBottom: '10px'
          }}>
            <FaQuestion size={20} />
            <h1>{session.question}</h1>
          </div>
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '12px',
            marginTop: '8px'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              background: 'rgba(255, 255, 255, 0.2)',
              padding: '6px 12px',
              borderRadius: '8px',
              fontSize: '14px'
            }}>
              <FaCode /> كود الجلسة: {session.code}
            </div>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              background: 'rgba(255, 255, 255, 0.2)',
              padding: '6px 12px',
              borderRadius: '8px',
              fontSize: '14px'
            }}>
              <FaUsers /> المشاركون: {session.participants.length}/{session.maxPlayers}
            </div>
          </div>
        </div>
        <div className="card-body">
          {/* حالة الجلسة */}
          {session.participants.length < session.maxPlayers && (
            <div className="alert alert-warning">
              <FaExclamationTriangle /> في انتظار انضمام اللاعبين... ({session.participants.length}/{session.maxPlayers})
            </div>
          )}
          
          {hasSubmitted && (
            <div className="alert alert-success">
              <FaCheck /> تم إرسال توقعك بنجاح!
            </div>
          )}
          
          {/* نموذج إرسال التوقع */}
          {!hasSubmitted && (
            <div style={{ marginTop: '20px' }}>
              <h2 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '15px', color: 'var(--dark)' }}>
                أضف توقعك
              </h2>
              
              {error && <div className="alert alert-error"><FaExclamationTriangle /> {error}</div>}
              
              <form onSubmit={handleSubmitPrediction}>
                <div className="form-group">
                  <label htmlFor="prediction">ما هو توقعك؟</label>
                  <textarea
                    id="prediction"
                    value={prediction}
                    onChange={(e) => setPrediction(e.target.value)}
                    placeholder="اكتب توقعك هنا... كن محددًا قدر الإمكان"
                    rows="4"
                    style={{ 
                      width: '100%', 
                      padding: '14px', 
                      borderRadius: 'var(--border-radius-md)', 
                      border: '2px solid rgba(0, 0, 0, 0.08)',
                      minHeight: '120px',
                      fontFamily: 'inherit'
                    }}
                    disabled={submitting}
                  />
                </div>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={submitting}
                >
                  {submitting ? (
                    <>
                      <div className="loading"></div>
                      <span>جار إرسال التوقع...</span>
                    </>
                  ) : (
                    <>
                      <FaPaperPlane /> إرسال التوقع
                    </>
                  )}
                </button>
              </form>
            </div>
          )}
          
          {/* عرض التوقعات */}
          {hasSubmitted && predictions.length > 0 && (
            <div className="predictions-container">
              <h2 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '15px', color: 'var(--dark)' }}>
                التوقعات ({predictions.length})
              </h2>
              
              <div className="predictions-list">
                {predictions.map((p) => (
                  <div
                    key={p._id}
                    className={`prediction-card ${(p.user && p.user._id === user.id) || p.guestId === user.id ? 'mine' : ''}`}
                  >
                    <div className="prediction-header">
                      <div
                        className="user-avatar"
                        style={{
                          backgroundColor: getRandomColor(p.user ? p.user._id : p.guestId || 'unknown')
                        }}
                      >
                        {getInitial(p.user ? p.user.username : p.guestName)}
                      </div>
                      <div className="user-info">
                        <div className="username">
                          {p.user ? p.user.username : p.guestName}
                          {(p.guestId || isUserGuest(p.user?._id)) && <span className="guest-tag">ضيف</span>}
                          {(p.user && p.user._id === user.id) || p.guestId === user.id ? ' (أنت)' : ''}
                        </div>
                        <div className="timestamp">
                          <FaClock style={{ fontSize: '11px' }} />
                          {formatDateTime(p.submittedAt)}
                        </div>
                      </div>
                    </div>
                    <div className="prediction-content">
                      {p.content}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          <div style={{ marginTop: '30px', textAlign: 'center' }}>
            <button 
              onClick={() => router.push('/sessions')}
              className="btn btn-secondary"
              style={{ maxWidth: '200px' }}
            >
              <FaArrowRight /> العودة إلى الجلسات
            </button>
            
            {isGuest && (
              <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'center', gap: '10px' }}>
                <button 
                  onClick={() => router.push('/')} 
                  className="btn btn-primary" 
                  style={{ maxWidth: '180px' }}
                >
                  <FaSignInAlt /> تسجيل الدخول
                </button>
                <button 
                  onClick={() => router.push('/')} 
                  className="btn btn-secondary" 
                  style={{ maxWidth: '180px' }}
                >
                  <FaUserPlus /> إنشاء حساب
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}