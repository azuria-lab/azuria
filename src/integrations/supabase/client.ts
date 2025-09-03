
import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/supabase';

// Read from environment variables provided by Vite
const SUPABASE_URL = (import.meta.env.VITE_SUPABASE_URL || import.meta.env.VITE_SUPABASE_PROJECT_ID && `https://${import.meta.env.VITE_SUPABASE_PROJECT_ID}.supabase.co`) as string | undefined;
const SUPABASE_PUBLISHABLE_KEY = (import.meta.env.VITE_SUPABASE_ANON_KEY || import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY) as string | undefined;

if (!SUPABASE_URL || !SUPABASE_PUBLISHABLE_KEY) {
	// Provide a clear error early in development
	// Do NOT throw to avoid breaking SSR/static analysis; consumers should handle failed calls gracefully.
	console.warn(
		'[Supabase] Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY. Configure your .env.* files.'
	);
}

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(
	SUPABASE_URL ?? '',
	SUPABASE_PUBLISHABLE_KEY ?? ''
);
