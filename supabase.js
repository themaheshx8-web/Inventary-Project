/**
 * Supabase Initialization Script
 * Uses the global window.supabase client loaded via CDN.
 */

// Replace placeholders with your actual Supabase credentials
const SUPABASE_URL = 'https://mxbfvonueqgotncueuym.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im14YmZ2b251ZXFnb3RuY3VldXltIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODU2OTM1MDYsImV4cCI6MjEwMTI2OTUwNn0.XSWIVENgTSc6twpvVoX8H6Mtw5T4XLTpaOfN73fhct4';

if (!window.supabase) {
  console.error('Supabase CDN failed to load properly.');
}

// Export global supabase client instance
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
