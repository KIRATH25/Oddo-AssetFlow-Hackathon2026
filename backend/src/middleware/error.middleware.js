const { ZodError } = require('zod');
const { AuthApiError } = require('@supabase/supabase-js');

const errorMiddleware = (err, req, res, next) => {
  // Log the detailed error for backend debugging
  console.error('❌ Error caught by centralized middleware:', err);

  // 1. Zod Validation Errors
  if (err instanceof ZodError) {
    return res.status(400).json({
      success: false,
      error: {
        message: 'Validation failed',
        code: 'VALIDATION_ERROR',
        details: err.errors.map(e => ({
          path: e.path.join('.'),
          message: e.message,
        })),
      },
    });
  }

  // 2. Supabase Auth API Errors
  if (err instanceof AuthApiError) {
    return res.status(err.status || 400).json({
      success: false,
      error: {
        message: err.message,
        code: 'SUPABASE_AUTH_ERROR',
        status: err.status,
      },
    });
  }

  // 3. Prisma Database Errors
  if (
    err.name === 'PrismaClientKnownRequestError' ||
    err.constructor?.name === 'PrismaClientKnownRequestError'
  ) {
    return res.status(400).json({
      success: false,
      error: {
        message: 'Database query error',
        code: `DATABASE_ERROR_${err.code || 'UNKNOWN'}`,
        details: err.meta,
      },
    });
  }

  if (
    err.name === 'PrismaClientValidationError' ||
    err.constructor?.name === 'PrismaClientValidationError'
  ) {
    return res.status(400).json({
      success: false,
      error: {
        message: 'Database validation error',
        code: 'DATABASE_VALIDATION_ERROR',
      },
    });
  }

  // 4. Default Unknown Errors
  const status = err.status || err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  return res.status(status).json({
    success: false,
    error: {
      message,
      code: err.code || 'INTERNAL_SERVER_ERROR',
    },
  });
};

module.exports = { errorMiddleware };
