
import { Json } from "@/integrations/supabase/types";

export interface AutomationRulesTable {
  Row: {
    id: string;
    user_id: string;
    name: string;
    description: string | null;
    is_active: boolean;
    rule_type: string;
    conditions: Json;
    actions: Json;
    schedule: Json | null;
    priority: number;
    tags: string[] | null;
    version: number;
    created_at: string;
    updated_at: string;
    last_executed_at: string | null;
    execution_count: number;
  };
  Insert: {
    id?: string;
    user_id: string;
    name: string;
    description?: string | null;
    is_active?: boolean;
    rule_type: string;
    conditions?: Json;
    actions?: Json;
    schedule?: Json | null;
    priority?: number;
    tags?: string[] | null;
    version?: number;
    created_at?: string;
    updated_at?: string;
    last_executed_at?: string | null;
    execution_count?: number;
  };
  Update: {
    id?: string;
    user_id?: string;
    name?: string;
    description?: string | null;
    is_active?: boolean;
    rule_type?: string;
    conditions?: Json;
    actions?: Json;
    schedule?: Json | null;
    priority?: number;
    tags?: string[] | null;
    version?: number;
    created_at?: string;
    updated_at?: string;
    last_executed_at?: string | null;
    execution_count?: number;
  };
  Relationships: [];
}

export interface AutomationExecutionsTable {
  Row: {
    id: string;
    rule_id: string;
    user_id: string;
    status: string;
    input_data: Json | null;
    output_data: Json | null;
    error_message: string | null;
    execution_time_ms: number | null;
    started_at: string;
    completed_at: string | null;
    metadata: Json | null;
  };
  Insert: {
    id?: string;
    rule_id: string;
    user_id: string;
    status: string;
    input_data?: Json | null;
    output_data?: Json | null;
    error_message?: string | null;
    execution_time_ms?: number | null;
    started_at?: string;
    completed_at?: string | null;
    metadata?: Json | null;
  };
  Update: {
    id?: string;
    rule_id?: string;
    user_id?: string;
    status?: string;
    input_data?: Json | null;
    output_data?: Json | null;
    error_message?: string | null;
    execution_time_ms?: number | null;
    started_at?: string;
    completed_at?: string | null;
    metadata?: Json | null;
  };
  Relationships: [];
}

export interface AutomationAlertsTable {
  Row: {
    id: string;
    user_id: string;
    rule_id: string | null;
    alert_type: string;
    title: string;
    message: string;
    severity: string;
    data: Json | null;
    is_read: boolean;
    is_resolved: boolean;
    notification_channels: string[];
    created_at: string;
    resolved_at: string | null;
    expires_at: string | null;
  };
  Insert: {
    id?: string;
    user_id: string;
    rule_id?: string | null;
    alert_type: string;
    title: string;
    message: string;
    severity: string;
    data?: Json | null;
    is_read?: boolean;
    is_resolved?: boolean;
    notification_channels?: string[];
    created_at?: string;
    resolved_at?: string | null;
    expires_at?: string | null;
  };
  Update: {
    id?: string;
    user_id?: string;
    rule_id?: string | null;
    alert_type?: string;
    title?: string;
    message?: string;
    severity?: string;
    data?: Json | null;
    is_read?: boolean;
    is_resolved?: boolean;
    notification_channels?: string[];
    created_at?: string;
    resolved_at?: string | null;
    expires_at?: string | null;
  };
  Relationships: [];
}

export interface AutomationWorkflowsTable {
  Row: {
    id: string;
    user_id: string;
    name: string;
    description: string | null;
    is_active: boolean;
    trigger_type: string;
    trigger_config: Json;
    steps: Json;
    approval_required: boolean;
    approval_users: string[] | null;
    tags: string[] | null;
    created_at: string;
    updated_at: string;
    last_run_at: string | null;
    next_run_at: string | null;
    run_count: number;
  };
  Insert: {
    id?: string;
    user_id: string;
    name: string;
    description?: string | null;
    is_active?: boolean;
    trigger_type: string;
    trigger_config: Json;
    steps?: Json;
    approval_required?: boolean;
    approval_users?: string[] | null;
    tags?: string[] | null;
    created_at?: string;
    updated_at?: string;
    last_run_at?: string | null;
    next_run_at?: string | null;
    run_count?: number;
  };
  Update: {
    id?: string;
    user_id?: string;
    name?: string;
    description?: string | null;
    is_active?: boolean;
    trigger_type?: string;
    trigger_config?: Json;
    steps?: Json;
    approval_required?: boolean;
    approval_users?: string[] | null;
    tags?: string[] | null;
    created_at?: string;
    updated_at?: string;
    last_run_at?: string | null;
    next_run_at?: string | null;
    run_count?: number;
  };
  Relationships: [];
}

export interface AutomationTemplatesTable {
  Row: {
    id: string;
    name: string;
    description: string | null;
    category: string;
    template_data: Json;
    is_public: boolean;
    created_by: string | null;
    usage_count: number;
    rating: number | null;
    tags: string[] | null;
    created_at: string;
    updated_at: string;
  };
  Insert: {
    id?: string;
    name: string;
    description?: string | null;
    category: string;
    template_data: Json;
    is_public?: boolean;
    created_by?: string | null;
    usage_count?: number;
    rating?: number | null;
    tags?: string[] | null;
    created_at?: string;
    updated_at?: string;
  };
  Update: {
    id?: string;
    name?: string;
    description?: string | null;
    category?: string;
    template_data?: Json;
    is_public?: boolean;
    created_by?: string | null;
    usage_count?: number;
    rating?: number | null;
    tags?: string[] | null;
    created_at?: string;
    updated_at?: string;
  };
  Relationships: [];
}
