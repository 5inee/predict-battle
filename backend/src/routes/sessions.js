const express = require('express');
const router = express.Router();
const sessionController = require('../controllers/sessions');
const authMiddleware = require('../middleware/auth');

// مسارات عامة لا تحتاج إلى مصادقة
router.get('/:code/public', sessionController.getSessionByCodePublic);

// Apply auth middleware to all protected routes
router.post('/', authMiddleware, sessionController.createSession);
router.post('/join/:code', authMiddleware, sessionController.joinSession);
router.get('/user', authMiddleware, sessionController.getUserSessions);
router.get('/:code', authMiddleware, sessionController.getSessionByCode);

module.exports = router;