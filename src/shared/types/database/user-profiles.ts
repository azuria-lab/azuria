
import { Json } from "@/integrations/supabase/types";

export interface UserProfilesTable {
  Row: {
    id: string;
    name: string | null;
    email: string | null;
    avatar_url: string | null;
    is_pro: boolean | null;
    created_at: string;
    updated_at: string;
  };
  Insert: {
    id: string;
    name?: string | null;
    email?: string | null;
    avatar_url?: string | null;
    is_pro?: boolean | null;
    created_at?: string;
    updated_at?: string;
  };
  Update: {
    id?: string;
    name?: string | null;
    email?: string | null;
    avatar_url?: string | null;
    is_pro?: boolean | null;
    created_at?: string;
    updated_at?: string;
  };
  Relationships: [];
}

export interface BusinessSettingsTable {
  Row: {
    id: string;
    user_id: string;
    default_margin: number | null;
    default_tax: number | null;
    default_card_fee: number | null;
    default_shipping: number | null;
    include_shipping_default: boolean | null;
    created_at: string;
    updated_at: string | null;
  };
  Insert: {
    id?: string;
    user_id: string;
    default_margin?: number | null;
    default_tax?: number | null;
    default_card_fee?: number | null;
    default_shipping?: number | null;
    include_shipping_default?: boolean | null;
    created_at?: string;
    updated_at?: string | null;
  };
  Update: {
    id?: string;
    user_id?: string;
    default_margin?: number | null;
    default_tax?: number | null;
    default_card_fee?: number | null;
    default_shipping?: number | null;
    include_shipping_default?: boolean | null;
    created_at?: string;
    updated_at?: string | null;
  };
  Relationships: [];
}
