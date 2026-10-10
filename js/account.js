/**
 * Account Settings Module
 * Handles profile update, password change, and Supabase config tester.
 */
window.Account = {
  async init() {
    this.populateAccountData();
    this.bindEvents();
  },

  populateAccountData() {
    const user = window.currentUser;
    const profile = window.currentProfile;

    if (!user || !profile) return;

    const usernameInput = document.getElementById('account-username');
    const emailDisplay = document.getElementById('account-email');
    const roleBadge = document.getElementById('account-role-badge');
    const createdAtDisplay = document.getElementById('account-created-at');
    const projectUrlDisplay = document.getElementById('account-project-url');
    const anonKeyInput = document.getElementById('account-anon-key');

    if (usernameInput) usernameInput.value = profile.username || '';
    if (emailDisplay) emailDisplay.value = user.email || profile.email || '—';
    if (roleBadge) roleBadge.innerHTML = window.UI.renderRoleBadge(profile.role);
    if (createdAtDisplay) createdAtDisplay.textContent = window.Utils.formatDate(profile.created_at || user.created_at, true);
    if (projectUrlDisplay) projectUrlDisplay.value = window.APP_CONFIG.SUPABASE_URL;
    if (anonKeyInput) anonKeyInput.value = window.APP_CONFIG.SUPABASE_ANON_KEY;
  },

  bindEvents() {
    // Profile form submit
    const profileForm = document.getElementById('profile-form');
    if (profileForm) {
      profileForm.addEventListener('submit', (e) => this.handleUpdateProfile(e));
    }

    // Password form submit
    const passwordForm = document.getElementById('password-form');
    if (passwordForm) {
      passwordForm.addEventListener('submit', (e) => this.handleChangePassword(e));
    }

    // Config form submit
    const configForm = document.getElementById('config-form');
    if (configForm) {
      configForm.addEventListener('submit', (e) => this.handleSaveConfig(e));
    }
  },

  async handleUpdateProfile(e) {
    e.preventDefault();

    const username = document.getElementById('account-username').value.trim();
    if (!username) {
      window.UI.toast('Username cannot be empty.', 'warning');
      return;
    }

    const btn = document.getElementById('btn-save-profile');
    btn.disabled = true;
    btn.innerHTML = `<div class="spinner spinner-sm"></div> Saving...`;

    try {
      const updated = await window.Auth.updateProfile(window.currentUser.id, { username });
      window.currentProfile.username = username;
      window.Layout.updateUserInfo();
      window.UI.toast('Profile updated successfully!', 'success');
    } catch (err) {
      console.error("Update profile error:", err);
      window.UI.toast('Failed to update profile: ' + err.message, 'error');
    } finally {
      btn.disabled = false;
      btn.textContent = 'Save Changes';
    }
  },

  async handleChangePassword(e) {
    e.preventDefault();

    const newPassword = document.getElementById('account-new-password').value;
    const confirmPassword = document.getElementById('account-confirm-password').value;

    if (newPassword.length < 6) {
      window.UI.toast('Password must be at least 6 characters long.', 'warning');
      return;
    }

    if (newPassword !== confirmPassword) {
      window.UI.toast('Passwords do not match.', 'error');
      return;
    }

    const btn = document.getElementById('btn-change-password');
    btn.disabled = true;
    btn.innerHTML = `<div class="spinner spinner-sm"></div> Updating...`;

    try {
      await window.Auth.resetPassword(newPassword);
      window.UI.toast('Password changed successfully!', 'success');
      document.getElementById('account-new-password').value = '';
      document.getElementById('account-confirm-password').value = '';
    } catch (err) {
      console.error("Change password error:", err);
      window.UI.toast('Failed to change password: ' + err.message, 'error');
    } finally {
      btn.disabled = false;
      btn.textContent = 'Update Password';
    }
  },

  handleSaveConfig(e) {
    e.preventDefault();
    const key = document.getElementById('account-anon-key').value.trim();
    if (key) {
      localStorage.setItem('SUPABASE_ANON_KEY', key);
      window.UI.toast('Supabase Anon Key saved in browser. Reloading...', 'success');
      setTimeout(() => window.location.reload(), 1000);
    }
  }
};
