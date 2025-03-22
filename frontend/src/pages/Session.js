// frontend/src/pages/Session.js
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSession } from '../context/SessionContext';
import { FormInput, SubmitButton, ErrorMessage, PredictionCard } from '../components/FormComponents';
import { FaUsers, FaRegCopy, FaCheck } from 'react-icons/fa';

const Session = () => {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { getSession, submitPrediction, currentSession, loading, error } = useSession();

  const [prediction, setPrediction] = useState('');
  const [formError, setFormError] = useState('');
  const [copied, setCopied] = useState(false);
  const [hasPredicted, setHasPredicted] = useState(false);

  // تحميل بيانات الجلسة
  useEffect(() => {
    const loadSession = async () => {
      try {
        await getSession(sessionId);
      } catch (err) {
        console.error('خطأ في تحميل الجلسة:', err);
        navigate('/dashboard');
      }
    };

    loadSession();
  }, [sessionId, getSession, navigate]);

  // التحقق مما إذا كان المستخدم قد أرسل توقعًا بالفعل
  useEffect(() => {
    if (currentSession && user) {
      const userPrediction = currentSession.predictions.find(
        (p) => p.user === user.id || p.username === user.username
      );
      
      if (userPrediction) {
        setHasPredicted(true);
        setPrediction(userPrediction.prediction);
      }
    }
  }, [currentSession, user]);

  // إرسال التوقع
  const handleSubmitPrediction = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!prediction.trim()) {
      setFormError('الرجاء إدخال توقعك');
      return;
    }

    try {
      await submitPrediction(sessionId, prediction);
      setHasPredicted(true);
    } catch (err) {
      setFormError(err.response?.data?.message || 'خطأ في إرسال التوقع');
    }
  };

  // نسخ كود الجلسة
  const copySessionCode = () => {
    if (currentSession) {
      navigator.clipboard.writeText(currentSession.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // التحقق من تحميل الجلسة
  if (loading && !currentSession) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>جاري تحميل بيانات الجلسة...</p>
      </div>
    );
  }

  // التحقق من وجود الجلسة
  if (!currentSession) {
    return (
      <div className="error-container">
        <h2>خطأ</h2>
        <p>لم يتم العثور على الجلسة أو حدث خطأ في التحميل.</p>
        <button className="btn" onClick={() => navigate('/dashboard')}>
          العودة للرئيسية
        </button>
      </div>
    );
  }

  return (
    <div className="session-container">
      <div className="session-header">
        <h2>{currentSession.question}</h2>
        
        <div className="session-meta">
          <div className="session-code-container">
            <span>كود الجلسة: </span>
            <span className="session-code">{currentSession.code}</span>
            <button className="btn-icon" onClick={copySessionCode}>
              {copied ? <FaCheck className="text-success" /> : <FaRegCopy />}
            </button>
          </div>
          
          <div className="participants-info">
            <FaUsers />
            <span>
              {currentSession.currentPlayers}/{currentSession.maxPlayers} مشارك
            </span>
          </div>
        </div>
      </div>

      <div className="session-content">
        {/* نموذج إرسال التوقع */}
        {!hasPredicted ? (
          <div className="prediction-form-container">
            <h3>أدخل توقعك</h3>
            
            <form onSubmit={handleSubmitPrediction} className="prediction-form">
              <ErrorMessage message={formError || error} />
              
              <FormInput
                id="prediction"
                label="التوقع"
                value={prediction}
                onChange={(e) => setPrediction(e.target.value)}
              />
              
              <SubmitButton
                text="إرسال التوقع"
                loading={loading}
                disabled={hasPredicted}
              />
            </form>
          </div>
        ) : (
          <div className="user-prediction">
            <h3>توقعك</h3>
            <div className="prediction-box">
              <p>{prediction}</p>
            </div>
          </div>
        )}

        {/* قائمة التوقعات */}
        <div className="predictions-list">
          <h3>
            التوقعات المرسلة ({currentSession.predictions.length}/{currentSession.currentPlayers})
          </h3>
          
          {currentSession.predictions.length > 0 ? (
            <div className="predictions-container">
              {currentSession.predictions.map((p) => (
                <PredictionCard
                  key={p._id || p.user}
                  prediction={p}
                  isCurrentUser={p.user === user.id || p.username === user.username}
                />
              ))}
            </div>
          ) : (
            <p className="no-predictions">لا توجد توقعات حتى الآن</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Session;