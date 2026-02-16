require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
const fs = require('fs');
const connectDB = require('./config/database');
const errorHandler = require('./middleware/errorHandler');

// Initialize express app
const app = express();

// Connect to database
connectDB();

// Create upload directory if it doesn't exist
const uploadDir = process.env.UPLOAD_PATH || 'uploads/cards';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
  console.log(`✅ Created upload directory: ${uploadDir}`);
}

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Serve static files (uploaded images)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// API Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/cards', require('./routes/cardRoutes'));
app.use('/api/contacts', require('./routes/contactRoutes'));
app.use('/api/tags', require('./routes/tagRoutes'));
app.use('/api/dashboard', require('./routes/dashboardRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));

// Health check route
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Dexi Card Scanner API is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Root route
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to Dexi Card Scanner API',
    version: '1.0.0',
    endpoints: {
      health: '/api/health',
      auth: '/api/auth',
      cards: '/api/cards',
      contacts: '/api/contacts',
      tags: '/api/tags',
      dashboard: '/api/dashboard',
      admin: '/api/admin'
    }
  });
});

// 404 handler
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`
  });
});

// Error handler (must be last)
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
  console.log('');
  console.log('═══════════════════════════════════════════════════');
  console.log('🚀 Dexi Card Scanner API Server');
  console.log('═══════════════════════════════════════════════════');
  console.log(`📡 Server running on port: ${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 API URL: http://localhost:${PORT}`);
  console.log(`📁 Upload directory: ${uploadDir}`);
  console.log('═══════════════════════════════════════════════════');
  console.log('');
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('❌ Unhandled Rejection:', err);
  server.close(() => process.exit(1));
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('❌ Uncaught Exception:', err);
  process.exit(1);
});

module.exports = app;
