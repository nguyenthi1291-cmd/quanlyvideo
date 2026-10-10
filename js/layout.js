/**
 * Admin Layout Manager
 * Handles Sidebar, Navigation, Mobile Toggle, and User header snippet.
 */
window.Layout = {
  /**
   * Initialize layout on protected pages
   * @param {string} activePage - e.g. 'dashboard', 'videos', 'categories', 'users', 'account'
   */
  init(activePage = '') {
    this.activePage = activePage;
    this.renderSidebar();
    this.renderTopbar();
    this.setupEvents();
    this.updateUserInfo();
  },

  renderSidebar() {
    const sidebarEl = document.getElementById('app-sidebar');
    if (!sidebarEl) return;

    const isAdmin = window.currentProfile?.role === 'ADMIN';

    sidebarEl.innerHTML = `
      <div class="sidebar-header">
        <div class="brand-logo">V</div>
        <div class="brand-text">Video Admin</div>
        <span class="brand-badge">Pro</span>
      </div>

      <nav class="sidebar-nav">
        <div class="nav-section-title">Overview</div>
        <a href="dashboard.html" class="nav-link ${this.activePage === 'dashboard' ? 'active' : ''}">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>
          Dashboard
        </a>

        <div class="nav-section-title">Content</div>
        <a href="videos.html" class="nav-link ${this.activePage === 'videos' ? 'active' : ''}">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="23 7 16 12 23 17 23 7"></polygon><rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect></svg>
          Videos
        </a>
        <a href="categories.html" class="nav-link ${this.activePage === 'categories' ? 'active' : ''}">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="8" y1="6" x2="21" y2="6"></line><line x1="8" y1="12" x2="21" y2="12"></line><line x1="8" y1="18" x2="21" y2="18"></line><line x1="3" y1="6" x2="3.01" y2="6"></line><line x1="3" y1="12" x2="3.01" y2="12"></line><line x1="3" y1="18" x2="3.01" y2="18"></line></svg>
          Categories
        </a>

        ${isAdmin ? `
        <div class="nav-section-title">Administration</div>
        <a href="users.html" class="nav-link ${this.activePage === 'users' ? 'active' : ''}">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
          Users
        </a>
        ` : ''}

        <div class="nav-section-title">Settings</div>
        <a href="account.html" class="nav-link ${this.activePage === 'account' ? 'active' : ''}">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
          Account
        </a>
      </nav>

      <div class="sidebar-footer">
        <div class="user-snippet">
          <div class="user-avatar" id="sidebar-avatar">U</div>
          <div class="user-meta">
            <div class="user-name truncate" id="sidebar-username">Loading...</div>
            <div class="user-role-badge" id="sidebar-role-badge"></div>
          </div>
          <button class="btn btn-icon btn-outline" id="btn-sidebar-logout" title="Log out" type="button">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
          </button>
        </div>
      </div>
    `;
  },

  renderTopbar() {
    const topbarEl = document.getElementById('app-topbar');
    if (!topbarEl) return;

    topbarEl.innerHTML = `
      <div class="topbar-left">
        <button class="sidebar-toggle" id="btn-sidebar-toggle" type="button" aria-label="Toggle Sidebar">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
        </button>
        <span class="topbar-title" id="topbar-page-title">${this.getPageTitle(this.activePage)}</span>
      </div>
      <div class="topbar-right">
        <a href="video-form.html" class="btn btn-primary btn-sm">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
          Add Video
        </a>
      </div>
    `;
  },

  getPageTitle(pageKey) {
    const map = {
      dashboard: 'Dashboard',
      videos: 'Video Library',
      'video-form': 'Video Editor',
      categories: 'Categories',
      users: 'User Management',
      account: 'Account Settings'
    };
    return map[pageKey] || 'Admin';
  },

  setupEvents() {
    // Sidebar toggle on mobile
    const toggleBtn = document.getElementById('btn-sidebar-toggle');
    const sidebar = document.getElementById('app-sidebar');
    let backdrop = document.getElementById('sidebar-backdrop');

    if (!backdrop) {
      backdrop = document.createElement('div');
      backdrop.id = 'sidebar-backdrop';
      backdrop.className = 'sidebar-backdrop';
      document.body.appendChild(backdrop);
    }

    if (toggleBtn && sidebar) {
      toggleBtn.onclick = () => {
        sidebar.classList.toggle('open');
        backdrop.classList.toggle('active');
      };

      backdrop.onclick = () => {
        sidebar.classList.remove('open');
        backdrop.classList.remove('active');
      };
    }

    // Logout button handler
    const logoutBtn = document.getElementById('btn-sidebar-logout');
    if (logoutBtn) {
      logoutBtn.onclick = async () => {
        const confirmed = await window.UI.confirm({
          title: 'Sign Out',
          message: 'Are you sure you want to sign out of your account?',
          confirmText: 'Sign Out',
          confirmType: 'primary'
        });
        if (confirmed) {
          await window.Auth.logout();
        }
      };
    }
  },

  updateUserInfo() {
    const profile = window.currentProfile;
    if (!profile) return;

    const usernameEl = document.getElementById('sidebar-username');
    const avatarEl = document.getElementById('sidebar-avatar');
    const roleBadgeEl = document.getElementById('sidebar-role-badge');

    if (usernameEl) {
      usernameEl.textContent = profile.username || profile.email;
    }
    if (avatarEl) {
      avatarEl.textContent = (profile.username || profile.email || 'U').charAt(0).toUpperCase();
    }
    if (roleBadgeEl) {
      roleBadgeEl.innerHTML = window.UI.renderRoleBadge(profile.role);
    }
  }
};
