import { type AzuriaEvent, emitEvent, on } from './eventBus';
import {
  computeUnifiedInference,
  generateUnifiedRecommendation,
  getGlobalState,
  harmonizeConflicts,
  routeEvent,
  runCoherenceCheck,
  runSafeActionPipeline,
  runSelfEvolutionStep,
  synchronizeTemporalConsistency,
  updateGlobalState,
} from '../engines/integratedCoreEngine';
import { validateRecommendation } from '../engines/consciousOrchestrator';

const LISTEN_EVENTS: Array<AzuriaEvent['tipo']> = [
  'calc:updated',
  'calc:completed',
  'ai:predictive-insight',
  'ai:trend-detected',
  'ai:future-state-predicted',
  'ai:temporal-anomaly',
  'ai:emotion-inferred',
  'ai:user-profile-updated',
  'ai:signal-quality',
  'ai:evolution-score-updated',
  'ai:consistency-warning',
  'ai:internal-drift',
  'ai:core-sync',
];

export function initializeIntegratedOrchestrator() {
  LISTEN_EVENTS.forEach(tipo => {
    on(tipo, handleEvent);
  });
}

function handleEvent(event: AzuriaEvent) {
  routeEvent(event);

  const merged = getGlobalState();
  // Update some slices if present
  if (event.tipo === 'ai:signal-quality') {
    updateGlobalState({
      operational: {
        ...(merged.operational || {}),
        signalQuality: event.payload?.signalQuality,
      },
    });
  }
  if (event.tipo === 'ai:evolution-score-updated') {
    updateGlobalState({
      evolution: {
        ...(merged.evolution || {}),
        evolutionScore: event.payload?.evolutionScore,
      },
    });
  }
  if (
    event.tipo === 'ai:trend-detected' ||
    event.tipo === 'ai:future-state-predicted'
  ) {
    updateGlobalState({
      temporal: {
        ...(merged.temporal || {}),
        trend: event.payload?.trend,
        expected: event.payload?.expected,
      },
    });
  }

  computeUnifiedInference();
  generateUnifiedRecommendation();
  synchronizeTemporalConsistency();
  harmonizeConflicts();
  runSelfEvolutionStep();
  runCoherenceCheck(getGlobalState() as unknown as Record<string, unknown>);

  emitUnifiedInsight();
}

function emitUnifiedInsight() {
  const state = getGlobalState();
  const validated = validateRecommendation({
    type: 'insight',
    severity: 'medium',
    message: state.lastRecommendation || 'Recomendação unificada pronta.',
    values: {
      confidence: state.confidence,
      health: state.healthScore,
    },
    sourceModule: 'integratedCoreEngine',
  });

  const actionResult = runSafeActionPipeline(
    { type: 'recommendation', message: validated.message },
    { intent: 'unified-recommendation' }
  );

  emitEvent(
    'insight:generated',
    actionResult.allowed
      ? validated
      : {
          ...validated,
          severity: 'high',
          message:
            'Ação bloqueada: ' +
            ((actionResult.decision as { reason?: string })?.reason ||
              validated.message),
        },
    { source: 'integratedOrchestrator', priority: 5 }
  );
}
