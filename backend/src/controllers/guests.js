// في ملف جديد: backend/src/controllers/guests.js

const Guest = require('../models/Guest');

// تسجيل مستخدم ضيف جديد
exports.registerGuest = async (req, res) => {
  try {
    const { guestId, username } = req.body;
    
    // التحقق من البيانات
    if (!guestId || !username) {
      return res.status(400).json({ message: 'معرف الضيف واسم المستخدم مطلوبان' });
    }
    
    // التحقق من وجود مستخدم ضيف بنفس المعرف
    let guest = await Guest.findOne({ guestId });
    
    if (guest) {
      // إذا كان موجود بالفعل، نقوم بتحديث اسم المستخدم واستعادة التوقيت
      guest.username = username;
      guest.createdAt = new Date(); // تحديث وقت النشاط
      await guest.save();
    } else {
      // إنشاء مستخدم ضيف جديد
      guest = new Guest({
        guestId,
        username
      });
      
      await guest.save();
    }
    
    res.status(201).json({
      guest: {
        id: guest.guestId,
        username: guest.username
      }
    });
  } catch (error) {
    console.error('Error registering guest:', error);
    res.status(500).json({ message: 'خطأ في الخادم' });
  }
};

// الحصول على معلومات مستخدم ضيف
exports.getGuestById = async (req, res) => {
  try {
    const { guestId } = req.params;
    
    const guest = await Guest.findOne({ guestId });
    
    if (!guest) {
      return res.status(404).json({ message: 'مستخدم ضيف غير موجود' });
    }
    
    res.status(200).json({
      guest: {
        id: guest.guestId,
        username: guest.username
      }
    });
  } catch (error) {
    console.error('Error retrieving guest:', error);
    res.status(500).json({ message: 'خطأ في الخادم' });
  }
};