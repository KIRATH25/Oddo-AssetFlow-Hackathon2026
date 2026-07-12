const app = require('./app');
const { env } = require('./config/env');

const PORT = env.PORT;

const server = app.listen(PORT, () => {
  console.log(`🚀 Asset Flow Auth API server is running on port ${PORT}`);
  console.log(`📡 URL: http://localhost:${PORT}/health`);
});

// Graceful shutdown handling
const gracefulShutdown = (signal) => {
  console.log(`\nReceived ${signal}, starting graceful shutdown...`);
  
  server.close(() => {
    console.log('HTTP server closed.');
    process.exit(0);
  });

  // Force shutdown after 10 seconds
  setTimeout(() => {
    console.error('Forced shutdown: active connections did not terminate within 10s.');
    process.exit(1);
  }, 10000);
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));
