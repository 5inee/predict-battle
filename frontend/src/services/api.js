import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 15000 // إضافة مهلة زمنية للطلبات
});

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
        
        // مسح بيانات المصادقة من التخزين المحلي
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

// تحسين وظيفة إرسال التوقع
apiService.predictions = {
  submit: async (sessionId, content) => {
    try {
      // التحقق من المدخلات قبل إرسال الطلب
      if (!sessionId) {
        throw new Error('معرّف الجلسة مطلوب');
      }
      if (!content || content.trim() === '') {
        throw new Error('محتوى التوقع مطلوب');
      }
      
      const response = await api.post('/predictions', { 
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
  
  // باقي الوظائف...
}

// إضافة معترض الاستجابة للتعامل مع أخطاء الخادم
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // تحديد الأخطاء المختلفة
    const customError = {
      message: error.response?.data?.message || 'حدث خطأ غير متوقع. الرجاء المحاولة مرة أخرى.',
      status: error.response?.status || 500,
      data: error.response?.data || {}
    };

    // إذا كان الخطأ متعلق بانتهاء الجلسة، يمكن تسجيل الخروج تلقائيًا
    if (customError.status === 401 && typeof window !== 'undefined') {
      // إذا كانت هناك حاجة لتسجيل الخروج تلقائيًا عند انتهاء الجلسة
      // يمكن إضافة الكود هنا لتسجيل الخروج وإعادة توجيه المستخدم
    }

    // لوجل في الكونسول للتصحيح في بيئة التطوير
    if (process.env.NODE_ENV === 'development') {
      console.error('API Error:', customError);
    }

    return Promise.reject(error);
  }
);

// إضافة وظائف مساعدة لتبسيط استخدام واجهة برمجة التطبيقات
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
    
    join: async (code) => {
      try {
        const response = await api.post(`/sessions/join/${code}`);
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
    
    getByCode: async (code) => {
      try {
        const response = await api.get(`/sessions/${code}`);
        return response.data;
      } catch (error) {
        throw error;
      }
    }
  },

  // طلبات التوقعات
  predictions: {
    submit: async (sessionId, content) => {
      try {
        const response = await api.post('/predictions', { sessionId, content });
        return response.data;
      } catch (error) {
        throw error;
      }
    },
    
    getSessionPredictions: async (sessionId) => {
      try {
        const response = await api.get(`/predictions/session/${sessionId}`);
        return response.data;
      } catch (error) {
        throw error;
      }
    }
  }
};

// تصدير واجهة API الأساسية وأيضًا الخدمة الموسعة
export { apiService };
export default api;