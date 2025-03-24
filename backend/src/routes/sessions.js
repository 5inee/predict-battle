// في ملف backend/src/routes/sessions.js
// نضيف مسارًا جديدًا لا يتطلب مصادقة للوصول إلى تفاصيل الجلسة

const express = require('express');
const router = express.Router();
const sessionController = require('../controllers/sessions');
const authMiddleware = require('../middleware/auth');

// المسارات التي تحتاج إلى مصادقة
router.use('/user', authMiddleware);
router.use('/join', authMiddleware);
router.post('/', authMiddleware, sessionController.createSession);

// مسار عام للحصول على الجلسة بواسطة الكود - بدون مصادقة
// مهم: هذا المسار يجب أن يكون قبل المسار '/:code' المحمي
router.get('/:code/public', sessionController.getSessionByCodePublic);

// المسارات الأخرى المحمية
router.use(authMiddleware);
router.get('/user', sessionController.getUserSessions);
router.get('/:code', sessionController.getSessionByCode);

module.exports = router;