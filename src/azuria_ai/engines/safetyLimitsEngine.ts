import { emitEvent } from '../core/eventBus';

export interface SafetyState {
  load?: number;
  actionsPerMinute?: number;
  loopSignals?: number;
}

export function checkCriticalBoundaries(state: SafetyState) {
  const critical = (state.load ?? 0) > 0.9 || (state.actionsPerMinute ?? 0) > 20;
  if (critical) {
    applySafetyBreak({ reason: 'critical_boundaries', state });
  }
  return critical;
}

export function detectRunawayBehavior(actions: Array<Record<string, unknown>> = []) {
  const runaway = actions.length > 10;
  if (runaway) {
    applySafetyBreak({ reason: 'runaway_actions', state: { actions: actions.length } });
  }
  return runaway;
}

export function applySafetyBreak(event: { reason: string; state?: Record<string, unknown> }) {
  emitEvent('ai:safety-break', event, { source: 'safetyLimitsEngine', priority: 10 });
  return true;
}

export function logSafetyEvent(event: Record<string, unknown>) {
  emitEvent('ai:governance-alert', { message: 'Safety event', detail: event }, { source: 'safetyLimitsEngine', priority: 6 });
}

