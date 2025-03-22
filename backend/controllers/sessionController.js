// controllers/sessionController.js
const Session = require('../models/Session');
const User = require('../models/User');

// إنشاء جلسة جديدة
const createSession = async (req, res) => {
  try {
    const { question, maxPlayers } = req.body;
    const hostId = req.user.id;
    
    const session = new Session({
      question,
      maxPlayers,
      host: hostId,
      participants: [hostId] // إضافة المضيف كأول مشارك
    });
    
    await session.save();
    
    // إضافة الجلسة لقائمة جلسات المستخدم
    await User.findByIdAndUpdate(hostId, {
      $push: { sessions: session._id }
    });
    
    res.status(201).json({
      message: 'تم إنشاء الجلسة بنجاح',
      session: {
        id: session._id,
        code: session.code,
        question: session.question,
        maxPlayers: session.maxPlayers,
        currentPlayers: 1
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'خطأ في إنشاء الجلسة', error: error.message });
  }
};

// الانضمام إلى جلسة
const joinSession = async (req, res) => {
  try {
    const { code } = req.body;
    const userId = req.user.id;
    
    // البحث عن الجلسة بواسطة الكود
    const session = await Session.findOne({ code, active: true });
    if (!session) {
      return res.status(404).json({ message: 'الجلسة غير موجودة أو غير نشطة' });
    }
    
    // التحقق من عدم امتلاء الجلسة
    if (session.participants.length >= session.maxPlayers) {
      return res.status(400).json({ message: 'الجلسة ممتلئة' });
    }
    
    // التحقق من أن المستخدم ليس مشاركًا بالفعل
    if (session.participants.includes(userId)) {
      // إذا كان المستخدم مشاركًا بالفعل، نعيد معلومات الجلسة فقط
      return res.status(200).json({
        message: 'أنت مشارك بالفعل في هذه الجلسة',
        session: {
          id: session._id,
          code: session.code,
          question: session.question,
          maxPlayers: session.maxPlayers,
          currentPlayers: session.participants.length,
          predictions: session.predictions
        }
      });
    }
    
    // إضافة المستخدم للجلسة
    session.participants.push(userId);
    await session.save();
    
    // إضافة الجلسة لقائمة جلسات المستخدم
    await User.findByIdAndUpdate(userId, {
      $push: { sessions: session._id }
    });
    
    res.status(200).json({
      message: 'تم الانضمام للجلسة بنجاح',
      session: {
        id: session._id,
        code: session.code,
        question: session.question,
        maxPlayers: session.maxPlayers,
        currentPlayers: session.participants.length,
        predictions: session.predictions
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'خطأ في الانضمام للجلسة', error: error.message });
  }
};

// إرسال توقع
const submitPrediction = async (req, res) => {
  try {
    const { sessionId, prediction } = req.body;
    const userId = req.user.id;
    const username = req.user.username;
    
    // البحث عن الجلسة
    const session = await Session.findById(sessionId);
    if (!session) {
      return res.status(404).json({ message: 'الجلسة غير موجودة' });
    }
    
    // التحقق من أن المستخدم مشارك في الجلسة
    if (!session.participants.includes(userId)) {
      return res.status(403).json({ message: 'غير مصرح لك بإرسال توقع في هذه الجلسة' });
    }
    
    // التحقق من أن المستخدم لم يرسل توقعًا من قبل
    const existingPrediction = session.predictions.find(p => p.user.toString() === userId);
    if (existingPrediction) {
      return res.status(400).json({ message: 'قمت بالفعل بإرسال توقع لهذه الجلسة' });
    }
    
    // إضافة التوقع
    session.predictions.push({
      user: userId,
      username,
      prediction
    });
    
    await session.save();
    
    res.status(200).json({
      message: 'تم إرسال التوقع بنجاح',
      sessionData: {
        id: session._id,
        question: session.question,
        maxPlayers: session.maxPlayers,
        currentPredictions: session.predictions.length,
        totalPlayers: session.participants.length,
        predictions: session.predictions
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'خطأ في إرسال التوقع', error: error.message });
  }
};

// الحصول على تفاصيل جلسة
const getSession = async (req, res) => {
  try {
    const { sessionId } = req.params;
    
    const session = await Session.findById(sessionId)
      .populate('predictions.user', 'username');
    
    if (!session) {
      return res.status(404).json({ message: 'الجلسة غير موجودة' });
    }
    
    res.status(200).json({
      session: {
        id: session._id,
        code: session.code,
        question: session.question,
        maxPlayers: session.maxPlayers,
        currentPlayers: session.participants.length,
        predictions: session.predictions,
        active: session.active,
        createdAt: session.createdAt
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'خطأ في الحصول على بيانات الجلسة', error: error.message });
  }
};

// الحصول على جلسات المستخدم
const getUserSessions = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const user = await User.findById(userId)
      .populate({
        path: 'sessions',
        select: 'code question maxPlayers participants predictions createdAt active'
      });
    
    if (!user) {
      return res.status(404).json({ message: 'المستخدم غير موجود' });
    }
    
    // تنسيق البيانات للواجهة الأمامية
    const formattedSessions = user.sessions.map(session => ({
      id: session._id,
      code: session.code,
      question: session.question,
      maxPlayers: session.maxPlayers,
      currentPlayers: session.participants.length,
      predictionsCount: session.predictions.length,
      active: session.active,
      createdAt: session.createdAt
    }));
    
    res.status(200).json({
      sessions: formattedSessions
    });
  } catch (error) {
    res.status(500).json({ message: 'خطأ في الحصول على جلسات المستخدم', error: error.message });
  }
};

module.exports = {
  createSession,
  joinSession,
  submitPrediction,
  getSession,
  getUserSessions
};