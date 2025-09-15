
import { Database as SupabaseDB } from "@/integrations/supabase/types";

// Re-export the complete database type from Supabase
export type Database = SupabaseDB;

// Type-safe helper for Supabase tables
export type Tables<T extends keyof Database['public']['Tables']> = 
  Database['public']['Tables'][T]['Row'];

// Type-safe helper for Supabase inserts
export type TablesInsert<T extends keyof Database['public']['Tables']> = 
  Database['public']['Tables'][T]['Insert'];
  
// Type-safe helper for Supabase updates
export type TablesUpdate<T extends keyof Database['public']['Tables']> = 
  Database['public']['Tables'][T]['Update'];

// Re-export Json type for convenience
export type { Json } from "@/integrations/supabase/types";
