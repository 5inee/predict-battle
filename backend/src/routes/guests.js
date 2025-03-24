// في ملف جديد: backend/src/routes/guests.js

const express = require('express');
const router = express.Router();
const guestController = require('../controllers/guests');

// تسجيل مستخدم ضيف جديد
router.post('/register', guestController.registerGuest);

// الحصول على معلومات مستخدم ضيف
router.get('/:guestId', guestController.getGuestById);

module.exports = router;