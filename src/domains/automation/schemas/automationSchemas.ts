import { z } from "zod";

// DB rows (snake_case) from Supabase
export const automationRuleRow = z.object({
  id: z.string(),
  user_id: z.string(),
  name: z.string(),
  description: z.string().nullable().optional(),
  is_active: z.boolean(),
  rule_type: z.enum(["pricing","alert","workflow","notification"]),
  conditions: z.unknown().optional(),
  actions: z.unknown().optional(),
  priority: z.union([z.literal(1), z.literal(2), z.literal(3), z.literal(4), z.literal(5)]),
  tags: z.array(z.string()).nullable().optional(),
  version: z.number(),
  created_at: z.string(),
  updated_at: z.string(),
  last_executed_at: z.string().nullable().optional(),
  execution_count: z.number(),
});
export type AutomationRuleRow = z.infer<typeof automationRuleRow>;

export const automationAlertRow = z.object({
  id: z.string(),
  user_id: z.string(),
  rule_id: z.string().nullable().optional(),
  alert_type: z.enum(["margin_alert","cost_change","competitor_price","seasonal","performance","opportunity"]),
  title: z.string(),
  message: z.string(),
  severity: z.enum(["low","medium","high","critical"]),
  data: z.unknown().optional(),
  is_read: z.boolean(),
  is_resolved: z.boolean(),
  notification_channels: z.array(z.string()).nullable().optional(),
  created_at: z.string(),
  resolved_at: z.string().nullable().optional(),
  expires_at: z.string().nullable().optional(),
});
export type AutomationAlertRow = z.infer<typeof automationAlertRow>;

export const automationWorkflowRow = z.object({
  id: z.string(),
  user_id: z.string(),
  name: z.string(),
  description: z.string().nullable().optional(),
  is_active: z.boolean(),
  trigger_type: z.enum(["schedule","event","manual","condition"]),
  trigger_config: z.unknown().nullable().optional(),
  steps: z.unknown().nullable().optional(),
  approval_required: z.boolean(),
  approval_users: z.array(z.string()).nullable().optional(),
  tags: z.array(z.string()).nullable().optional(),
  created_at: z.string(),
  updated_at: z.string(),
  last_run_at: z.string().nullable().optional(),
  next_run_at: z.string().nullable().optional(),
  run_count: z.number(),
});
export type AutomationWorkflowRow = z.infer<typeof automationWorkflowRow>;
