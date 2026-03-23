/**
 * Cloud sync for live results (Supabase + Netlify function).
 * Public key: Supabase “publishable” (sb_publishable_…) or legacy anon JWT — both work in the browser.
 * Never put the secret / service_role key here — only in Netlify environment variables.
 */
window.LAGOSTE_CLOUD = {
  enabled: true,
  supabaseUrl: 'https://opmrxkinxthunphthrog.supabase.co',
  supabaseAnonKey: 'sb_publishable_YyISr0p3vtz4MDTySx0nWg_phdjrE4p',
  /** POST target for saves (same site on Netlify). Override if you proxy elsewhere. */
  saveFunctionPath: '/.netlify/functions/save-tournament',
};
