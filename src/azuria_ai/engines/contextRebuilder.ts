import { emitEvent } from '../core/eventBus';

export function rebuildContext(sample: any) {
  const reconstructedState = {
    inferredLoad: sample?.eventFrequency > 5 ? 'high' : 'normal',
    inferredStability: sample?.avgLatency > 150 ? 'low' : 'good',
  };
  const confidence = Math.max(0.3, Math.min(0.9, 1 - (sample?.avgLatency || 0) / 400));
  const missingSignals = sample?.silentComponents || [];
  const anomalies = sample?.logAnomalies || [];

  const payload = { reconstructedState, confidence, missingSignals, anomalies };
  emitEvent('ai:context-reconstructed', payload, { source: 'contextRebuilder', priority: 6 });
  return payload;
}

