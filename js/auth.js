/**
 * Authentication Module
 * Handles login, register, forgot password, reset password, logout, and profile loading.
 */
window.Auth = {
  /**
   * Log in user with email & password
   */
  async login(email, password) {
    if (!window.sbClient) throw new Error("Supabase client not initialized.");

    const { data, error } = await window.sbClient.auth.signInWithPassword({
      email: email.trim(),
      password
    });

    if (error) throw error;
    return data;
  },

  /**
   * Register new user
   */
  async register(username, email, password) {
    if (!window.sbClient) throw new Error("Supabase client not initialized.");

    const { data, error } = await window.sbClient.auth.signUp({
      email: email.trim(),
      password,
      options: {
        data: {
          username: username.trim()
        }
      }
    });

    if (error) throw error;
    return data;
  },

  /**
   * Send password reset email
   */
  async forgotPassword(email) {
    if (!window.sbClient) throw new Error("Supabase client not initialized.");

    const redirectTo = window.location.origin + window.location.pathname.replace(/[^/]*$/, 'reset-password.html');
    const { data, error } = await window.sbClient.auth.resetPasswordForEmail(email.trim(), {
      redirectTo
    });

    if (error) throw error;
    return data;
  },

  /**
   * Reset / update password for current authenticated user or token
   */
  async resetPassword(newPassword) {
    if (!window.sbClient) throw new Error("Supabase client not initialized.");

    const { data, error } = await window.sbClient.auth.updateUser({
      password: newPassword
    });

    if (error) throw error;
    return data;
  },

  /**
   * Log out current user
   */
  async logout() {
    if (window.sbClient) {
      await window.sbClient.auth.signOut();
    }
    window.location.href = 'login.html';
  },

  /**
   * Get current auth session
   */
  async getSession() {
    if (!window.sbClient) return null;
    const { data: { session }, error } = await window.sbClient.auth.getSession();
    if (error || !session) return null;
    return session;
  },

  /**
   * Get profile row for specific user ID
   */
  async getProfile(userId) {
    if (!window.sbClient || !userId) return null;

    const { data, error } = await window.sbClient
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      console.warn("Could not fetch profile:", error.message);
      return null;
    }
    return data;
  },

  /**
   * Update profile information
   */
  async updateProfile(userId, updates) {
    if (!window.sbClient || !userId) throw new Error("Missing parameters.");

    const { data, error } = await window.sbClient
      .from('profiles')
      .update(updates)
      .eq('id', userId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }
};
