// controllers/authController.js
const User = require('../models/User');
const jwt = require('jsonwebtoken');

// تسجيل مستخدم جديد
const register = async (req, res) => {
  try {
    const { username, password } = req.body;
    
    // التحقق من عدم وجود مستخدم بنفس الاسم
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ message: 'اسم المستخدم مستخدم بالفعل' });
    }
    
    // إنشاء مستخدم جديد
    const user = new User({ username, password });
    await user.save();
    
    // إنشاء توكن JWT
    const token = jwt.sign(
      { id: user._id, username: user.username },
      process.env.JWT_SECRET,
      { expiresIn: '30d' }
    );
    
    res.status(201).json({
      message: 'تم تسجيل المستخدم بنجاح',
      token,
      user: {
        id: user._id,
        username: user.username
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'خطأ في تسجيل المستخدم', error: error.message });
  }
};

// تسجيل الدخول
const login = async (req, res) => {
  try {
    const { username, password } = req.body;
    
    // البحث عن المستخدم
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(404).json({ message: 'اسم المستخدم غير موجود' });
    }
    
    // التحقق من كلمة المرور
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: 'كلمة المرور غير صحيحة' });
    }
    
    // إنشاء توكن JWT
    const token = jwt.sign(
      { id: user._id, username: user.username },
      process.env.JWT_SECRET,
      { expiresIn: '30d' }
    );
    
    res.status(200).json({
      message: 'تم تسجيل الدخول بنجاح',
      token,
      user: {
        id: user._id,
        username: user.username
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'خطأ في تسجيل الدخول', error: error.message });
  }
};

// الحصول على معلومات المستخدم الحالي
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'المستخدم غير موجود' });
    }
    
    res.status(200).json({
      user: {
        id: user._id,
        username: user.username
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'خطأ في الحصول على بيانات المستخدم', error: error.message });
  }
};

module.exports = {
  register,
  login,
  getMe
};