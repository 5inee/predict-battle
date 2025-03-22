// middleware/auth.js
const jwt = require('jsonwebtoken');

const auth = (req, res, next) => {
  try {
    // الحصول على التوكن من رأس الطلب
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ message: 'غير مصرح، الرجاء تسجيل الدخول' });
    }
    
    // التحقق من صحة التوكن
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // إضافة معلومات المستخدم للطلب
    req.user = {
      id: decoded.id,
      username: decoded.username
    };
    
    next();
  } catch (error) {
    res.status(401).json({ message: 'توكن غير صالح', error: error.message });
  }
};

module.exports = auth;