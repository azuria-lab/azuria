import { emitEvent } from '../core/eventBus';
import { getInternalLogs } from '../logs/modeDeus_internal.log.ts';

interface ImprovementParams {
  sensitivity?: number;
  debounceMs?: number;
  maxAlerts?: number;
}

const params: ImprovementParams = {
  sensitivity: 0.5,
  debounceMs: 400,
  maxAlerts: 5,
};

let evolutionScore = 0.5;

function computeEvolutionScore(): number {
  const logs = getInternalLogs();
  const penalty = Math.min(0.4, logs.risk.length * 0.01 + logs.conflict.length * 0.02);
  const reward = Math.min(0.4, logs.opportunity.length * 0.01 + logs.predictive.length * 0.015);
  const score = Math.max(0.1, Math.min(1, 0.6 + reward - penalty));
  evolutionScore = score;
  emitEvent(
    'ai:evolution-score-updated',
    { evolutionScore: score },
    { source: 'continuousImprovementEngine', priority: 4 }
  );
  return score;
}

function scanForWeaknesses() {
  const logs = getInternalLogs();
  const weaknesses: string[] = [];
  if (logs.risk.length > params.maxAlerts!) {weaknesses.push('Muitos alerts de risco');}
  if (logs.conflict.length > 0) {weaknesses.push('Conflitos recorrentes em decisões');}
  if (logs.predictive.length < 2) {weaknesses.push('Baixo volume de insights preditivos');}

  emitEvent(
    'ai:evolution-weakness-found',
    { weaknesses },
    { source: 'continuousImprovementEngine', priority: 5 }
  );
  return weaknesses;
}

function learnFromHistory() {
  const logs = getInternalLogs();
  const summary = {
    risks: logs.risk.length,
    opportunities: logs.opportunity.length,
    predictive: logs.predictive.length,
  };
  emitEvent(
    'ai:evolution-scan',
    { summary },
    { source: 'continuousImprovementEngine', priority: 4 }
  );
  return summary;
}

function proposeFixes(weaknesses: string[]) {
  const suggestions = weaknesses.map(w => `Sugestão: Ajustar sensibilidade diante de ${w}`);
  emitEvent(
    'ai:evolution-patch-proposed',
    { suggestions },
    { source: 'continuousImprovementEngine', priority: 4 }
  );
  return suggestions;
}

function validateImpact() {
  // Sandbox simulado: apenas retorno estático indicando sucesso potencial
  return { safe: true, expectedGain: 0.05 };
}

export function analyzeAndAdjust() {
  const logs = getInternalLogs();
  const riskCount = logs.risk.length;
  const conflictCount = logs.conflict.length;

  if (riskCount > params.maxAlerts!) {
    params.sensitivity = Math.min(1, (params.sensitivity || 0.5) + 0.1);
  }
  if (conflictCount > 0) {
    params.debounceMs = Math.min(800, (params.debounceMs || 400) + 50);
  }

  emitEvent(
    'ai:signal-quality',
    { sensitivity: params.sensitivity, debounceMs: params.debounceMs },
    { source: 'continuousImprovementEngine', priority: 3 }
  );

  emitEvent(
    'ai:planner-plan-adjusted',
    { parameters: params, reason: 'auto-improvement' },
    { source: 'continuousImprovementEngine', priority: 3 }
  );
}

export function proposeImprovements() {
  emitEvent(
    'ai:consistency-warning',
    { message: 'Sugerir ajuste de sensibilidade e debounce para reduzir falsos positivos.' },
    { source: 'continuousImprovementEngine', priority: 4 }
  );
}

export function getCurrentParams() {
  return { ...params };
}

export function runEvolutionCycle() {
  const summary = learnFromHistory();
  const weaknesses = scanForWeaknesses();
  const suggestions = proposeFixes(weaknesses);
  const impact = validateImpact();
  const score = computeEvolutionScore();

  return { summary, weaknesses, suggestions, impact, score };
}

export const _internals = {
  scanForWeaknesses,
  learnFromHistory,
  proposeFixes,
  validateImpact,
  computeEvolutionScore,
};

