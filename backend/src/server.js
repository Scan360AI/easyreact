import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import { testConnection } from './config/db.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';
import { authenticate } from './middleware/authenticate.js';

// Import routes
import authRoutes from './routes/auth.js';
import companiesRoutes from './routes/companies.js';
import reportsRoutes from './routes/reports.js';
import statsRoutes from './routes/stats.js';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// ============================================
// Middleware
// ============================================

// Security headers
app.use(helmet());

// CORS configuration
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Rate limiting (global)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});
app.use(limiter);

// Stricter rate limiting for auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 requests per windowMs
  message: 'Too many authentication attempts, please try again later.'
});

// Request logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// ============================================
// Routes
// ============================================

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// API routes
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/companies', companiesRoutes);
app.use('/api/reports', reportsRoutes);
app.use('/api/my/stats', statsRoutes);

// Protected test route
app.get('/api/me', authenticate, (req, res) => {
  res.json({
    message: 'Authenticated!',
    user: req.user
  });
});

// ============================================
// Error Handling
// ============================================

// 404 handler
app.use(notFoundHandler);

// Global error handler
app.use(errorHandler);

// ============================================
// Server Startup
// ============================================

const startServer = async () => {
  try {
    // Test database connection
    console.log('🔌 Testing database connection...');
    const dbOk = await testConnection();

    if (!dbOk) {
      console.error('❌ Database connection failed. Please check your configuration.');
      process.exit(1);
    }

    // Start server
    app.listen(PORT, () => {
      console.log('');
      console.log('╔════════════════════════════════════════════╗');
      console.log('║   FinReport Backend API - Professional MVP  ║');
      console.log('╚════════════════════════════════════════════╝');
      console.log('');
      console.log(`✅ Server running on port ${PORT}`);
      console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`🔗 API URL: http://localhost:${PORT}`);
      console.log(`🏥 Health check: http://localhost:${PORT}/health`);
      console.log('');
      console.log('📋 Available endpoints:');
      console.log('   POST   /api/auth/register');
      console.log('   POST   /api/auth/login');
      console.log('   GET    /api/auth/me');
      console.log('   GET    /api/companies');
      console.log('   POST   /api/companies');
      console.log('   GET    /api/companies/autocomplete');
      console.log('   POST   /api/reports');
      console.log('   GET    /api/my/reports');
      console.log('   GET    /api/reports/:id');
      console.log('   POST   /api/reports/:id/complete');
      console.log('   GET    /api/my/stats');
      console.log('');
      console.log('📊 Demo credentials:');
      console.log('   Email: demo@finreport.com');
      console.log('   Password: demo123');
      console.log('');
      console.log('🚀 Ready to accept requests!');
      console.log('');
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

// Handle graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT signal received: closing HTTP server');
  process.exit(0);
});

// Start the server
startServer();

export default app;
