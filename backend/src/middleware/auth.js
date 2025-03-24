// ملف backend/src/middleware/auth.js

const jwt = require('jsonwebtoken');
const User = require('../models/User');

const authMiddleware = async (req, res, next) => {
  try {
    // التحقق من وجود معلمات الضيف
    const isGuest = req.query.guest === 'true';
    const guestId = req.query.guestId;
    const guestName = req.query.guestName;
    
    // إذا كان طلب ضيف صحيح، السماح له بالمرور
    if (isGuest && guestId && guestName) {
      // إضافة معلومات الضيف إلى req للاستخدام في وحدات التحكم
      req.isGuest = true;
      req.guestUser = {
        id: guestId,
        username: guestName
      };
      return next();
    }
    
    // Get token from header - للمستخدمين المسجلين
    const authHeader = req.header('Authorization');
    if (!authHeader) {
      return res.status(401).json({ message: 'No authentication token, authorization denied' });
    }
    
    const token = authHeader.replace('Bearer ', '');
    
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Find user
    const user = await User.findById(decoded.id);
    
    if (!user) {
      return res.status(401).json({ message: 'User not found or deleted' });
    }
    
    // Add user to request
    req.user = user;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(401).json({ message: 'Token is not valid' });
  }
};

module.exports = authMiddleware;