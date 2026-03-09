import { createClient, SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const supabasePublishableKey =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? "";
const supabaseSecretKey = process.env.SUPABASE_SECRET_KEY ?? "";

/**
 * Supabase client for client-side usage (browser).
 * Uses the publishable (anon) key — safe to expose in the browser.
 * Respects RLS policies.
 */
let supabase: SupabaseClient;

if (supabaseUrl && supabasePublishableKey) {
  supabase = createClient(supabaseUrl, supabasePublishableKey);
} else {
  supabase = createClient("https://placeholder.supabase.co", "placeholder");
}

/**
 * Supabase client for server-side usage only (API routes, Server Actions).
 * Uses the secret (service_role) key — NEVER expose this to the browser.
 * Bypasses RLS policies.
 */
let supabaseAdmin: SupabaseClient;

if (supabaseUrl && supabaseSecretKey) {
  supabaseAdmin = createClient(supabaseUrl, supabaseSecretKey);
} else {
  supabaseAdmin = createClient("https://placeholder.supabase.co", "placeholder");
}

export { supabase, supabaseAdmin };
