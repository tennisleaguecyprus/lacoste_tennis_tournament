/**
 * Cloud sync — browser only. Use the PUBLISHABLE / ANON key here (safe in Git).
 * NEVER paste the service_role / secret key in this file — that key goes ONLY in
 * Netlify → Environment variables → SUPABASE_SERVICE_ROLE_KEY (must be a *different* value).
 */
window.LAGOSTE_CLOUD = {
  enabled: true,
  supabaseUrl: 'https://opmrxkinxthunphthrog.supabase.co',
  // Publishable or anon JWT only (NOT the same as SUPABASE_SERVICE_ROLE_KEY on Netlify)
  supabaseAnonKey: 'sb_publishable_YyISr0p3vtz4MDTySx0nWg_phdjrE4p',
  /** POST target for saves (same site on Netlify). Override if you proxy elsewhere. */
  saveFunctionPath: '/.netlify/functions/save-tournament',
};
