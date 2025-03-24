require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

// Import routes
const authRoutes = require('./routes/auth');
const sessionRoutes = require('./routes/sessions');
const predictionRoutes = require('./routes/predictions');
const guestRoutes = require('./routes/guests'); // إضافة مسارات الضيوف

// Initialize express app
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json());
app.use(cors());
app.use(helmet());
app.use(morgan('dev'));

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('Failed to connect to MongoDB:', err));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/sessions', sessionRoutes);
app.use('/api/predictions', predictionRoutes);
app.use('/api/guests', guestRoutes); // إضافة مسارات الضيوف

// Base route
app.get('/', (req, res) => {
  res.send('PredictBattle API is running');
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});