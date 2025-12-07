import { emitEvent } from '../core/eventBus';
import { speak } from './brandVoiceEngine';

export interface EngagementState {
  streak: number;
  lastActive: number;
  motivationLevel: number; // 0-1
  achievements: number;
  recommendedNextAction?: string;
}

const state: EngagementState = {
  streak: 0,
  lastActive: Date.now(),
  motivationLevel: 0.6,
  achievements: 0,
};

function clamp(v: number, min = 0, max = 1) {
  return Math.max(min, Math.min(max, v));
}

export function detectMotivation(activityScore: number) {
  state.motivationLevel = clamp(0.5 + activityScore * 0.3, 0, 1);
  emitEvent('ai:user-motivation-level', { motivationLevel: state.motivationLevel }, { source: 'engagementEngine', priority: 5 });
}

export function detectUsageDrop(now = Date.now()) {
  const diff = now - state.lastActive;
  if (diff > 1000 * 60 * 60 * 24) {
    emitEvent('ai:engagement-drop-detected', { inactiveHours: diff / 3600000 }, { source: 'engagementEngine', priority: 7 });
  }
}

export function analyzeStreak(progress: boolean) {
  if (progress) {
    state.streak += 1;
    state.achievements += 1;
    emitEvent('ai:achievement-unlocked', { streak: state.streak, achievements: state.achievements }, { source: 'engagementEngine', priority: 6 });
  } else {
    state.streak = Math.max(0, state.streak - 1);
  }
  emitEvent('ai:engagement-progress', { streak: state.streak }, { source: 'engagementEngine', priority: 5 });
}

export function computeRecommendedNextAction(context?: any) {
  const action = context?.intent === 'pricing' ? 'Revisar preços sugeridos' : 'Explorar insights de IA';
  state.recommendedNextAction = action;
  const spoken = speak(action, 'motivador', { user: context?.user, personaSignals: context?.persona });
  emitEvent(
    'ai:next-best-action',
    { action: spoken.message, brandTone: spoken.tone, persona: spoken.persona },
    { source: 'engagementEngine', priority: 5 }
  );
  return spoken.message;
}

export function getEngagementSnapshot(): EngagementState {
  return { ...state };
}

