/**
 * Supabase Initialization Script
 * Uses the global window.supabase client loaded via CDN.
 */

// Replace placeholders with your actual Supabase credentials
const SUPABASE_URL = 'YOUR_SUPABASE_PROJECT_URL';
const SUPABASE_ANON_KEY = 'YOUR_SUPABASE_ANON_KEY';

if (!window.supabase) {
  console.error('Supabase CDN failed to load properly.');
}

// Export global supabase client instance
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
