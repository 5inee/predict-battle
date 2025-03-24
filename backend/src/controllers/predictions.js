// ملف backend/src/controllers/predictions.js

const Prediction = require('../models/Prediction');
const Session = require('../models/Session');
const mongoose = require('mongoose');

// Submit prediction - unified for both regular users and guests
exports.submitPrediction = async (req, res) => {
  try {
    const { sessionId, content } = req.body;
    const isGuest = req.isGuest === true;
    
    // التحقق من وجود البيانات المطلوبة
    if (!sessionId) {
      return res.status(400).json({ message: 'Session ID is required' });
    }
    
    if (!content || content.trim() === '') {
      return res.status(400).json({ message: 'Prediction content is required' });
    }
    
    // التحقق من صحة معرّف الجلسة (MongoDB ObjectId)
    if (!mongoose.Types.ObjectId.isValid(sessionId)) {
      return res.status(400).json({ message: 'Invalid session ID format' });
    }
    
    console.log(`Prediction request for session ${sessionId} - Guest user: ${isGuest}`);
    
    // العثور على الجلسة
    let session;
    try {
      session = await Session.findById(sessionId);
      
      if (!session) {
        return res.status(404).json({ message: 'Session not found' });
      }
    } catch (err) {
      console.error('Error finding session:', err);
      return res.status(500).json({ message: 'Error retrieving session data' });
    }
    
    // التحقق من المشارك (مختلف للمستخدم المسجل والضيف)
    let isParticipant = false;
    
    if (!isGuest) {
      // مستخدم مسجل
      isParticipant = session.participants.some(p => 
        p.user && p.user.toString() === req.user._id.toString()
      );
    } else {
      // مستخدم ضيف
      isParticipant = session.participants.some(p => 
        p.guestId && p.guestId === req.guestUser.id
      );
    }
    
    if (!isParticipant) {
      // إذا لم يكن مشاركًا، أضفه كمشارك جديد
      if (!isGuest) {
        // إضافة مستخدم مسجل
        session.participants.push({ user: req.user._id });
      } else {
        // إضافة ضيف
        session.participants.push({ 
          guestId: req.guestUser.id, 
          guestName: req.guestUser.username,
          joinedAt: new Date() 
        });
      }
      
      await session.save();
      console.log('Added new participant to session');
    }
    
    // التحقق من التوقع الموجود
    let existingPrediction;
    try {
      if (!isGuest) {
        // مستخدم مسجل
        existingPrediction = await Prediction.findOne({
          $or: [
            { session: sessionId, user: req.user._id },
            { game: sessionId, user: req.user._id }
          ]
        });
      } else {
        // مستخدم ضيف
        existingPrediction = await Prediction.findOne({
          $or: [
            { session: sessionId, guestId: req.guestUser.id },
            { game: sessionId, guestId: req.guestUser.id }
          ]
        });
      }
    } catch (err) {
      console.error('Error finding existing prediction:', err);
      return res.status(500).json({ message: 'Error checking for existing prediction' });
    }
    
    if (existingPrediction) {
      // إرجاع جميع التوقعات للجلسة إذا كان قد قدم توقع بالفعل
      const predictions = await Prediction.find({
        $or: [
          { session: sessionId },
          { game: sessionId }
        ]
      })
      .populate('user', 'username')
      .sort({ submittedAt: 1 });
      
      return res.status(200).json({
        message: 'You have already submitted a prediction',
        predictions,
        prediction: existingPrediction
      });
    }
    
    // إنشاء توقع جديد
    const prediction = new Prediction({
      session: sessionId,
      game: sessionId, // تعيين كلا الحقلين للتوافق مع الفهرس القديم والجديد
      content: content.trim(),
      submittedAt: new Date()
    });
    
    // تعيين معلومات المستخدم حسب نوعه
    if (!isGuest) {
      prediction.user = req.user._id;
    } else {
      prediction.guestId = req.guestUser.id;
      prediction.guestName = req.guestUser.username;
    }
    
    // حفظ التوقع
    try {
      await prediction.save();
      console.log('New prediction saved successfully');
    } catch (err) {
      console.error('Error saving prediction:', err);
      
      if (err.code === 11000) {
        // في حالة حدوث خطأ مفتاح مكرر، ربما تم تقديم توقع بالفعل بين التحقق والحفظ
        console.log('Duplicate key error - prediction may already exist');
        
        const predictions = await Prediction.find({
          $or: [
            { session: sessionId },
            { game: sessionId }
          ]
        })
        .populate('user', 'username')
        .sort({ submittedAt: 1 });
        
        // البحث عن توقع المستخدم
        let userPrediction;
        
        if (!isGuest) {
          userPrediction = predictions.find(p => p.user && p.user._id.toString() === req.user._id.toString());
        } else {
          userPrediction = predictions.find(p => p.guestId === req.guestUser.id);
        }
        
        return res.status(200).json({
          message: 'Your prediction was already submitted',
          predictions,
          prediction: userPrediction
        });
      }
      
      return res.status(500).json({ message: 'Error saving your prediction' });
    }
    
    // الحصول على جميع التوقعات للجلسة
    try {
      const predictions = await Prediction.find({
        $or: [
          { session: sessionId },
          { game: sessionId }
        ]
      })
      .populate('user', 'username')
      .sort({ submittedAt: 1 });
      
      res.status(201).json({
        message: 'Prediction submitted successfully',
        prediction,
        predictions
      });
    } catch (err) {
      console.error('Error retrieving predictions after save:', err);
      
      return res.status(201).json({
        message: 'Prediction submitted successfully, but there was an error retrieving all predictions',
        prediction,
        predictions: [prediction]
      });
    }
  } catch (error) {
    console.error('Unhandled error in submitPrediction:', error);
    res.status(500).json({ message: 'Server error while processing your prediction' });
  }
};

// Get predictions for session - unified for both regular users and guests
exports.getSessionPredictions = async (req, res) => {
  try {
    const { sessionId } = req.params;
    
    // Check if session exists
    const session = await Session.findById(sessionId);
    
    if (!session) {
      return res.status(404).json({ message: 'Session not found' });
    }
    
    // Get predictions for all users
    const predictions = await Prediction.find({ 
      $or: [
        { session: sessionId },
        { game: sessionId }
      ]
    })
      .populate('user', 'username')
      .sort({ submittedAt: 1 });
    
    res.status(200).json(predictions);
  } catch (error) {
    console.error('Error getting session predictions:', error);
    res.status(500).json({ message: 'Server error' });
  }
};