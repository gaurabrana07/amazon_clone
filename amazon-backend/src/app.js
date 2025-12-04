const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const cookieParser = require('cookie-parser');
require('dotenv').config();

// Import configurations
const database = require('./config/database');
const mongoCache = require('./config/mongoCache');
const { logger, stream } = require('./utils/logger');

// Import middleware
const { globalErrorHandler, handleNotFound } = require('./middleware/errorHandler');

// Import routes (will be created in next phases)
// const authRoutes = require('./routes/auth');
// const userRoutes = require('./routes/users');
// const productRoutes = require('./routes/products');

/**
 * Express Application Setup
 * Main server configuration with middleware, routes, and error handling
 */
class App {
  constructor() {
    this.app = express();
    this.port = process.env.PORT || 5000;
    
    this.initializeDatabase();
    this.initializeCache();
    this.initializeMiddleware();
    this.initializeRoutes();
    this.initializeErrorHandling();
  }

  /**
   * Initialize Database Connection
   */
  async initializeDatabase() {
    try {
      await database.connect();
    } catch (error) {
      logger.error('Failed to connect to database:', error);
      process.exit(1);
    }
  }

  /**
   * Initialize Cache Service
   */
  async initializeCache() {
    try {
      // Skip cache in development if flag is set
      if (process.env.NODE_ENV === 'development' && process.env.SKIP_CACHE === 'true') {
        logger.info('⚠️ Skipping cache initialization in development mode');
        return;
      }
      await mongoCache.connect();
    } catch (error) {
      logger.warn('Cache initialization failed, continuing without cache:', error.message);
    }
  }

  /**
   * Initialize Middleware
   */
  initializeMiddleware() {
    // Trust proxy for accurate IP addresses
    this.app.set('trust proxy', 1);

    // Security middleware
    this.app.use(helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          scriptSrc: ["'self'"],
          imgSrc: ["'self'", "data:", "https:"],
        },
      },
      crossOriginEmbedderPolicy: false
    }));

    // CORS configuration
    const corsOptions = {
      origin: process.env.NODE_ENV === 'production' 
        ? [process.env.FRONTEND_URL] 
        : ['http://localhost:3000', 'http://localhost:3001'],
      credentials: true,
      optionsSuccessStatus: 200,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
    };
    this.app.use(cors(corsOptions));

    // Compression middleware
    this.app.use(compression());

    // Rate limiting
    const limiter = rateLimit({
      windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
      max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100, // limit each IP to 100 requests per windowMs
      message: {
        error: 'Too many requests from this IP, please try again later.',
        retryAfter: '15 minutes'
      },
      standardHeaders: true,
      legacyHeaders: false,
      handler: (req, res) => {
        logger.security('Rate limit exceeded', {
          ip: req.ip,
          userAgent: req.get('User-Agent'),
          url: req.originalUrl
        });
        
        res.status(429).json({
          error: 'Too many requests from this IP, please try again later.',
          retryAfter: '15 minutes'
        });
      }
    });
    this.app.use('/api/', limiter);

    // Logging middleware
    this.app.use(morgan('combined', { stream }));

    // Body parsing middleware
    this.app.use(express.json({ 
      limit: '10mb',
      verify: (req, res, buf) => {
        req.rawBody = buf;
      }
    }));
    this.app.use(express.urlencoded({ 
      extended: true, 
      limit: '10mb' 
    }));

    // Cookie parsing middleware
    this.app.use(cookieParser());

    // Custom request logging
    this.app.use((req, res, next) => {
      const start = Date.now();
      
      res.on('finish', () => {
        const duration = Date.now() - start;
        logger.request(req, res, duration);
      });
      
      next();
    });
  }

  /**
   * Initialize Routes
   */
  initializeRoutes() {
    // Health check endpoint
    this.app.get('/health', async (req, res) => {
      const dbStatus = await database.healthCheck();
      const cacheStatus = await mongoCache.healthCheck();
      
      const health = {
        status: 'OK',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: process.env.NODE_ENV,
        version: process.env.npm_package_version || '1.0.0',
        services: {
          database: dbStatus,
          cache: cacheStatus
        }
      };

      res.status(200).json(health);
    });

    // API status endpoint
    this.app.get('/api/status', (req, res) => {
      res.status(200).json({
        success: true,
        message: 'Amazon Clone API is running!',
        version: '1.0.0',
        phase: 'Phase 5 - Payment Processing & Notification System',
        timestamp: new Date().toISOString(),
        features: {
          authentication: 'active',
          userManagement: 'active',
          productManagement: 'active',
          categoryManagement: 'active',
          shoppingCart: 'active',
          orderManagement: 'active',
          addressManagement: 'active',
          paymentProcessing: 'active',
          notifications: 'active',
          inventory: 'active',
          search: 'active',
          emailService: 'active',
          smsService: 'active',
          validation: 'active',
          rateLimit: 'active',
          security: 'active'
        },
        endpoints: {
          health: '/health',
          docs: '/api/docs',
          auth: '/api/auth',
          users: '/api/users',
          products: '/api/products',
          categories: '/api/categories',
          cart: '/api/cart',
          orders: '/api/orders',
          addresses: '/api/addresses',
          payments: '/api/payments',
          notifications: '/api/notifications'
        }
      });
    });

    // API routes
    const authRoutes = require('./routes/authRoutes');
    const userRoutes = require('./routes/userRoutes');
    const productRoutes = require('./routes/productRoutes');
    const categoryRoutes = require('./routes/categoryRoutes');
    const cartRoutes = require('./routes/cartRoutes');
    const orderRoutes = require('./routes/orderRoutes');
    const addressRoutes = require('./routes/addressRoutes');
    const paymentRoutes = require('./routes/paymentRoutes');
    const notificationRoutes = require('./routes/notificationRoutes');
    
    this.app.use('/api/auth', authRoutes);
    this.app.use('/api/users', userRoutes);
    this.app.use('/api/products', productRoutes);
    this.app.use('/api/categories', categoryRoutes);
    this.app.use('/api/cart', cartRoutes);
    this.app.use('/api/orders', orderRoutes);
    this.app.use('/api/addresses', addressRoutes);
    this.app.use('/api/payments', paymentRoutes);
    this.app.use('/api/notifications', notificationRoutes);

    // Root endpoint
    this.app.get('/', (req, res) => {
      res.status(200).json({
        message: '🛒 Welcome to Amazon Clone Backend API',
        version: '1.0.0',
        phase: 'Phase 5 - Payment Processing & Notification System',
        documentation: '/api/docs',
        status: '/api/status',
        health: '/health',
        features: {
          authentication: 'active',
          userManagement: 'active',
          productManagement: 'active',
          categoryManagement: 'active',
          shoppingCart: 'active',
          orderManagement: 'active',
          addressManagement: 'active',
          paymentProcessing: 'active',
          notifications: 'active',
          inventory: 'active',
          search: 'active'
        }
      });
    });
  }

  /**
   * Initialize Error Handling
   */
  initializeErrorHandling() {
    // Handle unhandled routes
    this.app.use('*', handleNotFound);

    // Global error handler
    this.app.use(globalErrorHandler);
  }

  /**
   * Start the server
   */
  start() {
    const server = this.app.listen(this.port, () => {
      logger.info(`🚀 Server running on port ${this.port}`);
      logger.info(`🌍 Environment: ${process.env.NODE_ENV}`);
      logger.info(`📱 API Documentation: http://localhost:${this.port}/api/docs`);
      logger.info(`🔍 Health Check: http://localhost:${this.port}/health`);
      logger.info(`⚡ Status: http://localhost:${this.port}/api/status`);
    });

    // Graceful shutdown
      process.on('SIGTERM', () => {
        logger.info('SIGTERM received. Shutting down gracefully...');
        server.close(async () => {
          logger.info('Process terminated');
          await database.disconnect();
          await mongoCache.disconnect();
          process.exit(0);
        });
      });

      process.on('SIGINT', () => {
        logger.info('SIGINT received. Shutting down gracefully...');
        server.close(async () => {
          logger.info('Process terminated');
          await database.disconnect();
          await mongoCache.disconnect();
          process.exit(0);
        });
      });

    return server;
  }

  /**
   * Get Express app instance
   */
  getApp() {
    return this.app;
  }
}

module.exports = App;