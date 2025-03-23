const Prediction = require('../models/Prediction');
const Session = require('../models/Session');

// Submit prediction
exports.submitPrediction = async (req, res) => {
  try {
    const { sessionId, content } = req.body;
    
    // Find session
    const session = await Session.findById(sessionId);
    
    if (!session) {
      return res.status(404).json({ message: 'Session not found' });
    }
    
    // Check if user is participant
    const isParticipant = session.participants.some(p => p.user.toString() === req.user._id.toString());
    
    if (!isParticipant) {
      return res.status(403).json({ message: 'You are not a participant in this session' });
    }
    
    // Check if user already submitted prediction
    const existingPrediction = await Prediction.findOne({
      session: sessionId,
      user: req.user._id
    });
    
    if (existingPrediction) {
      return res.status(400).json({ message: 'You have already submitted a prediction' });
    }
    
    // Create prediction
    const prediction = new Prediction({
      session: sessionId,
      user: req.user._id,
      content
    });
    
    await prediction.save();
    
    // Get all predictions for this session
    const predictions = await Prediction.find({ session: sessionId })
      .populate('user', 'username')
      .sort({ submittedAt: 1 });
    
    res.status(201).json({
      prediction,
      predictions
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get predictions for session
exports.getSessionPredictions = async (req, res) => {
  try {
    const { sessionId } = req.params;
    
    // Check if session exists
    const session = await Session.findById(sessionId);
    
    if (!session) {
      return res.status(404).json({ message: 'Session not found' });
    }
    
    // Get predictions
    const predictions = await Prediction.find({ session: sessionId })
      .populate('user', 'username')
      .sort({ submittedAt: 1 });
    
    res.status(200).json(predictions);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};