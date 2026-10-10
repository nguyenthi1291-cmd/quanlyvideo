/**
 * Application Configuration
 * Contains Supabase project credentials and application constants.
 */
window.APP_CONFIG = {
  // Supabase Project URL from Supabase.txt
  SUPABASE_URL: "https://mgduhtgaatkubwjewhjv.supabase.co",
  
  // Supabase Public Anon Key (Replace with your project's anon/public key from Supabase Dashboard > Project Settings > API)
  // Can also be configured via browser local storage fallback if needed.
  SUPABASE_ANON_KEY: window.localStorage.getItem('SUPABASE_ANON_KEY') || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1nZHVodGdhYXRrdWJ3amV3aGp2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTEwOTExMzcsImV4cCI6MjEwNjY2NzEzN30.N5Z_MtcjGQwl0Vq5vlHuKzR7CdJMoUCBgUXZVV5mgE8",

  // App details
  APP_NAME: "Video Admin",
  APP_VERSION: "1.0.0",

  // Upload limits
  MAX_VIDEO_SIZE_MB: 200,
  MAX_THUMBNAIL_SIZE_MB: 10,
  ALLOWED_VIDEO_TYPES: ['video/mp4', 'video/webm', 'video/quicktime', 'video/x-matroska'],
  ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],

  // Pagination default
  DEFAULT_PAGE_SIZE: 10,

  // Storage bucket names
  BUCKETS: {
    VIDEOS: 'videos',
    THUMBNAILS: 'thumbnails'
  }
};
