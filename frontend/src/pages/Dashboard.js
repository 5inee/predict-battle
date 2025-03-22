// frontend/src/pages/Dashboard.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSession } from '../context/SessionContext';
import { FormInput, SubmitButton, ErrorMessage, SuccessMessage } from '../components/FormComponents';
import { FaPlusCircle, FaSignInAlt } from 'react-icons/fa';

const Dashboard = () => {
  const { user } = useAuth();
  const { createSession, joinSession, loading, error } = useSession();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('join'); // 'join' or 'create'
  const [sessionCode, setSessionCode] = useState('');
  const [question, setQuestion] = useState('');
  const [maxPlayers, setMaxPlayers] = useState(5);
  const [formError, setFormError] = useState('');
  const [success, setSuccess] = useState('');

  // التبديل بين علامات التبويب
  const toggleTab = (tab) => {
    setActiveTab(tab);
    setFormError('');
    setSuccess('');
  };

  // إنشاء جلسة جديدة
  const handleCreateSession = async (e) => {
    e.preventDefault();
    setFormError('');
    setSuccess('');

    if (!question.trim()) {
      setFormError('الرجاء إدخال سؤال التوقع');
      return;
    }

    if (maxPlayers < 2 || maxPlayers > 50) {
      setFormError('يجب أن يكون عدد اللاعبين بين 2 و 50');
      return;
    }

    try {
      const session = await createSession(question, maxPlayers);
      setSuccess(`تم إنشاء الجلسة بنجاح! كود الجلسة: ${session.code}`);
      
      // انتقال إلى صفحة الجلسة بعد ثانيتين
      setTimeout(() => {
        navigate(`/session/${session.id}`);
      }, 2000);
    } catch (err) {
      setFormError(err.response?.data?.message || 'خطأ في إنشاء الجلسة');
    }
  };

  // الانضمام إلى جلسة
  const handleJoinSession = async (e) => {
    e.preventDefault();
    setFormError('');
    setSuccess('');

    if (!sessionCode.trim()) {
      setFormError('الرجاء إدخال كود الجلسة');
      return;
    }

    try {
      const session = await joinSession(sessionCode);
      setSuccess('تم الانضمام للجلسة بنجاح!');
      
      // انتقال إلى صفحة الجلسة بعد ثانية
      setTimeout(() => {
        navigate(`/session/${session.id}`);
      }, 1000);
    } catch (err) {
      setFormError(err.response?.data?.message || 'خطأ في الانضمام للجلسة');
    }
  };

  return (
    <div className="dashboard-container">
      <div className="welcome-section">
        <h2>مرحبًا، {user?.username}!</h2>
        <p>مرحبًا بك في منصة التوقعات. ابدأ الآن بإنشاء جلسة جديدة أو انضم إلى جلسة موجودة.</p>
      </div>

      <div className="session-options">
        <div className="tabs">
          <button
            className={`tab ${activeTab === 'join' ? 'active' : ''}`}
            onClick={() => toggleTab('join')}
          >
            <FaSignInAlt /> انضم إلى جلسة
          </button>
          <button
            className={`tab ${activeTab === 'create' ? 'active' : ''}`}
            onClick={() => toggleTab('create')}
          >
            <FaPlusCircle /> إنشاء جلسة جديدة
          </button>
        </div>

        <div className="tab-content">
          {/* نموذج الانضمام إلى جلسة */}
          {activeTab === 'join' && (
            <form onSubmit={handleJoinSession} className="session-form">
              <ErrorMessage message={formError || error} />
              <SuccessMessage message={success} />

              <FormInput
                id="sessionCode"
                label="كود الجلسة"
                value={sessionCode}
                onChange={(e) => setSessionCode(e.target.value.toUpperCase())}
              />

              <SubmitButton text="انضم للجلسة" loading={loading} />
            </form>
          )}

          {/* نموذج إنشاء جلسة جديدة */}
          {activeTab === 'create' && (
            <form onSubmit={handleCreateSession} className="session-form">
              <ErrorMessage message={formError || error} />
              <SuccessMessage message={success} />

              <FormInput
                id="question"
                label="سؤال التوقع"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
              />

              <FormInput
                id="maxPlayers"
                label="الحد الأقصى لعدد اللاعبين"
                type="number"
                value={maxPlayers}
                onChange={(e) => setMaxPlayers(parseInt(e.target.value))}
              />

              <SubmitButton text="إنشاء جلسة" loading={loading} />
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;