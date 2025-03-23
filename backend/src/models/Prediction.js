const mongoose = require('mongoose');

const predictionSchema = new mongoose.Schema({
  // تغيير اسم الحقل من session إلى game للتوافق مع الفهرس الموجود
  // أو إضافة كلا الحقلين مع التحقق من أن أحدهما على الأقل غير فارغ
  session: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Session',
    required: true
  },
  game: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Session'
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
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
  next();
});

// إضافة فهرس مركب فريد على المستوى المناسب 
// نحن نستبدل الفهرس القديم (game وuser) بفهرس جديد (session وuser)
predictionSchema.index({ session: 1, user: 1 }, { unique: true });

const Prediction = mongoose.model('Prediction', predictionSchema);

module.exports = Prediction;