/**
 * Video List Management Module
 * Search, filter, pagination, sorting, preview, and deletion with Storage cleanup.
 */
window.Videos = {
  page: 0,
  pageSize: 10,
  totalCount: 0,
  searchQuery: '',
  categoryFilter: '',
  statusFilter: '',
  sortBy: 'created_at',
  sortAscending: false,

  async init() {
    this.bindEvents();
    await this.loadCategoriesFilter();
    await this.loadVideos();
  },

  bindEvents() {
    const searchInput = document.getElementById('video-search-input');
    if (searchInput) {
      searchInput.addEventListener('input', window.Utils.debounce((e) => {
        this.searchQuery = e.target.value.trim();
        this.page = 0;
        this.loadVideos();
      }, 350));
    }

    const categorySelect = document.getElementById('video-category-filter');
    if (categorySelect) {
      categorySelect.addEventListener('change', (e) => {
        this.categoryFilter = e.target.value;
        this.page = 0;
        this.loadVideos();
      });
    }

    const statusSelect = document.getElementById('video-status-filter');
    if (statusSelect) {
      statusSelect.addEventListener('change', (e) => {
        this.statusFilter = e.target.value;
        this.page = 0;
        this.loadVideos();
      });
    }

    const sortSelect = document.getElementById('video-sort-filter');
    if (sortSelect) {
      sortSelect.addEventListener('change', (e) => {
        const val = e.target.value;
        if (val === 'views_desc') {
          this.sortBy = 'views';
          this.sortAscending = false;
        } else if (val === 'views_asc') {
          this.sortBy = 'views';
          this.sortAscending = true;
        } else if (val === 'title_asc') {
          this.sortBy = 'title';
          this.sortAscending = true;
        } else if (val === 'created_at_asc') {
          this.sortBy = 'created_at';
          this.sortAscending = true;
        } else {
          this.sortBy = 'created_at';
          this.sortAscending = false;
        }
        this.page = 0;
        this.loadVideos();
      });
    }
  },

  async loadCategoriesFilter() {
    const select = document.getElementById('video-category-filter');
    if (!select) return;

    try {
      const { data: categories } = await window.sbClient
        .from('video_categories')
        .select('id, name')
        .eq('status', 'ACTIVE')
        .order('name');

      if (categories) {
        select.innerHTML = '<option value="">All Categories</option>' +
          categories.map(c => `<option value="${c.id}">${window.Utils.escapeHTML(c.name)}</option>`).join('');
      }
    } catch (err) {
      console.warn("Could not load categories for filter:", err);
    }
  },

  async loadVideos() {
    const tableBody = document.getElementById('videos-table-body');
    const tableContainer = document.getElementById('videos-table-container');
    const paginationContainer = document.getElementById('videos-pagination');

    if (!tableBody) return;

    tableBody.innerHTML = `<tr><td colspan="7" class="text-center" style="padding: 3rem;"><div class="spinner" style="margin: 0 auto;"></div><p class="text-xs text-muted mt-2">Loading videos...</p></td></tr>`;

    try {
      let query = window.sbClient
        .from('videos')
        .select('*, video_categories(id, name)', { count: 'exact' });

      // Apply Filters
      if (this.searchQuery) {
        query = query.ilike('title', `%${this.searchQuery}%`);
      }
      if (this.categoryFilter) {
        query = query.eq('category_id', this.categoryFilter);
      }
      if (this.statusFilter) {
        query = query.eq('status', this.statusFilter);
      }

      // Sort & Pagination
      query = query
        .order(this.sortBy, { ascending: this.sortAscending })
        .range(this.page * this.pageSize, (this.page + 1) * this.pageSize - 1);

      const { data: videos, count, error } = await query;

      if (error) throw error;

      this.totalCount = count || 0;

      if (!videos || videos.length === 0) {
        tableBody.innerHTML = `
          <tr>
            <td colspan="7">
              <div class="empty-state" style="padding: 3rem 1rem;">
                <div class="empty-state-title">No Videos Found</div>
                <div class="empty-state-text">No videos match your search or filter criteria.</div>
                <a href="video-form.html" class="btn btn-primary btn-sm mt-2">Add New Video</a>
              </div>
            </td>
          </tr>
        `;
        if (paginationContainer) paginationContainer.innerHTML = '';
        return;
      }

      this.renderTableRows(videos);
      this.renderPagination();
    } catch (err) {
      console.error("Error loading videos:", err);
      tableBody.innerHTML = `
        <tr>
          <td colspan="7">
            <div class="empty-state" style="padding: 2rem 1rem;">
              <p class="text-danger font-medium">Failed to load video list</p>
              <p class="text-xs text-muted mt-1">${window.Utils.escapeHTML(err.message)}</p>
              <button class="btn btn-secondary btn-sm mt-3" onclick="window.Videos.loadVideos()">Retry</button>
            </div>
          </td>
        </tr>
      `;
    }
  },

  renderTableRows(videos) {
    const tableBody = document.getElementById('videos-table-body');
    const isAdmin = window.currentProfile?.role === 'ADMIN';

    tableBody.innerHTML = videos.map(v => {
      const categoryName = v.video_categories?.name || 'Uncategorized';
      const thumbUrl = v.thumbnail_url || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=160&auto=format&fit=crop&q=60';

      return `
        <tr>
          <td class="text-xs text-muted">#${v.id}</td>
          <td>
            <div style="position: relative; width: 72px; height: 44px; cursor: pointer;" onclick="window.Videos.previewVideo(${v.id}, '${window.Utils.escapeHTML(v.title)}', '${encodeURIComponent(v.video_url || '')}')">
              <img src="${window.Utils.escapeHTML(thumbUrl)}" alt="" class="table-thumb" onerror="this.src='https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=160&auto=format&fit=crop&q=60'" />
              <div style="position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; background: rgba(0,0,0,0.3); border-radius: var(--radius-sm);">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="white"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
              </div>
            </div>
          </td>
          <td>
            <div class="font-medium text-sm">${window.Utils.escapeHTML(v.title)}</div>
            <div class="text-xs text-muted line-clamp-2">${window.Utils.escapeHTML(v.description || '')}</div>
          </td>
          <td class="text-sm font-semibold">${window.Utils.formatNumber(v.views)}</td>
          <td><span class="badge badge-neutral">${window.Utils.escapeHTML(categoryName)}</span></td>
          <td>${window.UI.renderStatusBadge(v.status)}</td>
          <td class="text-xs text-muted">${window.Utils.formatDate(v.created_at)}</td>
          <td>
            <div class="table-actions">
              <button class="btn btn-icon btn-outline btn-sm" title="Preview Video" onclick="window.Videos.previewVideo(${v.id}, '${window.Utils.escapeHTML(v.title)}', '${encodeURIComponent(v.video_url || '')}')">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
              </button>
              ${isAdmin ? `
              <a href="video-form.html?id=${v.id}" class="btn btn-icon btn-outline btn-sm" title="Edit Video">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
              </a>
              <button class="btn btn-icon btn-danger-outline btn-sm" title="Delete Video" onclick="window.Videos.deleteVideo(${v.id}, '${window.Utils.escapeHTML(v.title)}', '${v.video_path || ''}', '${v.thumbnail_path || ''}')">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
              </button>
              ` : ''}
            </div>
          </td>
        </tr>
      `;
    }).join('');
  },

  renderPagination() {
    const container = document.getElementById('videos-pagination');
    if (!container) return;

    const totalPages = Math.ceil(this.totalCount / this.pageSize);
    if (totalPages <= 1) {
      container.innerHTML = `<span class="text-xs text-muted">Showing ${this.totalCount} of ${this.totalCount} videos</span>`;
      return;
    }

    const startItem = this.page * this.pageSize + 1;
    const endItem = Math.min((this.page + 1) * this.pageSize, this.totalCount);

    container.innerHTML = `
      <div class="text-xs text-secondary">
        Showing <strong>${startItem}</strong> - <strong>${endItem}</strong> of <strong>${this.totalCount}</strong> videos
      </div>
      <div class="pagination-controls">
        <button class="pagination-btn" ${this.page === 0 ? 'disabled' : ''} onclick="window.Videos.goToPage(${this.page - 1})">Previous</button>
        ${Array.from({ length: totalPages }, (_, i) => `
          <button class="pagination-btn ${this.page === i ? 'active' : ''}" onclick="window.Videos.goToPage(${i})">${i + 1}</button>
        `).join('')}
        <button class="pagination-btn" ${this.page >= totalPages - 1 ? 'disabled' : ''} onclick="window.Videos.goToPage(${this.page + 1})">Next</button>
      </div>
    `;
  },

  goToPage(p) {
    this.page = p;
    this.loadVideos();
  },

  async previewVideo(id, title, encodedUrl) {
    const url = decodeURIComponent(encodedUrl);
    let modal = document.getElementById('video-preview-modal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'video-preview-modal';
      modal.className = 'modal-backdrop';
      document.body.appendChild(modal);
    }

    modal.innerHTML = `
      <div class="modal modal-lg">
        <div class="modal-header">
          <h3 class="modal-title truncate">${title}</h3>
          <button class="modal-close" onclick="window.UI.closeModal('video-preview-modal')">&times;</button>
        </div>
        <div class="modal-body" style="padding: var(--space-4);">
          ${url ? `
          <video controls autoplay class="video-preview-player" src="${url}">
            Your browser does not support HTML5 video.
          </video>
          ` : `
          <div class="empty-state">
            <p class="text-muted">No video source file available for preview.</p>
          </div>
          `}
          <div class="flex items-center justify-between mt-4">
            <span class="text-xs text-muted">ID: #${id}</span>
            <button class="btn btn-outline btn-sm" onclick="window.Videos.recordTestView(${id})">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
              +1 Test View
            </button>
          </div>
        </div>
      </div>
    `;

    window.UI.openModal('video-preview-modal');
  },

  async recordTestView(id) {
    try {
      const { error } = await window.sbClient.rpc('record_video_view', { p_video_id: id });
      if (error) {
        // Fallback: direct update if RPC is missing
        await window.sbClient.from('video_views').insert({ video_id: id });
      }
      window.UI.toast('View recorded for analytics!', 'success');
      this.loadVideos();
    } catch (err) {
      window.UI.toast('Could not record view: ' + err.message, 'error');
    }
  },

  async deleteVideo(id, title, videoPath, thumbPath) {
    const confirmed = await window.UI.confirm({
      title: 'Delete Video',
      message: `Are you sure you want to delete "${title}"? This action cannot be undone and will remove files from storage.`,
      confirmText: 'Delete Video',
      confirmType: 'danger'
    });

    if (!confirmed) return;

    try {
      // 1. Delete DB record
      const { error: dbError } = await window.sbClient
        .from('videos')
        .delete()
        .eq('id', id);

      if (dbError) throw dbError;

      // 2. Clean up storage if paths exist
      if (videoPath) {
        await window.sbClient.storage.from(window.APP_CONFIG.BUCKETS.VIDEOS).remove([videoPath]);
      }
      if (thumbPath) {
        await window.sbClient.storage.from(window.APP_CONFIG.BUCKETS.THUMBNAILS).remove([thumbPath]);
      }

      window.UI.toast(`Video "${title}" deleted successfully.`, 'success');
      this.loadVideos();
    } catch (err) {
      console.error("Delete video error:", err);
      window.UI.toast('Failed to delete video: ' + err.message, 'error');
    }
  }
};
