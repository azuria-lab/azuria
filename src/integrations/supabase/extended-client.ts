/**
 * Extended Supabase client with dashboard types
 * Use this instead of the regular supabase client when working with dashboard tables
 */

import { createClient } from "@supabase/supabase-js";
import type { ExtendedDatabase } from "@/types/dashboard-extended";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Missing Supabase environment variables");
}

export const supabaseExtended = createClient<ExtendedDatabase>(
  supabaseUrl,
  supabaseAnonKey,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  }
);

// Re-export for convenience
export { supabaseExtended as default };
