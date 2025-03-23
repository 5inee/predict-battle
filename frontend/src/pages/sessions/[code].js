import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Layout from '../../components/Layout';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import {
  FaClock,
  FaPaperPlane,
  FaExclamationTriangle,
  FaCheck
} from 'react-icons/fa';

export default function SessionDetail() {
  const [session, setSession] = useState(null);
  const [predictions, setPredictions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [prediction, setPrediction] = useState('');
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  
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
      } catch (error) {
        setError('فشل في تحميل تفاصيل الجلسة');
        setLoading(false);
      }
    };

    if (isAuthenticated()) {
      fetchSessionDetails();
    }
  }, [code, isAuthenticated, user]);

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
      setSubmitting(false);
    } catch (error) {
      setError(error.response?.data?.message || 'فشل في إرسال التوقع');
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
      '#4285F4', '#EA4335', '#FBBC05', '#34A853',
      '#5E60CE', '#5390D9', '#6930C3', '#7400B8',
      '#FF7600', '#FF5400', '#FF1053', '#6A0572'
    ];
    
    // استخدام رقم المستخدم لتحديد اللون
    const index = userId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % colors.length;
    return colors[index];
  };

  if (!isAuthenticated() || loading) {
    return (
      <Layout title="PredictBattle - جاري التحميل">
        <div className="card">
          <div className="card-body">
            <div className="no-sessions">جاري التحميل...</div>
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
            <div className="alert alert-error">{error}</div>
            <button onClick={() => router.push('/sessions')} className="btn btn-primary">
              العودة إلى الجلسات
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
            <div className="alert alert-error">الجلسة غير موجودة</div>
            <button onClick={() => router.push('/sessions')} className="btn btn-primary">
              العودة إلى الجلسات
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
          <p className="subtitle">
            كود الجلسة: {session.code} | المشاركون: {session.participants.length}/{session.maxPlayers}
          </p>
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
            <form onSubmit={handleSubmitPrediction}>
              <div className="form-group">
                <label htmlFor="prediction">توقعك</label>
                <textarea
                  id="prediction"
                  value={prediction}
                  onChange={(e) => setPrediction(e.target.value)}
                  placeholder="اكتب توقعك هنا..."
                  rows="4"
                  className="w-full p-4 border-2 border-gray-200 rounded-md"
                  style={{ width: '100%', padding: '14px', borderRadius: 'var(--border-radius-md)', border: '2px solid #e1e4e8' }}
                />
              </div>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={submitting}
              >
                <FaPaperPlane /> إرسال التوقع
              </button>
            </form>
          )}
          
          {/* عرض التوقعات */}
          {predictions.length > 0 && (
            <div className="predictions-container" style={{ marginTop: '30px' }}>
              <h2 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '15px', color: 'var(--dark)' }}>
                التوقعات
              </h2>
              
              <div className="predictions-list">
                {predictions.map((p) => (
                  <div
                    key={p._id}
                    className="prediction-card"
                    style={{
                      backgroundColor: 'white',
                      borderRadius: 'var(--border-radius-md)',
                      padding: '20px',
                      marginBottom: '15px',
                      boxShadow: 'var(--shadow-md)',
                      borderRight: p.user._id === user.id ? '4px solid var(--primary)' : '4px solid var(--secondary)'
                    }}
                  >
                    <div className="prediction-header" style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
                      <div
                        className="user-avatar"
                        style={{
                          width: '40px',
                          height: '40px',
                          borderRadius: '50%',
                          backgroundColor: getRandomColor(p.user._id),
                          color: 'white',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 'bold',
                          marginLeft: '10px'
                        }}
                      >
                        {getInitial(p.user.username)}
                      </div>
                      <div className="user-info">
                        <div className="username" style={{ fontWeight: '600', color: 'var(--dark)' }}>
                          {p.user.username} {p.user._id === user.id ? '(أنت)' : ''}
                        </div>
                        <div className="timestamp" style={{ fontSize: '12px', color: 'var(--medium)' }}>
                          <FaClock style={{ marginLeft: '5px', display: 'inline-block' }} />
                          {formatDateTime(p.submittedAt)}
                        </div>
                      </div>
                    </div>
                    <div className="prediction-content" style={{ whiteSpace: 'pre-wrap', lineHeight: '1.6', color: 'var(--dark)' }}>
                      {p.content}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}