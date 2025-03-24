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
    console.error('Error creating session:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Join session
exports.joinSession = async (req, res) => {
  try {
    const { code } = req.params;
    const isGuest = req.query.guest === 'true';
    const guestId = req.query.guestId;
    const guestName = req.query.guestName;
    
    console.log('Join session request:', { code, isGuest, guestId, guestName });
    
    // Find session
    const session = await Session.findOne({ code }).populate('participants.user', 'username');
    
    if (!session) {
      return res.status(404).json({ message: 'Session not found' });
    }
    
    // للمستخدمين العاديين
    if (!isGuest) {
      // Check if user already joined
      const isParticipant = session.participants.some(p => p.user && p.user._id.toString() === req.user._id.toString());
      
      if (isParticipant) {
        // إذا كان المستخدم مشاركًا بالفعل، أرسل له الجلسة مباشرةً دون رسالة خطأ
        return res.status(200).json(session);
      }
      
      // Check if session is full
      if (session.participants.length >= session.maxPlayers) {
        return res.status(400).json({ message: 'Session is full' });
      }
      
      // إضافة المستخدم كمشارك جديد
      session.participants.push({ user: req.user._id });
    } 
    // للضيوف
    else if (isGuest && guestId && guestName) {
      // التحقق مما إذا كان الضيف قد انضم بالفعل (باستخدام المعرف)
      const isGuestParticipant = session.participants.some(p => 
        p.guestId && p.guestId === guestId
      );
      
      if (isGuestParticipant) {
        return res.status(200).json(session);
      }
      
      // التحقق مما إذا كانت الجلسة ممتلئة
      if (session.participants.length >= session.maxPlayers) {
        return res.status(400).json({ message: 'Session is full' });
      }
      
      // إضافة الضيف كمشارك جديد
      session.participants.push({ 
        guestId: guestId,
        guestName: guestName,
        joinedAt: new Date()
      });
    } else {
      return res.status(400).json({ message: 'Invalid guest information' });
    }
    
    await session.save();
    res.status(200).json(session);
  } catch (error) {
    console.error('Error joining session:', error);
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
    console.error('Error getting user sessions:', error);
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
    console.error('Error getting session by code:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get session by code (public version - no authentication required)
// إضافة هذه الدالة في ملف backend/src/controllers/sessions.js

// Get session by code (public version - no authentication required)
exports.getSessionByCodePublic = async (req, res) => {
  try {
    console.log('Public session request for code:', req.params.code);
    const { code } = req.params;
    const isGuest = req.query.guest === 'true';
    const guestId = req.query.guestId;
    const guestName = req.query.guestName;
    
    // Find session
    const session = await Session.findOne({ code })
      .populate('participants.user', 'username')
      .populate('creator', 'username');
    
    if (!session) {
      console.log('Session not found:', code);
      return res.status(404).json({ message: 'Session not found' });
    }
    
    console.log('Session found:', session.code, session.question);
    
    // If guest info provided, add guest to participants
    if (isGuest && guestId && guestName) {
      console.log('Guest info provided:', guestId, guestName);
      
      // Check if guest already a participant
      const isParticipant = session.participants.some(p => 
        p.guestId && p.guestId === guestId
      );
      
      if (!isParticipant && session.participants.length < session.maxPlayers) {
        console.log('Adding guest to participants');
        session.participants.push({
          guestId: guestId,
          guestName: guestName,
          joinedAt: new Date()
        });
        
        await session.save();
      } else if (isParticipant) {
        console.log('Guest already a participant');
      } else {
        console.log('Session is full, cannot add guest');
      }
    }
    
    // Get predictions for this session
    const predictions = await Prediction.find({
      $or: [
        { session: session._id },
        { game: session._id }
      ]
    })
    .populate('user', 'username')
    .sort({ submittedAt: 1 });
    
    console.log(`Found ${predictions.length} predictions for session`);
    
    // Return session and predictions
    res.status(200).json({
      session,
      predictions
    });
  } catch (error) {
    console.error('Error in getSessionByCodePublic:', error);
    res.status(500).json({ message: 'Server error' });
  }
};