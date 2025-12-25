import { emitEvent } from '../core/eventBus';

type MindState = {
  globalState: Record<string, unknown>;
  confidenceMap: Record<string, number>;
  anomalies: string[];
  healthScore: number;
};

const mindState: MindState = {
  globalState: {},
  confidenceMap: {},
  anomalies: [],
  healthScore: 0.75,
};

function clamp(v: number, min = 0, max = 1) {
  return Math.max(min, Math.min(max, v));
}

export function computeGlobalState(sources: Record<string, unknown> = {}) {
  mindState.globalState = { ...mindState.globalState, ...sources };
  mindState.healthScore = clamp(0.6 + Object.keys(sources).length * 0.02);
  emitGlobalMindSnapshot();
  return mindState.globalState;
}

interface Signal {
  conflict?: boolean;
  [key: string]: unknown;
}

export function harmonizeSignals(signals: Record<string, Signal | unknown> = {}) {
  const conflicts = Object.values(signals).filter((s): s is Signal => typeof s === 'object' && s !== null && 'conflict' in s && s.conflict === true).length;
  mindState.healthScore = clamp(mindState.healthScore - conflicts * 0.05);
  emitGlobalMindSnapshot();
  return { conflicts };
}

interface AnomalyInput {
  health?: number;
  [key: string]: unknown;
}

export function detectInternalAnomalies(inputs: Record<string, AnomalyInput | unknown> = {}) {
  const anomalies: string[] = [];
  Object.entries(inputs).forEach(([k, v]) => {
    if (v && v.health && v.health < 0.3) {anomalies.push(`low-health:${k}`);}
  });
  mindState.anomalies = anomalies;
  if (anomalies.length > 0) {
    emitEvent('ai:mind-warning', { anomalies }, { source: 'systemMindEngine', priority: 8 });
  }
  emitGlobalMindSnapshot();
  return anomalies;
}

export function rankEngineConfidence(confidenceMap: Record<string, number> = {}) {
  mindState.confidenceMap = confidenceMap;
  const avg = Object.values(confidenceMap).reduce((a, b) => a + b, 0) / (Object.keys(confidenceMap).length || 1);
  mindState.healthScore = clamp((mindState.healthScore + avg) / 2);
  emitGlobalMindSnapshot();
  return confidenceMap;
}

export function emitGlobalMindSnapshot() {
  emitEvent(
    'ai:mind-snapshot',
    { state: mindState.globalState, confidenceMap: mindState.confidenceMap, anomalies: mindState.anomalies, healthScore: mindState.healthScore },
    { source: 'systemMindEngine', priority: 7 }
  );
}

export function resetMindState() {
  mindState.globalState = {};
  mindState.confidenceMap = {};
  mindState.anomalies = [];
  mindState.healthScore = 0.75;
  emitGlobalMindSnapshot();
}

