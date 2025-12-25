import { emitEvent } from '../core/eventBus';

interface SystemState {
  consistency?: {
    drift?: boolean;
    [key: string]: unknown;
  };
  operational?: {
    load?: number;
    [key: string]: unknown;
  };
  evolution?: {
    evolutionScore?: number;
    [key: string]: unknown;
  };
  temporal?: {
    trend?: string;
    [key: string]: unknown;
  };
  [key: string]: unknown;
}

export function scanWholeSystem(state: SystemState | Record<string, unknown>) {
  const snapshot = generateHolisticSnapshot(state);
  emitEvent('ai:system-health-updated', { health: snapshot.health }, { source: 'holisticStateEngine', priority: 5 });
  return snapshot;
}

export function computeSystemHealth(state: SystemState | Record<string, unknown>) {
  const stateData = state as SystemState;
  const health =
    0.7 -
    (stateData?.consistency?.drift ? 0.1 : 0) -
    (stateData?.operational?.load || 0) * 0.1 +
    (stateData?.evolution?.evolutionScore || 0) * 0.1;
  return Math.max(0, Math.min(1, health));
}

export function detectWeakSpots(state: SystemState | Record<string, unknown>): string[] {
  const stateData = state as SystemState;
  const weak: string[] = [];
  if (stateData?.temporal?.trend === 'decline') {weak.push('Tendência de queda detectada');}
  if ((stateData?.operational?.load || 0) > 0.8) {weak.push('Sobrecarga operacional');}
  return weak;
}

export function mapInterdependencies() {
  return ['core -> orchestrator -> agents', 'temporal -> strategic -> planner'];
}

export function generateHolisticSnapshot(state: SystemState | Record<string, unknown>) {
  return {
    health: computeSystemHealth(state),
    weakSpots: detectWeakSpots(state),
    interdependencies: mapInterdependencies(),
  };
}

