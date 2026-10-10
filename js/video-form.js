/**
 * Video Form Module (Create & Edit)
 * Handles file validation, Supabase Storage uploads, metadata upsert, and cleanup.
 */
window.VideoForm = {
  videoId: null,
  isEdit: false,
  selectedVideoFile: null,
  selectedThumbFile: null,
  existingVideoPath: null,
  existingThumbPath: null,

  async init() {
    this.videoId = window.Utils.getQueryParam('id');
    this.isEdit = !!this.videoId;

    this.bindEvents();
    await this.loadCategories();

    if (this.isEdit) {
      document.getElementById('form-page-title').textContent = 'Edit Video';
      document.getElementById('btn-submit-text').textContent = 'Update Video';
      await this.loadVideoData(this.videoId);
    } else {
      document.getElementById('form-page-title').textContent = 'Add New Video';
      document.getElementById('btn-submit-text').textContent = 'Create Video';
    }
  },

  bindEvents() {
    const titleInput = document.getElementById('video-title');
    const slugInput = document.getElementById('video-slug');

    if (titleInput && slugInput) {
      titleInput.addEventListener('input', () => {
        if (!this.isEdit || !slugInput.value) {
          slugInput.value = window.Utils.slugify(titleInput.value);
        }
      });
    }

    // Video File Dropzone
    const videoInput = document.getElementById('video-file-input');
    if (videoInput) {
      videoInput.addEventListener('change', (e) => this.handleVideoFileSelect(e.target.files[0]));
    }

    // Thumbnail File Dropzone
    const thumbInput = document.getElementById('thumbnail-file-input');
    if (thumbInput) {
      thumbInput.addEventListener('change', (e) => this.handleThumbFileSelect(e.target.files[0]));
    }

    // Form submit
    const form = document.getElementById('video-form');
    if (form) {
      form.addEventListener('submit', (e) => this.handleSubmit(e));
    }
  },

  async loadCategories() {
    const select = document.getElementById('video-category');
    if (!select) return;

    try {
      const { data: categories, error } = await window.sbClient
        .from('video_categories')
        .select('id, name')
        .eq('status', 'ACTIVE')
        .order('name');

      if (error) throw error;

      select.innerHTML = '<option value="">Select a category</option>' +
        (categories || []).map(c => `<option value="${c.id}">${window.Utils.escapeHTML(c.name)}</option>`).join('');
    } catch (err) {
      console.error("Load categories error:", err);
      window.UI.toast("Failed to load categories: " + err.message, "error");
    }
  },

  async loadVideoData(id) {
    try {
      const { data: video, error } = await window.sbClient
        .from('videos')
        .select('*')
        .eq('id', id)
        .single();

      if (error || !video) {
        throw new Error("Video not found");
      }

      document.getElementById('video-title').value = video.title || '';
      document.getElementById('video-slug').value = video.slug || '';
      document.getElementById('video-description').value = video.description || '';
      document.getElementById('video-category').value = video.category_id || '';
      document.getElementById('video-status').value = video.status || 'ACTIVE';

      this.existingVideoPath = video.video_path;
      this.existingThumbPath = video.thumbnail_path;

      if (video.video_url) {
        document.getElementById('video-file-info').innerHTML = `
          <div class="flex items-center gap-2 text-xs text-secondary mt-2">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="23 7 16 12 23 17 23 7"></polygon><rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect></svg>
            <span class="truncate">Current file: <a href="${video.video_url}" target="_blank" class="text-primary font-medium underline">View Video</a> (${window.Utils.formatBytes(video.file_size)})</span>
          </div>
        `;
      }

      if (video.thumbnail_url) {
        const previewEl = document.getElementById('thumb-preview-img');
        if (previewEl) {
          previewEl.src = video.thumbnail_url;
          previewEl.classList.remove('hidden');
        }
      }
    } catch (err) {
      console.error("Error loading video:", err);
      window.UI.toast("Failed to load video: " + err.message, "error");
      setTimeout(() => { window.location.href = 'videos.html'; }, 1500);
    }
  },

  handleVideoFileSelect(file) {
    if (!file) return;

    // Validate size
    const maxBytes = window.APP_CONFIG.MAX_VIDEO_SIZE_MB * 1024 * 1024;
    if (file.size > maxBytes) {
      window.UI.toast(`Video file is too large. Maximum size is ${window.APP_CONFIG.MAX_VIDEO_SIZE_MB}MB.`, 'error');
      document.getElementById('video-file-input').value = '';
      return;
    }

    this.selectedVideoFile = file;
    document.getElementById('video-file-info').innerHTML = `
      <div class="flex items-center gap-2 text-xs font-medium text-success mt-2">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"></polyline></svg>
        <span>Selected: <strong>${window.Utils.escapeHTML(file.name)}</strong> (${window.Utils.formatBytes(file.size)})</span>
      </div>
    `;
  },

  handleThumbFileSelect(file) {
    if (!file) return;

    const maxBytes = window.APP_CONFIG.MAX_THUMBNAIL_SIZE_MB * 1024 * 1024;
    if (file.size > maxBytes) {
      window.UI.toast(`Thumbnail file is too large. Maximum size is ${window.APP_CONFIG.MAX_THUMBNAIL_SIZE_MB}MB.`, 'error');
      document.getElementById('thumbnail-file-input').value = '';
      return;
    }

    this.selectedThumbFile = file;

    const reader = new FileReader();
    reader.onload = (e) => {
      const previewEl = document.getElementById('thumb-preview-img');
      if (previewEl) {
        previewEl.src = e.target.result;
        previewEl.classList.remove('hidden');
      }
    };
    reader.readAsDataURL(file);
  },

  async handleSubmit(e) {
    e.preventDefault();

    const title = document.getElementById('video-title').value.trim();
    const slug = document.getElementById('video-slug').value.trim() || window.Utils.slugify(title);
    const categoryId = document.getElementById('video-category').value;
    const description = document.getElementById('video-description').value.trim();
    const status = document.getElementById('video-status').value;

    // Validations
    if (!title) {
      window.UI.toast("Please enter a video title.", "warning");
      return;
    }
    if (!categoryId) {
      window.UI.toast("Please select a category.", "warning");
      return;
    }

    if (!this.isEdit && !this.selectedVideoFile) {
      window.UI.toast("Please upload a video file.", "warning");
      return;
    }

    const submitBtn = document.getElementById('btn-submit-video');
    submitBtn.disabled = true;
    submitBtn.innerHTML = `<div class="spinner spinner-sm"></div> Saving video...`;

    const progressBar = document.getElementById('upload-progress-fill');
    const progressContainer = document.getElementById('upload-progress-container');
    if (progressContainer) progressContainer.classList.remove('hidden');

    let uploadedVideoPath = null;
    let uploadedThumbPath = null;
    let videoUrl = null;
    let thumbUrl = null;
    let fileSize = 0;

    try {
      const userId = window.currentUser?.id || 'public';
      const timestamp = Date.now();

      // 1. Upload Video File if selected
      if (this.selectedVideoFile) {
        if (progressBar) progressBar.style.width = '30%';
        const safeName = this.selectedVideoFile.name.replace(/[^a-zA-Z0-9.-]/g, '_');
        uploadedVideoPath = `${userId}/${timestamp}-${safeName}`;

        const { data: vData, error: vError } = await window.sbClient.storage
          .from(window.APP_CONFIG.BUCKETS.VIDEOS)
          .upload(uploadedVideoPath, this.selectedVideoFile, {
            cacheControl: '3600',
            upsert: false
          });

        if (vError) throw new Error(`Video upload failed: ${vError.message}`);

        // Get public URL
        const { data: vUrlData } = window.sbClient.storage
          .from(window.APP_CONFIG.BUCKETS.VIDEOS)
          .getPublicUrl(uploadedVideoPath);

        videoUrl = vUrlData.publicUrl;
        fileSize = this.selectedVideoFile.size;
      }

      // 2. Upload Thumbnail File if selected
      if (this.selectedThumbFile) {
        if (progressBar) progressBar.style.width = '70%';
        const safeName = this.selectedThumbFile.name.replace(/[^a-zA-Z0-9.-]/g, '_');
        uploadedThumbPath = `${userId}/${timestamp}-${safeName}`;

        const { data: tData, error: tError } = await window.sbClient.storage
          .from(window.APP_CONFIG.BUCKETS.THUMBNAILS)
          .upload(uploadedThumbPath, this.selectedThumbFile, {
            cacheControl: '3600',
            upsert: false
          });

        if (tError) throw new Error(`Thumbnail upload failed: ${tError.message}`);

        const { data: tUrlData } = window.sbClient.storage
          .from(window.APP_CONFIG.BUCKETS.THUMBNAILS)
          .getPublicUrl(uploadedThumbPath);

        thumbUrl = tUrlData.publicUrl;
      }

      if (progressBar) progressBar.style.width = '90%';

      // 3. Database Upsert
      const payload = {
        title,
        slug,
        description,
        category_id: categoryId,
        status
      };

      if (videoUrl) {
        payload.video_url = videoUrl;
        payload.video_path = uploadedVideoPath;
        payload.file_size = fileSize;
      }

      if (thumbUrl) {
        payload.thumbnail_url = thumbUrl;
        payload.thumbnail_path = uploadedThumbPath;
      }

      if (this.isEdit) {
        const { error: updateError } = await window.sbClient
          .from('videos')
          .update(payload)
          .eq('id', this.videoId);

        if (updateError) throw updateError;

        // Clean up old storage files if replaced
        if (uploadedVideoPath && this.existingVideoPath && this.existingVideoPath !== uploadedVideoPath) {
          await window.sbClient.storage.from(window.APP_CONFIG.BUCKETS.VIDEOS).remove([this.existingVideoPath]);
        }
        if (uploadedThumbPath && this.existingThumbPath && this.existingThumbPath !== uploadedThumbPath) {
          await window.sbClient.storage.from(window.APP_CONFIG.BUCKETS.THUMBNAILS).remove([this.existingThumbPath]);
        }

        window.UI.toast("Video updated successfully!", "success");
      } else {
        payload.created_by = window.currentUser?.id;
        const { error: insertError } = await window.sbClient
          .from('videos')
          .insert(payload);

        if (insertError) throw insertError;
        window.UI.toast("Video created successfully!", "success");
      }

      if (progressBar) progressBar.style.width = '100%';

      setTimeout(() => {
        window.location.href = 'videos.html';
      }, 1000);

    } catch (err) {
      console.error("Video submission error:", err);

      // Rollback newly uploaded storage objects if metadata insertion failed
      if (uploadedVideoPath) {
        await window.sbClient.storage.from(window.APP_CONFIG.BUCKETS.VIDEOS).remove([uploadedVideoPath]);
      }
      if (uploadedThumbPath) {
        await window.sbClient.storage.from(window.APP_CONFIG.BUCKETS.THUMBNAILS).remove([uploadedThumbPath]);
      }

      window.UI.toast("Failed to save video: " + err.message, "error");
      submitBtn.disabled = false;
      submitBtn.innerHTML = this.isEdit ? 'Update Video' : 'Create Video';
      if (progressContainer) progressContainer.classList.add('hidden');
    }
  }
};
