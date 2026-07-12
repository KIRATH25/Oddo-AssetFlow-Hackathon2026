const { supabase } = require('../config/supabase');

class AuthService {
  /**
   * Registers a new user with email, password, and full name metadata.
   */
  static async signup(input) {
    const { data, error } = await supabase.auth.signUp({
      email: input.email,
      password: input.password,
      options: {
        data: {
          fullName: input.fullName,
        },
      },
    });

    if (error) throw error;
    return data;
  }

  /**
   * Log in a user with email and password.
   */
  static async login(input) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: input.email,
      password: input.password,
    });

    if (error) throw error;
    return data;
  }

  /**
   * Get the current user details using a JWT token.
   */
  static async getCurrentUser(token) {
    const { data: { user }, error } = await supabase.auth.getUser(token);
    if (error) throw error;
    return user;
  }

  /**
   * Log out the current user session.
   */
  static async logout() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  }
}

module.exports = { AuthService };
