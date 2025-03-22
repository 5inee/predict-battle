// models/Session.js
const mongoose = require('mongoose');
const crypto = require('crypto');

const predictionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  username: {
    type: String,
    required: true
  },
  prediction: {
    type: String,
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

const sessionSchema = new mongoose.Schema({
  code: {
    type: String,
    required: true,
    unique: true
  },
  question: {
    type: String,
    required: true
  },
  host: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  maxPlayers: {
    type: Number,
    required: true,
    min: 2,
    max: 50
  },
  participants: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  predictions: [predictionSchema],
  active: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// إنشاء كود فريد للجلسة
sessionSchema.pre('save', function(next) {
  if (this.isNew) {
    // إنشاء كود عشوائي من 6 أحرف
    this.code = crypto.randomBytes(3).toString('hex').toUpperCase();
  }
  next();
});

const Session = mongoose.model('Session', sessionSchema);

module.exports = Session;