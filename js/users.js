/**
 * Users Management Module (ADMIN only)
 * Handles listing users, changing role, and updating status.
 */
window.Users = {
  searchQuery: '',
  selectedUserId: null,

  async init() {
    this.bindEvents();
    await this.loadUsers();
  },

  bindEvents() {
    const searchInput = document.getElementById('user-search-input');
    if (searchInput) {
      searchInput.addEventListener('input', window.Utils.debounce((e) => {
        this.searchQuery = e.target.value.trim();
        this.loadUsers();
      }, 300));
    }

    const form = document.getElementById('user-edit-form');
    if (form) {
      form.addEventListener('submit', (e) => this.handleSaveUser(e));
    }
  },

  async loadUsers() {
    const tbody = document.getElementById('users-table-body');
    if (!tbody) return;

    tbody.innerHTML = `<tr><td colspan="6" class="text-center" style="padding: 2.5rem;"><div class="spinner" style="margin: 0 auto;"></div><p class="text-xs text-muted mt-2">Loading users...</p></td></tr>`;

    try {
      let query = window.sbClient
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (this.searchQuery) {
        query = query.or(`username.ilike.%${this.searchQuery}%,email.ilike.%${this.searchQuery}%`);
      }

      const { data: users, error } = await query;

      if (error) throw error;

      if (!users || users.length === 0) {
        tbody.innerHTML = `
          <tr>
            <td colspan="6">
              <div class="empty-state" style="padding: 2.5rem 1rem;">
                <div class="empty-state-title">No Users Found</div>
                <div class="empty-state-text">No registered profiles match your search criteria.</div>
              </div>
            </td>
          </tr>
        `;
        return;
      }

      this.renderTableRows(users);
    } catch (err) {
      console.error("Load users error:", err);
      tbody.innerHTML = `
        <tr>
          <td colspan="6">
            <div class="empty-state" style="padding: 2rem 1rem;">
              <p class="text-danger font-medium">Failed to load users</p>
              <p class="text-xs text-muted mt-1">${window.Utils.escapeHTML(err.message)}</p>
              <button class="btn btn-secondary btn-sm mt-3" onclick="window.Users.loadUsers()">Retry</button>
            </div>
          </td>
        </tr>
      `;
    }
  },

  renderTableRows(users) {
    const tbody = document.getElementById('users-table-body');
    const currentUserId = window.currentUser?.id;

    tbody.innerHTML = users.map(u => {
      const isMe = u.id === currentUserId;

      return `
        <tr>
          <td class="text-xs text-muted font-mono" title="${u.id}">${u.id.substring(0, 8)}...</td>
          <td>
            <div class="font-medium text-sm flex items-center gap-2">
              ${window.Utils.escapeHTML(u.username)}
              ${isMe ? '<span class="badge badge-primary" style="font-size:10px;">You</span>' : ''}
            </div>
          </td>
          <td class="text-xs text-secondary">${window.Utils.escapeHTML(u.email || '—')}</td>
          <td>${window.UI.renderRoleBadge(u.role)}</td>
          <td>${window.UI.renderStatusBadge(u.status)}</td>
          <td class="text-xs text-muted">${window.Utils.formatDate(u.created_at, true)}</td>
          <td>
            <div class="table-actions">
              <button class="btn btn-icon btn-outline btn-sm" title="Edit User" onclick="window.Users.openEditModal('${u.id}', '${window.Utils.escapeHTML(u.username)}', '${window.Utils.escapeHTML(u.email || '')}', '${u.role}', '${u.status}')">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
              </button>
            </div>
          </td>
        </tr>
      `;
    }).join('');
  },

  openEditModal(id, username, email, role, status) {
    this.selectedUserId = id;
    document.getElementById('edit-user-username').textContent = username;
    document.getElementById('edit-user-email').textContent = email || 'No email';
    document.getElementById('edit-user-role').value = role;
    document.getElementById('edit-user-status').value = status;
    window.UI.openModal('user-edit-modal');
  },

  async handleSaveUser(e) {
    e.preventDefault();

    const role = document.getElementById('edit-user-role').value;
    const status = document.getElementById('edit-user-status').value;

    const isMe = this.selectedUserId === window.currentUser?.id;

    if (isMe && role !== 'ADMIN') {
      const confirmSelfDemote = await window.UI.confirm({
        title: 'Revoke Admin Privileges?',
        message: 'Warning: You are about to remove your own ADMIN role. You will immediately lose access to user administration.',
        confirmText: 'Yes, change my role',
        confirmType: 'danger'
      });
      if (!confirmSelfDemote) return;
    }

    try {
      const { error } = await window.sbClient
        .from('profiles')
        .update({ role, status })
        .eq('id', this.selectedUserId);

      if (error) throw error;

      window.UI.toast('User updated successfully!', 'success');
      window.UI.closeModal('user-edit-modal');

      if (isMe && role !== 'ADMIN') {
        window.location.href = 'dashboard.html';
      } else {
        this.loadUsers();
      }
    } catch (err) {
      console.error("Save user error:", err);
      window.UI.toast('Failed to update user: ' + err.message, 'error');
    }
  }
};
