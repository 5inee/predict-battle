import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 15000 // إضافة مهلة زمنية للطلبات
});

// Define apiService before using it
const apiService = {
  // للحصول على إحصائيات العملية من الخادم (يمكن الاستخدام مستقبلاً)
  getStatus: async () => {
    try {
      const response = await api.get('/');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // طلبات المصادقة
  auth: {
    login: async (username, password) => {
      try {
        const response = await api.post('/auth/login', { username, password });
        return response.data;
      } catch (error) {
        throw error;
      }
    },
    
    register: async (username, password) => {
      try {
        const response = await api.post('/auth/register', { username, password });
        return response.data;
      } catch (error) {
        throw error;
      }
    },
    
    getProfile: async () => {
      try {
        const response = await api.get('/auth/profile');
        return response.data;
      } catch (error) {
        throw error;
      }
    }
  },

  // طلبات الضيوف
  guests: {
    registerGuest: async (guestId, username) => {
      try {
        const response = await api.post('/guests/register', { guestId, username });
        return response.data;
      } catch (error) {
        throw error;
      }
    },
    
    getGuestById: async (guestId) => {
      try {
        const response = await api.get(`/guests/${guestId}`);
        return response.data;
      } catch (error) {
        throw error;
      }
    }
  },

  // طلبات الجلسات
  sessions: {
    create: async (sessionData) => {
      try {
        const response = await api.post('/sessions', sessionData);
        return response.data;
      } catch (error) {
        throw error;
      }
    },
    
    join: async (code, isGuest = false, guestId = null, guestName = null) => {
      try {
        let url = `/sessions/join/${code}`;
        
        // إضافة معلومات الضيف إذا كان متاحًا
        if (isGuest && guestId && guestName) {
          url += `?guest=true&guestId=${guestId}&guestName=${encodeURIComponent(guestName)}`;
        }
        
        const response = await api.post(url);
        return response.data;
      } catch (error) {
        throw error;
      }
    },
    
    getUserSessions: async () => {
      try {
        const response = await api.get('/sessions/user');
        return response.data;
      } catch (error) {
        throw error;
      }
    },
    
    getByCode: async (code, isGuest = false, guestId = null, guestName = null) => {
      try {
        let url = `/sessions/${code}`;
        
        // للضيوف، استخدم المسار العام
        if (isGuest && guestId && guestName) {
          url += `?guest=true&guestId=${guestId}&guestName=${encodeURIComponent(guestName)}`;
        }
        
        const response = await api.get(url);
        return response.data;
      } catch (error) {
        throw error;
      }
    }
  },

  // طلبات التوقعات
  predictions: {
    submit: async (sessionId, content, isGuest = false, guestId = null, guestName = null) => {
      try {
        // التحقق من المدخلات قبل إرسال الطلب
        if (!sessionId) {
          throw new Error('معرّف الجلسة مطلوب');
        }
        if (!content || content.trim() === '') {
          throw new Error('محتوى التوقع مطلوب');
        }
        
        let url = '/predictions';
        
        // إضافة معلومات الضيف إذا كان متاحًا
        if (isGuest && guestId && guestName) {
          url += `?guest=true&guestId=${guestId}&guestName=${encodeURIComponent(guestName)}`;
        }
        
        const response = await api.post(url, { 
          sessionId, 
          content: content.trim() 
        });
        
        return response.data;
      } catch (error) {
        // رمي الخطأ مع معلومات إضافية
        console.error('Error in predictions.submit:', error.message);
        throw error;
      }
    },
    
    getSessionPredictions: async (sessionId, isGuest = false, guestId = null, guestName = null) => {
      try {
        let url = `/predictions/session/${sessionId}`;
        
        // إضافة معلومات الضيف إذا كان متاحًا
        if (isGuest && guestId && guestName) {
          url += `?guest=true&guestId=${guestId}&guestName=${encodeURIComponent(guestName)}`;
        }
        
        const response = await api.get(url);
        return response.data;
      } catch (error) {
        throw error;
      }
    }
  }
};

// إضافة معترض الطلبات لإضافة رمز المصادقة إذا كان موجودًا
// تحسين معترض الطلبات والاستجابات في خدمة API
api.interceptors.request.use(
  (config) => {
    // إضافة وقت طلب للمساعدة في تتبع الأخطاء
    config.metadata = { startTime: new Date() };
    
    // التحقق من وجود localStorage في بيئة المتصفح
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      
      // ملاحظة مهمة: لا نضيف معلومات الضيف تلقائياً لكل الطلبات
      // لأن ذلك قد يسبب مشاكل مع المسارات التي لا تدعم المعلمات
    }
    return config;
  },
  (error) => {
    console.error('Request error:', error);
    return Promise.reject(error);
  }
);

// تحسين معترض الاستجابة
api.interceptors.response.use(
  (response) => {
    // إضافة معلومات وقت الاستجابة للتسجيل
    const requestTime = response.config.metadata.startTime;
    response.config.metadata.endTime = new Date();
    response.config.metadata.duration = response.config.metadata.endTime - requestTime;
    
    return response;
  },
  (error) => {
    // تحديد الأخطاء المختلفة
    const customError = {
      message: error.response?.data?.message || 'حدث خطأ غير متوقع. الرجاء المحاولة مرة أخرى.',
      status: error.response?.status || 500,
      data: error.response?.data || {},
      duration: 0
    };

    // حساب وقت الاستجابة للخطأ
    if (error.config && error.config.metadata) {
      const requestTime = error.config.metadata.startTime;
      const endTime = new Date();
      customError.duration = endTime - requestTime;
    }

    // إذا كان الخطأ متعلق بانتهاء الجلسة
    if (customError.status === 401 && typeof window !== 'undefined') {
      // تحقق مما إذا كان الخطأ بسبب انتهاء صلاحية الجلسة أو توكن غير صالح
      if (error.response?.data?.message?.includes('Token') || 
          error.response?.data?.message?.includes('token') ||
          error.response?.data?.message?.includes('session')) {
        
        // مسح بيانات المصادقة من التخزين المحلي (فقط للمستخدمين المسجلين)
        if (localStorage.getItem('token')) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          
          // إعادة تحميل الصفحة أو توجيه المستخدم إلى صفحة تسجيل الدخول
          if (window.location.pathname !== '/') {
            console.log('Session expired, redirecting to login page...');
            // تأخير قصير قبل إعادة التوجيه لإتاحة الوقت لإنهاء العمليات الحالية
            setTimeout(() => {
              window.location.href = '/';
            }, 100);
          }
        }
      }
    }

    // لوجل في الكونسول للتصحيح في بيئة التطوير
    if (process.env.NODE_ENV === 'development') {
      console.error(`API Error (${customError.status}):`, {
        message: customError.message,
        endpoint: error.config?.url,
        method: error.config?.method?.toUpperCase(),
        duration: `${customError.duration}ms`,
        data: customError.data
      });
    }

    return Promise.reject(error);
  }
);

// تصدير واجهة API الأساسية وأيضًا الخدمة الموسعة
export { apiService };
export default api;