
import { Json } from "@/integrations/supabase/types";

// Core database types that are used across the application
export interface BaseTable {
  id: string;
  created_at: string;
  updated_at: string;
}

export interface UserOwnedTable extends BaseTable {
  user_id: string;
}

// Re-export Json type for convenience
export type { Json };
