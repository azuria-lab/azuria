export interface GovernancePolicy {
  allowAutonomousEdits: boolean;
  maxDailyActions: number;
  forbiddenActions: string[];
  riskTolerance: 'low' | 'medium' | 'high';
  requireUserConfirmationFor: string[];
}

export interface PolicyResult {
  allowed: boolean;
  reason?: string;
  requiresConfirmation?: boolean;
}

const activePolicy: GovernancePolicy = {
  allowAutonomousEdits: false,
  maxDailyActions: 20,
  forbiddenActions: ['delete', 'financialTransfer'],
  riskTolerance: 'medium',
  requireUserConfirmationFor: ['payment', 'bulkEdit'],
};

export function getActivePolicy(): GovernancePolicy {
  return activePolicy;
}

export function validateActionAgainstPolicy(action: { type?: string }): PolicyResult {
  const policy = getActivePolicy();
  if (policy.forbiddenActions.includes(action.type || '')) {
    return { allowed: false, reason: 'Action forbidden by policy' };
  }
  if (policy.requireUserConfirmationFor.includes(action.type || '')) {
    return { allowed: false, requiresConfirmation: true, reason: 'Needs user confirmation' };
  }
  if (!policy.allowAutonomousEdits && (action.type || '') === 'write') {
    return { allowed: false, reason: 'Autonomous edits disabled' };
  }
  return { allowed: true };
}

