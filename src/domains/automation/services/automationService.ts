import { supabase } from "@/integrations/supabase/client";
import { z } from "zod";
import type { AutomationAlert, AutomationExecution, AutomationRule, AutomationWorkflow, RuleAction, RuleCondition, WorkflowStep } from "@/types/automation";
import type { Database, Json } from "@/integrations/supabase/types";
import { automationAlertRow, automationRuleRow, automationWorkflowRow } from "../schemas/automationSchemas";

// Mappers DB→Domain
function mapRule(row: z.infer<typeof automationRuleRow>): AutomationRule {
  const parsed = automationRuleRow.parse(row);
  const conditions: RuleCondition[] = Array.isArray(parsed.conditions) ? (parsed.conditions as unknown as RuleCondition[]) : [];
  const actions: RuleAction[] = Array.isArray(parsed.actions) ? (parsed.actions as unknown as RuleAction[]) : [];
  return {
    id: parsed.id,
    user_id: parsed.user_id,
    name: parsed.name,
    description: parsed.description ?? undefined,
    is_active: parsed.is_active,
    rule_type: parsed.rule_type,
    conditions,
    actions,
    schedule: undefined, // not present currently
    priority: parsed.priority,
    tags: parsed.tags ?? undefined,
    version: parsed.version,
    created_at: parsed.created_at,
    updated_at: parsed.updated_at,
    last_executed_at: parsed.last_executed_at ?? undefined,
    execution_count: parsed.execution_count,
  };
}

function mapAlert(row: z.infer<typeof automationAlertRow>): AutomationAlert {
  const parsed = automationAlertRow.parse(row);
  return {
    id: parsed.id,
    user_id: parsed.user_id,
    rule_id: parsed.rule_id ?? undefined,
    alert_type: parsed.alert_type,
    title: parsed.title,
    message: parsed.message,
    severity: parsed.severity,
  data: (parsed.data ?? undefined) as Record<string, unknown> | undefined,
    is_read: parsed.is_read,
    is_resolved: parsed.is_resolved,
    notification_channels: parsed.notification_channels ?? ["app"],
    created_at: parsed.created_at,
    resolved_at: parsed.resolved_at ?? undefined,
    expires_at: parsed.expires_at ?? undefined,
  };
}

function mapWorkflow(row: z.infer<typeof automationWorkflowRow>): AutomationWorkflow {
  const parsed = automationWorkflowRow.parse(row);
  const steps: WorkflowStep[] = Array.isArray(parsed.steps) ? (parsed.steps as unknown as WorkflowStep[]) : [];
  return {
    id: parsed.id,
    user_id: parsed.user_id,
    name: parsed.name,
    description: parsed.description ?? undefined,
    is_active: parsed.is_active,
    trigger_type: parsed.trigger_type,
  trigger_config: (parsed.trigger_config ?? {}) as Record<string, unknown>,
    steps,
    approval_required: parsed.approval_required,
    approval_users: parsed.approval_users ?? [],
    tags: parsed.tags ?? [],
    created_at: parsed.created_at,
    updated_at: parsed.updated_at,
    last_run_at: parsed.last_run_at ?? undefined,
    next_run_at: parsed.next_run_at ?? undefined,
    run_count: parsed.run_count,
  };
}

type AutomationExecutionRow = Database["public"]["Tables"]["automation_executions"]["Row"];

function mapExecution(row: AutomationExecutionRow): AutomationExecution {
  return {
    id: row.id,
    rule_id: row.rule_id,
    user_id: row.user_id,
    status: row.status as AutomationExecution["status"],
    input_data: row.input_data ?? undefined,
    output_data: row.output_data ?? undefined,
    error_message: row.error_message ?? undefined,
    execution_time_ms: row.execution_time_ms ?? undefined,
    started_at: row.started_at,
    completed_at: row.completed_at ?? undefined,
    metadata: (row.metadata ?? undefined) as Record<string, unknown> | undefined,
  };
}

// Queries
export async function listRules(): Promise<AutomationRule[]> {
  const { data, error } = await supabase
    .from("automation_rules")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) { throw error; }
  return (data ?? []).map((r) => mapRule(r as z.infer<typeof automationRuleRow>));
}

export async function getRule(id: string): Promise<AutomationRule | null> {
  const { data, error } = await supabase
    .from("automation_rules")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error) { throw error; }
  if (!data) { return null; }
  return mapRule(data as z.infer<typeof automationRuleRow>);
}

export async function listAlerts(): Promise<AutomationAlert[]> {
  const { data, error } = await supabase
    .from("automation_alerts")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) { throw error; }
  return (data ?? []).map((r) => mapAlert(r as z.infer<typeof automationAlertRow>));
}

export async function listAlertsByRule(ruleId: string): Promise<AutomationAlert[]> {
  // Usar função auxiliar para evitar erro de profundidade de tipo
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const result: any = await supabase
    .from("automation_alerts")
    .select("*")
    .eq("rule_id", ruleId)
    .order("created_at", { ascending: false });
  
  if (result.error) { throw result.error; }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (result.data ?? []).map((r: any) => mapAlert(r));
}

export async function listWorkflows(): Promise<AutomationWorkflow[]> {
  const { data, error } = await supabase
    .from("automation_workflows")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) { throw error; }
  return (data ?? []).map((r) => mapWorkflow(r as z.infer<typeof automationWorkflowRow>));
}

export async function listExecutions(limit = 100): Promise<AutomationExecution[]> {
  const { data, error } = await supabase
    .from("automation_executions")
    .select("*")
    .order("started_at", { ascending: false })
    .limit(limit);
  if (error) { throw error; }
  return (data ?? []).map((e) => mapExecution(e));
}

export async function listExecutionsByRule(ruleId: string, limit = 50): Promise<AutomationExecution[]> {
  const { data, error } = await supabase
    .from("automation_executions")
    .select("*")
    .eq("rule_id", ruleId)
    .order("started_at", { ascending: false })
    .limit(limit);
  if (error) { throw error; }
  return (data ?? []).map((e) => mapExecution(e));
}

// Commands
export async function createRule(input: Omit<AutomationRule, "id"|"user_id"|"created_at"|"updated_at"|"version"|"execution_count">) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) { throw new Error("Usuário não autenticado"); }

  const payload = {
    name: input.name,
    description: input.description ?? null,
    rule_type: input.rule_type,
    conditions: input.conditions as unknown as Json,
    actions: input.actions as unknown as Json,
    is_active: input.is_active,
    priority: input.priority,
    user_id: user.id,
  };

  const { data, error } = await supabase
    .from("automation_rules")
    .insert(payload as Database["public"]["Tables"]["automation_rules"]["Insert"])
    .select()
    .single();
  if (error) { throw error; }
  return mapRule(data as z.infer<typeof automationRuleRow>);
}

export async function updateRule(id: string, updates: Partial<Omit<AutomationRule, "id"|"user_id"|"created_at"|"updated_at">>) {
  const updatesPayload = {
    name: updates.name,
    description: updates.description,
    rule_type: updates.rule_type,
    conditions: (updates.conditions as unknown as Json | undefined),
    actions: (updates.actions as unknown as Json | undefined),
    is_active: updates.is_active,
    priority: updates.priority,
  };

  const { data, error } = await supabase
    .from("automation_rules")
    .update(updatesPayload as Database["public"]["Tables"]["automation_rules"]["Update"])
    .eq("id", id)
    .select()
    .single();
  if (error) { throw error; }
  return mapRule(data as z.infer<typeof automationRuleRow>);
}

export async function deleteRule(id: string) {
  const { error } = await supabase
    .from("automation_rules")
    .delete()
    .eq("id", id);
  if (error) { throw error; }
}

export async function resolveAlert(id: string) {
  const { error } = await supabase
    .from("automation_alerts")
    .update({ is_resolved: true, resolved_at: new Date().toISOString() } satisfies Database["public"]["Tables"]["automation_alerts"]["Update"])
    .eq("id", id);
  if (error) { throw error; }
}

export async function createAlert(input: Omit<AutomationAlert, "id" | "user_id" | "created_at">) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) { throw new Error("Usuário não autenticado"); }

  const payload: Database["public"]["Tables"]["automation_alerts"]["Insert"] = {
    rule_id: input.rule_id ?? null,
    alert_type: input.alert_type,
    title: input.title,
    message: input.message,
    severity: input.severity,
    is_read: input.is_read ?? false,
    is_resolved: input.is_resolved ?? false,
    data: (input.data as Json) ?? null,
    notification_channels: input.notification_channels ?? ["app"],
    user_id: user.id,
  };

  const { data, error } = await supabase
    .from("automation_alerts")
    .insert(payload satisfies Database["public"]["Tables"]["automation_alerts"]["Insert"])
    .select()
    .single();
  if (error) { throw error; }
  return mapAlert(data as z.infer<typeof automationAlertRow>);
}

export async function markAlertAsRead(id: string) {
  const { error } = await supabase
    .from("automation_alerts")
    .update({ is_read: true } satisfies Database["public"]["Tables"]["automation_alerts"]["Update"])
    .eq("id", id);
  if (error) { throw error; }
}

export async function createExecution(ruleId: string, inputData?: Json) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) { throw new Error("Usuário não autenticado"); }
  const payload: Database["public"]["Tables"]["automation_executions"]["Insert"] = {
    rule_id: ruleId,
    user_id: user.id,
    status: "success",
    input_data: inputData ?? { test: true },
  };
  const { data, error } = await supabase
    .from("automation_executions")
    .insert(payload satisfies Database["public"]["Tables"]["automation_executions"]["Insert"])
    .select()
    .single();
  if (error) { throw error; }
  return mapExecution(data);
}
