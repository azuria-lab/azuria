import { emitEvent } from '../core/eventBus';

let stabilityScore = 0.8;
let safeMode = false;
const recoveryEvents: string[] = [];

function emitStabilityAlert(event: { severity: 'info' | 'warning' | 'critical'; riskLevel: number; details?: Record<string, unknown> }) {
  emitEvent('ai:stability-alert', event, { source: 'stabilityEngine', priority: event.severity === 'critical' ? 9 : 6 });
  if (event.riskLevel >= 0.8) {
    safeMode = true;
  }
}

interface FailureSignals {
  loopsDetected?: boolean;
  contradictions?: number;
  load?: number;
  [key: string]: unknown;
}

export function predictFailure(signals: FailureSignals | Record<string, unknown>): { risk: number } {
  const risk =
    (signals?.loopsDetected ? 0.3 : 0) +
    (signals?.contradictions ? Math.min(signals.contradictions / 5, 0.3) : 0) +
    (signals?.load && signals.load > 0.8 ? 0.2 : 0);
  const totalRisk = Math.min(1, risk);
  if (totalRisk > 0.6) {
    emitStabilityAlert({ severity: totalRisk > 0.8 ? 'critical' : 'warning', riskLevel: totalRisk, details: signals });
  }
  stabilityScore = Math.max(0, 1 - totalRisk * 0.8);
  return { risk: totalRisk };
}

interface HistoryEntry {
  type?: string;
  [key: string]: unknown;
}

export function detectCascadingErrors(history: HistoryEntry[] = []) {
  const cascades = history.filter((h) => h.type === 'error').length > 3;
  if (cascades) {emitStabilityAlert({ severity: 'warning', riskLevel: 0.7, details: { cascades: true } });}
  return cascades;
}

export function stabilizeCognitiveLoad(load: number = 0.5) {
  if (load > 0.9) {
    emitStabilityAlert({ severity: 'critical', riskLevel: 0.9, details: { load } });
    return limitProcessingIfNecessary();
  }
  return { loadReduced: false };
}

export function limitProcessingIfNecessary() {
  safeMode = true;
  emitStabilityAlert({ severity: 'critical', riskLevel: 0.85, details: { action: 'safe-mode' } });
  return { safeMode: true };
}

export function autoPauseAndRecover(reason: string) {
  safeMode = true;
  recoveryEvents.unshift(reason);
  if (recoveryEvents.length > 10) {recoveryEvents.pop();}
  emitStabilityAlert({ severity: 'critical', riskLevel: 0.9, details: { reason } });
  safeMode = false;
  return { recovered: true };
}

export function emitStabilitySnapshot() {
  emitEvent(
    'ai:stability-alert',
    { severity: 'info', riskLevel: 0, details: { stabilityScore, safeMode, recoveryEvents } },
    { source: 'stabilityEngine', priority: 4 }
  );
}

export function getStabilityState() {
  return { stabilityScore, safeMode, recoveryEvents };
}

