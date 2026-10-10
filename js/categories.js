/**
 * Categories Management Module
 * Handles category CRUD, slug auto-generation, search, and delete-safety verification.
 */
window.Categories = {
  searchQuery: '',
  editingCategoryId: null,

  async init() {
    this.bindEvents();
    await this.loadCategories();
  },

  bindEvents() {
    const searchInput = document.getElementById('category-search-input');
    if (searchInput) {
      searchInput.addEventListener('input', window.Utils.debounce((e) => {
        this.searchQuery = e.target.value.trim();
        this.loadCategories();
      }, 300));
    }

    const nameInput = document.getElementById('category-name');
    const slugInput = document.getElementById('category-slug');
    if (nameInput && slugInput) {
      nameInput.addEventListener('input', () => {
        if (!this.editingCategoryId || !slugInput.value) {
          slugInput.value = window.Utils.slugify(nameInput.value);
        }
      });
    }

    const form = document.getElementById('category-form');
    if (form) {
      form.addEventListener('submit', (e) => this.handleSave(e));
    }
  },

  async loadCategories() {
    const tbody = document.getElementById('categories-table-body');
    if (!tbody) return;

    tbody.innerHTML = `<tr><td colspan="6" class="text-center" style="padding: 2.5rem;"><div class="spinner" style="margin: 0 auto;"></div><p class="text-xs text-muted mt-2">Loading categories...</p></td></tr>`;

    try {
      let query = window.sbClient
        .from('video_categories')
        .select('*, videos(count)')
        .order('name');

      if (this.searchQuery) {
        query = query.ilike('name', `%${this.searchQuery}%`);
      }

      const { data: categories, error } = await query;

      if (error) throw error;

      if (!categories || categories.length === 0) {
        tbody.innerHTML = `
          <tr>
            <td colspan="6">
              <div class="empty-state" style="padding: 2.5rem 1rem;">
                <div class="empty-state-title">No Categories Found</div>
                <div class="empty-state-text">Create your first category to organize videos.</div>
                <button class="btn btn-primary btn-sm mt-2" onclick="window.Categories.openCreateModal()">Add Category</button>
              </div>
            </td>
          </tr>
        `;
        return;
      }

      this.renderTableRows(categories);
    } catch (err) {
      console.error("Load categories error:", err);
      tbody.innerHTML = `
        <tr>
          <td colspan="6">
            <div class="empty-state" style="padding: 2rem 1rem;">
              <p class="text-danger font-medium">Failed to load categories</p>
              <p class="text-xs text-muted mt-1">${window.Utils.escapeHTML(err.message)}</p>
              <button class="btn btn-secondary btn-sm mt-3" onclick="window.Categories.loadCategories()">Retry</button>
            </div>
          </td>
        </tr>
      `;
    }
  },

  renderTableRows(categories) {
    const tbody = document.getElementById('categories-table-body');
    const isAdmin = window.currentProfile?.role === 'ADMIN';

    tbody.innerHTML = categories.map(c => {
      const videoCount = c.videos?.[0]?.count || 0;

      return `
        <tr>
          <td class="text-xs text-muted">#${c.id}</td>
          <td>
            <div class="font-medium text-sm">${window.Utils.escapeHTML(c.name)}</div>
            <div class="text-xs text-muted font-mono">${window.Utils.escapeHTML(c.slug)}</div>
          </td>
          <td class="text-xs text-secondary">${window.Utils.escapeHTML(c.description || '—')}</td>
          <td>
            <span class="badge badge-neutral">${videoCount} videos</span>
          </td>
          <td>${window.UI.renderStatusBadge(c.status)}</td>
          <td>
            <div class="table-actions">
              ${isAdmin ? `
              <button class="btn btn-icon btn-outline btn-sm" title="Edit Category" onclick="window.Categories.openEditModal(${c.id}, '${window.Utils.escapeHTML(c.name)}', '${window.Utils.escapeHTML(c.slug)}', '${window.Utils.escapeHTML(c.description || '')}', '${c.status}')">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
              </button>
              <button class="btn btn-icon btn-danger-outline btn-sm" title="Delete Category" onclick="window.Categories.deleteCategory(${c.id}, '${window.Utils.escapeHTML(c.name)}', ${videoCount})">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
              </button>
              ` : '—'}
            </div>
          </td>
        </tr>
      `;
    }).join('');
  },

  openCreateModal() {
    this.editingCategoryId = null;
    document.getElementById('category-modal-title').textContent = 'Add Category';
    document.getElementById('category-name').value = '';
    document.getElementById('category-slug').value = '';
    document.getElementById('category-description').value = '';
    document.getElementById('category-status').value = 'ACTIVE';
    window.UI.openModal('category-form-modal');
  },

  openEditModal(id, name, slug, description, status) {
    this.editingCategoryId = id;
    document.getElementById('category-modal-title').textContent = 'Edit Category';
    document.getElementById('category-name').value = name;
    document.getElementById('category-slug').value = slug;
    document.getElementById('category-description').value = description;
    document.getElementById('category-status').value = status;
    window.UI.openModal('category-form-modal');
  },

  async handleSave(e) {
    e.preventDefault();

    const name = document.getElementById('category-name').value.trim();
    const slug = document.getElementById('category-slug').value.trim() || window.Utils.slugify(name);
    const description = document.getElementById('category-description').value.trim();
    const status = document.getElementById('category-status').value;

    if (!name) {
      window.UI.toast('Category name is required.', 'warning');
      return;
    }

    const payload = { name, slug, description, status };

    try {
      if (this.editingCategoryId) {
        const { error } = await window.sbClient
          .from('video_categories')
          .update(payload)
          .eq('id', this.editingCategoryId);

        if (error) throw error;
        window.UI.toast('Category updated successfully!', 'success');
      } else {
        const { error } = await window.sbClient
          .from('video_categories')
          .insert(payload);

        if (error) throw error;
        window.UI.toast('Category created successfully!', 'success');
      }

      window.UI.closeModal('category-form-modal');
      this.loadCategories();
    } catch (err) {
      console.error("Save category error:", err);
      window.UI.toast('Failed to save category: ' + err.message, 'error');
    }
  },

  async deleteCategory(id, name, videoCount) {
    // Check if category has associated videos
    if (videoCount > 0) {
      window.UI.toast(`Cannot delete "${name}" because it is currently assigned to ${videoCount} video(s). Please reassign them first.`, 'warning');
      return;
    }

    const confirmed = await window.UI.confirm({
      title: 'Delete Category',
      message: `Are you sure you want to delete the category "${name}"?`,
      confirmText: 'Delete Category',
      confirmType: 'danger'
    });

    if (!confirmed) return;

    try {
      const { error } = await window.sbClient
        .from('video_categories')
        .delete()
        .eq('id', id);

      if (error) throw error;

      window.UI.toast(`Category "${name}" deleted successfully.`, 'success');
      this.loadCategories();
    } catch (err) {
      console.error("Delete category error:", err);
      window.UI.toast('Failed to delete category: ' + err.message, 'error');
    }
  }
};
