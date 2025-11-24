/**
 * Tipos do Banco de Dados Supabase
 * Gerado manualmente baseado na migration 20250108_complete_subscription_system.sql
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      subscriptions: {
        Row: {
          id: string;
          user_id: string;
          plan_id: 'free' | 'essencial' | 'pro' | 'enterprise';
          status:
            | 'active'
            | 'canceled'
            | 'past_due'
            | 'trialing'
            | 'incomplete'
            | 'incomplete_expired';
          billing_interval: 'monthly' | 'annual';
          current_period_start: string;
          current_period_end: string;
          cancel_at_period_end: boolean;
          canceled_at: string | null;
          trial_start: string | null;
          trial_end: string | null;
          mercadopago_subscription_id: string | null;
          mercadopago_preapproval_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          plan_id: 'free' | 'essencial' | 'pro' | 'enterprise';
          status:
            | 'active'
            | 'canceled'
            | 'past_due'
            | 'trialing'
            | 'incomplete'
            | 'incomplete_expired';
          billing_interval: 'monthly' | 'annual';
          current_period_start?: string;
          current_period_end: string;
          cancel_at_period_end?: boolean;
          canceled_at?: string | null;
          trial_start?: string | null;
          trial_end?: string | null;
          mercadopago_subscription_id?: string | null;
          mercadopago_preapproval_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          plan_id?: 'free' | 'essencial' | 'pro' | 'enterprise';
          status?:
            | 'active'
            | 'canceled'
            | 'past_due'
            | 'trialing'
            | 'incomplete'
            | 'incomplete_expired';
          billing_interval?: 'monthly' | 'annual';
          current_period_start?: string;
          current_period_end?: string;
          cancel_at_period_end?: boolean;
          canceled_at?: string | null;
          trial_start?: string | null;
          trial_end?: string | null;
          mercadopago_subscription_id?: string | null;
          mercadopago_preapproval_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      usage_tracking: {
        Row: {
          id: string;
          user_id: string;
          subscription_id: string;
          calculations_today: number;
          calculations_this_month: number;
          ai_queries_this_month: number;
          api_requests_this_month: number;
          last_calculation_at: string | null;
          last_ai_query_at: string | null;
          last_api_request_at: string | null;
          period_start: string;
          period_end: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          subscription_id: string;
          calculations_today?: number;
          calculations_this_month?: number;
          ai_queries_this_month?: number;
          api_requests_this_month?: number;
          last_calculation_at?: string | null;
          last_ai_query_at?: string | null;
          last_api_request_at?: string | null;
          period_start?: string;
          period_end: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          subscription_id?: string;
          calculations_today?: number;
          calculations_this_month?: number;
          ai_queries_this_month?: number;
          api_requests_this_month?: number;
          last_calculation_at?: string | null;
          last_ai_query_at?: string | null;
          last_api_request_at?: string | null;
          period_start?: string;
          period_end?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      teams: {
        Row: {
          id: string;
          name: string;
          owner_id: string;
          subscription_id: string;
          require_approval: boolean;
          allow_comments: boolean;
          audit_log_enabled: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          owner_id: string;
          subscription_id: string;
          require_approval?: boolean;
          allow_comments?: boolean;
          audit_log_enabled?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          owner_id?: string;
          subscription_id?: string;
          require_approval?: boolean;
          allow_comments?: boolean;
          audit_log_enabled?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      team_members: {
        Row: {
          id: string;
          team_id: string;
          user_id: string;
          role: 'admin' | 'manager' | 'analyst' | 'operator';
          can_view_calculations: boolean;
          can_create_calculations: boolean;
          can_edit_calculations: boolean;
          can_delete_calculations: boolean;
          can_export_reports: boolean;
          can_manage_integrations: boolean;
          can_view_analytics: boolean;
          can_manage_team: boolean;
          can_manage_billing: boolean;
          invited_by: string;
          invited_at: string;
          accepted_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          team_id: string;
          user_id: string;
          role: 'admin' | 'manager' | 'analyst' | 'operator';
          can_view_calculations?: boolean;
          can_create_calculations?: boolean;
          can_edit_calculations?: boolean;
          can_delete_calculations?: boolean;
          can_export_reports?: boolean;
          can_manage_integrations?: boolean;
          can_view_analytics?: boolean;
          can_manage_team?: boolean;
          can_manage_billing?: boolean;
          invited_by: string;
          invited_at?: string;
          accepted_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          team_id?: string;
          user_id?: string;
          role?: 'admin' | 'manager' | 'analyst' | 'operator';
          can_view_calculations?: boolean;
          can_create_calculations?: boolean;
          can_edit_calculations?: boolean;
          can_delete_calculations?: boolean;
          can_export_reports?: boolean;
          can_manage_integrations?: boolean;
          can_view_analytics?: boolean;
          can_manage_team?: boolean;
          can_manage_billing?: boolean;
          invited_by?: string;
          invited_at?: string;
          accepted_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      documentos: {
        Row: {
          id: string;
          user_id: string;
          tipo: string;
          nome: string;
          numero: string | null;
          data_emissao: string;
          data_validade: string;
          arquivo_url: string | null;
          status: 'valido' | 'proximo_vencimento' | 'vencido';
          dias_para_vencer: number;
          observacoes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          tipo: string;
          nome: string;
          numero?: string | null;
          data_emissao: string;
          data_validade: string;
          arquivo_url?: string | null;
          status?: 'valido' | 'proximo_vencimento' | 'vencido';
          dias_para_vencer?: number;
          observacoes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          tipo?: string;
          nome?: string;
          numero?: string | null;
          data_emissao?: string;
          data_validade?: string;
          arquivo_url?: string | null;
          status?: 'valido' | 'proximo_vencimento' | 'vencido';
          dias_para_vencer?: number;
          observacoes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      plan_change_history: {
        Row: {
          id: string;
          user_id: string;
          subscription_id: string;
          from_plan_id: 'free' | 'essencial' | 'pro' | 'enterprise';
          to_plan_id: 'free' | 'essencial' | 'pro' | 'enterprise';
          change_type:
            | 'upgrade'
            | 'downgrade'
            | 'reactivation'
            | 'cancellation';
          reason: string | null;
          effective_date: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          subscription_id: string;
          from_plan_id: 'free' | 'essencial' | 'pro' | 'enterprise';
          to_plan_id: 'free' | 'essencial' | 'pro' | 'enterprise';
          change_type:
            | 'upgrade'
            | 'downgrade'
            | 'reactivation'
            | 'cancellation';
          reason?: string | null;
          effective_date?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          subscription_id?: string;
          from_plan_id?: 'free' | 'essencial' | 'pro' | 'enterprise';
          to_plan_id?: 'free' | 'essencial' | 'pro' | 'enterprise';
          change_type?:
            | 'upgrade'
            | 'downgrade'
            | 'reactivation'
            | 'cancellation';
          reason?: string | null;
          effective_date?: string;
          created_at?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      reset_daily_calculations: {
        Args: Record<string, never>;
        Returns: undefined;
      };
      reset_monthly_counters: {
        Args: Record<string, never>;
        Returns: undefined;
      };
    };
    Enums: {
      [_ in never]: never;
    };
  };
}
