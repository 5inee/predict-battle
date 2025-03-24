const express = require('express');
const router = express.Router();
const predictionController = require('../controllers/predictions');
const authMiddleware = require('../middleware/auth');

// مسارات عامة لا تحتاج إلى مصادقة
router.post('/public', predictionController.submitPredictionPublic);
router.get('/session/:sessionId/public', predictionController.getSessionPredictionsPublic);

// المسارات التي تحتاج إلى مصادقة
router.use(authMiddleware);
router.post('/', predictionController.submitPrediction);
router.get('/session/:sessionId', predictionController.getSessionPredictions);

module.exports = router;