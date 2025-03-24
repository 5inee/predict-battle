const Session = require('../models/Session');
const Prediction = require('../models/Prediction');

// Generate a random 6-character code
const generateSessionCode = () => {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return code;
};

// Create new session
exports.createSession = async (req, res) => {
  try {
    const { question, maxPlayers, secretCode } = req.body;
    
    // Check if secret code is correct
    if (secretCode !== '021') {
      return res.status(403).json({ message: 'Invalid secret code' });
    }
    
    // Generate unique code
    let sessionCode;
    let isCodeUnique = false;
    
    while (!isCodeUnique) {
      sessionCode = generateSessionCode();
      const existingSession = await Session.findOne({ code: sessionCode });
      isCodeUnique = !existingSession;
    }
    
    // Create new session
    const session = new Session({
      code: sessionCode,
      question,
      creator: req.user._id,
      maxPlayers,
      participants: [{ user: req.user._id }]
    });
    
    await session.save();
    
    res.status(201).json(session);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Join session
// في ملف backend/src/controllers/sessions.js
exports.joinSession = async (req, res) => {
  try {
    const { code } = req.params;
    
    // Find session
    const session = await Session.findOne({ code }).populate('participants.user', 'username');
    
    if (!session) {
      return res.status(404).json({ message: 'Session not found' });
    }
    
    // Check if user already joined
    const isParticipant = session.participants.some(p => p.user._id.toString() === req.user._id.toString());
    
    if (isParticipant) {
      // إذا كان المستخدم مشاركًا بالفعل، أرسل له الجلسة مباشرةً دون رسالة خطأ
      return res.status(200).json(session);
    }
    
    // Check if session is full (فقط إذا لم يكن المستخدم مشاركًا بالفعل)
    if (session.participants.length >= session.maxPlayers) {
      return res.status(400).json({ message: 'Session is full' });
    }
    
    // إضافة المستخدم كمشارك جديد
    session.participants.push({ user: req.user._id });
    await session.save();
    
    res.status(200).json(session);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get user's sessions
exports.getUserSessions = async (req, res) => {
  try {
    // Find sessions where user is participant
    const sessions = await Session.find({
      'participants.user': req.user._id
    })
    .populate('creator', 'username')
    .sort({ createdAt: -1 });
    
    res.status(200).json(sessions);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// في ملف backend/src/controllers/sessions.js
// نضيف دالة جديدة للوصول العام إلى تفاصيل الجلسة (بدون مصادقة)

// Get session by code (public version - no authentication required)
exports.getSessionByCodePublic = async (req, res) => {
  try {
    const { code } = req.params;
    
    // Find session
    const session = await Session.findOne({ code })
      .populate('participants.user', 'username')
      .populate('creator', 'username');
    
    if (!session) {
      return res.status(404).json({ message: 'Session not found' });
    }
    
    // Get predictions for this session
    const predictions = await Prediction.find({ session: session._id })
      .populate('user', 'username')
      .sort({ submittedAt: 1 });
    
    // تقديم نفس الاستجابة مثل المسار المحمي
    res.status(200).json({
      session,
      predictions
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get session by code
exports.getSessionByCode = async (req, res) => {
  try {
    const { code } = req.params;
    
    // Find session
    const session = await Session.findOne({ code })
      .populate('participants.user', 'username')
      .populate('creator', 'username');
    
    if (!session) {
      return res.status(404).json({ message: 'Session not found' });
    }
    
    // Get predictions for this session
    const predictions = await Prediction.find({ session: session._id })
      .populate('user', 'username')
      .sort({ submittedAt: 1 });
    
    res.status(200).json({
      session,
      predictions
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};