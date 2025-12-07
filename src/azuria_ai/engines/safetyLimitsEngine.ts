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

export function detectRunawayBehavior(actions: any[] = []) {
  const runaway = actions.length > 10;
  if (runaway) {
    applySafetyBreak({ reason: 'runaway_actions', state: { actions: actions.length } });
  }
  return runaway;
}

export function applySafetyBreak(event: { reason: string; state?: any }) {
  emitEvent('ai:safety-break', event, { source: 'safetyLimitsEngine', priority: 10 });
  return true;
}

export function logSafetyEvent(event: any) {
  emitEvent('ai:governance-alert', { message: 'Safety event', detail: event }, { source: 'safetyLimitsEngine', priority: 6 });
}

