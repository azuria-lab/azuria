export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      admin_actions: {
        Row: {
          action: string
          admin_id: string
          created_at: string | null
          details: Json | null
          id: string
        }
        Insert: {
          action: string
          admin_id: string
          created_at?: string | null
          details?: Json | null
          id?: string
        }
        Update: {
          action?: string
          admin_id?: string
          created_at?: string | null
          details?: Json | null
          id?: string
        }
        Relationships: []
      }
      advanced_calculation_history: {
        Row: {
          cost: number
          created_at: string
          date: string
          features: Json | null
          id: string
          include_payment_fee: boolean | null
          marketing: number | null
          marketplace_id: string
          net_profit: number
          notes: string | null
          other_costs: number | null
          packaging: number | null
          payment_method: string
          shipping: number | null
          suggested_price: number
          tags: string[] | null
          target_margin: number
          total_cost: number
          total_margin: number
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          cost: number
          created_at?: string
          date?: string
          features?: Json | null
          id: string
          include_payment_fee?: boolean | null
          marketing?: number | null
          marketplace_id: string
          net_profit: number
          notes?: string | null
          other_costs?: number | null
          packaging?: number | null
          payment_method: string
          shipping?: number | null
          suggested_price: number
          tags?: string[] | null
          target_margin: number
          total_cost: number
          total_margin: number
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          cost?: number
          created_at?: string
          date?: string
          features?: Json | null
          id?: string
          include_payment_fee?: boolean | null
          marketing?: number | null
          marketplace_id?: string
          net_profit?: number
          notes?: string | null
          other_costs?: number | null
          packaging?: number | null
          payment_method?: string
          shipping?: number | null
          suggested_price?: number
          tags?: string[] | null
          target_margin?: number
          total_cost?: number
          total_margin?: number
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      ai_cache: {
        Row: {
          cache_key: string
          created_at: string
          expires_at: string
          hit_count: number | null
          id: string
          model: string
          prompt: string
          response: string
          tokens_used: number | null
        }
        Insert: {
          cache_key: string
          created_at?: string
          expires_at: string
          hit_count?: number | null
          id?: string
          model: string
          prompt: string
          response: string
          tokens_used?: number | null
        }
        Update: {
          cache_key?: string
          created_at?: string
          expires_at?: string
          hit_count?: number | null
          id?: string
          model?: string
          prompt?: string
          response?: string
          tokens_used?: number | null
        }
        Relationships: []
      }
      ai_logs: {
        Row: {
          ai_response: string
          context: string | null
          created_at: string | null
          id: string
          message_type: string | null
          metadata: Json | null
          session_id: string
          user_id: string
          user_message: string
        }
        Insert: {
          ai_response: string
          context?: string | null
          created_at?: string | null
          id?: string
          message_type?: string | null
          metadata?: Json | null
          session_id: string
          user_id: string
          user_message: string
        }
        Update: {
          ai_response?: string
          context?: string | null
          created_at?: string | null
          id?: string
          message_type?: string | null
          metadata?: Json | null
          session_id?: string
          user_id?: string
          user_message?: string
        }
        Relationships: []
      }
      alerts: {
        Row: {
          created_at: string
          edital_id: string
          id: string
          message: string
          read: boolean
          read_at: string | null
          suggested_actions: Json
          title: string
          type: string
          urgency: string
          user_id: string
        }
        Insert: {
          created_at?: string
          edital_id: string
          id: string
          message: string
          read?: boolean
          read_at?: string | null
          suggested_actions?: Json
          title: string
          type: string
          urgency: string
          user_id: string
        }
        Update: {
          created_at?: string
          edital_id?: string
          id?: string
          message?: string
          read?: boolean
          read_at?: string | null
          suggested_actions?: Json
          title?: string
          type?: string
          urgency?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "alerts_edital_id_fkey"
            columns: ["edital_id"]
            isOneToOne: false
            referencedRelation: "detected_editais"
            referencedColumns: ["id"]
          },
        ]
      }
      analytics_events: {
        Row: {
          created_at: string
          event_data: Json | null
          event_name: string
          id: string
          ip_address: unknown
          page_url: string | null
          session_id: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          event_data?: Json | null
          event_name: string
          id?: string
          ip_address?: unknown
          page_url?: string | null
          session_id?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          event_data?: Json | null
          event_name?: string
          id?: string
          ip_address?: unknown
          page_url?: string | null
          session_id?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      analytics_metrics: {
        Row: {
          created_at: string
          date: string
          hour: number
          id: string
          metadata: Json | null
          metric_type: string
          metric_value: number
          user_id: string | null
        }
        Insert: {
          created_at?: string
          date?: string
          hour?: number
          id?: string
          metadata?: Json | null
          metric_type: string
          metric_value: number
          user_id?: string | null
        }
        Update: {
          created_at?: string
          date?: string
          hour?: number
          id?: string
          metadata?: Json | null
          metric_type?: string
          metric_value?: number
          user_id?: string | null
        }
        Relationships: []
      }
      audit_logs: {
        Row: {
          action: string
          created_at: string
          id: string
          ip_address: unknown
          new_values: Json | null
          old_values: Json | null
          resource_id: string | null
          resource_type: string
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string
          id?: string
          ip_address?: unknown
          new_values?: Json | null
          old_values?: Json | null
          resource_id?: string | null
          resource_type: string
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string
          id?: string
          ip_address?: unknown
          new_values?: Json | null
          old_values?: Json | null
          resource_id?: string | null
          resource_type?: string
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      automation_alerts: {
        Row: {
          alert_type: string
          created_at: string
          id: string
          is_read: boolean | null
          message: string
          metadata: Json | null
          severity: string
          title: string
          user_id: string
        }
        Insert: {
          alert_type: string
          created_at?: string
          id?: string
          is_read?: boolean | null
          message: string
          metadata?: Json | null
          severity: string
          title: string
          user_id: string
        }
        Update: {
          alert_type?: string
          created_at?: string
          id?: string
          is_read?: boolean | null
          message?: string
          metadata?: Json | null
          severity?: string
          title?: string
          user_id?: string
        }
        Relationships: []
      }
      automation_executions: {
        Row: {
          error_message: string | null
          executed_at: string
          id: string
          result_data: Json | null
          rule_id: string
          status: string
          trigger_data: Json | null
        }
        Insert: {
          error_message?: string | null
          executed_at?: string
          id?: string
          result_data?: Json | null
          rule_id: string
          status: string
          trigger_data?: Json | null
        }
        Update: {
          error_message?: string | null
          executed_at?: string
          id?: string
          result_data?: Json | null
          rule_id?: string
          status?: string
          trigger_data?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "automation_executions_rule_id_fkey"
            columns: ["rule_id"]
            isOneToOne: false
            referencedRelation: "automation_rules"
            referencedColumns: ["id"]
          },
        ]
      }
      automation_rules: {
        Row: {
          actions: Json
          created_at: string
          description: string | null
          id: string
          is_active: boolean | null
          last_run_at: string | null
          name: string
          run_count: number | null
          trigger_conditions: Json
          trigger_type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          actions: Json
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          last_run_at?: string | null
          name: string
          run_count?: number | null
          trigger_conditions: Json
          trigger_type: string
          updated_at?: string
          user_id: string
        }
        Update: {
          actions?: Json
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          last_run_at?: string | null
          name?: string
          run_count?: number | null
          trigger_conditions?: Json
          trigger_type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      automation_templates: {
        Row: {
          category: string
          created_at: string
          created_by: string | null
          description: string | null
          id: string
          is_public: boolean | null
          name: string
          template_data: Json
          updated_at: string
        }
        Insert: {
          category: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          is_public?: boolean | null
          name: string
          template_data: Json
          updated_at?: string
        }
        Update: {
          category?: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          is_public?: boolean | null
          name?: string
          template_data?: Json
          updated_at?: string
        }
        Relationships: []
      }
      automation_workflows: {
        Row: {
          created_at: string
          description: string | null
          id: string
          is_active: boolean | null
          name: string
          updated_at: string
          user_id: string
          workflow_steps: Json
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          updated_at?: string
          user_id: string
          workflow_steps: Json
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          updated_at?: string
          user_id?: string
          workflow_steps?: Json
        }
        Relationships: []
      }
      business_kpis: {
        Row: {
          color: string | null
          created_at: string
          current_value: number | null
          icon: string | null
          id: string
          is_active: boolean | null
          kpi_name: string
          kpi_type: string
          target_value: number | null
          unit: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          color?: string | null
          created_at?: string
          current_value?: number | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          kpi_name: string
          kpi_type: string
          target_value?: number | null
          unit?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          color?: string | null
          created_at?: string
          current_value?: number | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          kpi_name?: string
          kpi_type?: string
          target_value?: number | null
          unit?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      business_metrics: {
        Row: {
          created_at: string
          id: string
          metadata: Json | null
          metric_type: string
          metric_value: number
          period_date: string
          period_type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          metadata?: Json | null
          metric_type: string
          metric_value: number
          period_date: string
          period_type: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          metadata?: Json | null
          metric_type?: string
          metric_value?: number
          period_date?: string
          period_type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      business_settings: {
        Row: {
          created_at: string
          default_card_fee: number | null
          default_margin: number | null
          default_shipping: number | null
          default_tax: number | null
          id: string
          include_shipping_default: boolean | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          default_card_fee?: number | null
          default_margin?: number | null
          default_shipping?: number | null
          default_tax?: number | null
          id?: string
          include_shipping_default?: boolean | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          default_card_fee?: number | null
          default_margin?: number | null
          default_shipping?: number | null
          default_tax?: number | null
          id?: string
          include_shipping_default?: boolean | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      calculation_approvals: {
        Row: {
          approved_at: string | null
          approver_id: string | null
          calculation_id: string | null
          comment: string | null
          created_at: string | null
          id: string
          requested_by: string | null
          status: string | null
        }
        Insert: {
          approved_at?: string | null
          approver_id?: string | null
          calculation_id?: string | null
          comment?: string | null
          created_at?: string | null
          id?: string
          requested_by?: string | null
          status?: string | null
        }
        Update: {
          approved_at?: string | null
          approver_id?: string | null
          calculation_id?: string | null
          comment?: string | null
          created_at?: string | null
          id?: string
          requested_by?: string | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "calculation_approvals_calculation_id_fkey"
            columns: ["calculation_id"]
            isOneToOne: false
            referencedRelation: "calculation_history"
            referencedColumns: ["id"]
          },
        ]
      }
      calculation_comments: {
        Row: {
          calculation_id: string | null
          content: string
          created_at: string | null
          id: string
          parent_id: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          calculation_id?: string | null
          content: string
          created_at?: string | null
          id?: string
          parent_id?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          calculation_id?: string | null
          content?: string
          created_at?: string | null
          id?: string
          parent_id?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "calculation_comments_calculation_id_fkey"
            columns: ["calculation_id"]
            isOneToOne: false
            referencedRelation: "calculation_history"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "calculation_comments_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "calculation_comments"
            referencedColumns: ["id"]
          },
        ]
      }
      calculation_history: {
        Row: {
          card_fee: string | null
          cost: string
          date: string
          id: string
          include_shipping: boolean | null
          margin: number
          other_costs: string | null
          result: Json
          shipping: string | null
          tax: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          card_fee?: string | null
          cost: string
          date?: string
          id?: string
          include_shipping?: boolean | null
          margin: number
          other_costs?: string | null
          result: Json
          shipping?: string | null
          tax?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          card_fee?: string | null
          cost?: string
          date?: string
          id?: string
          include_shipping?: boolean | null
          margin?: number
          other_costs?: string | null
          result?: Json
          shipping?: string | null
          tax?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      calculation_shares: {
        Row: {
          calculation_id: string | null
          created_at: string | null
          expires_at: string | null
          id: string
          permission_level: string | null
          shared_by: string | null
          shared_with: string | null
        }
        Insert: {
          calculation_id?: string | null
          created_at?: string | null
          expires_at?: string | null
          id?: string
          permission_level?: string | null
          shared_by?: string | null
          shared_with?: string | null
        }
        Update: {
          calculation_id?: string | null
          created_at?: string | null
          expires_at?: string | null
          id?: string
          permission_level?: string | null
          shared_by?: string | null
          shared_with?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "calculation_shares_calculation_id_fkey"
            columns: ["calculation_id"]
            isOneToOne: false
            referencedRelation: "calculation_history"
            referencedColumns: ["id"]
          },
        ]
      }
      calculation_templates: {
        Row: {
          category: Database["public"]["Enums"]["template_category"]
          created_at: string
          created_by: string | null
          custom_formulas: Json | null
          default_values: Json
          description: string | null
          downloads_count: number | null
          id: string
          image_url: string | null
          is_premium: boolean | null
          is_public: boolean | null
          name: string
          price: number | null
          rating: number | null
          sector_specific_config: Json
          status: Database["public"]["Enums"]["template_status"] | null
          updated_at: string
        }
        Insert: {
          category: Database["public"]["Enums"]["template_category"]
          created_at?: string
          created_by?: string | null
          custom_formulas?: Json | null
          default_values?: Json
          description?: string | null
          downloads_count?: number | null
          id?: string
          image_url?: string | null
          is_premium?: boolean | null
          is_public?: boolean | null
          name: string
          price?: number | null
          rating?: number | null
          sector_specific_config?: Json
          status?: Database["public"]["Enums"]["template_status"] | null
          updated_at?: string
        }
        Update: {
          category?: Database["public"]["Enums"]["template_category"]
          created_at?: string
          created_by?: string | null
          custom_formulas?: Json | null
          default_values?: Json
          description?: string | null
          downloads_count?: number | null
          id?: string
          image_url?: string | null
          is_premium?: boolean | null
          is_public?: boolean | null
          name?: string
          price?: number | null
          rating?: number | null
          sector_specific_config?: Json
          status?: Database["public"]["Enums"]["template_status"] | null
          updated_at?: string
        }
        Relationships: []
      }
      chat_message_reads: {
        Row: {
          id: string
          message_id: string
          read_at: string
          user_id: string
        }
        Insert: {
          id?: string
          message_id: string
          read_at?: string
          user_id: string
        }
        Update: {
          id?: string
          message_id?: string
          read_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_message_reads_message_id_fkey"
            columns: ["message_id"]
            isOneToOne: false
            referencedRelation: "chat_messages"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_messages: {
        Row: {
          content: string
          created_at: string
          deleted_at: string | null
          id: string
          reply_to_id: string | null
          room_id: string
          sender_id: string
          status: Database["public"]["Enums"]["message_delivery_status"]
          updated_at: string | null
        }
        Insert: {
          content: string
          created_at?: string
          deleted_at?: string | null
          id?: string
          reply_to_id?: string | null
          room_id: string
          sender_id: string
          status?: Database["public"]["Enums"]["message_delivery_status"]
          updated_at?: string | null
        }
        Update: {
          content?: string
          created_at?: string
          deleted_at?: string | null
          id?: string
          reply_to_id?: string | null
          room_id?: string
          sender_id?: string
          status?: Database["public"]["Enums"]["message_delivery_status"]
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "chat_messages_reply_to_id_fkey"
            columns: ["reply_to_id"]
            isOneToOne: false
            referencedRelation: "chat_messages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chat_messages_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "chat_rooms"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_room_members: {
        Row: {
          id: string
          is_archived: boolean
          is_muted: boolean
          joined_at: string
          last_read_at: string | null
          role: string
          room_id: string
          user_id: string
        }
        Insert: {
          id?: string
          is_archived?: boolean
          is_muted?: boolean
          joined_at?: string
          last_read_at?: string | null
          role?: string
          room_id: string
          user_id: string
        }
        Update: {
          id?: string
          is_archived?: boolean
          is_muted?: boolean
          joined_at?: string
          last_read_at?: string | null
          role?: string
          room_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_room_members_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "chat_rooms"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_rooms: {
        Row: {
          avatar_url: string | null
          created_at: string
          created_by: string
          description: string | null
          id: string
          is_group: boolean
          last_message_at: string | null
          last_message_id: string | null
          last_message_text: string | null
          name: string
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          created_by: string
          description?: string | null
          id?: string
          is_group?: boolean
          last_message_at?: string | null
          last_message_id?: string | null
          last_message_text?: string | null
          name: string
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          created_by?: string
          description?: string | null
          id?: string
          is_group?: boolean
          last_message_at?: string | null
          last_message_id?: string | null
          last_message_text?: string | null
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      collaboration_notifications: {
        Row: {
          action_url: string | null
          created_at: string
          id: string
          is_read: boolean | null
          message: string
          metadata: Json | null
          notification_type: string
          related_resource_id: string | null
          related_resource_type: string | null
          sender_id: string | null
          title: string
          user_id: string
        }
        Insert: {
          action_url?: string | null
          created_at?: string
          id?: string
          is_read?: boolean | null
          message: string
          metadata?: Json | null
          notification_type: string
          related_resource_id?: string | null
          related_resource_type?: string | null
          sender_id?: string | null
          title: string
          user_id: string
        }
        Update: {
          action_url?: string | null
          created_at?: string
          id?: string
          is_read?: boolean | null
          message?: string
          metadata?: Json | null
          notification_type?: string
          related_resource_id?: string | null
          related_resource_type?: string | null
          sender_id?: string | null
          title?: string
          user_id?: string
        }
        Relationships: []
      }
      company_data: {
        Row: {
          created_at: string
          data: Json
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          data?: Json
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          data?: Json
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      competitor_prices: {
        Row: {
          competitor_name: string
          competitor_url: string | null
          id: string
          is_valid: boolean | null
          marketplace: string
          monitored_product_id: string
          price: number
          rating: number | null
          reviews_count: number | null
          scraped_at: string | null
          seller_reputation: string | null
          shipping_cost: number | null
          stock_available: boolean | null
          total_price: number | null
        }
        Insert: {
          competitor_name: string
          competitor_url?: string | null
          id?: string
          is_valid?: boolean | null
          marketplace: string
          monitored_product_id: string
          price: number
          rating?: number | null
          reviews_count?: number | null
          scraped_at?: string | null
          seller_reputation?: string | null
          shipping_cost?: number | null
          stock_available?: boolean | null
          total_price?: number | null
        }
        Update: {
          competitor_name?: string
          competitor_url?: string | null
          id?: string
          is_valid?: boolean | null
          marketplace?: string
          monitored_product_id?: string
          price?: number
          rating?: number | null
          reviews_count?: number | null
          scraped_at?: string | null
          seller_reputation?: string | null
          shipping_cost?: number | null
          stock_available?: boolean | null
          total_price?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "competitor_prices_monitored_product_id_fkey"
            columns: ["monitored_product_id"]
            isOneToOne: false
            referencedRelation: "monitored_products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "competitor_prices_monitored_product_id_fkey"
            columns: ["monitored_product_id"]
            isOneToOne: false
            referencedRelation: "v_price_monitoring_summary"
            referencedColumns: ["id"]
          },
        ]
      }
      creator_alerts: {
        Row: {
          area: string | null
          created_at: string | null
          id: string
          message: string
          payload: Json | null
          severity: string | null
          status: string | null
          type: string
          updated_at: string | null
        }
        Insert: {
          area?: string | null
          created_at?: string | null
          id?: string
          message: string
          payload?: Json | null
          severity?: string | null
          status?: string | null
          type: string
          updated_at?: string | null
        }
        Update: {
          area?: string | null
          created_at?: string | null
          id?: string
          message?: string
          payload?: Json | null
          severity?: string | null
          status?: string | null
          type?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      creator_evolution_events: {
        Row: {
          created_at: string
          id: string
          payload: Json
          type: string
        }
        Insert: {
          created_at?: string
          id?: string
          payload: Json
          type: string
        }
        Update: {
          created_at?: string
          id?: string
          payload?: Json
          type?: string
        }
        Relationships: []
      }
      creator_evolution_snapshots: {
        Row: {
          created_at: string
          id: string
          snapshot: Json
        }
        Insert: {
          created_at?: string
          id?: string
          snapshot: Json
        }
        Update: {
          created_at?: string
          id?: string
          snapshot?: Json
        }
        Relationships: []
      }
      creator_health: {
        Row: {
          created_at: string
          error_rate: number | null
          health: string
          id: string
          latency_ms: number | null
          module: string
        }
        Insert: {
          created_at?: string
          error_rate?: number | null
          health: string
          id?: string
          latency_ms?: number | null
          module: string
        }
        Update: {
          created_at?: string
          error_rate?: number | null
          health?: string
          id?: string
          latency_ms?: number | null
          module?: string
        }
        Relationships: []
      }
      dashboard_configurations: {
        Row: {
          created_at: string
          dashboard_name: string
          filters: Json | null
          id: string
          is_default: boolean | null
          layout: Json
          updated_at: string
          user_id: string
          widgets: Json
        }
        Insert: {
          created_at?: string
          dashboard_name: string
          filters?: Json | null
          id?: string
          is_default?: boolean | null
          layout: Json
          updated_at?: string
          user_id: string
          widgets: Json
        }
        Update: {
          created_at?: string
          dashboard_name?: string
          filters?: Json | null
          id?: string
          is_default?: boolean | null
          layout?: Json
          updated_at?: string
          user_id?: string
          widgets?: Json
        }
        Relationships: []
      }
      dashboard_widgets: {
        Row: {
          config: Json | null
          created_at: string
          height: number | null
          id: string
          is_visible: boolean | null
          position: Json
          updated_at: string
          user_id: string
          widget_type: string
          width: number | null
          x_position: number | null
          y_position: number | null
        }
        Insert: {
          config?: Json | null
          created_at?: string
          height?: number | null
          id?: string
          is_visible?: boolean | null
          position: Json
          updated_at?: string
          user_id: string
          widget_type: string
          width?: number | null
          x_position?: number | null
          y_position?: number | null
        }
        Update: {
          config?: Json | null
          created_at?: string
          height?: number | null
          id?: string
          is_visible?: boolean | null
          position?: Json
          updated_at?: string
          user_id?: string
          widget_type?: string
          width?: number | null
          x_position?: number | null
          y_position?: number | null
        }
        Relationships: []
      }
      detected_editais: {
        Row: {
          analyzed_at: string | null
          created_at: string
          data_abertura: string
          data_limite: string | null
          detected_at: string
          full_data: Json | null
          id: string
          modalidade: string
          numero: string
          objeto: string
          orgao: string
          portal_id: string
          relevance_reasons: string[] | null
          relevance_score: number | null
          status: string
          updated_at: string
          url: string
          valor_estimado: number | null
          win_probability: number | null
        }
        Insert: {
          analyzed_at?: string | null
          created_at?: string
          data_abertura: string
          data_limite?: string | null
          detected_at?: string
          full_data?: Json | null
          id: string
          modalidade: string
          numero: string
          objeto: string
          orgao: string
          portal_id: string
          relevance_reasons?: string[] | null
          relevance_score?: number | null
          status?: string
          updated_at?: string
          url: string
          valor_estimado?: number | null
          win_probability?: number | null
        }
        Update: {
          analyzed_at?: string | null
          created_at?: string
          data_abertura?: string
          data_limite?: string | null
          detected_at?: string
          full_data?: Json | null
          id?: string
          modalidade?: string
          numero?: string
          objeto?: string
          orgao?: string
          portal_id?: string
          relevance_reasons?: string[] | null
          relevance_score?: number | null
          status?: string
          updated_at?: string
          url?: string
          valor_estimado?: number | null
          win_probability?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "detected_editais_portal_id_fkey"
            columns: ["portal_id"]
            isOneToOne: false
            referencedRelation: "portals"
            referencedColumns: ["id"]
          },
        ]
      }
      documentos: {
        Row: {
          arquivo_url: string | null
          created_at: string
          data_emissao: string
          data_validade: string
          dias_para_vencer: number | null
          id: string
          nome: string
          numero: string | null
          observacoes: string | null
          status: string | null
          tipo: string
          updated_at: string
          user_id: string
        }
        Insert: {
          arquivo_url?: string | null
          created_at?: string
          data_emissao: string
          data_validade: string
          dias_para_vencer?: number | null
          id?: string
          nome: string
          numero?: string | null
          observacoes?: string | null
          status?: string | null
          tipo: string
          updated_at?: string
          user_id: string
        }
        Update: {
          arquivo_url?: string | null
          created_at?: string
          data_emissao?: string
          data_validade?: string
          dias_para_vencer?: number | null
          id?: string
          nome?: string
          numero?: string | null
          observacoes?: string | null
          status?: string | null
          tipo?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      impostos_presets: {
        Row: {
          cofins: number
          created_at: string
          destino_uf: string | null
          icms: number
          id: string
          is_active: boolean | null
          nome: string
          origem_uf: string
          pis: number
          tipo_operacao: string
          updated_at: string
          user_id: string
        }
        Insert: {
          cofins?: number
          created_at?: string
          destino_uf?: string | null
          icms?: number
          id?: string
          is_active?: boolean | null
          nome: string
          origem_uf: string
          pis?: number
          tipo_operacao: string
          updated_at?: string
          user_id: string
        }
        Update: {
          cofins?: number
          created_at?: string
          destino_uf?: string | null
          icms?: number
          id?: string
          is_active?: boolean | null
          nome?: string
          origem_uf?: string
          pis?: number
          tipo_operacao?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      maquininha_presets: {
        Row: {
          bandeira: string
          created_at: string
          id: string
          is_active: boolean | null
          maquininha_fornecedor: string | null
          nome: string
          parcelas_default: number
          taxas_por_parcela: Json
          updated_at: string
          user_id: string
        }
        Insert: {
          bandeira: string
          created_at?: string
          id?: string
          is_active?: boolean | null
          maquininha_fornecedor?: string | null
          nome: string
          parcelas_default?: number
          taxas_por_parcela?: Json
          updated_at?: string
          user_id: string
        }
        Update: {
          bandeira?: string
          created_at?: string
          id?: string
          is_active?: boolean | null
          maquininha_fornecedor?: string | null
          nome?: string
          parcelas_default?: number
          taxas_por_parcela?: Json
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      marketplace_orders: {
        Row: {
          billing_address: Json
          created_at: string
          currency: string
          customer_email: string | null
          customer_name: string
          customer_phone: string | null
          external_order_id: string
          fees: Json
          id: string
          items: Json
          last_sync_at: string | null
          notes: string | null
          order_date: string
          payment_status: string
          platform_id: string
          shipping_address: Json
          status: string
          tenant_id: string
          total_amount: number
          tracking_code: string | null
          updated_at: string
        }
        Insert: {
          billing_address?: Json
          created_at?: string
          currency?: string
          customer_email?: string | null
          customer_name: string
          customer_phone?: string | null
          external_order_id: string
          fees?: Json
          id?: string
          items?: Json
          last_sync_at?: string | null
          notes?: string | null
          order_date: string
          payment_status?: string
          platform_id: string
          shipping_address?: Json
          status: string
          tenant_id: string
          total_amount?: number
          tracking_code?: string | null
          updated_at?: string
        }
        Update: {
          billing_address?: Json
          created_at?: string
          currency?: string
          customer_email?: string | null
          customer_name?: string
          customer_phone?: string | null
          external_order_id?: string
          fees?: Json
          id?: string
          items?: Json
          last_sync_at?: string | null
          notes?: string | null
          order_date?: string
          payment_status?: string
          platform_id?: string
          shipping_address?: Json
          status?: string
          tenant_id?: string
          total_amount?: number
          tracking_code?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "marketplace_orders_platform_id_fkey"
            columns: ["platform_id"]
            isOneToOne: false
            referencedRelation: "marketplace_platforms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "marketplace_orders_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      marketplace_platforms: {
        Row: {
          api_credentials: Json
          configuration: Json
          created_at: string
          error_message: string | null
          id: string
          last_sync_at: string | null
          name: string
          platform_type: string
          status: string
          tenant_id: string
          updated_at: string
        }
        Insert: {
          api_credentials?: Json
          configuration?: Json
          created_at?: string
          error_message?: string | null
          id?: string
          last_sync_at?: string | null
          name: string
          platform_type: string
          status?: string
          tenant_id: string
          updated_at?: string
        }
        Update: {
          api_credentials?: Json
          configuration?: Json
          created_at?: string
          error_message?: string | null
          id?: string
          last_sync_at?: string | null
          name?: string
          platform_type?: string
          status?: string
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "marketplace_platforms_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      marketplace_products: {
        Row: {
          attributes: Json
          category_external: string | null
          created_at: string
          description: string | null
          external_id: string
          external_sku: string | null
          id: string
          images: Json
          last_sync_at: string | null
          platform_id: string
          price: number
          product_id: string
          status: string
          stock_quantity: number
          tenant_id: string
          title: string
          updated_at: string
        }
        Insert: {
          attributes?: Json
          category_external?: string | null
          created_at?: string
          description?: string | null
          external_id: string
          external_sku?: string | null
          id?: string
          images?: Json
          last_sync_at?: string | null
          platform_id: string
          price?: number
          product_id: string
          status?: string
          stock_quantity?: number
          tenant_id: string
          title: string
          updated_at?: string
        }
        Update: {
          attributes?: Json
          category_external?: string | null
          created_at?: string
          description?: string | null
          external_id?: string
          external_sku?: string | null
          id?: string
          images?: Json
          last_sync_at?: string | null
          platform_id?: string
          price?: number
          product_id?: string
          status?: string
          stock_quantity?: number
          tenant_id?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "marketplace_products_platform_id_fkey"
            columns: ["platform_id"]
            isOneToOne: false
            referencedRelation: "marketplace_platforms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "marketplace_products_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "marketplace_products_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "v_products_margin"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "marketplace_products_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      marketplace_sync_jobs: {
        Row: {
          completed_at: string | null
          created_at: string
          error_message: string | null
          id: string
          job_type: string
          metadata: Json
          platform_id: string | null
          records_error: number | null
          records_processed: number | null
          records_success: number | null
          started_at: string | null
          status: string
          tenant_id: string
          updated_at: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          error_message?: string | null
          id?: string
          job_type: string
          metadata?: Json
          platform_id?: string | null
          records_error?: number | null
          records_processed?: number | null
          records_success?: number | null
          started_at?: string | null
          status?: string
          tenant_id: string
          updated_at?: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          error_message?: string | null
          id?: string
          job_type?: string
          metadata?: Json
          platform_id?: string | null
          records_error?: number | null
          records_processed?: number | null
          records_success?: number | null
          started_at?: string | null
          status?: string
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "marketplace_sync_jobs_platform_id_fkey"
            columns: ["platform_id"]
            isOneToOne: false
            referencedRelation: "marketplace_platforms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "marketplace_sync_jobs_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      monitored_products: {
        Row: {
          alert_threshold: number | null
          brand: string | null
          category: string | null
          check_interval: number | null
          cost_price: number | null
          created_at: string | null
          current_price: number
          ean: string | null
          id: string
          last_checked_at: string | null
          marketplaces: Json | null
          max_price: number | null
          min_price: number | null
          monitor_enabled: boolean | null
          product_name: string
          sku: string | null
          target_margin: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          alert_threshold?: number | null
          brand?: string | null
          category?: string | null
          check_interval?: number | null
          cost_price?: number | null
          created_at?: string | null
          current_price: number
          ean?: string | null
          id?: string
          last_checked_at?: string | null
          marketplaces?: Json | null
          max_price?: number | null
          min_price?: number | null
          monitor_enabled?: boolean | null
          product_name: string
          sku?: string | null
          target_margin?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          alert_threshold?: number | null
          brand?: string | null
          category?: string | null
          check_interval?: number | null
          cost_price?: number | null
          created_at?: string | null
          current_price?: number
          ean?: string | null
          id?: string
          last_checked_at?: string | null
          marketplaces?: Json | null
          max_price?: number | null
          min_price?: number | null
          monitor_enabled?: boolean | null
          product_name?: string
          sku?: string | null
          target_margin?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      organization_members: {
        Row: {
          id: string
          joined_at: string
          organization_id: string
          permissions: string[] | null
          role: string
          user_id: string
        }
        Insert: {
          id?: string
          joined_at?: string
          organization_id: string
          permissions?: string[] | null
          role?: string
          user_id: string
        }
        Update: {
          id?: string
          joined_at?: string
          organization_id?: string
          permissions?: string[] | null
          role?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "organization_members_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      organizations: {
        Row: {
          created_at: string
          description: string | null
          id: string
          logo_url: string | null
          max_stores: number | null
          max_users: number | null
          name: string
          plan_type: string
          settings: Json
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          logo_url?: string | null
          max_stores?: number | null
          max_users?: number | null
          name: string
          plan_type?: string
          settings?: Json
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          logo_url?: string | null
          max_stores?: number | null
          max_users?: number | null
          name?: string
          plan_type?: string
          settings?: Json
          updated_at?: string
        }
        Relationships: []
      }
      payment_history: {
        Row: {
          amount: number
          created_at: string | null
          currency: string | null
          gateway_customer_id: string | null
          gateway_payment_id: string
          gateway_subscription_id: string | null
          id: string
          metadata: Json | null
          paid_at: string | null
          payment_gateway: string
          payment_method_id: string | null
          payment_type: string | null
          period_end: string | null
          period_start: string | null
          status: string
          status_detail: string | null
          subscription_id: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string | null
          currency?: string | null
          gateway_customer_id?: string | null
          gateway_payment_id: string
          gateway_subscription_id?: string | null
          id?: string
          metadata?: Json | null
          paid_at?: string | null
          payment_gateway: string
          payment_method_id?: string | null
          payment_type?: string | null
          period_end?: string | null
          period_start?: string | null
          status: string
          status_detail?: string | null
          subscription_id?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string | null
          currency?: string | null
          gateway_customer_id?: string | null
          gateway_payment_id?: string
          gateway_subscription_id?: string | null
          id?: string
          metadata?: Json | null
          paid_at?: string | null
          payment_gateway?: string
          payment_method_id?: string | null
          payment_type?: string | null
          period_end?: string | null
          period_start?: string | null
          status?: string
          status_detail?: string | null
          subscription_id?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "payment_history_subscription_id_fkey"
            columns: ["subscription_id"]
            isOneToOne: false
            referencedRelation: "subscriptions"
            referencedColumns: ["id"]
          },
        ]
      }
      plan_change_history: {
        Row: {
          change_type: string
          created_at: string
          effective_date: string
          from_plan_id: string
          id: string
          reason: string | null
          subscription_id: string
          to_plan_id: string
          user_id: string
        }
        Insert: {
          change_type: string
          created_at?: string
          effective_date?: string
          from_plan_id: string
          id?: string
          reason?: string | null
          subscription_id: string
          to_plan_id: string
          user_id: string
        }
        Update: {
          change_type?: string
          created_at?: string
          effective_date?: string
          from_plan_id?: string
          id?: string
          reason?: string | null
          subscription_id?: string
          to_plan_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "plan_change_history_subscription_id_fkey"
            columns: ["subscription_id"]
            isOneToOne: false
            referencedRelation: "subscriptions"
            referencedColumns: ["id"]
          },
        ]
      }
      portals: {
        Row: {
          base_url: string
          created_at: string
          credentials: Json | null
          enabled: boolean
          id: string
          last_sync_at: string | null
          name: string
          scraping: Json | null
          type: string
          updated_at: string
        }
        Insert: {
          base_url: string
          created_at?: string
          credentials?: Json | null
          enabled?: boolean
          id: string
          last_sync_at?: string | null
          name: string
          scraping?: Json | null
          type: string
          updated_at?: string
        }
        Update: {
          base_url?: string
          created_at?: string
          credentials?: Json | null
          enabled?: boolean
          id?: string
          last_sync_at?: string | null
          name?: string
          scraping?: Json | null
          type?: string
          updated_at?: string
        }
        Relationships: []
      }
      price_adjustments: {
        Row: {
          applied_at: string | null
          applied_by: string | null
          id: string
          marketplace: string | null
          marketplace_listing_id: string | null
          marketplace_response: Json | null
          new_price: number
          old_price: number
          price_change_percent: number | null
          product_id: string | null
          product_name: string
          revert_reason: string | null
          reverted_at: string | null
          sku: string | null
          source: string
          source_id: string | null
          status: string | null
          user_id: string
        }
        Insert: {
          applied_at?: string | null
          applied_by?: string | null
          id?: string
          marketplace?: string | null
          marketplace_listing_id?: string | null
          marketplace_response?: Json | null
          new_price: number
          old_price: number
          price_change_percent?: number | null
          product_id?: string | null
          product_name: string
          revert_reason?: string | null
          reverted_at?: string | null
          sku?: string | null
          source: string
          source_id?: string | null
          status?: string | null
          user_id: string
        }
        Update: {
          applied_at?: string | null
          applied_by?: string | null
          id?: string
          marketplace?: string | null
          marketplace_listing_id?: string | null
          marketplace_response?: Json | null
          new_price?: number
          old_price?: number
          price_change_percent?: number | null
          product_id?: string | null
          product_name?: string
          revert_reason?: string | null
          reverted_at?: string | null
          sku?: string | null
          source?: string
          source_id?: string | null
          status?: string | null
          user_id?: string
        }
        Relationships: []
      }
      price_alerts: {
        Row: {
          action_required: string | null
          alert_type: string
          created_at: string | null
          dismissed_at: string | null
          expires_at: string | null
          id: string
          is_dismissed: boolean | null
          is_read: boolean | null
          message: string
          monitored_product_id: string
          read_at: string | null
          related_competitor_id: string | null
          related_suggestion_id: string | null
          severity: string | null
          title: string
          user_id: string
        }
        Insert: {
          action_required?: string | null
          alert_type: string
          created_at?: string | null
          dismissed_at?: string | null
          expires_at?: string | null
          id?: string
          is_dismissed?: boolean | null
          is_read?: boolean | null
          message: string
          monitored_product_id: string
          read_at?: string | null
          related_competitor_id?: string | null
          related_suggestion_id?: string | null
          severity?: string | null
          title: string
          user_id: string
        }
        Update: {
          action_required?: string | null
          alert_type?: string
          created_at?: string | null
          dismissed_at?: string | null
          expires_at?: string | null
          id?: string
          is_dismissed?: boolean | null
          is_read?: boolean | null
          message?: string
          monitored_product_id?: string
          read_at?: string | null
          related_competitor_id?: string | null
          related_suggestion_id?: string | null
          severity?: string | null
          title?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "price_alerts_monitored_product_id_fkey"
            columns: ["monitored_product_id"]
            isOneToOne: false
            referencedRelation: "monitored_products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "price_alerts_monitored_product_id_fkey"
            columns: ["monitored_product_id"]
            isOneToOne: false
            referencedRelation: "v_price_monitoring_summary"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "price_alerts_related_competitor_id_fkey"
            columns: ["related_competitor_id"]
            isOneToOne: false
            referencedRelation: "competitor_prices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "price_alerts_related_suggestion_id_fkey"
            columns: ["related_suggestion_id"]
            isOneToOne: false
            referencedRelation: "price_suggestions"
            referencedColumns: ["id"]
          },
        ]
      }
      price_history: {
        Row: {
          change_reason: string | null
          competitors_avg_price: number | null
          cost: number | null
          id: string
          margin: number | null
          market_position: string | null
          marketplace: string | null
          price: number
          product_id: string | null
          product_name: string
          recorded_at: string | null
          sku: string | null
          user_id: string
        }
        Insert: {
          change_reason?: string | null
          competitors_avg_price?: number | null
          cost?: number | null
          id?: string
          margin?: number | null
          market_position?: string | null
          marketplace?: string | null
          price: number
          product_id?: string | null
          product_name: string
          recorded_at?: string | null
          sku?: string | null
          user_id: string
        }
        Update: {
          change_reason?: string | null
          competitors_avg_price?: number | null
          cost?: number | null
          id?: string
          margin?: number | null
          market_position?: string | null
          marketplace?: string | null
          price?: number
          product_id?: string | null
          product_name?: string
          recorded_at?: string | null
          sku?: string | null
          user_id?: string
        }
        Relationships: []
      }
      price_monitoring_history: {
        Row: {
          alerts_generated: number | null
          checked_at: string | null
          competitors_count: number | null
          highest_price: number | null
          id: string
          lowest_price: number | null
          market_avg_price: number | null
          monitored_product_id: string
          price_advantage: number | null
          price_position: string | null
          suggestions_created: number | null
          user_price: number
        }
        Insert: {
          alerts_generated?: number | null
          checked_at?: string | null
          competitors_count?: number | null
          highest_price?: number | null
          id?: string
          lowest_price?: number | null
          market_avg_price?: number | null
          monitored_product_id: string
          price_advantage?: number | null
          price_position?: string | null
          suggestions_created?: number | null
          user_price: number
        }
        Update: {
          alerts_generated?: number | null
          checked_at?: string | null
          competitors_count?: number | null
          highest_price?: number | null
          id?: string
          lowest_price?: number | null
          market_avg_price?: number | null
          monitored_product_id?: string
          price_advantage?: number | null
          price_position?: string | null
          suggestions_created?: number | null
          user_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "price_monitoring_history_monitored_product_id_fkey"
            columns: ["monitored_product_id"]
            isOneToOne: false
            referencedRelation: "monitored_products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "price_monitoring_history_monitored_product_id_fkey"
            columns: ["monitored_product_id"]
            isOneToOne: false
            referencedRelation: "v_price_monitoring_summary"
            referencedColumns: ["id"]
          },
        ]
      }
      price_monitoring_settings: {
        Row: {
          alert_min_severity: string | null
          auto_apply_suggestions: boolean | null
          created_at: string | null
          default_strategy: string | null
          email_alerts: boolean | null
          enabled_marketplaces: Json | null
          global_check_interval: number | null
          marketplace_credentials: Json | null
          max_price_change_percent: number | null
          push_alerts: boolean | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          alert_min_severity?: string | null
          auto_apply_suggestions?: boolean | null
          created_at?: string | null
          default_strategy?: string | null
          email_alerts?: boolean | null
          enabled_marketplaces?: Json | null
          global_check_interval?: number | null
          marketplace_credentials?: Json | null
          max_price_change_percent?: number | null
          push_alerts?: boolean | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          alert_min_severity?: string | null
          auto_apply_suggestions?: boolean | null
          created_at?: string | null
          default_strategy?: string | null
          email_alerts?: boolean | null
          enabled_marketplaces?: Json | null
          global_check_interval?: number | null
          marketplace_credentials?: Json | null
          max_price_change_percent?: number | null
          push_alerts?: boolean | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      price_simulations: {
        Row: {
          cost_price: number
          created_at: string | null
          current_price: number
          estimated_impact: string | null
          id: string
          optimal_margin: number | null
          parameters: Json | null
          product_name: string
          recommendation_reason: string | null
          recommended_price: number | null
          scenarios: Json
          simulation_type: string | null
          user_id: string
        }
        Insert: {
          cost_price: number
          created_at?: string | null
          current_price: number
          estimated_impact?: string | null
          id?: string
          optimal_margin?: number | null
          parameters?: Json | null
          product_name: string
          recommendation_reason?: string | null
          recommended_price?: number | null
          scenarios: Json
          simulation_type?: string | null
          user_id: string
        }
        Update: {
          cost_price?: number
          created_at?: string | null
          current_price?: number
          estimated_impact?: string | null
          id?: string
          optimal_margin?: number | null
          parameters?: Json | null
          product_name?: string
          recommendation_reason?: string | null
          recommended_price?: number | null
          scenarios?: Json
          simulation_type?: string | null
          user_id?: string
        }
        Relationships: []
      }
      price_suggestions: {
        Row: {
          analysis: Json | null
          applied_at: string | null
          competitors_count: number | null
          confidence_score: number | null
          created_at: string | null
          current_price: number
          estimated_margin: number | null
          estimated_sales_impact: string | null
          expires_at: string | null
          highest_competitor_price: number | null
          id: string
          lowest_competitor_price: number | null
          market_avg_price: number | null
          monitored_product_id: string
          price_change: number | null
          price_change_percent: number | null
          reason: string
          status: string | null
          suggested_price: number
          user_id: string
        }
        Insert: {
          analysis?: Json | null
          applied_at?: string | null
          competitors_count?: number | null
          confidence_score?: number | null
          created_at?: string | null
          current_price: number
          estimated_margin?: number | null
          estimated_sales_impact?: string | null
          expires_at?: string | null
          highest_competitor_price?: number | null
          id?: string
          lowest_competitor_price?: number | null
          market_avg_price?: number | null
          monitored_product_id: string
          price_change?: number | null
          price_change_percent?: number | null
          reason: string
          status?: string | null
          suggested_price: number
          user_id: string
        }
        Update: {
          analysis?: Json | null
          applied_at?: string | null
          competitors_count?: number | null
          confidence_score?: number | null
          created_at?: string | null
          current_price?: number
          estimated_margin?: number | null
          estimated_sales_impact?: string | null
          expires_at?: string | null
          highest_competitor_price?: number | null
          id?: string
          lowest_competitor_price?: number | null
          market_avg_price?: number | null
          monitored_product_id?: string
          price_change?: number | null
          price_change_percent?: number | null
          reason?: string
          status?: string | null
          suggested_price?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "price_suggestions_monitored_product_id_fkey"
            columns: ["monitored_product_id"]
            isOneToOne: false
            referencedRelation: "monitored_products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "price_suggestions_monitored_product_id_fkey"
            columns: ["monitored_product_id"]
            isOneToOne: false
            referencedRelation: "v_price_monitoring_summary"
            referencedColumns: ["id"]
          },
        ]
      }
      pricing_performance_metrics: {
        Row: {
          avg_adjustment_percent: number | null
          avg_margin: number | null
          avg_price: number | null
          avg_price_position: number | null
          avg_transaction_value: number | null
          created_at: string | null
          date: string
          hour: number | null
          id: string
          marketplace: string | null
          price_adjustments_count: number | null
          product_id: string | null
          times_was_lowest: number | null
          total_revenue: number | null
          total_sales: number | null
          user_id: string
        }
        Insert: {
          avg_adjustment_percent?: number | null
          avg_margin?: number | null
          avg_price?: number | null
          avg_price_position?: number | null
          avg_transaction_value?: number | null
          created_at?: string | null
          date: string
          hour?: number | null
          id?: string
          marketplace?: string | null
          price_adjustments_count?: number | null
          product_id?: string | null
          times_was_lowest?: number | null
          total_revenue?: number | null
          total_sales?: number | null
          user_id: string
        }
        Update: {
          avg_adjustment_percent?: number | null
          avg_margin?: number | null
          avg_price?: number | null
          avg_price_position?: number | null
          avg_transaction_value?: number | null
          created_at?: string | null
          date?: string
          hour?: number | null
          id?: string
          marketplace?: string | null
          price_adjustments_count?: number | null
          product_id?: string | null
          times_was_lowest?: number | null
          total_revenue?: number | null
          total_sales?: number | null
          user_id?: string
        }
        Relationships: []
      }
      pricing_rule_executions: {
        Row: {
          avg_price_change_percent: number | null
          duration_ms: number | null
          error_message: string | null
          executed_at: string | null
          execution_log: Json | null
          id: string
          pricing_rule_id: string
          products_evaluated: number | null
          products_updated: number | null
          success: boolean | null
          total_price_changes: number | null
          user_id: string
        }
        Insert: {
          avg_price_change_percent?: number | null
          duration_ms?: number | null
          error_message?: string | null
          executed_at?: string | null
          execution_log?: Json | null
          id?: string
          pricing_rule_id: string
          products_evaluated?: number | null
          products_updated?: number | null
          success?: boolean | null
          total_price_changes?: number | null
          user_id: string
        }
        Update: {
          avg_price_change_percent?: number | null
          duration_ms?: number | null
          error_message?: string | null
          executed_at?: string | null
          execution_log?: Json | null
          id?: string
          pricing_rule_id?: string
          products_evaluated?: number | null
          products_updated?: number | null
          success?: boolean | null
          total_price_changes?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_executions_rule"
            columns: ["pricing_rule_id"]
            isOneToOne: false
            referencedRelation: "pricing_rules"
            referencedColumns: ["id"]
          },
        ]
      }
      pricing_rules: {
        Row: {
          actions: Json
          apply_to: string | null
          apply_to_ids: Json | null
          conditions: Json
          created_at: string | null
          description: string | null
          execution_count: number | null
          id: string
          is_active: boolean | null
          is_automatic: boolean | null
          last_executed_at: string | null
          max_adjustment_percent: number | null
          max_price_limit: number | null
          min_price_limit: number | null
          priority: number | null
          rule_name: string
          rule_type: string
          target_marketplaces: Json | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          actions: Json
          apply_to?: string | null
          apply_to_ids?: Json | null
          conditions: Json
          created_at?: string | null
          description?: string | null
          execution_count?: number | null
          id?: string
          is_active?: boolean | null
          is_automatic?: boolean | null
          last_executed_at?: string | null
          max_adjustment_percent?: number | null
          max_price_limit?: number | null
          min_price_limit?: number | null
          priority?: number | null
          rule_name: string
          rule_type: string
          target_marketplaces?: Json | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          actions?: Json
          apply_to?: string | null
          apply_to_ids?: Json | null
          conditions?: Json
          created_at?: string | null
          description?: string | null
          execution_count?: number | null
          id?: string
          is_active?: boolean | null
          is_automatic?: boolean | null
          last_executed_at?: string | null
          max_adjustment_percent?: number | null
          max_price_limit?: number | null
          min_price_limit?: number | null
          priority?: number | null
          rule_name?: string
          rule_type?: string
          target_marketplaces?: Json | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      pricing_strategies: {
        Row: {
          apply_to_categories: Json | null
          base_margin: number
          competitor_match_threshold: number | null
          created_at: string | null
          demand_sensitivity: number | null
          description: string | null
          id: string
          inventory_based_adjustments: Json | null
          is_default: boolean | null
          max_margin: number | null
          min_margin: number
          strategy_name: string
          strategy_type: string
          time_based_multipliers: Json | null
          undercut_by: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          apply_to_categories?: Json | null
          base_margin: number
          competitor_match_threshold?: number | null
          created_at?: string | null
          demand_sensitivity?: number | null
          description?: string | null
          id?: string
          inventory_based_adjustments?: Json | null
          is_default?: boolean | null
          max_margin?: number | null
          min_margin: number
          strategy_name: string
          strategy_type: string
          time_based_multipliers?: Json | null
          undercut_by?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          apply_to_categories?: Json | null
          base_margin?: number
          competitor_match_threshold?: number | null
          created_at?: string | null
          demand_sensitivity?: number | null
          description?: string | null
          id?: string
          inventory_based_adjustments?: Json | null
          is_default?: boolean | null
          max_margin?: number | null
          min_margin?: number
          strategy_name?: string
          strategy_type?: string
          time_based_multipliers?: Json | null
          undercut_by?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      processed_documents: {
        Row: {
          confidence: number
          created_at: string
          document_type: string
          error_message: string | null
          extracted_fields: Json
          extracted_tables: Json
          file_name: string
          file_size: number
          file_type: string
          full_text: string | null
          id: string
          language: string
          metadata: Json
          processed_at: string | null
          status: string
          storage_path: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          confidence?: number
          created_at?: string
          document_type: string
          error_message?: string | null
          extracted_fields?: Json
          extracted_tables?: Json
          file_name: string
          file_size: number
          file_type: string
          full_text?: string | null
          id?: string
          language?: string
          metadata?: Json
          processed_at?: string | null
          status?: string
          storage_path?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          confidence?: number
          created_at?: string
          document_type?: string
          error_message?: string | null
          extracted_fields?: Json
          extracted_tables?: Json
          file_name?: string
          file_size?: number
          file_type?: string
          full_text?: string | null
          id?: string
          language?: string
          metadata?: Json
          processed_at?: string | null
          status?: string
          storage_path?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      product_performance: {
        Row: {
          conversion_rate: number | null
          created_at: string
          date: string
          id: string
          margin_percentage: number | null
          product_id: string
          profit: number | null
          sales_quantity: number | null
          sales_revenue: number | null
          updated_at: string
          user_id: string
          views_count: number | null
        }
        Insert: {
          conversion_rate?: number | null
          created_at?: string
          date: string
          id?: string
          margin_percentage?: number | null
          product_id: string
          profit?: number | null
          sales_quantity?: number | null
          sales_revenue?: number | null
          updated_at?: string
          user_id: string
          views_count?: number | null
        }
        Update: {
          conversion_rate?: number | null
          created_at?: string
          date?: string
          id?: string
          margin_percentage?: number | null
          product_id?: string
          profit?: number | null
          sales_quantity?: number | null
          sales_revenue?: number | null
          updated_at?: string
          user_id?: string
          views_count?: number | null
        }
        Relationships: []
      }
      products: {
        Row: {
          base_cost: number
          category: string | null
          channel_fee_pct: number
          created_at: string
          currency: string
          current_price: number
          freight_avg: number
          id: string
          name: string
          sku: string
          tax_pct: number
          tenant_id: string
          updated_at: string
        }
        Insert: {
          base_cost?: number
          category?: string | null
          channel_fee_pct?: number
          created_at?: string
          currency?: string
          current_price?: number
          freight_avg?: number
          id?: string
          name: string
          sku: string
          tax_pct?: number
          tenant_id: string
          updated_at?: string
        }
        Update: {
          base_cost?: number
          category?: string | null
          channel_fee_pct?: number
          created_at?: string
          currency?: string
          current_price?: number
          freight_avg?: number
          id?: string
          name?: string
          sku?: string
          tax_pct?: number
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "products_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      rag_documents: {
        Row: {
          chunk_index: number
          content: string
          created_at: string
          document_id: string
          embedding: string | null
          id: string
          metadata: Json
          updated_at: string
        }
        Insert: {
          chunk_index: number
          content: string
          created_at?: string
          document_id: string
          embedding?: string | null
          id: string
          metadata?: Json
          updated_at?: string
        }
        Update: {
          chunk_index?: number
          content?: string
          created_at?: string
          document_id?: string
          embedding?: string | null
          id?: string
          metadata?: Json
          updated_at?: string
        }
        Relationships: []
      }
      sales_data: {
        Row: {
          cost: number | null
          created_at: string
          customer_id: string | null
          id: string
          metadata: Json | null
          order_date: string
          order_id: string
          payment_method: string | null
          product_id: string
          profit: number | null
          quantity: number
          status: string | null
          total_amount: number
          unit_price: number
          user_id: string
        }
        Insert: {
          cost?: number | null
          created_at?: string
          customer_id?: string | null
          id?: string
          metadata?: Json | null
          order_date: string
          order_id: string
          payment_method?: string | null
          product_id: string
          profit?: number | null
          quantity: number
          status?: string | null
          total_amount: number
          unit_price: number
          user_id: string
        }
        Update: {
          cost?: number | null
          created_at?: string
          customer_id?: string | null
          id?: string
          metadata?: Json | null
          order_date?: string
          order_id?: string
          payment_method?: string | null
          product_id?: string
          profit?: number | null
          quantity?: number
          status?: string | null
          total_amount?: number
          unit_price?: number
          user_id?: string
        }
        Relationships: []
      }
      security_sessions: {
        Row: {
          created_at: string
          device_info: Json | null
          expires_at: string
          id: string
          ip_address: unknown
          is_active: boolean | null
          last_activity: string
          session_token: string
          user_id: string
        }
        Insert: {
          created_at?: string
          device_info?: Json | null
          expires_at: string
          id?: string
          ip_address?: unknown
          is_active?: boolean | null
          last_activity?: string
          session_token: string
          user_id: string
        }
        Update: {
          created_at?: string
          device_info?: Json | null
          expires_at?: string
          id?: string
          ip_address?: unknown
          is_active?: boolean | null
          last_activity?: string
          session_token?: string
          user_id?: string
        }
        Relationships: []
      }
      stores: {
        Row: {
          address: string | null
          city: string | null
          country: string | null
          created_at: string
          id: string
          is_active: boolean | null
          name: string
          organization_id: string
          settings: Json
          state: string | null
          updated_at: string
        }
        Insert: {
          address?: string | null
          city?: string | null
          country?: string | null
          created_at?: string
          id?: string
          is_active?: boolean | null
          name: string
          organization_id: string
          settings?: Json
          state?: string | null
          updated_at?: string
        }
        Update: {
          address?: string | null
          city?: string | null
          country?: string | null
          created_at?: string
          id?: string
          is_active?: boolean | null
          name?: string
          organization_id?: string
          settings?: Json
          state?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "stores_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      subscribers: {
        Row: {
          billing_cycle: string
          created_at: string
          end_date: string | null
          id: string
          is_active: boolean | null
          last_payment_date: string | null
          metadata: Json | null
          next_payment_date: string | null
          payment_method: string | null
          plan_name: string
          price: number
          start_date: string
          subscription_type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          billing_cycle: string
          created_at?: string
          end_date?: string | null
          id?: string
          is_active?: boolean | null
          last_payment_date?: string | null
          metadata?: Json | null
          next_payment_date?: string | null
          payment_method?: string | null
          plan_name: string
          price: number
          start_date: string
          subscription_type: string
          updated_at?: string
          user_id: string
        }
        Update: {
          billing_cycle?: string
          created_at?: string
          end_date?: string | null
          id?: string
          is_active?: boolean | null
          last_payment_date?: string | null
          metadata?: Json | null
          next_payment_date?: string | null
          payment_method?: string | null
          plan_name?: string
          price?: number
          start_date?: string
          subscription_type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      subscriptions: {
        Row: {
          billing_interval: string
          cancel_at_period_end: boolean
          canceled_at: string | null
          created_at: string
          current_period_end: string
          current_period_start: string
          id: string
          mercadopago_preapproval_id: string | null
          mercadopago_subscription_id: string | null
          plan_id: string
          status: string
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          trial_end: string | null
          trial_start: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          billing_interval: string
          cancel_at_period_end?: boolean
          canceled_at?: string | null
          created_at?: string
          current_period_end: string
          current_period_start?: string
          id?: string
          mercadopago_preapproval_id?: string | null
          mercadopago_subscription_id?: string | null
          plan_id: string
          status: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          trial_end?: string | null
          trial_start?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          billing_interval?: string
          cancel_at_period_end?: boolean
          canceled_at?: string | null
          created_at?: string
          current_period_end?: string
          current_period_start?: string
          id?: string
          mercadopago_preapproval_id?: string | null
          mercadopago_subscription_id?: string | null
          plan_id?: string
          status?: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          trial_end?: string | null
          trial_start?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      suggestion_feedback: {
        Row: {
          comment: string | null
          context: Json | null
          created_at: string
          feedback_type: string
          id: string
          suggestion_id: string
          user_id: string
        }
        Insert: {
          comment?: string | null
          context?: Json | null
          created_at?: string
          feedback_type: string
          id?: string
          suggestion_id: string
          user_id: string
        }
        Update: {
          comment?: string | null
          context?: Json | null
          created_at?: string
          feedback_type?: string
          id?: string
          suggestion_id?: string
          user_id?: string
        }
        Relationships: []
      }
      taxas_historico: {
        Row: {
          created_at: string
          detalhes: Json | null
          id: string
          taxa_aplicada: number
          tipo: string
          user_id: string
          valor_recebido: number
          valor_venda: number
        }
        Insert: {
          created_at?: string
          detalhes?: Json | null
          id?: string
          taxa_aplicada: number
          tipo: string
          user_id: string
          valor_recebido: number
          valor_venda: number
        }
        Update: {
          created_at?: string
          detalhes?: Json | null
          id?: string
          taxa_aplicada?: number
          tipo?: string
          user_id?: string
          valor_recebido?: number
          valor_venda?: number
        }
        Relationships: []
      }
      team_members: {
        Row: {
          accepted_at: string | null
          can_create_calculations: boolean
          can_delete_calculations: boolean
          can_edit_calculations: boolean
          can_export_reports: boolean
          can_manage_billing: boolean
          can_manage_integrations: boolean
          can_manage_team: boolean
          can_view_analytics: boolean
          can_view_calculations: boolean
          created_at: string
          id: string
          invited_at: string
          invited_by: string
          role: string
          team_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          accepted_at?: string | null
          can_create_calculations?: boolean
          can_delete_calculations?: boolean
          can_edit_calculations?: boolean
          can_export_reports?: boolean
          can_manage_billing?: boolean
          can_manage_integrations?: boolean
          can_manage_team?: boolean
          can_view_analytics?: boolean
          can_view_calculations?: boolean
          created_at?: string
          id?: string
          invited_at?: string
          invited_by: string
          role: string
          team_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          accepted_at?: string | null
          can_create_calculations?: boolean
          can_delete_calculations?: boolean
          can_edit_calculations?: boolean
          can_export_reports?: boolean
          can_manage_billing?: boolean
          can_manage_integrations?: boolean
          can_manage_team?: boolean
          can_view_analytics?: boolean
          can_view_calculations?: boolean
          created_at?: string
          id?: string
          invited_at?: string
          invited_by?: string
          role?: string
          team_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "team_members_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      teams: {
        Row: {
          allow_comments: boolean
          audit_log_enabled: boolean
          created_at: string
          id: string
          name: string
          owner_id: string
          require_approval: boolean
          subscription_id: string
          updated_at: string
        }
        Insert: {
          allow_comments?: boolean
          audit_log_enabled?: boolean
          created_at?: string
          id?: string
          name: string
          owner_id: string
          require_approval?: boolean
          subscription_id: string
          updated_at?: string
        }
        Update: {
          allow_comments?: boolean
          audit_log_enabled?: boolean
          created_at?: string
          id?: string
          name?: string
          owner_id?: string
          require_approval?: boolean
          subscription_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "teams_subscription_id_fkey"
            columns: ["subscription_id"]
            isOneToOne: false
            referencedRelation: "subscriptions"
            referencedColumns: ["id"]
          },
        ]
      }
      template_favorites: {
        Row: {
          created_at: string
          id: string
          template_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          template_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          template_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "template_favorites_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "calculation_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      template_purchases: {
        Row: {
          id: string
          purchase_price: number
          purchased_at: string
          template_id: string
          user_id: string
        }
        Insert: {
          id?: string
          purchase_price: number
          purchased_at?: string
          template_id: string
          user_id: string
        }
        Update: {
          id?: string
          purchase_price?: number
          purchased_at?: string
          template_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "template_purchases_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "calculation_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      template_reviews: {
        Row: {
          comment: string | null
          created_at: string
          id: string
          rating: number
          template_id: string
          user_id: string
        }
        Insert: {
          comment?: string | null
          created_at?: string
          id?: string
          rating: number
          template_id: string
          user_id: string
        }
        Update: {
          comment?: string | null
          created_at?: string
          id?: string
          rating?: number
          template_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "template_reviews_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "calculation_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      tenants: {
        Row: {
          created_at: string
          id: string
          name: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
        }
        Relationships: []
      }
      two_factor_auth: {
        Row: {
          backup_codes: string[] | null
          created_at: string
          id: string
          is_enabled: boolean | null
          secret: string
          updated_at: string
          user_id: string
        }
        Insert: {
          backup_codes?: string[] | null
          created_at?: string
          id?: string
          is_enabled?: boolean | null
          secret: string
          updated_at?: string
          user_id: string
        }
        Update: {
          backup_codes?: string[] | null
          created_at?: string
          id?: string
          is_enabled?: boolean | null
          secret?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      usage_tracking: {
        Row: {
          ai_queries_this_month: number
          api_requests_this_month: number
          calculations_this_month: number
          calculations_today: number
          created_at: string
          id: string
          last_ai_query_at: string | null
          last_api_request_at: string | null
          last_calculation_at: string | null
          period_end: string
          period_start: string
          subscription_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          ai_queries_this_month?: number
          api_requests_this_month?: number
          calculations_this_month?: number
          calculations_today?: number
          created_at?: string
          id?: string
          last_ai_query_at?: string | null
          last_api_request_at?: string | null
          last_calculation_at?: string | null
          period_end: string
          period_start?: string
          subscription_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          ai_queries_this_month?: number
          api_requests_this_month?: number
          calculations_this_month?: number
          calculations_today?: number
          created_at?: string
          id?: string
          last_ai_query_at?: string | null
          last_api_request_at?: string | null
          last_calculation_at?: string | null
          period_end?: string
          period_start?: string
          subscription_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "usage_tracking_subscription_id_fkey"
            columns: ["subscription_id"]
            isOneToOne: false
            referencedRelation: "subscriptions"
            referencedColumns: ["id"]
          },
        ]
      }
      user_achievements: {
        Row: {
          achievement_id: string
          description: string | null
          icon: string | null
          id: string
          metadata: Json | null
          title: string
          tutorial_id: string | null
          unlocked_at: string
          user_id: string
        }
        Insert: {
          achievement_id: string
          description?: string | null
          icon?: string | null
          id?: string
          metadata?: Json | null
          title: string
          tutorial_id?: string | null
          unlocked_at?: string
          user_id: string
        }
        Update: {
          achievement_id?: string
          description?: string | null
          icon?: string | null
          id?: string
          metadata?: Json | null
          title?: string
          tutorial_id?: string | null
          unlocked_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_behavior_patterns: {
        Row: {
          confidence: number
          first_detected_at: string
          id: string
          last_detected_at: string
          metadata: Json | null
          occurrences: number
          pattern_data: Json
          pattern_key: string
          pattern_type: string
          user_id: string
        }
        Insert: {
          confidence?: number
          first_detected_at?: string
          id?: string
          last_detected_at?: string
          metadata?: Json | null
          occurrences?: number
          pattern_data?: Json
          pattern_key: string
          pattern_type: string
          user_id: string
        }
        Update: {
          confidence?: number
          first_detected_at?: string
          id?: string
          last_detected_at?: string
          metadata?: Json | null
          occurrences?: number
          pattern_data?: Json
          pattern_key?: string
          pattern_type?: string
          user_id?: string
        }
        Relationships: []
      }
      user_copilot_preferences: {
        Row: {
          created_at: string
          enabled: boolean
          frequency: string
          max_per_hour: number | null
          silence_during_typing: boolean | null
          silenced_categories: string[] | null
          silenced_types: string[] | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          enabled?: boolean
          frequency?: string
          max_per_hour?: number | null
          silence_during_typing?: boolean | null
          silenced_categories?: string[] | null
          silenced_types?: string[] | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          enabled?: boolean
          frequency?: string
          max_per_hour?: number | null
          silence_during_typing?: boolean | null
          silenced_categories?: string[] | null
          silenced_types?: string[] | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_interest_profiles: {
        Row: {
          categorias: string[] | null
          certificacoes: string[] | null
          cidades: string[] | null
          created_at: string
          enabled: boolean
          estados: string[] | null
          experience_level: string | null
          id: string
          keywords: string[]
          modalidades: string[] | null
          orgaos: string[] | null
          updated_at: string
          user_id: string
          valor_max: number | null
          valor_min: number | null
        }
        Insert: {
          categorias?: string[] | null
          certificacoes?: string[] | null
          cidades?: string[] | null
          created_at?: string
          enabled?: boolean
          estados?: string[] | null
          experience_level?: string | null
          id?: string
          keywords?: string[]
          modalidades?: string[] | null
          orgaos?: string[] | null
          updated_at?: string
          user_id: string
          valor_max?: number | null
          valor_min?: number | null
        }
        Update: {
          categorias?: string[] | null
          certificacoes?: string[] | null
          cidades?: string[] | null
          created_at?: string
          enabled?: boolean
          estados?: string[] | null
          experience_level?: string | null
          id?: string
          keywords?: string[]
          modalidades?: string[] | null
          orgaos?: string[] | null
          updated_at?: string
          user_id?: string
          valor_max?: number | null
          valor_min?: number | null
        }
        Relationships: []
      }
      user_marketplace_templates: {
        Row: {
          created_at: string | null
          id: string
          include_payment_fee: boolean | null
          is_default: boolean | null
          marketing: number | null
          marketplace_id: string
          other_costs: number | null
          packaging: number | null
          payment_fee: number | null
          payment_method: string | null
          shipping: number | null
          target_margin: number | null
          template_name: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          include_payment_fee?: boolean | null
          is_default?: boolean | null
          marketing?: number | null
          marketplace_id: string
          other_costs?: number | null
          packaging?: number | null
          payment_fee?: number | null
          payment_method?: string | null
          shipping?: number | null
          target_margin?: number | null
          template_name: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          include_payment_fee?: boolean | null
          is_default?: boolean | null
          marketing?: number | null
          marketplace_id?: string
          other_costs?: number | null
          packaging?: number | null
          payment_fee?: number | null
          payment_method?: string | null
          shipping?: number | null
          target_margin?: number | null
          template_name?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_personalization: {
        Row: {
          accepts_proactive_suggestions: boolean | null
          consecutive_days: number | null
          created_at: string
          engagement_score: number | null
          inferred_preferences: Json | null
          last_active_at: string | null
          optimal_suggestion_frequency: string | null
          preferred_calculator: string | null
          preferred_explanation_depth: string | null
          typical_usage_time: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          accepts_proactive_suggestions?: boolean | null
          consecutive_days?: number | null
          created_at?: string
          engagement_score?: number | null
          inferred_preferences?: Json | null
          last_active_at?: string | null
          optimal_suggestion_frequency?: string | null
          preferred_calculator?: string | null
          preferred_explanation_depth?: string | null
          typical_usage_time?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          accepts_proactive_suggestions?: boolean | null
          consecutive_days?: number | null
          created_at?: string
          engagement_score?: number | null
          inferred_preferences?: Json | null
          last_active_at?: string | null
          optimal_suggestion_frequency?: string | null
          preferred_calculator?: string | null
          preferred_explanation_depth?: string | null
          typical_usage_time?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          company: string | null
          cover_url: string | null
          created_at: string
          email: string | null
          experience: Json | null
          id: string
          is_pro: boolean | null
          links: Json | null
          location: string | null
          name: string | null
          phone: string | null
          skills: Json | null
          title: string | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          company?: string | null
          cover_url?: string | null
          created_at?: string
          email?: string | null
          experience?: Json | null
          id: string
          is_pro?: boolean | null
          links?: Json | null
          location?: string | null
          name?: string | null
          phone?: string | null
          skills?: Json | null
          title?: string | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          company?: string | null
          cover_url?: string | null
          created_at?: string
          email?: string | null
          experience?: Json | null
          id?: string
          is_pro?: boolean | null
          links?: Json | null
          location?: string | null
          name?: string | null
          phone?: string | null
          skills?: Json | null
          title?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      user_skill_metrics: {
        Row: {
          advanced_features_used: number
          avg_calculation_time_ms: number | null
          created_at: string
          help_views: number
          shortcuts_used: number
          skill_level: string
          skill_score: number
          successful_calculations: number
          total_calculations: number
          total_errors: number
          total_sessions: number
          total_time_spent_ms: number
          updated_at: string
          user_id: string
        }
        Insert: {
          advanced_features_used?: number
          avg_calculation_time_ms?: number | null
          created_at?: string
          help_views?: number
          shortcuts_used?: number
          skill_level?: string
          skill_score?: number
          successful_calculations?: number
          total_calculations?: number
          total_errors?: number
          total_sessions?: number
          total_time_spent_ms?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          advanced_features_used?: number
          avg_calculation_time_ms?: number | null
          created_at?: string
          help_views?: number
          shortcuts_used?: number
          skill_level?: string
          skill_score?: number
          successful_calculations?: number
          total_calculations?: number
          total_errors?: number
          total_sessions?: number
          total_time_spent_ms?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_status: {
        Row: {
          last_seen_at: string
          status: Database["public"]["Enums"]["user_status_type"]
          updated_at: string
          user_id: string
        }
        Insert: {
          last_seen_at?: string
          status?: Database["public"]["Enums"]["user_status_type"]
          updated_at?: string
          user_id: string
        }
        Update: {
          last_seen_at?: string
          status?: Database["public"]["Enums"]["user_status_type"]
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_suggestion_feedback: {
        Row: {
          comment: string | null
          context: Json | null
          created_at: string
          id: string
          suggestion_id: string
          type: string
          user_id: string | null
        }
        Insert: {
          comment?: string | null
          context?: Json | null
          created_at?: string
          id: string
          suggestion_id: string
          type: string
          user_id?: string | null
        }
        Update: {
          comment?: string | null
          context?: Json | null
          created_at?: string
          id?: string
          suggestion_id?: string
          type?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_suggestion_feedback_suggestion_id_fkey"
            columns: ["suggestion_id"]
            isOneToOne: false
            referencedRelation: "user_suggestions"
            referencedColumns: ["id"]
          },
        ]
      }
      user_suggestions: {
        Row: {
          action_at: string | null
          action_type: string | null
          category: string
          confidence: number
          context: Json | null
          created_at: string
          details: string | null
          expires_at: string | null
          id: string
          message: string
          priority: string
          session_id: string
          shown_at: string | null
          status: string
          title: string
          type: string
          user_id: string | null
        }
        Insert: {
          action_at?: string | null
          action_type?: string | null
          category?: string
          confidence?: number
          context?: Json | null
          created_at?: string
          details?: string | null
          expires_at?: string | null
          id: string
          message: string
          priority?: string
          session_id?: string
          shown_at?: string | null
          status?: string
          title: string
          type: string
          user_id?: string | null
        }
        Update: {
          action_at?: string | null
          action_type?: string | null
          category?: string
          confidence?: number
          context?: Json | null
          created_at?: string
          details?: string | null
          expires_at?: string | null
          id?: string
          message?: string
          priority?: string
          session_id?: string
          shown_at?: string | null
          status?: string
          title?: string
          type?: string
          user_id?: string | null
        }
        Relationships: []
      }
      user_tutorial_progress: {
        Row: {
          completed_at: string | null
          completed_steps: string[] | null
          created_at: string
          current_step_index: number
          id: string
          metadata: Json | null
          skipped_steps: string[] | null
          started_at: string | null
          status: string
          time_spent_ms: number
          tutorial_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          completed_steps?: string[] | null
          created_at?: string
          current_step_index?: number
          id?: string
          metadata?: Json | null
          skipped_steps?: string[] | null
          started_at?: string | null
          status?: string
          time_spent_ms?: number
          tutorial_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          completed_at?: string | null
          completed_steps?: string[] | null
          created_at?: string
          current_step_index?: number
          id?: string
          metadata?: Json | null
          skipped_steps?: string[] | null
          started_at?: string | null
          status?: string
          time_spent_ms?: number
          tutorial_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      workflow_approvals: {
        Row: {
          approver_id: string
          calculation_id: string | null
          comments: string | null
          id: string
          requested_at: string
          responded_at: string | null
          status: string
          workflow_id: string
        }
        Insert: {
          approver_id: string
          calculation_id?: string | null
          comments?: string | null
          id?: string
          requested_at?: string
          responded_at?: string | null
          status?: string
          workflow_id: string
        }
        Update: {
          approver_id?: string
          calculation_id?: string | null
          comments?: string | null
          id?: string
          requested_at?: string
          responded_at?: string | null
          status?: string
          workflow_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "workflow_approvals_calculation_id_fkey"
            columns: ["calculation_id"]
            isOneToOne: false
            referencedRelation: "calculation_history"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workflow_approvals_workflow_id_fkey"
            columns: ["workflow_id"]
            isOneToOne: false
            referencedRelation: "automation_workflows"
            referencedColumns: ["id"]
          },
        ]
      }
      xai_explanations: {
        Row: {
          alternatives: Json | null
          confidence: number
          created_at: string
          decision_type: string
          factors: Json
          id: string
          legal_basis: Json
          rationale: string
          result: Json
          top_factors: Json
          user_id: string
        }
        Insert: {
          alternatives?: Json | null
          confidence?: number
          created_at?: string
          decision_type: string
          factors?: Json
          id: string
          legal_basis?: Json
          rationale: string
          result: Json
          top_factors?: Json
          user_id: string
        }
        Update: {
          alternatives?: Json | null
          confidence?: number
          created_at?: string
          decision_type?: string
          factors?: Json
          id?: string
          legal_basis?: Json
          rationale?: string
          result?: Json
          top_factors?: Json
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      v_marketplace_dashboard: {
        Row: {
          active_platforms: number | null
          active_products: number | null
          active_sync_jobs: number | null
          failed_jobs_last_24h: number | null
          orders_last_30_days: number | null
          revenue_last_30_days: number | null
          tenant_id: string | null
          total_orders: number | null
          total_platforms: number | null
          total_products: number | null
          total_revenue: number | null
        }
        Relationships: [
          {
            foreignKeyName: "marketplace_platforms_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      v_marketplace_platform_stats: {
        Row: {
          active_products: number | null
          created_at: string | null
          last_sync_at: string | null
          platform_name: string | null
          platform_type: string | null
          status: string | null
          tenant_id: string | null
          total_orders: number | null
          total_products: number | null
          total_revenue: number | null
          updated_at: string | null
        }
        Relationships: [
          {
            foreignKeyName: "marketplace_platforms_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      v_marketplace_product_performance: {
        Row: {
          last_sync_at: string | null
          marketplace_price: number | null
          marketplace_title: string | null
          platform_name: string | null
          platform_type: string | null
          product_id: string | null
          product_name: string | null
          sku: string | null
          status: string | null
          stock_quantity: number | null
          tenant_id: string | null
          total_orders: number | null
          total_quantity_sold: number | null
          total_revenue: number | null
          updated_at: string | null
        }
        Relationships: [
          {
            foreignKeyName: "marketplace_products_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "marketplace_products_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "v_products_margin"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "marketplace_products_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      v_marketplace_sales_report: {
        Row: {
          avg_order_value: number | null
          cancelled_orders: number | null
          daily_revenue: number | null
          delivered_orders: number | null
          order_count: number | null
          order_date: string | null
          platform_name: string | null
          platform_type: string | null
          tenant_id: string | null
        }
        Relationships: [
          {
            foreignKeyName: "marketplace_orders_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      v_price_monitoring_summary: {
        Row: {
          avg_competitor_price: number | null
          competitors_count: number | null
          cost_price: number | null
          current_price: number | null
          highest_competitor_price: number | null
          id: string | null
          last_checked_at: string | null
          lowest_competitor_price: number | null
          monitor_enabled: boolean | null
          pending_suggestions: number | null
          price_position: string | null
          product_name: string | null
          target_margin: number | null
          unread_alerts: number | null
          user_id: string | null
        }
        Relationships: []
      }
      v_products_margin: {
        Row: {
          base_cost: number | null
          category: string | null
          channel_fee_pct: number | null
          created_at: string | null
          currency: string | null
          current_price: number | null
          freight_avg: number | null
          id: string | null
          margin_current: number | null
          name: string | null
          sku: string | null
          tax_pct: number | null
          tenant_id: string | null
          updated_at: string | null
        }
        Insert: {
          base_cost?: number | null
          category?: string | null
          channel_fee_pct?: number | null
          created_at?: string | null
          currency?: string | null
          current_price?: number | null
          freight_avg?: number | null
          id?: string | null
          margin_current?: never
          name?: string | null
          sku?: string | null
          tax_pct?: number | null
          tenant_id?: string | null
          updated_at?: string | null
        }
        Update: {
          base_cost?: number | null
          category?: string | null
          channel_fee_pct?: number | null
          created_at?: string | null
          currency?: string | null
          current_price?: number | null
          freight_avg?: number | null
          id?: string | null
          margin_current?: never
          name?: string | null
          sku?: string | null
          tax_pct?: number | null
          tenant_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "products_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      calculate_marketplace_metrics: {
        Args: { p_period?: string; p_tenant_id: string }
        Returns: {
          avg_order_value: number
          conversion_rate: number
          platform_name: string
          platform_type: string
          top_selling_products: Json
          total_orders: number
          total_revenue: number
        }[]
      }
      calculate_price_position: {
        Args: {
          p_highest_price: number
          p_lowest_price: number
          p_market_avg: number
          p_user_price: number
        }
        Returns: string
      }
      calculate_user_experience_level: {
        Args: { p_user_id: string }
        Returns: string
      }
      can_access_calculation: { Args: { calc_id?: string }; Returns: boolean }
      can_user_access_calculation: {
        Args: { calc_id: string; check_user_id?: string }
        Returns: boolean
      }
      clean_expired_ai_cache: { Args: never; Returns: undefined }
      clean_expired_sessions: { Args: never; Returns: undefined }
      cleanup_expired_roles: { Args: never; Returns: undefined }
      cleanup_old_analytics: { Args: never; Returns: undefined }
      cleanup_old_sync_jobs: {
        Args: { p_days_to_keep?: number; p_tenant_id: string }
        Returns: number
      }
      create_collaboration_notification: {
        Args: {
          _message: string
          _related_id?: string
          _title: string
          _type: string
          _user_id: string
        }
        Returns: string
      }
      current_tenant_id: { Args: never; Returns: string }
      expire_old_suggestions: { Args: never; Returns: undefined }
      get_current_user_context: {
        Args: never
        Returns: {
          is_admin: boolean
          user_email: string
          user_id: string
        }[]
      }
      get_current_user_id: { Args: never; Returns: string }
      get_marketplace_sync_stats: {
        Args: { p_days?: number; p_tenant_id: string }
        Returns: {
          avg_processing_time: unknown
          completed_jobs: number
          failed_jobs: number
          job_type: string
          last_success_at: string
          success_rate: number
          total_jobs: number
        }[]
      }
      get_monitoring_stats: { Args: { p_user_id: string }; Returns: Json }
      get_next_personalized_tip: {
        Args: { p_user_id: string }
        Returns: {
          action_label: string
          action_url: string
          category: Database["public"]["Enums"]["tip_category"]
          message: string
          tip_id: string
          title: string
        }[]
      }
      get_rls_performance_metrics: {
        Args: never
        Returns: {
          avg_execution_time: number
          policy_name: string
          table_name: string
          total_calls: number
        }[]
      }
      get_rls_performance_summary: {
        Args: never
        Returns: {
          avg_policy_execution_time: number
          cache_hit_ratio: number
          optimized_policies: number
          total_policies: number
        }[]
      }
      get_table_stats_optimized: {
        Args: never
        Returns: {
          index_usage_ratio: number
          row_count: number
          table_name: string
          table_size: string
        }[]
      }
      get_unread_alerts: {
        Args: { p_user_id: string }
        Returns: {
          created_at: string
          edital_numero: string
          id: string
          message: string
          title: string
          type: string
          urgency: string
        }[]
      }
      get_unread_count: {
        Args: { p_room_id: string; p_user_id: string }
        Returns: number
      }
      get_user_widget_layout: {
        Args: never
        Returns: {
          height: number
          is_visible: boolean
          widget_key: string
          width: number
          x_position: number
          y_position: number
        }[]
      }
      has_organization_role: {
        Args: { _organization_id: string; _role: string; _user_id: string }
        Returns: boolean
      }
      has_role: { Args: { _role: string; _user_id: string }; Returns: boolean }
      has_team_role: {
        Args: { _role: string; _team_id: string; _user_id: string }
        Returns: boolean
      }
      increment_daily_stat:
        | {
            Args: { p_stat_type: string; p_user_id: string; p_value?: number }
            Returns: undefined
          }
        | {
            Args: { p_stat_type: string; p_user_id: string; p_value?: number }
            Returns: undefined
          }
      is_admin_or_owner: { Args: { _user_id?: string }; Returns: boolean }
      is_admin_user: { Args: never; Returns: boolean }
      is_current_user_admin: { Args: never; Returns: boolean }
      is_organization_member: {
        Args: { check_user_id?: string; org_id: string }
        Returns: boolean
      }
      is_team_member: {
        Args: { check_user_id?: string; team_id_param: string }
        Returns: boolean
      }
      log_security_event: {
        Args: {
          _action: string
          _details?: Json
          _error_message?: string
          _resource_type: string
          _risk_level?: string
          _success?: boolean
          _user_id: string
        }
        Returns: string
      }
      maintenance_cleanup_optimized: { Args: never; Returns: undefined }
      mark_alert_read: {
        Args: { p_alert_id: string; p_user_id: string }
        Returns: boolean
      }
      mark_messages_as_read: {
        Args: { p_room_id: string; p_user_id: string }
        Returns: undefined
      }
      mark_notification_as_read: {
        Args: { p_notification_id: string }
        Returns: undefined
      }
      optimize_tables: { Args: never; Returns: undefined }
      refresh_all_documentos_status: { Args: never; Returns: undefined }
      reset_daily_calculations: { Args: never; Returns: undefined }
      reset_monthly_counters: { Args: never; Returns: undefined }
      reset_widget_layout: { Args: never; Returns: undefined }
      save_widget_layout: {
        Args: {
          p_h: number
          p_w: number
          p_widget_key: string
          p_x: number
          p_y: number
        }
        Returns: undefined
      }
      search_documents: {
        Args: {
          filter_type?: string
          match_count?: number
          match_threshold?: number
          query_embedding: string
        }
        Returns: {
          chunk_index: number
          content: string
          document_id: string
          id: string
          metadata: Json
          similarity: number
        }[]
      }
      search_users_by_location: {
        Args: { p_location: string }
        Returns: {
          avatar_url: string
          company: string
          email: string
          id: string
          location: string
          name: string
          title: string
        }[]
      }
      search_users_by_skill: {
        Args: { p_skill: string }
        Returns: {
          avatar_url: string
          company: string
          email: string
          id: string
          name: string
          title: string
        }[]
      }
      toggle_widget_visibility: {
        Args: { p_widget_key: string }
        Returns: boolean
      }
      track_tip_action_click: { Args: { p_tip_id: string }; Returns: undefined }
      track_tip_view: { Args: { p_tip_id: string }; Returns: undefined }
      validate_platform_credentials: {
        Args: { p_platform_id: string }
        Returns: boolean
      }
    }
    Enums: {
      message_delivery_status: "pending" | "sent" | "delivered" | "read"
      notification_type: "info" | "success" | "warning" | "error" | "tip"
      template_category:
        | "ecommerce"
        | "restaurante"
        | "servicos"
        | "artesanal"
        | "saas"
        | "varejo"
        | "industria"
        | "consultoria"
        | "outros"
      template_status: "draft" | "published" | "archived"
      tip_category:
        | "general"
        | "calculation"
        | "optimization"
        | "advanced"
        | "pricing"
        | "tax"
        | "automation"
        | "analytics"
      user_status_type: "online" | "away" | "offline"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      message_delivery_status: ["pending", "sent", "delivered", "read"],
      notification_type: ["info", "success", "warning", "error", "tip"],
      template_category: [
        "ecommerce",
        "restaurante",
        "servicos",
        "artesanal",
        "saas",
        "varejo",
        "industria",
        "consultoria",
        "outros",
      ],
      template_status: ["draft", "published", "archived"],
      tip_category: [
        "general",
        "calculation",
        "optimization",
        "advanced",
        "pricing",
        "tax",
        "automation",
        "analytics",
      ],
      user_status_type: ["online", "away", "offline"],
    },
  },
} as const
