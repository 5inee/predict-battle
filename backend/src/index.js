// في ملف backend/src/index.js

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
const guestRoutes = require('./routes/guests');

// Initialize express app
const app = express();
const PORT = process.env.PORT || 5000;

// تكوين CORS بشكل صحيح لقبول الطلبات من المصادر المختلفة
const corsOptions = {
  origin: ['https://predict-battle-seven.vercel.app', 'http://localhost:3000'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  credentials: true,
  preflightContinue: false,
  optionsSuccessStatus: 204
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json());
app.use(helmet());
app.use(morgan('dev'));

// CORS Preflight للطلبات المعقدة
app.options('*', cors(corsOptions));

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('Failed to connect to MongoDB:', err));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/sessions', sessionRoutes);
app.use('/api/predictions', predictionRoutes);
app.use('/api/guests', guestRoutes);

// Base route
app.get('/', (req, res) => {
  res.send('PredictBattle API is running');
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});