import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Public client for browser use (respects RLS)
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * Admin client for server-side use only (bypasses RLS)
 * Safe to use in Server Actions and Route Handlers
 */
export const supabaseAdmin = supabaseServiceKey 
  ? createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })
  : supabase; // Fallback to public client if service key is missing

export type Submission = {
  id: string;
  word: string;
  name?: string;
  original_text?: string;
  created_at: string;
};

