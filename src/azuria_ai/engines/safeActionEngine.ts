import { emitEvent } from '../core/eventBus';
import { validateActionAgainstPolicy } from './policyEngine';
import { logGovernance } from '../logs/modeDeus_conscious';
import { logSafeAction } from '../logs/ai.safeAction';

interface Action {
  type?: string;
  riskLevel?: 'low' | 'medium' | 'high';
  [key: string]: unknown;
}

interface ActionContext {
  [key: string]: unknown;
}

interface SafeResult {
  approved: boolean;
  action?: Action;
  reason?: string;
  riskLevel?: 'low' | 'medium' | 'high';
}

export function executeActionSafely(action: Action | Record<string, unknown>, _context: ActionContext | Record<string, unknown>): SafeResult {
  const policyResult = validateActionAgainstPolicy(action);
  if (!policyResult.allowed) {
    return { approved: false, reason: policyResult.reason, riskLevel: 'high' };
  }

  // Placeholder predictOutcome (assume medium risk)
  const actionData = action as Action;
  const predictedRisk = actionData.riskLevel || 'medium';
  if (predictedRisk === 'high' && policyResult.allowed) {
    return { approved: false, reason: 'Predicted high risk', riskLevel: 'high' };
  }

  return { approved: true, action, reason: 'Policy compliant' };
}

export function applyAction(action: Action | Record<string, unknown>) {
  // No real mutation; simulate execution and emit event
  const result = { success: true, details: { action } };
  emitEvent('ai:action-executed', result, { source: 'safeActionEngine', priority: 6 });
  logGovernance({ actionExecuted: action, result });
  logSafeAction({ action, result });
  return result;
}

