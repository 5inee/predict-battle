// ملف backend/src/routes/predictions.js

const express = require('express');
const router = express.Router();
const predictionController = require('../controllers/predictions');
const authMiddleware = require('../middleware/auth');

// تطبيق وسيط المصادقة المعدل على جميع المسارات
router.use(authMiddleware);

// مسارات التوقعات البسيطة
router.post('/', predictionController.submitPrediction);
router.get('/session/:sessionId', predictionController.getSessionPredictions);

module.exports = router;