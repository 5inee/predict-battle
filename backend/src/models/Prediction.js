const mongoose = require('mongoose');

const predictionSchema = new mongoose.Schema({
  session: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Session',
    required: true
  },
  game: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Session'
  },
  // للمستخدمين المسجلين
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  // للضيوف
  guestId: {
    type: String
  },
  guestName: {
    type: String
  },
  content: {
    type: String,
    required: true,
    trim: true
  },
  submittedAt: {
    type: Date,
    default: Date.now
  }
});

// إضافة منطق ما قبل الحفظ لضمان أن game تم تعيينها من session إذا كانت فارغة
predictionSchema.pre('save', function(next) {
  // إذا كان حقل game غير موجود وحقل session موجود، نقوم بتعيين game = session
  if (!this.game && this.session) {
    this.game = this.session;
  }
  
  // التحقق من وجود معلومات المستخدم
  if (!this.user && !this.guestId) {
    return next(new Error('Either user or guestId is required'));
  }
  
  next();
});

// تعديل الفهرس ليتعامل مع المستخدمين المسجلين والضيوف
predictionSchema.index({ 
  session: 1, 
  user: 1
}, { 
  unique: true, 
  partialFilterExpression: { user: { $exists: true } } 
});

predictionSchema.index({ 
  session: 1, 
  guestId: 1
}, { 
  unique: true, 
  partialFilterExpression: { guestId: { $exists: true } } 
});

const Prediction = mongoose.model('Prediction', predictionSchema);

module.exports = Prediction;