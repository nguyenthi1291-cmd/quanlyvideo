/**
 * Supabase Client Initialization & Helper
 */
(function() {
  if (!window.supabase) {
    console.error("Supabase JS SDK not loaded! Make sure supabase-js script is included in HTML.");
    return;
  }

  const { SUPABASE_URL, SUPABASE_ANON_KEY } = window.APP_CONFIG;

  try {
    // Create Supabase client instance
    window.sbClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true
      }
    });

    console.log("Supabase Client initialized successfully with URL:", SUPABASE_URL);
  } catch (err) {
    console.error("Failed to initialize Supabase client:", err);
  }
})();
