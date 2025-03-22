const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const dotenv = require('dotenv');

// تحميل المتغيرات البيئية
dotenv.config();

// إنشاء تطبيق إكسبرس
const app = express();

// الوسائط (Middleware)
app.use(cors());
app.use(express.json());

// توصيل قاعدة البيانات
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('تم الاتصال بقاعدة البيانات MongoDB بنجاح'))
  .catch(err => console.error('خطأ في الاتصال بقاعدة البيانات:', err));

// تعريف المسارات
const authRoutes = require('./routes/auth');
const sessionRoutes = require('./routes/sessions');

app.use('/api/auth', authRoutes);
app.use('/api/sessions', sessionRoutes);

// مسار الاختبار الأساسي
app.get('/', (req, res) => {
  res.send('مرحبًا بك في API الخاص بـ PredictBattle!');
});

// تكوين الخادم للإنتاج إذا كان في بيئة الإنتاج
if (process.env.NODE_ENV === 'production') {
  const configureProduction = require('./config/production');
  configureProduction(app);
}

// تحديد المنفذ والاستماع للطلبات
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`الخادم يعمل على المنفذ ${PORT}`);
});