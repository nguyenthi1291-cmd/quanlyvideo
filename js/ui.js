/**
 * Shared UI Components & Notification System
 */
window.UI = {
  /**
   * Toast notification system
   * @param {string} message 
   * @param {'success'|'error'|'warning'|'info'} type 
   * @param {string} title 
   * @param {number} duration 
   */
  toast(message, type = 'info', title = '', duration = 4000) {
    let container = document.getElementById('toast-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'toast-container';
      container.className = 'toast-container';
      document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;

    const iconMap = {
      success: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>`,
      error: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>`,
      warning: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>`,
      info: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>`
    };

    const titleMap = {
      success: 'Success',
      error: 'Error',
      warning: 'Warning',
      info: 'Notification'
    };

    const displayTitle = title || titleMap[type] || 'Notice';

    toast.innerHTML = `
      <div class="toast-icon">${iconMap[type] || iconMap.info}</div>
      <div class="toast-content">
        <div class="toast-title">${window.Utils.escapeHTML(displayTitle)}</div>
        <div class="toast-message">${window.Utils.escapeHTML(message)}</div>
      </div>
      <button class="toast-close" type="button" aria-label="Close">&times;</button>
    `;

    container.appendChild(toast);

    // Trigger transition
    requestAnimationFrame(() => {
      toast.classList.add('show');
    });

    const removeToast = () => {
      toast.classList.remove('show');
      setTimeout(() => {
        if (toast.parentNode) {
          toast.parentNode.removeChild(toast);
        }
      }, 300);
    };

    toast.querySelector('.toast-close').addEventListener('click', removeToast);

    if (duration > 0) {
      setTimeout(removeToast, duration);
    }
  },

  /**
   * Confirmation Dialog Modal (Promise-based)
   */
  confirm({
    title = 'Confirm Action',
    message = 'Are you sure you want to proceed?',
    confirmText = 'Confirm',
    cancelText = 'Cancel',
    confirmType = 'primary' // 'primary' | 'danger'
  }) {
    return new Promise((resolve) => {
      let modalBackdrop = document.getElementById('global-confirm-modal');
      if (!modalBackdrop) {
        modalBackdrop = document.createElement('div');
        modalBackdrop.id = 'global-confirm-modal';
        modalBackdrop.className = 'modal-backdrop';
        document.body.appendChild(modalBackdrop);
      }

      const btnClass = confirmType === 'danger' ? 'btn-danger' : 'btn-primary';

      modalBackdrop.innerHTML = `
        <div class="modal">
          <div class="modal-header">
            <h3 class="modal-title">${window.Utils.escapeHTML(title)}</h3>
            <button class="modal-close" id="confirm-modal-close" type="button">&times;</button>
          </div>
          <div class="modal-body">
            <p>${window.Utils.escapeHTML(message)}</p>
          </div>
          <div class="modal-footer">
            <button class="btn btn-secondary" id="confirm-modal-cancel" type="button">${window.Utils.escapeHTML(cancelText)}</button>
            <button class="btn ${btnClass}" id="confirm-modal-submit" type="button">${window.Utils.escapeHTML(confirmText)}</button>
          </div>
        </div>
      `;

      modalBackdrop.classList.add('active');

      const cleanup = (confirmed) => {
        modalBackdrop.classList.remove('active');
        resolve(confirmed);
      };

      document.getElementById('confirm-modal-submit').onclick = () => cleanup(true);
      document.getElementById('confirm-modal-cancel').onclick = () => cleanup(false);
      document.getElementById('confirm-modal-close').onclick = () => cleanup(false);
      modalBackdrop.onclick = (e) => {
        if (e.target === modalBackdrop) cleanup(false);
      };
    });
  },

  /**
   * Show loading spinner inside container
   */
  showLoading(container, text = 'Loading data...') {
    if (typeof container === 'string') {
      container = document.querySelector(container);
    }
    if (!container) return;
    container.innerHTML = `
      <div class="loading-state">
        <div class="spinner"></div>
        <p class="mt-4 text-sm text-secondary">${window.Utils.escapeHTML(text)}</p>
      </div>
    `;
  },

  /**
   * Render Empty state
   */
  renderEmpty(container, { title = 'No data found', message = 'There are currently no items to display.', actionText = '', onAction = null }) {
    if (typeof container === 'string') {
      container = document.querySelector(container);
    }
    if (!container) return;

    let actionBtnHtml = '';
    if (actionText && onAction) {
      actionBtnHtml = `<button class="btn btn-primary" id="empty-action-btn">${window.Utils.escapeHTML(actionText)}</button>`;
    }

    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
            <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
            <line x1="12" y1="22.08" x2="12" y2="12"></line>
          </svg>
        </div>
        <div class="empty-state-title">${window.Utils.escapeHTML(title)}</div>
        <div class="empty-state-text">${window.Utils.escapeHTML(message)}</div>
        ${actionBtnHtml}
      </div>
    `;

    if (actionText && onAction) {
      const btn = container.querySelector('#empty-action-btn');
      if (btn) btn.onclick = onAction;
    }
  },

  /**
   * Render Error state with optional retry button
   */
  renderError(container, message = 'An error occurred while fetching data.', onRetry = null) {
    if (typeof container === 'string') {
      container = document.querySelector(container);
    }
    if (!container) return;

    let retryHtml = onRetry ? `<button class="btn btn-secondary mt-4" id="retry-error-btn">Retry</button>` : '';

    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon" style="color: var(--color-danger); background-color: var(--color-danger-bg);">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="8" x2="12" y2="12"></line>
            <line x1="12" y1="16" x2="12.01" y2="16"></line>
          </svg>
        </div>
        <div class="empty-state-title">Unable to Load Data</div>
        <div class="empty-state-text">${window.Utils.escapeHTML(message)}</div>
        ${retryHtml}
      </div>
    `;

    if (onRetry) {
      const btn = container.querySelector('#retry-error-btn');
      if (btn) btn.onclick = onRetry;
    }
  },

  /**
   * Render Status Badge
   */
  renderStatusBadge(status) {
    const s = (status || '').toUpperCase();
    if (s === 'ACTIVE') {
      return `<span class="badge badge-success"><span class="badge-dot"></span>Active</span>`;
    }
    if (s === 'INACTIVE') {
      return `<span class="badge badge-danger"><span class="badge-dot"></span>Inactive</span>`;
    }
    if (s === 'DRAFT') {
      return `<span class="badge badge-warning"><span class="badge-dot"></span>Draft</span>`;
    }
    return `<span class="badge badge-neutral">${window.Utils.escapeHTML(status)}</span>`;
  },

  /**
   * Render Role Badge
   */
  renderRoleBadge(role) {
    const r = (role || 'USER').toUpperCase();
    if (r === 'ADMIN') {
      return `<span class="badge badge-info" style="font-weight:700;"><span class="badge-dot"></span>ADMIN</span>`;
    }
    return `<span class="badge badge-neutral">USER</span>`;
  },

  /**
   * Modal Open/Close Helper
   */
  openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.classList.add('active');
    }
  },

  closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.classList.remove('active');
    }
  }
};
