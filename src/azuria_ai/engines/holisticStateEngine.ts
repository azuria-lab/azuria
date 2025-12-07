import { emitEvent } from '../core/eventBus';

export function scanWholeSystem(state: any) {
  const snapshot = generateHolisticSnapshot(state);
  emitEvent('ai:system-health-updated', { health: snapshot.health }, { source: 'holisticStateEngine', priority: 5 });
  return snapshot;
}

export function computeSystemHealth(state: any) {
  const health =
    0.7 -
    (state?.consistency?.drift ? 0.1 : 0) -
    (state?.operational?.load || 0) * 0.1 +
    (state?.evolution?.evolutionScore || 0) * 0.1;
  return Math.max(0, Math.min(1, health));
}

export function detectWeakSpots(state: any): string[] {
  const weak: string[] = [];
  if (state?.temporal?.trend === 'decline') weak.push('Tendência de queda detectada');
  if ((state?.operational?.load || 0) > 0.8) weak.push('Sobrecarga operacional');
  return weak;
}

export function mapInterdependencies() {
  return ['core -> orchestrator -> agents', 'temporal -> strategic -> planner'];
}

export function generateHolisticSnapshot(state: any) {
  return {
    health: computeSystemHealth(state),
    weakSpots: detectWeakSpots(state),
    interdependencies: mapInterdependencies(),
  };
}

