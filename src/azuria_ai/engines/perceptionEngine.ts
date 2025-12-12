import { emitEvent } from '../core/eventBus';

interface SignalSample {
  eventFrequency: number;
  avgLatency: number;
  logAnomalies: string[];
  silentComponents: string[];
  contrastSignals: string[];
}

function simulateSensors(state: any): SignalSample {
  return {
    eventFrequency: Math.random() * 10,
    avgLatency: Math.random() * 200,
    logAnomalies: state?.logs?.anomalies || [],
    silentComponents: state?.silent || [],
    contrastSignals: state?.contrast || [],
  };
}

export function sampleSignals(state: any) {
  const sample = simulateSensors(state);
  emitEvent('ai:virtual-signal', { sample }, { source: 'perceptionEngine', priority: 5 });
  return sample;
}

export function reconstructState(sample?: SignalSample) {
  const reconstructedState = {
    health: sample?.eventFrequency > 5 ? 'busy' : 'normal',
    latencyRisk: sample?.avgLatency && sample.avgLatency > 150,
  };
  const confidence = sample ? Math.max(0.4, Math.min(0.9, 1 - (sample.avgLatency || 0) / 500)) : 0.5;
  const missingSignals = sample?.silentComponents || [];
  const anomalies = sample?.logAnomalies || [];
  const payload = { reconstructedState, confidence, missingSignals, anomalies };
  emitEvent('ai:context-reconstructed', payload, { source: 'perceptionEngine', priority: 6 });
  return payload;
}

export function estimateMissingData(sample?: SignalSample) {
  return {
    estimated: sample?.silentComponents?.reduce((acc, c) => ({ ...acc, [c]: 'estimated' }), {}) || {},
  };
}

export function detectSilentFailures(sample?: SignalSample) {
  if (sample?.silentComponents?.length) {
    emitEvent(
      'ai:silent-failure-detected',
      { components: sample.silentComponents },
      { source: 'perceptionEngine', priority: 7 }
    );
    return true;
  }
  return false;
}

export function predictBehaviorFromNoise(sample?: SignalSample) {
  if (!sample) {return null;}
  const noiseScore = (sample.contrastSignals?.length || 0) * 0.2;
  const behavior = noiseScore > 0.5 ? 'unstable' : 'stable';
  emitEvent(
    'ai:anomaly-behavior-detected',
    { noiseScore, behavior },
    { source: 'perceptionEngine', priority: 6 }
  );
  return { noiseScore, behavior };
}

