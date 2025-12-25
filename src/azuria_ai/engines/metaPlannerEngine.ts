import { emitEvent } from '../core/eventBus';

export interface PlannerGoal {
  id: string;
  objective: string;
  targetMetric?: string;
  targetValue?: number;
}

export interface PlannerPlan {
  goalId: string;
  steps: string[];
  parameters: Record<string, unknown>;
  status: 'generated' | 'executing' | 'completed' | 'adjusted';
  score?: number;
}

let currentGoal: PlannerGoal | null = null;
let currentPlan: PlannerPlan | null = null;

export function setGoal(goal: PlannerGoal) {
  currentGoal = goal;
  emitEvent(
    'ai:planner-goal-evaluated',
    { goal },
    { source: 'metaPlannerEngine', priority: 4 }
  );
}

export function generatePlan(goal: PlannerGoal): PlannerPlan {
  const plan: PlannerPlan = {
    goalId: goal.id,
    steps: ['coletar_métricas', 'ajustar_pesos', 'monitorar_resultados'],
    parameters: {
      sensibilidade: 0.5,
      janelaMonitoramento: 20,
    },
    status: 'generated',
  };
  currentPlan = plan;
  emitEvent(
    'ai:planner-plan-generated',
    { plan },
    { source: 'metaPlannerEngine', priority: 4 }
  );
  return plan;
}

export function executePlan() {
  if (!currentPlan) {return;}
  currentPlan.status = 'executing';
  emitEvent(
    'ai:planner-plan-executed',
    { plan: currentPlan },
    { source: 'metaPlannerEngine', priority: 4 }
  );
}

export function adjustPlan(feedbackScore: number) {
  if (!currentPlan) {return;}
  currentPlan.status = 'adjusted';
  currentPlan.parameters.sensibilidade = Math.min(
    1,
    Math.max(0, currentPlan.parameters.sensibilidade + (feedbackScore - 0.5) * 0.2)
  );
  emitEvent(
    'ai:planner-plan-adjusted',
    { plan: currentPlan, feedbackScore },
    { source: 'metaPlannerEngine', priority: 4 }
  );
}

export function getCurrentPlan() {
  return currentPlan;
}

