// frontend/src/api/api.js
import axios from 'axios';

// تكوين نقطة نهاية API
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// إنشاء نسخة من أكسيوس مع الإعدادات الأساسية
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// إضافة معترض للطلبات لإضافة توكن المصادقة
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// خدمات المصادقة
export const authAPI = {
  register: (userData) => api.post('/auth/register', userData),
  login: (credentials) => api.post('/auth/login', credentials),
  getMe: () => api.get('/auth/me'),
};

// خدمات الجلسات
export const sessionAPI = {
  create: (sessionData) => api.post('/sessions/create', sessionData),
  join: (sessionCode) => api.post('/sessions/join', sessionCode),
  submit: (predictionData) => api.post('/sessions/predict', predictionData),
  getSession: (sessionId) => api.get(`/sessions/${sessionId}`),
  getUserSessions: () => api.get('/sessions'),
};

export default api;