
export interface AutomationRule {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  is_active: boolean;
  rule_type: 'pricing' | 'alert' | 'workflow' | 'notification';
  conditions: RuleCondition[];
  actions: RuleAction[];
  schedule?: ScheduleConfig;
  priority: 1 | 2 | 3 | 4 | 5;
  tags?: string[];
  version: number;
  created_at: string;
  updated_at: string;
  last_executed_at?: string;
  execution_count: number;
}

export interface RuleCondition {
  id: string;
  type: 'product' | 'market' | 'time' | 'user' | 'calculation';
  field: string;
  operator: 'equals' | 'not_equals' | 'greater_than' | 'less_than' | 'contains' | 'between' | 'in' | 'not_in';
  value: unknown;
  logic?: 'and' | 'or';
}

export interface RuleAction {
  id: string;
  type: 'price_adjustment' | 'alert' | 'notification' | 'api_call' | 'webhook' | 'email';
  config: Record<string, unknown>;
  delay?: number;
}

export interface ScheduleConfig {
  type: 'immediate' | 'recurring' | 'delayed';
  cron?: string;
  timezone?: string;
  start_date?: string;
  end_date?: string;
}

export interface AutomationExecution {
  id: string;
  rule_id: string;
  user_id: string;
  status: 'success' | 'failed' | 'pending' | 'cancelled';
  input_data?: unknown;
  output_data?: unknown;
  error_message?: string;
  execution_time_ms?: number;
  started_at: string;
  completed_at?: string;
  metadata?: Record<string, unknown>;
}

export interface AutomationAlert {
  id: string;
  user_id: string;
  rule_id?: string;
  alert_type: 'margin_alert' | 'cost_change' | 'competitor_price' | 'seasonal' | 'performance' | 'opportunity';
  title: string;
  message: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  data?: Record<string, unknown>;
  is_read: boolean;
  is_resolved: boolean;
  notification_channels: string[];
  created_at: string;
  resolved_at?: string;
  expires_at?: string;
}

export interface AutomationWorkflow {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  is_active: boolean;
  trigger_type: 'schedule' | 'event' | 'manual' | 'condition';
  trigger_config: Record<string, unknown>;
  steps: WorkflowStep[];
  approval_required: boolean;
  approval_users?: string[];
  tags?: string[];
  created_at: string;
  updated_at: string;
  last_run_at?: string;
  next_run_at?: string;
  run_count: number;
}

export interface WorkflowStep {
  id: string;
  name: string;
  type: 'action' | 'condition' | 'approval' | 'delay';
  config: Record<string, unknown>;
  on_success?: string;
  on_failure?: string;
}

export interface WorkflowApproval {
  id: string;
  workflow_id: string;
  execution_id?: string;
  requested_by: string;
  approver_id?: string;
  status: 'pending' | 'approved' | 'rejected' | 'expired';
  request_data?: Record<string, unknown>;
  comment?: string;
  requested_at: string;
  responded_at?: string;
  expires_at: string;
}

export interface AutomationTemplate {
  id: string;
  name: string;
  description?: string;
  category: string;
  template_data: Record<string, unknown>;
  is_public: boolean;
  created_by?: string;
  usage_count: number;
  rating?: number;
  tags?: string[];
  created_at: string;
  updated_at: string;
}
