// frontend/src/components/FormComponents.js
import React from 'react';

// مكون حقل الإدخال
export const FormInput = ({ id, label, type = 'text', value, onChange, error }) => {
  return (
    <div className="form-group">
      <label htmlFor={id}>{label}</label>
      <input
        id={id}
        type={type}
        value={value}
        onChange={onChange}
        className={`form-input ${error ? 'error' : ''}`}
      />
      {error && <div className="error-message">{error}</div>}
    </div>
  );
};

// مكون زر الإرسال
export const SubmitButton = ({ text, loading, disabled }) => {
  return (
    <button type="submit" className="btn btn-primary" disabled={loading || disabled}>
      {loading ? 'جاري التحميل...' : text}
    </button>
  );
};

// مكون رسالة الخطأ
export const ErrorMessage = ({ message }) => {
  if (!message) return null;
  return <div className="alert alert-danger">{message}</div>;
};

// مكون رسالة النجاح
export const SuccessMessage = ({ message }) => {
  if (!message) return null;
  return <div className="alert alert-success">{message}</div>;
};

// مكون بطاقة الجلسة
export const SessionCard = ({ session, onClick }) => {
  return (
    <div className="session-card" onClick={onClick}>
      <div className="session-header">
        <h3>{session.question}</h3>
        <span className="session-code">الكود: {session.code}</span>
      </div>
      <div className="session-info">
        <div className="info-item">
          <span className="info-label">المشاركون:</span>
          <span className="info-value">
            {session.currentPlayers}/{session.maxPlayers}
          </span>
        </div>
        <div className="info-item">
          <span className="info-label">التوقعات:</span>
          <span className="info-value">{session.predictionsCount || 0}</span>
        </div>
      </div>
      <div className="session-status">
        <span className={`status ${session.active ? 'active' : 'ended'}`}>
          {session.active ? 'نشطة' : 'منتهية'}
        </span>
      </div>
    </div>
  );
};

// مكون بطاقة التوقع
export const PredictionCard = ({ prediction, isCurrentUser }) => {
  return (
    <div className={`prediction-card ${isCurrentUser ? 'current-user' : ''}`}>
      <div className="prediction-header">
        <h4 className="prediction-username">{prediction.username}</h4>
        {isCurrentUser && <span className="user-tag">(أنت)</span>}
      </div>
      <div className="prediction-content">
        <p>{prediction.prediction}</p>
      </div>
      <div className="prediction-time">
        <small>{new Date(prediction.timestamp).toLocaleString('ar')}</small>
      </div>
    </div>
  );
};