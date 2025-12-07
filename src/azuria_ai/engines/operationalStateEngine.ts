import { emitEvent } from '../core/eventBus';

export interface OperationalState {
  load: number;
  signalQuality: number;
  predictionTemperature: number;
  recentErrors: number;
  globalConfidence: number;
  userMood: string;
  sessionStability: number;
}

const state: OperationalState = {
  load: 0.3,
  signalQuality: 0.8,
  predictionTemperature: 0.5,
  recentErrors: 0,
  globalConfidence: 0.7,
  userMood: 'neutral',
  sessionStability: 0.9,
};

function clamp(val: number, min = 0, max = 1) {
  return Math.max(min, Math.min(max, val));
}

export function updateState(partial: Partial<OperationalState>) {
  Object.assign(state, partial);
  state.load = clamp(state.load);
  state.signalQuality = clamp(state.signalQuality);
  state.predictionTemperature = clamp(state.predictionTemperature);
  state.globalConfidence = clamp(state.globalConfidence);
  state.sessionStability = clamp(state.sessionStability);

  emitEvent('ai:state-changed', { state }, { source: 'operationalStateEngine', priority: 3 });
  emitEvent('ai:signal-quality', { signalQuality: state.signalQuality }, { source: 'operationalStateEngine', priority: 3 });
  emitEvent('ai:model-confidence', { confidence: state.globalConfidence }, { source: 'operationalStateEngine', priority: 3 });

  if (state.sessionStability < 0.5 || state.signalQuality < 0.4) {
    emitEvent('ai:internal-drift', { state }, { source: 'operationalStateEngine', priority: 6 });
  }
}

export function registerError() {
  state.recentErrors += 1;
  updateState({ recentErrors: state.recentErrors, globalConfidence: state.globalConfidence - 0.05 });
}

export function setUserMood(mood: string) {
  state.userMood = mood;
  updateState({ userMood: mood });
}

export function getOperationalState(): OperationalState {
  return { ...state };
}

