/**
 * Core Utilities & Formatter Helpers
 */
window.Utils = {
  /**
   * Escape HTML special characters to prevent XSS attacks
   */
  escapeHTML(str) {
    if (str === null || str === undefined) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  },

  /**
   * Convert numbers to compact human-readable format (e.g. 1,250 or 2.45M)
   */
  formatNumber(num) {
    if (num === null || num === undefined || isNaN(num)) return '0';
    const n = Number(num);
    if (n >= 1000000) {
      return (n / 1000000).toFixed(2).replace(/\.00$/, '') + 'M';
    }
    if (n >= 1000) {
      return (n / 1000).toFixed(1).replace(/\.0$/, '') + 'k';
    }
    return new Intl.NumberFormat().format(n);
  },

  /**
   * Convert bytes into KB, MB, GB, TB
   */
  formatBytes(bytes, decimals = 2) {
    if (!bytes || bytes === 0 || isNaN(bytes)) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    const val = parseFloat((bytes / Math.pow(k, i)).toFixed(dm));
    return `${val} ${sizes[i] || 'Bytes'}`;
  },

  /**
   * Format ISO date string into readable local format
   */
  formatDate(dateStr, showTime = false) {
    if (!dateStr) return '—';
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return '—';
      const options = {
        year: 'numeric',
        month: 'short',
        day: '2-digit',
        ...(showTime ? { hour: '2-digit', minute: '2-digit' } : {})
      };
      return d.toLocaleDateString(undefined, options);
    } catch {
      return '—';
    }
  },

  /**
   * Format seconds into mm:ss or hh:mm:ss
   */
  formatDuration(seconds) {
    if (!seconds || isNaN(seconds) || seconds <= 0) return '00:00';
    const sec = Math.floor(seconds);
    const hrs = Math.floor(sec / 3600);
    const mins = Math.floor((sec % 3600) / 60);
    const secs = sec % 60;
    if (hrs > 0) {
      return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  },

  /**
   * Generate slug from title
   */
  slugify(text) {
    if (!text) return '';
    return text
      .toString()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // remove Vietnamese diacritics
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9 -]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-');
  },

  /**
   * Debounce helper
   */
  debounce(func, wait = 300) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  },

  /**
   * Extract query param from URL
   */
  getQueryParam(param) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(param);
  }
};
