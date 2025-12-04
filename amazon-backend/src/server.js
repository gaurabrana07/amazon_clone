const App = require('./app');
const cronJobService = require('./services/cronJobService');
const { logger } = require('./utils/logger');

/**
 * Server Entry Point
 * Initialize and start the Express application
 */

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  logger.error('UNCAUGHT EXCEPTION! 💥 Shutting down...');
  logger.error(`Error: ${err.name} - ${err.message}`);
  logger.error(`Stack: ${err.stack}`);
  console.error('UNCAUGHT EXCEPTION:', err);
  
  // Stop cron jobs before exiting
  cronJobService.stop();
  process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  logger.error('UNHANDLED REJECTION! 💥 Shutting down...');
  logger.error(`Error: ${err.name} - ${err.message}`);
  logger.error(`Stack: ${err.stack}`);
  console.error('UNHANDLED REJECTION:', err);
  
  // Stop cron jobs before exiting
  cronJobService.stop();
  process.exit(1);
});

/**
 * Start the application
 */
async function startServer() {
  try {
    logger.info('🚀 Starting Amazon Clone Backend Server...');
    
    // Create and start the application
    const app = new App();
    const server = app.start();
    
    // Initialize and start cron jobs after server starts
    if (process.env.NODE_ENV !== 'test') {
      logger.info('🕐 Initializing cron jobs...');
      cronJobService.start();
    }
    
    logger.info('✅ Server started successfully');
    
    return server;
  } catch (error) {
    logger.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

// Start the server
startServer();