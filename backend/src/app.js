const express = require('express');
const cors = require('cors');
const routes = require('./routes');
const { errorMiddleware } = require('./middleware/error.middleware');

const app = express();

// Standard middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Asset Flow Auth API is healthy',
    timestamp: new Date().toISOString(),
  });
});

// Central API route mount
app.use('/api/v1', routes);

// 404 handler for unmatched routes
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    error: {
      message: `Endpoint not found: ${req.method} ${req.originalUrl}`,
      code: 'NOT_FOUND',
    },
  });
});

// Centralized error handling middleware
app.use(errorMiddleware);

module.exports = app;
