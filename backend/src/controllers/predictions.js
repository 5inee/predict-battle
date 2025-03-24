const Prediction = require('../models/Prediction');
const Session = require('../models/Session');
const mongoose = require('mongoose');

// معالج محسّن لتقديم التوقعات
exports.submitPrediction = async (req, res) => {
  try {
    const { sessionId, content } = req.body;
    const isGuest = req.query.guest === 'true';
    const guestId = req.query.guestId;
    const guestName = req.query.guestName;
    
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
    
    // التحقق مما إذا كان المستخدم مشاركًا في الجلسة
    let isParticipant = false;
    
    if (!isGuest) {
      // مستخدم مسجل
      isParticipant = session.participants.some(p => 
        p.user && p.user.toString() === req.user._id.toString()
      );
    } else {
      // مستخدم ضيف
      isParticipant = session.participants.some(p => 
        p.guestId && p.guestId === guestId
      );
    }
    
    if (!isParticipant) {
      // إذا لم يكن مشاركًا، نحاول إضافته
      if (!isGuest) {
        // إضافة مستخدم مسجل
        session.participants.push({ user: req.user._id });
      } else if (guestId && guestName) {
        // إضافة ضيف
        session.participants.push({ 
          guestId: guestId,
          guestName: guestName 
        });
      } else {
        return res.status(403).json({ message: 'You are not a participant in this session' });
      }
      
      await session.save();
    }
    
    // التحقق مما إذا كان المستخدم قد قدم توقعًا بالفعل
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
            { session: sessionId, guestId: guestId },
            { game: sessionId, guestId: guestId }
          ]
        });
      }
    } catch (err) {
      console.error('Error finding existing prediction:', err);
      return res.status(500).json({ message: 'Error checking for existing prediction' });
    }
    
    if (existingPrediction) {
      try {
        // إرجاع جميع التوقعات للجلسة
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
      } catch (err) {
        console.error('Error retrieving predictions:', err);
        return res.status(500).json({ message: 'Error retrieving predictions' });
      }
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
      prediction.guestId = guestId;
      prediction.guestName = guestName;
    }
    
    // حفظ التوقع
    try {
      await prediction.save();
    } catch (err) {
      console.error('Error saving prediction:', err);
      
      if (err.code === 11000) {
        // في حالة حدوث خطأ مفتاح مكرر، ربما تم تقديم توقع بالفعل بين التحقق والحفظ
        try {
          // إرجاع جميع التوقعات للجلسة
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
            userPrediction = predictions.find(p => p.guestId === guestId);
          }
          
          return res.status(200).json({
            message: 'Your prediction was already submitted',
            predictions,
            prediction: userPrediction
          });
        } catch (innerErr) {
          console.error('Error after duplicate key error:', innerErr);
          return res.status(500).json({ message: 'Error retrieving predictions after duplicate key error' });
        }
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
      // على الرغم من أننا حفظنا التوقع بنجاح، نواجه مشكلة في استرجاع جميع التوقعات
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

// Get predictions for session
exports.getSessionPredictions = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const isGuest = req.query.guest === 'true';
    const guestId = req.query.guestId;
    
    // Check if session exists
    const session = await Session.findById(sessionId);
    
    if (!session) {
      return res.status(404).json({ message: 'Session not found' });
    }
    
    // Get predictions
    let predictions;
    
    if (!isGuest) {
      // للمستخدمين المسجلين
      predictions = await Prediction.find({ session: sessionId })
        .populate('user', 'username')
        .sort({ submittedAt: 1 });
    } else {
      // للجميع (بما فيهم الضيوف)
      predictions = await Prediction.find({ session: sessionId })
        .populate('user', 'username')
        .sort({ submittedAt: 1 });
    }
    
    res.status(200).json(predictions);
  } catch (error) {
    console.error('Error in getSessionPredictions:', error);
    res.status(500).json({ message: 'Server error' });
  }
};