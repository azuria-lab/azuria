import { emitEvent } from '../core/eventBus';

const MAX_LOG = 100;

interface AuditEntry {
  type: string;
  payload: any;
  timestamp: number;
}

const auditLog: AuditEntry[] = [];

function push(entry: AuditEntry) {
  auditLog.unshift(entry);
  if (auditLog.length > MAX_LOG) {auditLog.pop();}
  emitEvent('ai:audited-decision', entry, { source: 'decisionAuditEngine', priority: 4 });
}

export function recordDecision(input: any) {
  push({ type: 'decision', payload: input, timestamp: Date.now() });
}

export function recordAutoFix(input: any) {
  push({ type: 'autofix', payload: input, timestamp: Date.now() });
}

export function recordInsightHistory(input: any) {
  push({ type: 'insight', payload: input, timestamp: Date.now() });
}

export function reviewLastActions(count = 10) {
  return auditLog.slice(0, count);
}

