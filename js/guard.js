/**
 * Route & Role Guards
 * Protects pages and validates session and role permissions.
 */
window.Guard = {
  /**
   * Protect a page: requires authenticated user and optionally ADMIN role
   */
  async requireAuth(options = { requireAdmin: false }) {
    // Wait for Supabase to be ready
    if (!window.sbClient) {
      console.error("Supabase client is not available.");
      window.location.href = 'login.html';
      return null;
    }

    const { data: { session }, error } = await window.sbClient.auth.getSession();

    if (error || !session || !session.user) {
      // Save redirect target
      sessionStorage.setItem('auth_redirect', window.location.href);
      window.location.href = 'login.html';
      return null;
    }

    // Load profile
    const profile = await window.Auth.getProfile(session.user.id);
    
    // Attach to global window object
    window.currentUser = session.user;
    window.currentProfile = profile || {
      id: session.user.id,
      email: session.user.email,
      username: session.user.user_metadata?.username || session.user.email.split('@')[0],
      role: 'USER',
      status: 'ACTIVE'
    };

    // Check if user is active
    if (window.currentProfile.status === 'INACTIVE') {
      window.UI.toast('Your account has been deactivated. Please contact an administrator.', 'error');
      await window.Auth.logout();
      return null;
    }

    // Check Admin requirement
    if (options.requireAdmin && window.currentProfile.role !== 'ADMIN') {
      window.UI.toast('Access restricted: ADMIN privileges required.', 'warning');
      setTimeout(() => {
        window.location.href = 'dashboard.html';
      }, 1000);
      return null;
    }

    return { session, user: session.user, profile: window.currentProfile };
  },

  /**
   * For Login/Register pages: if already logged in, redirect to Dashboard
   */
  async redirectIfLoggedIn() {
    if (!window.sbClient) return;

    const { data: { session } } = await window.sbClient.auth.getSession();
    if (session && session.user) {
      window.location.href = 'dashboard.html';
    }
  }
};
