import { useCallback, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from '@/components/ui/use-toast';
import type { AutomationAlert, AutomationRule, RuleCondition } from '@/types/automation';
import * as automationService from '@/domains/automation/services/automationService';

export const useAdvancedAutomation = () => {
  const queryClient = useQueryClient();
  const [isLoading, setIsLoading] = useState(false);

  // Fetch automation rules - aligned with actual DB schema
  const { data: rules = [], isLoading: rulesLoading } = useQuery({
    queryKey: ['automation-rules'],
    queryFn: () => automationService.listRules(),
  });

  // Fetch automation alerts - aligned with actual DB schema
  const { data: alerts = [], isLoading: alertsLoading } = useQuery({
    queryKey: ['automation-alerts'],
    queryFn: () => automationService.listAlerts(),
  });

  // Fetch automation workflows - aligned with actual DB schema
  const { data: workflows = [], isLoading: workflowsLoading } = useQuery({
    queryKey: ['automation-workflows'],
    queryFn: () => automationService.listWorkflows(),
  });

  // Fetch execution history - aligned with actual DB schema
  const { data: executions = [] } = useQuery({
    queryKey: ['automation-executions'],
    queryFn: () => automationService.listExecutions(100),
  });

  // Create automation rule - aligned with actual DB schema
  const createRule = useMutation({
    mutationFn: (rule: Omit<AutomationRule, 'id' | 'user_id' | 'created_at' | 'updated_at' | 'version' | 'execution_count'>) =>
      automationService.createRule(rule),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['automation-rules'] });
      if (data && 'id' in data && typeof data.id === 'string') {
        queryClient.invalidateQueries({ queryKey: ['automation-rule', data.id] });
      }
      toast.success('Regra de automação criada com sucesso!');
    },
  onError: () => {
      toast.error('Erro ao criar regra de automação');
    },
  });

  // Update automation rule - aligned with actual DB schema
  const updateRule = useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<Omit<AutomationRule, 'id' | 'user_id' | 'created_at' | 'updated_at'>> }) =>
      automationService.updateRule(id, updates),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['automation-rules'] });
      if (variables?.id) {
        queryClient.invalidateQueries({ queryKey: ['automation-rule', variables.id] });
        queryClient.invalidateQueries({ queryKey: ['automation-alerts', 'rule', variables.id] });
      }
      toast.success('Regra atualizada com sucesso!');
    },
  onError: () => {
      toast.error('Erro ao atualizar regra');
    },
  });

  // Delete automation rule
  const deleteRule = useMutation({
    mutationFn: (id: string) => automationService.deleteRule(id),
    onSuccess: (_data, id) => {
      queryClient.invalidateQueries({ queryKey: ['automation-rules'] });
      if (id) {
        queryClient.invalidateQueries({ queryKey: ['automation-rule', id] });
        queryClient.invalidateQueries({ queryKey: ['automation-alerts', 'rule', id] });
      }
      toast.success('Regra removida com sucesso!');
    },
  onError: () => {
      toast.error('Erro ao remover regra');
    },
  });

  // Execute rule manually
  const executeRule = useMutation({
    mutationFn: async (ruleId: string) => {
      setIsLoading(true);
      return automationService.createExecution(ruleId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['automation-executions'] });
      toast.success('Regra executada com sucesso!');
    },
    onError: () => {
      toast.error('Erro ao executar regra');
    },
    onSettled: () => {
      setIsLoading(false);
    },
  });

  // Create alert - aligned with actual DB schema
  const createAlert = useMutation({
    mutationFn: (alert: Omit<AutomationAlert, 'id' | 'user_id' | 'created_at'>) => automationService.createAlert(alert),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['automation-alerts'] });
      toast.success('Alerta criado com sucesso!');
    },
  onError: () => {
      toast.error('Erro ao criar alerta');
    },
  });

  // Mark alert as read
  const markAlertAsRead = useMutation({
    mutationFn: (alertId: string) => automationService.markAlertAsRead(alertId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['automation-alerts'] });
    },
  });

  // Resolve alert
  const resolveAlert = useMutation({
    mutationFn: (alertId: string) => automationService.resolveAlert(alertId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['automation-alerts'] });
      toast.success('Alerta resolvido!');
    },
  });

  // Test rule conditions
  const testRuleConditions = useCallback((conditions: RuleCondition[], testData: Record<string, unknown>) => {
    return conditions.every(condition => {
      const fieldValue = testData[condition.field];
      
      switch (condition.operator) {
        case 'equals':
          return fieldValue === condition.value;
        case 'not_equals':
          return fieldValue !== condition.value;
        case 'greater_than':
          return Number(fieldValue) > Number(condition.value);
        case 'less_than':
          return Number(fieldValue) < Number(condition.value);
        case 'contains':
          return String(fieldValue).includes(String(condition.value));
        case 'between': {
          const [min, max] = condition.value as [number, number];
          return Number(fieldValue) >= min && Number(fieldValue) <= max;
        }
        case 'in':
          return (Array.isArray(condition.value) ? condition.value : []).includes(fieldValue as never);
        case 'not_in':
          return !(Array.isArray(condition.value) ? condition.value : []).includes(fieldValue as never);
        default:
          return false;
      }
    });
  }, []);

  return {
    // Data
    rules,
    alerts,
    workflows,
    executions,
    
    // Loading states
    isLoading: rulesLoading || alertsLoading || workflowsLoading || isLoading,
    rulesLoading,
    alertsLoading,
    workflowsLoading,
    
    // Rule operations
    createRule: createRule.mutate,
    updateRule: updateRule.mutate,
    deleteRule: deleteRule.mutate,
    executeRule: executeRule.mutate,
    
    // Alert operations
    createAlert: createAlert.mutate,
    markAlertAsRead: markAlertAsRead.mutate,
    resolveAlert: resolveAlert.mutate,
    
    // Utilities
    testRuleConditions,
    
    // Computed data
    unreadAlerts: alerts.filter(alert => !alert.is_read),
    activeRules: rules.filter(rule => rule.is_active),
    criticalAlerts: alerts.filter(alert => alert.severity === 'critical' && !alert.is_resolved),

    // Prefetch helpers
    prefetchRule: (id: string) =>
      queryClient.prefetchQuery({ queryKey: ['automation-rule', id], queryFn: () => automationService.getRule(id) }),
    prefetchAlertsByRule: (ruleId: string) =>
      queryClient.prefetchQuery({ queryKey: ['automation-alerts', 'rule', ruleId], queryFn: () => automationService.listAlertsByRule(ruleId) }),
  };
};

// Parameterized hooks for targeted queries
export const useAutomationRule = (id: string | null | undefined) => {
  return useQuery({
    queryKey: ['automation-rule', id],
    queryFn: () => automationService.getRule(id as string),
    enabled: Boolean(id),
  staleTime: 30_000,
  });
};

export const useAlertsByRule = (ruleId: string | null | undefined) => {
  return useQuery({
    queryKey: ['automation-alerts', 'rule', ruleId],
    queryFn: () => automationService.listAlertsByRule(ruleId as string),
    enabled: Boolean(ruleId),
  staleTime: 30_000,
  });
};

export const useExecutionsByRule = (ruleId: string | null | undefined, limit = 50) => {
  return useQuery({
    queryKey: ['automation-executions', 'rule', ruleId, limit],
    queryFn: () => automationService.listExecutionsByRule(ruleId as string, limit),
    enabled: Boolean(ruleId),
    staleTime: 30_000,
  });
};
