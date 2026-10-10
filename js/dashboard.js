/**
 * Dashboard Module
 * Loads KPIs, Top 10 Bar Chart, and Views Over Time Line Chart from Supabase.
 */
window.Dashboard = {
  barChartInstance: null,
  lineChartInstance: null,
  currentPeriod: '7d',

  async init() {
    this.bindEvents();
    await this.loadDashboardData();
  },

  bindEvents() {
    const periodButtons = document.querySelectorAll('.period-filter-btn');
    periodButtons.forEach(btn => {
      btn.addEventListener('click', (e) => {
        periodButtons.forEach(b => b.classList.remove('active'));
        e.currentTarget.classList.add('active');
        this.currentPeriod = e.currentTarget.dataset.period;
        this.loadViewsTrend();
      });
    });

    const refreshBtn = document.getElementById('btn-refresh-dashboard');
    if (refreshBtn) {
      refreshBtn.addEventListener('click', () => this.loadDashboardData());
    }
  },

  async loadDashboardData() {
    const kpiContainer = document.getElementById('dashboard-kpis');
    const chartsContainer = document.getElementById('dashboard-charts');

    if (!window.sbClient) {
      window.UI.renderError(kpiContainer, "Supabase client not initialized.");
      return;
    }

    try {
      // 1. Fetch KPIs
      await this.loadKPIs();

      // 2. Fetch Top 10 Videos
      await this.loadTopVideos();

      // 3. Fetch Views Trend
      await this.loadViewsTrend();
    } catch (err) {
      console.error("Failed to load dashboard:", err);
      window.UI.toast("Failed to load some dashboard metrics: " + err.message, "error");
    }
  },

  async loadKPIs() {
    const elTotalVideos = document.getElementById('kpi-total-videos');
    const elTotalViews = document.getElementById('kpi-total-views');
    const elTotalStorage = document.getElementById('kpi-total-storage');

    // Query active videos
    const { data: videos, error } = await window.sbClient
      .from('videos')
      .select('views, file_size')
      .eq('status', 'ACTIVE');

    if (error) throw error;

    const totalVideos = videos.length;
    const totalViews = videos.reduce((sum, item) => sum + (Number(item.views) || 0), 0);
    const totalStorageBytes = videos.reduce((sum, item) => sum + (Number(item.file_size) || 0), 0);

    if (elTotalVideos) elTotalVideos.textContent = window.Utils.formatNumber(totalVideos);
    if (elTotalViews) elTotalViews.textContent = window.Utils.formatNumber(totalViews);
    if (elTotalStorage) elTotalStorage.textContent = window.Utils.formatBytes(totalStorageBytes);
  },

  async loadTopVideos() {
    const { data: topVideos, error } = await window.sbClient
      .from('videos')
      .select('id, title, views')
      .eq('status', 'ACTIVE')
      .order('views', { ascending: false })
      .limit(10);

    if (error) {
      console.error("Top videos fetch error:", error);
      return;
    }

    const ctx = document.getElementById('topVideosChart');
    if (!ctx) return;

    const labels = (topVideos || []).map(v => v.title.length > 25 ? v.title.substring(0, 22) + '...' : v.title);
    const data = (topVideos || []).map(v => v.views);

    if (this.barChartInstance) {
      this.barChartInstance.destroy();
    }

    if (!topVideos || topVideos.length === 0) {
      // Empty state
      ctx.parentElement.innerHTML = `<div class="empty-state" style="padding: 3rem 1rem;"><p class="text-muted text-sm">No video data available yet.</p></div>`;
      return;
    }

    this.barChartInstance = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [{
          label: 'Total Views',
          data: data,
          backgroundColor: '#4f46e5',
          borderRadius: 6,
          barThickness: 20
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: (item) => ` ${window.Utils.formatNumber(item.raw)} views`
            }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            grid: { color: '#f1f5f9' },
            ticks: {
              callback: (value) => window.Utils.formatNumber(value),
              font: { size: 11 }
            }
          },
          x: {
            grid: { display: false },
            ticks: {
              font: { size: 11 },
              maxRotation: 45,
              minRotation: 0
            }
          }
        }
      }
    });
  },

  async loadViewsTrend() {
    const ctx = document.getElementById('viewsTrendChart');
    if (!ctx) return;

    let days = 7;
    if (this.currentPeriod === '30d') days = 30;
    if (this.currentPeriod === '90d') days = 90;
    if (this.currentPeriod === 'monthly') days = 365;

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Fetch views from video_views table
    const { data: viewLogs, error } = await window.sbClient
      .from('video_views')
      .select('viewed_at')
      .gte('viewed_at', startDate.toISOString())
      .order('viewed_at', { ascending: true });

    if (error) {
      console.warn("View logs fetch warning:", error.message);
    }

    // Group by date
    const dateCounts = {};
    const step = days <= 30 ? 1 : (days <= 90 ? 3 : 30);

    // Populate full timeline
    for (let i = days; i >= 0; i -= step) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
      dateCounts[key] = 0;
    }

    if (viewLogs && viewLogs.length > 0) {
      viewLogs.forEach(log => {
        const d = new Date(log.viewed_at);
        const key = d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
        if (dateCounts[key] !== undefined) {
          dateCounts[key]++;
        }
      });
    }

    const labels = Object.keys(dateCounts);
    const data = Object.values(dateCounts);

    if (this.lineChartInstance) {
      this.lineChartInstance.destroy();
    }

    this.lineChartInstance = new Chart(ctx, {
      type: 'line',
      data: {
        labels: labels,
        datasets: [{
          label: 'Views',
          data: data,
          borderColor: '#10b981',
          backgroundColor: 'rgba(16, 185, 129, 0.08)',
          fill: true,
          tension: 0.35,
          borderWidth: 2,
          pointRadius: days <= 30 ? 3 : 1,
          pointHoverRadius: 6,
          pointBackgroundColor: '#10b981'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: (item) => ` ${window.Utils.formatNumber(item.raw)} views`
            }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            grid: { color: '#f1f5f9' },
            ticks: {
              font: { size: 11 },
              precision: 0
            }
          },
          x: {
            grid: { display: false },
            ticks: {
              font: { size: 11 },
              maxTicksLimit: 12
            }
          }
        }
      }
    });
  }
};
