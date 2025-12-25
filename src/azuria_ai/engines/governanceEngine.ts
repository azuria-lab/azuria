import { emitEvent } from '../core/eventBus';
import { logGovernance } from '../logs/modeDeus_conscious';

interface Intent {
  type?: string;
  target?: string;
  [key: string]: unknown;
}

interface Action {
  type?: string;
  payload?: Record<string, unknown>;
  [key: string]: unknown;
}

interface Policy {
  forbiddenActions?: Array<{ type: string }>;
  [key: string]: unknown;
}

interface Risk {
  level?: string;
  score?: number;
  [key: string]: unknown;
}

interface Decision {
  outcome?: string;
  reason?: string;
  [key: string]: unknown;
}

interface DecisionEntry {
  intent?: Intent;
  action?: Action;
  policy?: Policy;
  risk?: Risk;
  decision?: Decision;
  timestamps?: { requested: number; decided: number };
  signature?: string;
}

const decisions: DecisionEntry[] = [];
const LIMIT = 100;

export function registerDecision(entry: DecisionEntry) {
  const enriched = {
    ...entry,
    timestamps: entry.timestamps || { requested: Date.now(), decided: Date.now() },
    signature: 'ConsciousLayer',
  };
  decisions.push(enriched);
  if (decisions.length > LIMIT) {decisions.shift();}
  logGovernance({ decision: enriched });
}

export function auditLastDecisions(limit = 50) {
  return decisions.slice(-limit);
}

export function detectGovernanceViolations(entry: DecisionEntry) {
  const policy = entry.policy || {};
  if (policy.forbiddenActions && entry.action && policy.forbiddenActions.includes(entry.action.type)) {
    emitEvent(
      'ai:governance-violation',
      { action: entry.action, reason: 'forbidden' },
      { source: 'governanceEngine', priority: 9 }
    );
  }
}

