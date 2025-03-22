// routes/sessions.js
const express = require('express');
const router = express.Router();
const sessionController = require('../controllers/sessionController');
const auth = require('../middleware/auth');

// إنشاء جلسة جديدة
router.post('/create', auth, sessionController.createSession);

// الانضمام إلى جلسة
router.post('/join', auth, sessionController.joinSession);

// إرسال توقع
router.post('/predict', auth, sessionController.submitPrediction);

// الحصول على تفاصيل جلسة محددة
router.get('/:sessionId', auth, sessionController.getSession);

// الحصول على جلسات المستخدم
router.get('/', auth, sessionController.getUserSessions);

module.exports = router;