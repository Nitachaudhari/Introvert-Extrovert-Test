const path = require('path');
const dotenv = require('dotenv');

// Load .env configuration
dotenv.config({ path: path.resolve(__dirname, '.env') });

const express = require('express');
const morgan = require('morgan');
const corsMiddleware = require('./src/middleware/corsConfig');
const { notFoundHandler, errorHandler } = require('./src/middleware/errorHandler');
const { connectDB } = require('./src/config/db');
const healthRoutes = require('./src/routes/healthRoutes');
const dashboardRoutes = require('./src/routes/dashboardRoutes');

// Environment variable validation
const validateEnvironment = () => {
  const missing = [];
  if (!process.env.PORT) {
    console.warn('ℹ️  PORT not defined in environment. Defaulting to 5000.');
  }
  if (!process.env.MONGODB_URI) {
    missing.push('MONGODB_URI');
  }
  if (missing.length > 0) {
    console.warn(`⚠️  Warning: Missing environment variable(s): ${missing.join(', ')}`);
    console.warn('   Update backend/.env with your MongoDB Atlas connection string.');
  }
};

validateEnvironment();

const app = express();
const PORT = process.env.PORT || 5000;

// Security & Parsing Middlewares
app.use(corsMiddleware);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// Root greeting endpoint
app.get('/', (req, res) => {
  res.status(200).json({
    name: 'Psychometric Assessment Management System API',
    version: '1.0.0',
    phase: 'Phase 1 - Technical Setup',
    endpoints: {
      health: '/api/health',
      dbHealth: '/api/db-health',
      testConnection: '/api/test-connection',
      dashboardSummary: '/api/dashboard/summary',
    },
    status: 'online',
  });
});

// API Routes
app.use('/api', healthRoutes);
app.use('/api/dashboard', dashboardRoutes);

// Error Handling Middlewares
app.use(notFoundHandler);
app.use(errorHandler);

// Start Server and Database Connection
const startServer = async () => {
  const server = app.listen(PORT, () => {
    console.log(`🚀 Backend Server running in [${process.env.NODE_ENV || 'development'}] mode on port ${PORT}`);
    console.log(`📡 Health Check: http://localhost:${PORT}/api/health`);
    console.log(`🗄️  DB Health Check: http://localhost:${PORT}/api/db-health`);
    console.log(`🔗 Full Test Check: http://localhost:${PORT}/api/test-connection`);
  });

  // Attempt DB connection
  connectDB();

  // Graceful shutdown
  const gracefulShutdown = (signal) => {
    console.log(`\n🛑 Received ${signal}. Shutting down gracefully...`);
    server.close(() => {
      console.log('✅ HTTP server closed.');
      process.exit(0);
    });
  };

  process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
  process.on('SIGINT', () => gracefulShutdown('SIGINT'));
};

startServer();

module.exports = app;

