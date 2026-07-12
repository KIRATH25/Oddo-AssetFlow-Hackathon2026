const { Router } = require('express');
const authRoutes = require('./auth.routes');

const router = Router();

// Mount auth routes under /auth prefix
router.use('/auth', authRoutes);

module.exports = router;
