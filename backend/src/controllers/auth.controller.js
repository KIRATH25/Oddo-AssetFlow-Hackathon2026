const { AuthService } = require('../services/auth.service');

class AuthController {
  /**
   * Handles user signup.
   */
  static async signup(req, res, next) {
    try {
      const result = await AuthService.signup(req.body);
      res.status(201).json({
        success: true,
        message: 'User registered successfully',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Handles user login.
   */
  static async login(req, res, next) {
    try {
      const result = await AuthService.login(req.body);
      res.status(200).json({
        success: true,
        message: 'Login successful',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Retrieves current authenticated user profile.
   */
  static async me(req, res, next) {
    try {
      res.status(200).json({
        success: true,
        data: {
          user: req.user,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Handles user logout.
   */
  static async logout(req, res, next) {
    try {
      await AuthService.logout();
      res.status(200).json({
        success: true,
        message: 'Logout successful',
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = { AuthController };
