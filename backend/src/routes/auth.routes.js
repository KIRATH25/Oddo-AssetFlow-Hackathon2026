const { Router } = require('express');
const { AuthController } = require('../controllers/auth.controller');
const { validate } = require('../middleware/validate.middleware');
const { authMiddleware } = require('../middleware/auth.middleware');
const { signupSchema, loginSchema } = require('../validations/auth.validation');

const router = Router();

// Public routes
router.post('/signup', validate(signupSchema), AuthController.signup);
router.post('/login', validate(loginSchema), AuthController.login);

// Protected routes
router.get('/me', authMiddleware, AuthController.me);
router.post('/logout', authMiddleware, AuthController.logout);

module.exports = router;
