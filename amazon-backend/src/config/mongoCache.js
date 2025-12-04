const mongoose = require('mongoose');
const { logger } = require('../utils/logger');

/**
 * MongoDB-based Cache Service
 * Replaces Redis functionality using MongoDB collections
 */

// Cache schema for storing cached data
const cacheSchema = new mongoose.Schema({
  key: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  value: {
    type: mongoose.Schema.Types.Mixed,
    required: true
  },
  expiresAt: {
    type: Date,
    index: { expireAfterSeconds: 0 } // TTL index
  }
}, {
  timestamps: true
});

const Cache = mongoose.model('Cache', cacheSchema);

class MongoCache {
  constructor() {
    this.isConnected = false;
  }

  /**
   * Initialize cache (no separate connection needed, uses main MongoDB)
   */
  async connect() {
    try {
      // Cache uses the main MongoDB connection
      this.isConnected = mongoose.connection.readyState === 1;
      if (this.isConnected) {
        logger.info('📦 MongoDB Cache Service initialized');
      }
      return true;
    } catch (error) {
      logger.error('❌ MongoDB Cache initialization error:', error.message);
      return false;
    }
  }

  /**
   * Set cache value with optional TTL
   */
  async set(key, value, ttlSeconds = 3600) {
    try {
      if (!this.isConnected) {
        logger.warn('⚠️ Cache not connected, operation skipped');
        return false;
      }

      const expiresAt = ttlSeconds ? new Date(Date.now() + ttlSeconds * 1000) : undefined;
      
      await Cache.findOneAndUpdate(
        { key },
        { 
          value,
          expiresAt,
          updatedAt: new Date()
        },
        { 
          upsert: true,
          new: true
        }
      );

      logger.debug(`📦 Cache SET: ${key}`);
      return true;
    } catch (error) {
      logger.error('❌ Cache SET error:', error.message);
      return false;
    }
  }

  /**
   * Get cache value
   */
  async get(key) {
    try {
      if (!this.isConnected) {
        logger.warn('⚠️ Cache not connected, returning null');
        return null;
      }

      const cached = await Cache.findOne({ key });
      
      if (!cached) {
        logger.debug(`📦 Cache MISS: ${key}`);
        return null;
      }

      // Check if expired (extra safety, TTL index should handle this)
      if (cached.expiresAt && cached.expiresAt < new Date()) {
        await this.del(key);
        logger.debug(`📦 Cache EXPIRED: ${key}`);
        return null;
      }

      logger.debug(`📦 Cache HIT: ${key}`);
      return cached.value;
    } catch (error) {
      logger.error('❌ Cache GET error:', error.message);
      return null;
    }
  }

  /**
   * Delete cache entry
   */
  async del(key) {
    try {
      if (!this.isConnected) {
        return false;
      }

      await Cache.deleteOne({ key });
      logger.debug(`📦 Cache DEL: ${key}`);
      return true;
    } catch (error) {
      logger.error('❌ Cache DEL error:', error.message);
      return false;
    }
  }

  /**
   * Check if key exists
   */
  async exists(key) {
    try {
      if (!this.isConnected) {
        return false;
      }

      const count = await Cache.countDocuments({ key });
      return count > 0;
    } catch (error) {
      logger.error('❌ Cache EXISTS error:', error.message);
      return false;
    }
  }

  /**
   * Clear all cache
   */
  async clear() {
    try {
      if (!this.isConnected) {
        return false;
      }

      await Cache.deleteMany({});
      logger.info('📦 Cache cleared');
      return true;
    } catch (error) {
      logger.error('❌ Cache CLEAR error:', error.message);
      return false;
    }
  }

  /**
   * Health check
   */
  async healthCheck() {
    try {
      if (!this.isConnected) {
        return { status: 'unhealthy', error: 'Not connected' };
      }

      // Test cache operation
      const testKey = 'health_check_' + Date.now();
      await this.set(testKey, 'test', 60);
      const value = await this.get(testKey);
      await this.del(testKey);

      if (value === 'test') {
        return { status: 'healthy', timestamp: new Date() };
      } else {
        return { status: 'unhealthy', error: 'Cache test failed' };
      }
    } catch (error) {
      return { status: 'unhealthy', error: error.message, timestamp: new Date() };
    }
  }

  /**
   * Get cache statistics
   */
  async getStats() {
    try {
      if (!this.isConnected) {
        return { total: 0, expired: 0 };
      }

      const total = await Cache.countDocuments();
      const expired = await Cache.countDocuments({
        expiresAt: { $lt: new Date() }
      });

      return { total, expired };
    } catch (error) {
      logger.error('❌ Cache stats error:', error.message);
      return { total: 0, expired: 0 };
    }
  }

  /**
   * Disconnect (cleanup)
   */
  async disconnect() {
    try {
      // No separate connection to close
      this.isConnected = false;
      logger.info('📦 MongoDB Cache Service disconnected');
    } catch (error) {
      logger.error('❌ Cache disconnect error:', error.message);
    }
  }
}

module.exports = new MongoCache();