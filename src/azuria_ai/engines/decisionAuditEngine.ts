import { emitEvent } from '../core/eventBus';

const MAX_LOG = 100;

interface AuditEntry {
  type: string;
  payload: Record<string, unknown>;
  timestamp: number;
}

const auditLog: AuditEntry[] = [];

function push(entry: AuditEntry) {
  auditLog.unshift(entry);
  if (auditLog.length > MAX_LOG) {auditLog.pop();}
  emitEvent('ai:audited-decision', entry, { source: 'decisionAuditEngine', priority: 4 });
}

export function recordDecision(input: Record<string, unknown>) {
  push({ type: 'decision', payload: input, timestamp: Date.now() });
}

export function recordAutoFix(input: Record<string, unknown>) {
  push({ type: 'autofix', payload: input, timestamp: Date.now() });
}

export function recordInsightHistory(input: Record<string, unknown>) {
  push({ type: 'insight', payload: input, timestamp: Date.now() });
}

export function reviewLastActions(count = 10) {
  return auditLog.slice(0, count);
}

