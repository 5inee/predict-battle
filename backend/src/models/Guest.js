// في ملف جديد: backend/src/models/Guest.js

const mongoose = require('mongoose');

const guestSchema = new mongoose.Schema({
  guestId: {
    type: String,
    required: true,
    unique: true
  },
  username: {
    type: String,
    required: true,
    trim: true
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 60 * 60 * 24 * 7 // سيتم حذف المستخدمين الضيوف بعد أسبوع من عدم النشاط
  }
});

const Guest = mongoose.model('Guest', guestSchema);

module.exports = Guest;