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
  FaSpinner,
  FaUser,
  FaUsers,
  FaArrowRight,
  FaShare,
  FaCopy
} from 'react-icons/fa';

export default function SessionDetail() {
  const [session, setSession] = useState(null);
  const [predictions, setPredictions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [prediction, setPrediction] = useState('');
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [copiedToClipboard, setCopiedToClipboard] = useState(false);
  
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  const { code } = router.query;

  // التحقق من تسجيل الدخول
  useEffect(() => {
    if (typeof window !== 'undefined' && !isAuthenticated()) {
      router.push('/');
    }
  }, [isAuthenticated, router]);

  // جلب تفاصيل الجلسة والتوقعات
  useEffect(() => {
    const fetchSessionDetails = async () => {
      if (!code) return;
      
      try {
        setLoading(true);
        const response = await api.get(`/sessions/${code}`);
        setSession(response.data.session);
        setPredictions(response.data.predictions);
        
        // التحقق مما إذا كان المستخدم قد قدم توقعًا
        if (user && response.data.predictions.some(p => p.user._id === user.id)) {
          setHasSubmitted(true);
        }
        
        setLoading(false);
      } catch (err) {
        setError('فشل في تحميل تفاصيل الجلسة');
        setLoading(false);
      }
    };

    if (isAuthenticated()) {
      fetchSessionDetails();
    }
  }, [code, isAuthenticated, user]);

  // مسح إشعار النسخ بعد 3 ثوان
  useEffect(() => {
    if (copiedToClipboard) {
      const timer = setTimeout(() => {
        setCopiedToClipboard(false);
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, [copiedToClipboard]);

  // إرسال التوقع
  const handleSubmitPrediction = async (e) => {
    e.preventDefault();
    if (!prediction.trim()) {
      setError('الرجاء إدخال توقعك');
      return;
    }

    try {
      setSubmitting(true);
      const response = await api.post('/predictions', {
        sessionId: session._id,
        content: prediction
      });
      
      setPredictions(response.data.predictions);
      setHasSubmitted(true);
      setPrediction('');
      setSubmitting(false);
    } catch (err) {
      setError(err.response?.data?.message || 'فشل في إرسال التوقع');
      setSubmitting(false);
    }
  };

  // نسخ رابط المشاركة
  const handleShareClick = () => {
    if (typeof window !== 'undefined' && session) {
      const url = `${window.location.origin}/sessions/${session.code}`;
      navigator.clipboard.writeText(url);
      setCopiedToClipboard(true);
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
      '#4f46e5', '#0ea5e9', '#06b6d4', '#10b981', '#f59e0b',
      '#8b5cf6', '#ec4899', '#f43f5e', '#6366f1', '#14b8a6'
    ];
    
    // استخدام رقم المستخدم لتحديد اللون
    const index = userId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % colors.length;
    return colors[index];
  };

  if (!isAuthenticated() || loading) {
    return (
      <Layout title="PredictBattle - جاري التحميل">
        <div className="card">
          <div className="card-body" style={{ textAlign: 'center', padding: '60px 20px' }}>
            <FaSpinner style={{ fontSize: '32px', marginBottom: '16px', color: 'var(--primary)', animation: 'spin 1s linear infinite' }} />
            <div>جاري تحميل تفاصيل الجلسة...</div>
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
              <FaExclamationTriangle /> الجلسة غير موجودة
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
      <div className="card">
        <div className="card-header">
          <h1>{session.question}</h1>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '8px' }}>
            <p className="subtitle">
              كود الجلسة: <strong>{session.code}</strong> | المشاركون: {session.participants.length}/{session.maxPlayers}
            </p>
            <button 
              onClick={handleShareClick} 
              className="btn btn-secondary"
              style={{ 
                padding: '6px 12px', 
                fontSize: '14px',
                backgroundColor: copiedToClipboard ? 'var(--success)' : '',
                color: copiedToClipboard ? 'white' : ''
              }}
            >
              {copiedToClipboard ? (
                <>
                  <FaCheck /> تم النسخ
                </>
              ) : (
                <>
                  <FaShare /> مشاركة
                </>
              )}
            </button>
          </div>
        </div>
        <div className="card-body">
          {/* حالة الجلسة */}
          {session.participants.length < session.maxPlayers && (
            <div className="alert alert-warning">
              <FaExclamationTriangle /> في انتظار انضمام المشاركين... ({session.participants.length}/{session.maxPlayers})
            </div>
          )}
          
          {hasSubmitted && (
            <div className="alert alert-success">
              <FaCheck /> تم إرسال توقعك بنجاح! يمكنك الآن مشاهدة توقعات الآخرين.
            </div>
          )}
          
          {/* قائمة المشاركين */}
          <div className="participants-container">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
              <FaUsers style={{ color: 'var(--primary)' }} />
              <h2 style={{ fontSize: '18px', margin: 0 }}>المشاركون</h2>
            </div>
            
            <div className="participants-list" style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '24px' }}>
              {session.participants.map((participant) => (
                <div
                  key={participant.user._id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    backgroundColor: 'var(--light)',
                    padding: '8px 12px',
                    borderRadius: '20px',
                    fontSize: '14px'
                  }}
                >
                  <div
                    style={{
                      width: '26px',
                      height: '26px',
                      borderRadius: '50%',
                      backgroundColor: getRandomColor(participant.user._id),
                      color: 'white',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 'bold',
                      fontSize: '12px'
                    }}
                  >
                    {getInitial(participant.user.username)}
                  </div>
                  <span>
                    {participant.user.username}
                    {participant.user._id === user.id && " (أنت)"}
                  </span>
                </div>
              ))}
            </div>
          </div>
          
          {/* نموذج إرسال التوقع */}
          {!hasSubmitted && (
            <div className="prediction-form-container">
              <form onSubmit={handleSubmitPrediction}>
                <div className="form-group">
                  <label htmlFor="prediction">أدخل توقعك للسؤال المطروح</label>
                  <div className="input-wrapper">
                    <textarea
                      id="prediction"
                      value={prediction}
                      onChange={(e) => setPrediction(e.target.value)}
                      placeholder="اكتب توقعك هنا... كن مبدعاً ودقيقاً في إجابتك!"
                      rows="4"
                      disabled={submitting}
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={submitting}
                >
                  {submitting ? (
                    <>
                      <FaSpinner className="spin" /> جاري إرسال التوقع...
                    </>
                  ) : (
                    <>
                      <FaPaperPlane /> إرسال توقعي
                    </>
                  )}
                </button>
              </form>
            </div>
          )}
          
          {/* عرض التوقعات */}
          {hasSubmitted && predictions.length > 0 && (
            <div className="predictions-container">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px', marginTop: '32px' }}>
                <FaUser style={{ color: 'var(--primary)' }} />
                <h2 style={{ fontSize: '18px', margin: 0 }}>التوقعات</h2>
              </div>
              
              <div className="predictions-list">
                {predictions.map((p) => (
                  <div
                    key={p._id}
                    className={`prediction-card ${p.user._id === user.id ? 'current-user' : ''}`}
                  >
                    <div className="prediction-header">
                      <div
                        className="user-avatar"
                        style={{
                          backgroundColor: getRandomColor(p.user._id)
                        }}
                      >
                        {getInitial(p.user.username)}
                      </div>
                      <div className="user-info">
                        <div className="username">
                          {p.user.username} {p.user._id === user.id ? '(أنت)' : ''}
                        </div>
                        <div className="timestamp">
                          <FaClock style={{ fontSize: '12px' }} />
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
          
          {/* زر العودة */}
          <div style={{ marginTop: '24px' }}>
            <div className="back-link" onClick={() => router.push('/sessions')}>
              <FaArrowRight /> العودة إلى قائمة الجلسات
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}