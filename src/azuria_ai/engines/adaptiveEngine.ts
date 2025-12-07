import { emitEvent } from '../core/eventBus';
import { recordAgentEvent, updateHeuristic, updatePerformance, getAgentMemory } from '../core/agentMemory';

function clamp(v: number, min = 0, max = 1) {
  return Math.max(min, Math.min(max, v));
}

export function updateAgentHeuristics(agentId: string, metrics: Record<string, number>) {
  Object.entries(metrics).forEach(([k, v]) => {
    updateHeuristic(agentId, k, v);
  });
  emitEvent('agent:heuristic-updated', { agentId, metrics }, { source: 'adaptiveEngine', priority: 5 });
}

export function adjustConfidence(agentId: string, delta: number) {
  const mem = getAgentMemory(agentId);
  const current = mem.performance.confidence || 0.5;
  const next = clamp(current + delta, 0, 1);
  updatePerformance(agentId, 'confidence', next - current);
  emitEvent('agent:performance-shift', { agentId, confidence: next }, { source: 'adaptiveEngine', priority: 5 });
}

export function recordBehaviorShift(agentId: string, reason: string) {
  recordAgentEvent(agentId, { reason, timestamp: Date.now() });
  emitEvent('agent:anomaly-detected', { agentId, reason }, { source: 'adaptiveEngine', priority: 6 });
}

export function evaluatePerformance(agentId: string) {
  const mem = getAgentMemory(agentId);
  const confidence = mem.performance.confidence || 0.5;
  const successes = mem.history.filter(h => h.outcome === 'success').length;
  const failures = mem.history.filter(h => h.outcome === 'failure').length;
  return { confidence, successes, failures };
}

export function suggestModelUpdate(agentId: string) {
  const perf = evaluatePerformance(agentId);
  if (perf.failures > perf.successes) {
    emitEvent('agent:feedback', { agentId, suggestion: 'Rever heurísticas: alto índice de falhas.' }, { source: 'adaptiveEngine', priority: 5 });
  }
}

export function autoTuneParameters(agentId: string, context: any) {
  const mem = getAgentMemory(agentId);
  const nextThreshold = clamp((mem.heuristics.threshold || 0.5) + (context?.delta || 0), 0.1, 0.9);
  updateHeuristic(agentId, 'threshold', nextThreshold);
  emitEvent('agent:auto-tuned', { agentId, details: { threshold: nextThreshold } }, { source: 'adaptiveEngine', priority: 5 });
}

