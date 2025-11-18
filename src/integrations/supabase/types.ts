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
  | Json[]

// Helper types for ease of use
export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row']
export type TablesInsert<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Insert']
export type TablesUpdate<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Update']

export interface Database {
  public: {
    Tables: {
      subscriptions: {
        Row: {
          id: string
          user_id: string
          plan_id: 'free' | 'essencial' | 'pro' | 'enterprise'
          status: 'active' | 'canceled' | 'past_due' | 'trialing' | 'incomplete' | 'incomplete_expired'
          billing_interval: 'monthly' | 'annual'
          current_period_start: string
          current_period_end: string
          cancel_at_period_end: boolean
          canceled_at: string | null
          trial_start: string | null
          trial_end: string | null
          mercadopago_subscription_id: string | null
          mercadopago_preapproval_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          plan_id: 'free' | 'essencial' | 'pro' | 'enterprise'
          status: 'active' | 'canceled' | 'past_due' | 'trialing' | 'incomplete' | 'incomplete_expired'
          billing_interval: 'monthly' | 'annual'
          current_period_start?: string
          current_period_end: string
          cancel_at_period_end?: boolean
          canceled_at?: string | null
          trial_start?: string | null
          trial_end?: string | null
          mercadopago_subscription_id?: string | null
          mercadopago_preapproval_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          plan_id?: 'free' | 'essencial' | 'pro' | 'enterprise'
          status?: 'active' | 'canceled' | 'past_due' | 'trialing' | 'incomplete' | 'incomplete_expired'
          billing_interval?: 'monthly' | 'annual'
          current_period_start?: string
          current_period_end?: string
          cancel_at_period_end?: boolean
          canceled_at?: string | null
          trial_start?: string | null
          trial_end?: string | null
          mercadopago_subscription_id?: string | null
          mercadopago_preapproval_id?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      usage_tracking: {
        Row: {
          id: string
          user_id: string
          subscription_id: string
          calculations_today: number
          calculations_this_month: number
          ai_queries_this_month: number
          api_requests_this_month: number
          last_calculation_at: string | null
          last_ai_query_at: string | null
          last_api_request_at: string | null
          period_start: string
          period_end: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          subscription_id: string
          calculations_today?: number
          calculations_this_month?: number
          ai_queries_this_month?: number
          api_requests_this_month?: number
          last_calculation_at?: string | null
          last_ai_query_at?: string | null
          last_api_request_at?: string | null
          period_start?: string
          period_end: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          subscription_id?: string
          calculations_today?: number
          calculations_this_month?: number
          ai_queries_this_month?: number
          api_requests_this_month?: number
          last_calculation_at?: string | null
          last_ai_query_at?: string | null
          last_api_request_at?: string | null
          period_start?: string
          period_end?: string
          created_at?: string
          updated_at?: string
        }
      }
      teams: {
        Row: {
          id: string
          name: string
          owner_id: string
          subscription_id: string
          require_approval: boolean
          allow_comments: boolean
          audit_log_enabled: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          owner_id: string
          subscription_id: string
          require_approval?: boolean
          allow_comments?: boolean
          audit_log_enabled?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          owner_id?: string
          subscription_id?: string
          require_approval?: boolean
          allow_comments?: boolean
          audit_log_enabled?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      team_members: {
        Row: {
          id: string
          team_id: string
          user_id: string
          role: 'admin' | 'manager' | 'analyst' | 'operator'
          can_view_calculations: boolean
          can_create_calculations: boolean
          can_edit_calculations: boolean
          can_delete_calculations: boolean
          can_export_reports: boolean
          can_manage_integrations: boolean
          can_view_analytics: boolean
          can_manage_team: boolean
          can_manage_billing: boolean
          invited_by: string
          invited_at: string
          accepted_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          team_id: string
          user_id: string
          role: 'admin' | 'manager' | 'analyst' | 'operator'
          can_view_calculations?: boolean
          can_create_calculations?: boolean
          can_edit_calculations?: boolean
          can_delete_calculations?: boolean
          can_export_reports?: boolean
          can_manage_integrations?: boolean
          can_view_analytics?: boolean
          can_manage_team?: boolean
          can_manage_billing?: boolean
          invited_by: string
          invited_at?: string
          accepted_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          team_id?: string
          user_id?: string
          role?: 'admin' | 'manager' | 'analyst' | 'operator'
          can_view_calculations?: boolean
          can_create_calculations?: boolean
          can_edit_calculations?: boolean
          can_delete_calculations?: boolean
          can_export_reports?: boolean
          can_manage_integrations?: boolean
          can_view_analytics?: boolean
          can_manage_team?: boolean
          can_manage_billing?: boolean
          invited_by?: string
          invited_at?: string
          accepted_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      plan_change_history: {
        Row: {
          id: string
          user_id: string
          subscription_id: string
          from_plan_id: 'free' | 'essencial' | 'pro' | 'enterprise'
          to_plan_id: 'free' | 'essencial' | 'pro' | 'enterprise'
          change_type: 'upgrade' | 'downgrade' | 'reactivation' | 'cancellation'
          reason: string | null
          effective_date: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          subscription_id: string
          from_plan_id: 'free' | 'essencial' | 'pro' | 'enterprise'
          to_plan_id: 'free' | 'essencial' | 'pro' | 'enterprise'
          change_type: 'upgrade' | 'downgrade' | 'reactivation' | 'cancellation'
          reason?: string | null
          effective_date?: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          subscription_id?: string
          from_plan_id?: 'free' | 'essencial' | 'pro' | 'enterprise'
          to_plan_id?: 'free' | 'essencial' | 'pro' | 'enterprise'
          change_type?: 'upgrade' | 'downgrade' | 'reactivation' | 'cancellation'
          reason?: string | null
          effective_date?: string
          created_at?: string
        }
      }
      advanced_calculation_history: {
        Row: {
          id: string
          user_id: string | null
          date: string
          cost: number
          target_margin: number
          shipping: number
          packaging: number
          marketing: number
          other_costs: number
          marketplace_id: string
          payment_method: 'credit' | 'debit' | 'pix' | 'boleto'
          include_payment_fee: boolean
          suggested_price: number
          total_margin: number
          net_profit: number
          total_cost: number
          features: Json | null
          notes: string | null
          tags: string[] | null
          created_at: string
          updated_at: string | null
        }
        Insert: {
          id?: string
          user_id?: string | null
          date?: string
          cost: number
          target_margin: number
          shipping?: number
          packaging?: number
          marketing?: number
          other_costs?: number
          marketplace_id: string
          payment_method: 'credit' | 'debit' | 'pix' | 'boleto'
          include_payment_fee?: boolean
          suggested_price: number
          total_margin: number
          net_profit: number
          total_cost: number
          features?: Json | null
          notes?: string | null
          tags?: string[] | null
          created_at?: string
          updated_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string | null
          date?: string
          cost?: number
          target_margin?: number
          shipping?: number
          packaging?: number
          marketing?: number
          other_costs?: number
          marketplace_id?: string
          payment_method?: 'credit' | 'debit' | 'pix' | 'boleto'
          include_payment_fee?: boolean
          suggested_price?: number
          total_margin?: number
          net_profit?: number
          total_cost?: number
          features?: Json | null
          notes?: string | null
          tags?: string[] | null
          created_at?: string
          updated_at?: string | null
        }
      }
      user_profiles: {
        Row: {
          id: string
          email: string | null
          name: string | null
          avatar_url: string | null
          is_pro: boolean | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email?: string | null
          name?: string | null
          avatar_url?: string | null
          is_pro?: boolean | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string | null
          name?: string | null
          avatar_url?: string | null
          is_pro?: boolean | null
          created_at?: string
          updated_at?: string
        }
      }
      sales_data: {
        Row: {
          id: string
          user_id: string
          sale_date: string
          channel_name: string
          sale_value: number
          cost_value: number | null
          shipping_cost: number | null
          commission_fee: number | null
          advertising_cost: number | null
          product_id: string | null
          product_name: string
          profit_margin: number | null
          metadata: Json | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          sale_date: string
          channel_name: string
          sale_value: number
          cost_value?: number | null
          shipping_cost?: number | null
          commission_fee?: number | null
          advertising_cost?: number | null
          product_id?: string | null
          product_name: string
          profit_margin?: number | null
          metadata?: Json | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          sale_date?: string
          channel_name?: string
          sale_value?: number
          cost_value?: number | null
          shipping_cost?: number | null
          commission_fee?: number | null
          advertising_cost?: number | null
          product_id?: string | null
          product_name?: string
          profit_margin?: number | null
          metadata?: Json | null
          created_at?: string
        }
      }
      calculation_history: {
        Row: {
          id: string
          user_id: string | null
          date: string
          result: Json
          margin: number
          cost: string
          shipping: string | null
          tax: string | null
          card_fee: string | null
          other_costs: string | null
          include_shipping: boolean | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          user_id?: string | null
          date?: string
          result: Json
          margin: number
          cost: string
          shipping?: string | null
          tax?: string | null
          card_fee?: string | null
          other_costs?: string | null
          include_shipping?: boolean | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string | null
          date?: string
          result?: Json
          margin?: number
          cost?: string
          shipping?: string | null
          tax?: string | null
          card_fee?: string | null
          other_costs?: string | null
          include_shipping?: boolean | null
          updated_at?: string | null
        }
      }
      business_settings: {
        Row: {
          id: string
          user_id: string
          default_card_fee: number | null
          default_margin: number | null
          default_shipping: number | null
          default_tax: number | null
          include_shipping_default: boolean | null
          created_at: string
          updated_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          default_card_fee?: number | null
          default_margin?: number | null
          default_shipping?: number | null
          default_tax?: number | null
          include_shipping_default?: boolean | null
          created_at?: string
          updated_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          default_card_fee?: number | null
          default_margin?: number | null
          default_shipping?: number | null
          default_tax?: number | null
          include_shipping_default?: boolean | null
          created_at?: string
          updated_at?: string | null
        }
      }
      automation_rules: {
        Row: {
          id: string
          user_id: string
          name: string
          description: string | null
          rule_type: string
          priority: number
          is_active: boolean
          conditions: Json
          actions: Json
          schedule: Json | null
          tags: string[] | null
          version: number
          execution_count: number
          last_executed_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          description?: string | null
          rule_type: string
          priority?: number
          is_active?: boolean
          conditions?: Json
          actions?: Json
          schedule?: Json | null
          tags?: string[] | null
          version?: number
          execution_count?: number
          last_executed_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          description?: string | null
          rule_type?: string
          priority?: number
          is_active?: boolean
          conditions?: Json
          actions?: Json
          schedule?: Json | null
          tags?: string[] | null
          version?: number
          execution_count?: number
          last_executed_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      automation_executions: {
        Row: {
          id: string
          user_id: string
          rule_id: string
          status: string
          input_data: Json | null
          output_data: Json | null
          metadata: Json | null
          execution_time_ms: number | null
          error_message: string | null
          started_at: string
          completed_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          rule_id: string
          status: string
          input_data?: Json | null
          output_data?: Json | null
          metadata?: Json | null
          execution_time_ms?: number | null
          error_message?: string | null
          started_at?: string
          completed_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          rule_id?: string
          status?: string
          input_data?: Json | null
          output_data?: Json | null
          metadata?: Json | null
          execution_time_ms?: number | null
          error_message?: string | null
          started_at?: string
          completed_at?: string | null
        }
      }
      automation_alerts: {
        Row: {
          id: string
          user_id: string
          rule_id: string | null
          title: string
          message: string
          alert_type: string
          severity: string
          notification_channels: string[] | null
          is_read: boolean
          is_resolved: boolean
          resolved_at: string | null
          data: Json | null
          expires_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          rule_id?: string | null
          title: string
          message: string
          alert_type: string
          severity: string
          notification_channels?: string[] | null
          is_read?: boolean
          is_resolved?: boolean
          resolved_at?: string | null
          data?: Json | null
          expires_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          rule_id?: string | null
          title?: string
          message?: string
          alert_type?: string
          severity?: string
          notification_channels?: string[] | null
          is_read?: boolean
          is_resolved?: boolean
          resolved_at?: string | null
          data?: Json | null
          expires_at?: string | null
          created_at?: string
        }
      }
      calculation_comments: {
        Row: {
          id: string
          calculation_id: string | null
          user_id: string | null
          content: string
          parent_id: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          calculation_id?: string | null
          user_id?: string | null
          content: string
          parent_id?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          calculation_id?: string | null
          user_id?: string | null
          content?: string
          parent_id?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
      }
      calculation_shares: {
        Row: {
          id: string
          calculation_id: string | null
          shared_by: string | null
          shared_with: string | null
          permission_level: string | null
          created_at: string | null
          expires_at: string | null
        }
        Insert: {
          id?: string
          calculation_id?: string | null
          shared_by?: string | null
          shared_with?: string | null
          permission_level?: string | null
          created_at?: string | null
          expires_at?: string | null
        }
        Update: {
          id?: string
          calculation_id?: string | null
          shared_by?: string | null
          shared_with?: string | null
          permission_level?: string | null
          created_at?: string | null
          expires_at?: string | null
        }
      }
      calculation_approvals: {
        Row: {
          id: string
          calculation_id: string | null
          requested_by: string | null
          approver_id: string | null
          status: string | null
          comment: string | null
          created_at: string | null
          approved_at: string | null
        }
        Insert: {
          id?: string
          calculation_id?: string | null
          requested_by?: string | null
          approver_id?: string | null
          status?: string | null
          comment?: string | null
          created_at?: string | null
          approved_at?: string | null
        }
        Update: {
          id?: string
          calculation_id?: string | null
          requested_by?: string | null
          approver_id?: string | null
          status?: string | null
          comment?: string | null
          created_at?: string | null
          approved_at?: string | null
        }
      }
      calculation_templates: {
        Row: {
          id: string
          name: string
          description: string | null
          image_url: string | null
          is_public: boolean | null
          is_premium: boolean | null
          price: number | null
          rating: number | null
          downloads_count: number | null
          category: string | null
          sector_specific_config: Json | null
          custom_formulas: Json | null
          default_values: Json | null
          status: string | null
          created_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          image_url?: string | null
          is_public?: boolean | null
          is_premium?: boolean | null
          price?: number | null
          rating?: number | null
          downloads_count?: number | null
          category?: string | null
          sector_specific_config?: Json | null
          custom_formulas?: Json | null
          default_values?: Json | null
          status?: string | null
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          image_url?: string | null
          is_public?: boolean | null
          is_premium?: boolean | null
          price?: number | null
          rating?: number | null
          downloads_count?: number | null
          category?: string | null
          sector_specific_config?: Json | null
          custom_formulas?: Json | null
          default_values?: Json | null
          status?: string | null
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      user_marketplace_templates: {
        Row: {
          id: string
          user_id: string
          marketplace_id: string
          template_name: string
          shipping: number
          packaging: number
          marketing: number
          other_costs: number
          payment_method: string
          payment_fee: number
          include_payment_fee: boolean
          target_margin: number
          is_default: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          marketplace_id: string
          template_name: string
          shipping?: number
          packaging?: number
          marketing?: number
          other_costs?: number
          payment_method: string
          payment_fee?: number
          include_payment_fee?: boolean
          target_margin?: number
          is_default?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          marketplace_id?: string
          template_name?: string
          shipping?: number
          packaging?: number
          marketing?: number
          other_costs?: number
          payment_method?: string
          payment_fee?: number
          include_payment_fee?: boolean
          target_margin?: number
          is_default?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      analytics_metrics: {
        Row: {
          id: string
          user_id: string | null
          metric_type: string
          metric_value: number
          date: string
          hour: number
          metadata: Json | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          metric_type: string
          metric_value: number
          date?: string
          hour?: number
          metadata?: Json | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          metric_type?: string
          metric_value?: number
          date?: string
          hour?: number
          metadata?: Json | null
          created_at?: string
        }
      }
      audit_logs: {
        Row: {
          id: string
          user_id: string | null
          session_id: string | null
          user_agent: string | null
          ip_address: string | null
          action: string
          category: string
          risk_level: string
          success: boolean
          error_message: string | null
          details: Json | null
          created_at: string | null
        }
        Insert: {
          id?: string
          user_id?: string | null
          session_id?: string | null
          user_agent?: string | null
          ip_address?: string | null
          action: string
          category: string
          risk_level?: string
          success?: boolean
          error_message?: string | null
          details?: Json | null
          created_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string | null
          session_id?: string | null
          user_agent?: string | null
          ip_address?: string | null
          action?: string
          category?: string
          risk_level?: string
          success?: boolean
          error_message?: string | null
          details?: Json | null
          created_at?: string | null
        }
      }
      collaboration_notifications: {
        Row: {
          id: string
          user_id: string | null
          type: string
          title: string
          message: string
          related_id: string | null
          is_read: boolean | null
          created_at: string | null
        }
        Insert: {
          id?: string
          user_id?: string | null
          type: string
          title: string
          message: string
          related_id?: string | null
          is_read?: boolean | null
          created_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string | null
          type?: string
          title?: string
          message?: string
          related_id?: string | null
          is_read?: boolean | null
          created_at?: string | null
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      reset_daily_calculations: {
        Args: Record<string, never>
        Returns: undefined
      }
      reset_monthly_counters: {
        Args: Record<string, never>
        Returns: undefined
      }
      can_user_perform_action: {
        Args: {
          p_user_id: string
          p_action: string
        }
        Returns: boolean
      }
      increment_usage: {
        Args: {
          p_user_id: string
          p_action: string
        }
        Returns: undefined
      }
      create_notification: {
        Args: {
          _user_id: string
          _type: string
          _title: string
          _message: string
          _related_id: string
        }
        Returns: undefined
      }
      assign_user_role: {
        Args: {
          _user_id: string
          _organization_id?: string
          _team_id?: string
          _role: string
        }
        Returns: undefined
      }
      remove_user_role: {
        Args: {
          _user_id: string
        }
        Returns: undefined
      }
    }
    Enums: {
      [_ in never]: never
    }
  }
}
