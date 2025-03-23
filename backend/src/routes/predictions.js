const express = require('express');
const router = express.Router();
const predictionController = require('../controllers/predictions');
const authMiddleware = require('../middleware/auth');

// Apply auth middleware to all routes
router.use(authMiddleware);

// Submit prediction
router.post('/', predictionController.submitPrediction);

// Get predictions for session
router.get('/session/:sessionId', predictionController.getSessionPredictions);

module.exports = router;