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
  FaHashtag,
  FaSpinner,
  FaArrowLeft,
  FaShare,
  FaExclamationCircle,
  FaHourglassHalf,
  FaSadTear,
  FaUserCheck,
  FaUserEdit,
  FaLock,
  FaExclamationCircle
} from 'react-icons/fa';

export default function SessionDetail() {
  const [session, setSession] = useState(null);
  const [predictions, setPredictions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [prediction, setPrediction] = useState('');
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  const [remainingChars, setRemainingChars] = useState(1000);
  
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  const { code } = router.query;

  const MAX_CHARS = 1000; // الحد الأقصى للأحرف في التوقع

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
        setError(err.response?.data?.message || 'فشل في تحميل تفاصيل الجلسة');
        setLoading(false);
      }
    };

    if (isAuthenticated()) {
      fetchSessionDetails();
    }
  }, [code, isAuthenticated, user]);

  // تتبع عدد الأحرف المتبقية
  useEffect(() => {
    setRemainingChars(MAX_CHARS - prediction.length);
  }, [prediction]);

  // إرسال التوقع
  const handleSubmitPrediction = async (e) => {
    e.preventDefault();
    if (!prediction.trim()) {
      setError('الرجاء إدخال توقعك');
      return;
    }

    if (prediction.length > MAX_CHARS) {
      setError(`الرجاء تقليل عدد الأحرف إلى ${MAX_CHARS} حرف كحد أقصى`);
      return;
    }

    try {
      setSubmitting(true);
      setError(null);
      const response = await api.post('/predictions', {
        sessionId: session._id,
        content: prediction
      });
      
      setPredictions(response.data.predictions);
      setHasSubmitted(true);
      setSubmitting(false);
    } catch (err) {
      setError(err.response?.data?.message || 'فشل في إرسال التوقع');
      setSubmitting(false);
    }
  };

  // مشاركة الجلسة
  const handleShare = () => {
    setShowShareModal(true);
  };

  // نسخ رابط الجلسة
  const copySessionLink = () => {
    const sessionLink = `${window.location.origin}/sessions/${code}`;
    navigator.clipboard.writeText(sessionLink);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
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
    return username ? username.charAt(0).toUpperCase() : '؟';
  };

  // توليد لون عشوائي ثابت لكل مستخدم
  const getRandomColor = (userId) => {
    const colors = [
      '#6366f1', '#8b5cf6', '#ec4899', '#f43f5e', '#f97316',
      '#84cc16', '#10b981', '#06b6d4', '#3b82f6', '#6b7280'
    ];
    
    // استخدام رقم المستخدم لتحديد اللون
    const index = userId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % colors.length;
    return colors[index];
  };

  // العودة إلى صفحة الجلسات
  const handleBack = () => {
    router.push('/sessions');
  };

  if (!isAuthenticated() || loading) {
    return (
      <Layout title="PredictBattle - جاري التحميل">
        <div className="card">
          <div className="card-body">
            <div className="no-sessions" style={{ padding: '100px 0' }}>
              <FaHourglassHalf size={40} style={{ marginBottom: '15px', opacity: 0.5, animation: 'spin 2s linear infinite' }} />
              <div>جاري تحميل تفاصيل الجلسة...</div>
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
              <FaExclamationCircle />
              <span>{error}</span>
            </div>
            <button onClick={handleBack} className="btn btn-primary">
              <FaArrowLeft /> العودة إلى الجلسات
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
          <div className="card-body" style={{ textAlign: 'center', padding: '40px 20px' }}>
            <FaSadTear size={60} style={{ color: 'var(--medium)', marginBottom: '20px', opacity: 0.7 }} />
            <h2 style={{ fontSize: '24px', marginBottom: '15px', color: 'var(--dark)' }}>الجلسة غير موجودة</h2>
            <p style={{ color: 'var(--medium)', marginBottom: '25px' }}>لم نتمكن من العثور على الجلسة المطلوبة</p>
            <button onClick={handleBack} className="btn btn-primary" style={{ maxWidth: '200px', margin: '0 auto' }}>
              <FaArrowLeft /> العودة إلى الجلسات
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
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <h1>{session.question}</h1>
            <button 
              onClick={handleShare}
              style={{
                background: 'rgba(255, 255, 255, 0.2)',
                border: 'none',
                padding: '8px 12px',
                borderRadius: 'var(--border-radius-md)',
                color: 'white',
                cursor: 'pointer',
                fontSize: '14px',
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                transition: 'var(--transition-normal)'
              }}
              onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.3)'}
              onMouseOut={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)'}
            >
              <FaShare />
              <span>مشاركة</span>
            </button>
          </div>
          <div className="subtitle" style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', marginTop: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <FaHashtag style={{ opacity: 0.8 }} />
              <span>كود الجلسة: {session.code}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <FaUsers style={{ opacity: 0.8 }} />
              <span>المشاركون: {session.participants.length}/{session.maxPlayers}</span>
            </div>
          </div>
        </div>
        
        <div className="card-body">
          {/* حالة الجلسة */}
          {session.participants.length < session.maxPlayers && (
            <div className="alert alert-warning">
              <FaExclamationTriangle />
              <span>
                في انتظار انضمام اللاعبين... ({session.participants.length}/{session.maxPlayers})
                {session.participants.length > 1 && " - بإمكانك إرسال توقعك حتى مع عدم اكتمال العدد"}
              </span>
            </div>
          )}
          
          {hasSubmitted && predictions.length === 1 && (
            <div className="alert alert-info">
              <FaUserCheck />
              <span>تم إرسال توقعك بنجاح! في انتظار مشاركة باقي المتسابقين لتوقعاتهم...</span>
            </div>
          )}
          
          {hasSubmitted && predictions.length > 1 && (
            <div className="alert alert-success">
              <FaCheck />
              <span>تم إرسال توقعك بنجاح! يمكنك الآن مشاهدة توقعات المشاركين الآخرين.</span>
            </div>
          )}
          
          {/* نموذج إرسال التوقع */}
          {!hasSubmitted && (
            <div style={{
              background: 'rgba(99, 102, 241, 0.05)',
              padding: '25px',
              borderRadius: 'var(--border-radius-lg)',
              marginBottom: '25px',
              border: '1px solid rgba(99, 102, 241, 0.1)'
            }}>
              <h2 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '15px', color: 'var(--primary)' }}>
                <FaUserEdit style={{ marginLeft: '8px', display: 'inline', verticalAlign: 'middle' }} />
                أدخل توقعك
              </h2>
              
              {error && (
                <div className="alert alert-error" style={{ marginBottom: '15px' }}>
                  <FaExclamationCircle />
                  <span>{error}</span>
                </div>
              )}
              
              <form onSubmit={handleSubmitPrediction}>
                <div className="form-group" style={{ marginBottom: '15px' }}>
                  <textarea
                    value={prediction}
                    onChange={(e) => setPrediction(e.target.value)}
                    placeholder="اكتب توقعك هنا... (الحد الأقصى 1000 حرف)"
                    rows="5"
                    style={{
                      width: '100%',
                      padding: '15px',
                      borderRadius: 'var(--border-radius-md)',
                      border: remainingChars < 0 ? '2px solid var(--error)' : '2px solid #e2e8f0',
                      resize: 'vertical',
                      transition: 'var(--transition-normal)',
                      fontFamily: 'inherit'
                    }}
                    disabled={submitting}
                    maxLength={MAX_CHARS}
                  />
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    marginTop: '8px',
                    fontSize: '13px',
                    color: remainingChars < 0 ? 'var(--error)' : remainingChars < 100 ? 'var(--warning)' : 'var(--medium)'
                  }}>
                    <span>
                      {remainingChars < 0 ? (
                        <FaExclamationCircle style={{ marginLeft: '5px' }} />
                      ) : null}
                      المتبقي: {remainingChars} حرف
                    </span>
                    <span>
                      {prediction.length} / {MAX_CHARS}
                    </span>
                  </div>
                </div>
                
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={submitting || remainingChars < 0}
                  style={{ maxWidth: '200px' }}
                >
                  {submitting ? (
                    <>
                      <FaSpinner style={{ animation: 'spin 1s linear infinite' }} />
                      <span>جاري الإرسال...</span>
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
              <h2 style={{ 
                fontSize: '20px', 
                fontWeight: '600', 
                marginBottom: '20px', 
                color: 'var(--dark)',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <FaUsers /> توقعات المشاركين ({predictions.length})
              </h2>
              
              <div className="predictions-list">
                {predictions.map((p) => (
                  <div
                    key={p._id}
                    className={`prediction-card ${p.user._id === user.id ? 'self' : ''}`}
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
                          <span>{formatDateTime(p.submittedAt)}</span>
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
          
          {/* زر العودة للجلسات */}
          <div style={{ marginTop: '20px', textAlign: 'center' }}>
            <button 
              onClick={handleBack} 
              className="btn btn-secondary" 
              style={{ maxWidth: '200px' }}
            >
              <FaArrowLeft /> العودة إلى الجلسات
            </button>
          </div>
        </div>
      </div>
      
      {/* مودال المشاركة */}
      {showShareModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: 'var(--border-radius-lg)',
            width: '100%',
            maxWidth: '450px',
            padding: '25px',
            boxShadow: 'var(--shadow-lg)'
          }}>
            <h3 style={{ fontSize: '20px', marginBottom: '15px' }}>مشاركة الجلسة</h3>
            
            {copySuccess && (
              <div className="alert alert-success" style={{ marginBottom: '15px' }}>
                <FaCheck />
                <span>تم نسخ الرابط بنجاح!</span>
              </div>
            )}
            
            <p style={{ marginBottom: '15px', color: 'var(--medium)' }}>
              شارك هذا الرابط مع أصدقائك للانضمام إلى الجلسة:
            </p>
            
            <div style={{
              display: 'flex',
              marginBottom: '20px',
              gap: '10px'
            }}>
              <input
                type="text"
                value={`${typeof window !== 'undefined' ? window.location.origin : ''}/sessions/${code}`}
                readOnly
                style={{
                  padding: '12px',
                  borderRadius: 'var(--border-radius-md)',
                  border: '1px solid #e2e8f0',
                  flex: 1,
                  backgroundColor: '#f8fafc'
                }}
              />
              <button
                onClick={copySessionLink}
                className="btn btn-primary"
                style={{ width: 'auto', margin: 0, padding: '10px 15px' }}
              >
                <FaShare /> نسخ
              </button>
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '10px' }}>
              <div>
                <strong>كود الجلسة: </strong> {code}
              </div>
              <button
                onClick={() => setShowShareModal(false)}
                style={{
                  backgroundColor: 'transparent',
                  border: 'none',
                  color: 'var(--primary)',
                  cursor: 'pointer',
                  fontSize: '15px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px'
                }}
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* أضف أنماط CSS لدوران الأيقونة */}
      <style jsx>{`
        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </Layout>
  );
}