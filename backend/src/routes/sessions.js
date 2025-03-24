const express = require('express');
const router = express.Router();
const sessionController = require('../controllers/sessions');
const authMiddleware = require('../middleware/auth');

// مسار عام للحصول على الجلسة بواسطة الكود - بدون مصادقة
router.get('/:code/public', sessionController.getSessionByCodePublic);

// المسارات التي تحتاج إلى مصادقة
router.post('/', authMiddleware, sessionController.createSession);
router.post('/join/:code', authMiddleware, sessionController.joinSession);
router.get('/user', authMiddleware, sessionController.getUserSessions);
router.get('/:code', authMiddleware, sessionController.getSessionByCode);

module.exports = router;