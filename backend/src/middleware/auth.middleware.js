const { supabaseAdmin } = require('../config/admin');

const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: {
          message: 'Unauthorized: No token provided',
          code: 'UNAUTHORIZED_NO_TOKEN',
        },
      });
    }

    const token = authHeader.split(' ')[1];
    
    // Verify user using the Supabase Admin client
    const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);

    if (error || !user) {
      return res.status(401).json({
        success: false,
        error: {
          message: 'Unauthorized: Invalid or expired token',
          code: 'UNAUTHORIZED_INVALID_TOKEN',
          details: error?.message,
        },
      });
    }

    req.user = user;
    next();
  } catch (err) {
    next(err);
  }
};

module.exports = { authMiddleware };
