const mongoose = require('mongoose');
const { logger } = require('../utils/logger');

/**
 * Database Connection Configuration
 * Handles MongoDB connection with error handling and reconnection logic
 */
class DatabaseConnection {
  constructor() {
    this.isConnected = false;
    this.retryCount = 0;
    this.maxRetries = 5;
    this.retryDelay = 5000;
  }

  /**
   * Connect to MongoDB
   */
  async connect() {
    try {
      // Skip MongoDB connection if flag is set
      if (process.env.SKIP_DB === 'true') {
        logger.info('⚠️ Skipping MongoDB connection (SKIP_DB=true)');
        this.isConnected = false;
        return null;
      }

      const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/amazon_clone';
      
      const options = {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        maxPoolSize: 10, // Maintain up to 10 socket connections
        serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
        socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
        family: 4, // Use IPv4, skip trying IPv6
        bufferMaxEntries: 0,
        retryWrites: true,
        writeConcern: {
          w: 'majority'
        }
      };

      await mongoose.connect(mongoUri, options);
      
      this.isConnected = true;
      this.retryCount = 0;
      
      logger.info(`📊 MongoDB Connected: ${mongoose.connection.host}`);
      
      // Handle connection events
      this.setupEventHandlers();
      
      return mongoose.connection;
    } catch (error) {
      logger.error('❌ MongoDB Connection Error:', error.message);
      await this.handleConnectionError();
    }
  }

  /**
   * Setup mongoose event handlers
   */
  setupEventHandlers() {
    mongoose.connection.on('connected', () => {
      logger.info('🟢 Mongoose connected to MongoDB');
      this.isConnected = true;
    });

    mongoose.connection.on('error', (error) => {
      logger.error('🔴 Mongoose connection error:', error);
      this.isConnected = false;
    });

    mongoose.connection.on('disconnected', () => {
      logger.warn('🟡 Mongoose disconnected from MongoDB');
      this.isConnected = false;
    });

    // Handle application termination
    process.on('SIGINT', async () => {
      await this.disconnect();
      process.exit(0);
    });
  }

  /**
   * Handle connection errors with retry logic
   */
  async handleConnectionError() {
    if (this.retryCount < this.maxRetries) {
      this.retryCount++;
      logger.info(
        `🔄 Retrying database connection... Attempt ${this.retryCount}/${this.maxRetries}`
      );
      
      setTimeout(() => {
        this.connect();
      }, this.retryDelay);
    } else {
      logger.error('💀 Max retry attempts reached. Exiting application.');
      process.exit(1);
    }
  }

  /**
   * Disconnect from MongoDB
   */
  async disconnect() {
    try {
      await mongoose.connection.close();
      this.isConnected = false;
      logger.info('📊 MongoDB Disconnected');
    } catch (error) {
      logger.error('❌ Error disconnecting from MongoDB:', error.message);
    }
  }

  /**
   * Get connection status
   */
  getStatus() {
    return {
      isConnected: this.isConnected,
      readyState: mongoose.connection.readyState,
      host: mongoose.connection.host,
      name: mongoose.connection.name
    };
  }

  /**
   * Health check for database
   */
  async healthCheck() {
    try {
      // If DB is skipped, return skipped status
      if (process.env.SKIP_DB === 'true') {
        return { status: 'skipped', message: 'Database disabled in development', timestamp: new Date() };
      }

      if (!this.isConnected) {
        return { status: 'unhealthy', error: 'Not connected to database', timestamp: new Date() };
      }

      await mongoose.connection.db.admin().ping();
      return { status: 'healthy', timestamp: new Date() };
    } catch (error) {
      return { status: 'unhealthy', error: error.message, timestamp: new Date() };
    }
  }
}

module.exports = new DatabaseConnection();