import { emitEvent } from '../core/eventBus';

interface GlobalState {
  systemHealthScore?: number;
  operational?: {
    load?: number;
    [key: string]: unknown;
  };
  consistency?: {
    drift?: boolean;
    [key: string]: unknown;
  };
  risk?: {
    level?: string;
    [key: string]: unknown;
  };
  opportunity?: {
    signal?: string;
    [key: string]: unknown;
  };
  [key: string]: unknown;
}

export function analyzeGlobalState(state: GlobalState | Record<string, unknown>) {
  const health = state?.systemHealthScore ?? 0.7;
  const risks = identifyStructuralRisks(state);
  const goals = defineLongTermGoals(state);
  const plan = generateStrategicPlan(state, goals);
  emitEvent('ai:strategic-plan-generated', { plan }, { source: 'strategicEngine', priority: 6 });
  emitEvent('ai:long-term-goal-defined', { goals }, { source: 'strategicEngine', priority: 6 });
  if (risks.length) {
    emitEvent('ai:structural-risk-detected', { risks }, { source: 'strategicEngine', priority: 7 });
  }
  return { health, risks, goals, plan };
}

export function identifyStructuralRisks(state: GlobalState | Record<string, unknown>): string[] {
  const risks: string[] = [];
  if (state?.operational?.load > 0.8) {risks.push('Carga operacional alta');}
  if (state?.consistency?.drift) {risks.push('Drift de consistência');}
  return risks;
}

export function defineLongTermGoals(_state: GlobalState | Record<string, unknown>) {
  return [
    { id: 'goal-reliability', target: 'reduzir drift', horizonDays: 180 },
    { id: 'goal-precision', target: 'aumentar precisão preditiva', horizonDays: 90 },
  ];
}

interface Goal {
  id: string;
  [key: string]: unknown;
}

export function generateStrategicPlan(_state: GlobalState | Record<string, unknown>, goals: Goal[]) {
  return goals.map(g => ({
    goalId: g.id,
    actions: ['rodar simulação', 'ajustar pesos', 'monitorar métricas'],
    priority: 'high',
  }));
}

export function recommendGlobalAdjustments(_state: GlobalState | Record<string, unknown>) {
  return ['elevar sensibilidade de detecção', 'reduzir latência em pipelines críticos'];
}

export function detectStrategicConflicts(state: GlobalState | Record<string, unknown>) {
  const conflicts = [];
  if (state?.risk?.level === 'high' && state?.opportunity?.signal === 'strong') {
    conflicts.push('Prioridade conflito: risco alto vs oportunidade forte');
    emitEvent('ai:strategic-conflict-detected', { conflicts }, { source: 'strategicEngine', priority: 7 });
  }
  return conflicts;
}

