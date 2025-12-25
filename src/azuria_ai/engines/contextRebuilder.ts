import { emitEvent } from '../core/eventBus';

interface ContextSample {
  eventFrequency?: number;
  avgLatency?: number;
  silentComponents?: string[];
  logAnomalies?: string[];
}

export function rebuildContext(sample: ContextSample | Record<string, unknown>) {
  const sampleData = sample as ContextSample;
  const eventFrequencyValue = sampleData?.eventFrequency;
  const avgLatencyValue = sampleData?.avgLatency;
  
  const reconstructedState = {
    inferredLoad: typeof eventFrequencyValue === 'number' && eventFrequencyValue > 5 ? 'high' : 'normal',
    inferredStability: typeof avgLatencyValue === 'number' && avgLatencyValue > 150 ? 'low' : 'good',
  };
  
  const avgLatency = typeof avgLatencyValue === 'number' ? avgLatencyValue : 0;
  const confidence = Math.max(0.3, Math.min(0.9, 1 - avgLatency / 400));
  const missingSignals = Array.isArray(sampleData?.silentComponents) ? sampleData.silentComponents : [];
  const anomalies = Array.isArray(sampleData?.logAnomalies) ? sampleData.logAnomalies : [];

  const payload = { reconstructedState, confidence, missingSignals, anomalies };
  emitEvent('ai:context-reconstructed', payload, { source: 'contextRebuilder', priority: 6 });
  return payload;
}

