
import { Json } from "@/integrations/supabase/types";

export interface CalculationSharesTable {
  Row: {
    id: string;
    calculation_id: string | null;
    shared_by: string | null;
    shared_with: string | null;
    permission_level: string | null;
    expires_at: string | null;
    created_at: string | null;
  };
  Insert: {
    id?: string;
    calculation_id?: string | null;
    shared_by?: string | null;
    shared_with?: string | null;
    permission_level?: string | null;
    expires_at?: string | null;
    created_at?: string | null;
  };
  Update: {
    id?: string;
    calculation_id?: string | null;
    shared_by?: string | null;
    shared_with?: string | null;
    permission_level?: string | null;
    expires_at?: string | null;
    created_at?: string | null;
  };
  Relationships: [];
}

export interface CalculationCommentsTable {
  Row: {
    id: string;
    calculation_id: string | null;
    user_id: string | null;
    content: string;
    parent_id: string | null;
    created_at: string | null;
    updated_at: string | null;
  };
  Insert: {
    id?: string;
    calculation_id?: string | null;
    user_id?: string | null;
    content: string;
    parent_id?: string | null;
    created_at?: string | null;
    updated_at?: string | null;
  };
  Update: {
    id?: string;
    calculation_id?: string | null;
    user_id?: string | null;
    content?: string;
    parent_id?: string | null;
    created_at?: string | null;
    updated_at?: string | null;
  };
  Relationships: [];
}

export interface CalculationApprovalsTable {
  Row: {
    id: string;
    calculation_id: string | null;
    requested_by: string | null;
    approver_id: string | null;
    status: string | null;
    comment: string | null;
    approved_at: string | null;
    created_at: string | null;
  };
  Insert: {
    id?: string;
    calculation_id?: string | null;
    requested_by?: string | null;
    approver_id?: string | null;
    status?: string | null;
    comment?: string | null;
    approved_at?: string | null;
    created_at?: string | null;
  };
  Update: {
    id?: string;
    calculation_id?: string | null;
    requested_by?: string | null;
    approver_id?: string | null;
    status?: string | null;
    comment?: string | null;
    approved_at?: string | null;
    created_at?: string | null;
  };
  Relationships: [];
}

export interface CollaborationNotificationsTable {
  Row: {
    id: string;
    user_id: string | null;
    type: string;
    title: string;
    message: string;
    related_id: string | null;
    is_read: boolean | null;
    created_at: string | null;
  };
  Insert: {
    id?: string;
    user_id?: string | null;
    type: string;
    title: string;
    message: string;
    related_id?: string | null;
    is_read?: boolean | null;
    created_at?: string | null;
  };
  Update: {
    id?: string;
    user_id?: string | null;
    type?: string;
    title?: string;
    message?: string;
    related_id?: string | null;
    is_read?: boolean | null;
    created_at?: string | null;
  };
  Relationships: [];
}
