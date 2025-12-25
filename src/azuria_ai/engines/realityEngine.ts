import { emitEvent } from '../core/eventBus';

interface RealityState {
  context: Record<string, unknown>;
  forces: Record<string, unknown>;
  confidence: number;
}

const realityState: RealityState = {
  context: {},
  forces: {},
  confidence: 0.6,
};

function clamp(v: number, min = 0, max = 1) {
  return Math.max(min, Math.min(max, v));
}

export function captureContext(context: Record<string, unknown> = {}) {
  realityState.context = { ...realityState.context, ...context };
  return realityState.context;
}

export function inferState() {
  const inferred = {
    userBehavior: realityState.context?.userBehavior || 'estável',
    pricingRisk: realityState.context?.pricingRisk || 'moderado',
  };
  realityState.context.inferred = inferred;
  return inferred;
}

export function predictExternalForces(data: Record<string, unknown> = {}) {
  const forces = {
    competition: data.competition || 'médio',
    seasonality: data.seasonality || 'neutro',
    marketRisk: data.marketRisk || 'baixo',
  };
  realityState.forces = forces;
  return forces;
}

export function updateRealityModel(payload: Record<string, unknown> = {}) {
  captureContext(payload.context || {});
  inferState();
  predictExternalForces(payload.forces || {});
  const confidence = clamp(0.5 + Object.keys(realityState.context).length * 0.02);
  realityState.confidence = confidence;
  emitEvent(
    'ai:reality-updated',
    { context: realityState.context, forces: realityState.forces, confidence },
    { source: 'realityEngine', priority: 6 }
  );
  return realityState;
}

