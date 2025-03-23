const express = require('express');
const router = express.Router();
const sessionController = require('../controllers/sessions');
const authMiddleware = require('../middleware/auth');

// Apply auth middleware to all routes
router.use(authMiddleware);

// Create new session
router.post('/', sessionController.createSession);

// Join session
router.post('/join/:code', sessionController.joinSession);

// Get user's sessions
router.get('/user', sessionController.getUserSessions);

// Get session by code
router.get('/:code', sessionController.getSessionByCode);

module.exports = router;