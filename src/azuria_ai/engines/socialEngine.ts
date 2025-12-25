import { emitEvent } from '../core/eventBus';
import { updateUsagePattern, type UserModel, userModel } from '../core/userModel';

interface SocialEventPayload {
  tipo?: string;
  action?: string;
  timestamp?: number;
  metadata?: Record<string, unknown>;
  context?: Record<string, unknown>;
}

function clamp(val: number, min = 0, max = 1) {
  return Math.max(min, Math.min(max, val));
}

function inferEmotionScore(event: SocialEventPayload) {
  const meta = event.metadata || {};
  let score = 0.5;

  if (meta.hesitation || meta.delays) {score -= 0.2;}
  if (meta.repeatClicks || meta.undo) {score -= 0.15;}
  if (meta.fastInputs) {score += 0.1;}
  if (meta.abandon) {score -= 0.25;}
  if (meta.successiveActions) {score += 0.1;}

  return clamp(score);
}

function mapEmotion(score: number): UserModel['emotionalState'] {
  if (score <= 0.25) {return 'frustrated';}
  if (score <= 0.4) {return 'confused';}
  if (score >= 0.75) {return 'engaged';}
  if (score >= 0.6) {return 'focused';}
  if (score >= 0.45) {return 'rushed';}
  return 'neutral';
}

function adjustSkill(meta: Record<string, unknown>) {
  if (meta.advancedFlows) {userModel.skillLevel = 'advanced';}
  if (meta.requiresHelp) {userModel.skillLevel = 'beginner';}
}

function adjustRisk(meta: Record<string, unknown>) {
  if (meta.riskAverse) {userModel.riskTolerance = 'low';}
  if (meta.aggressivePricing) {userModel.riskTolerance = 'high';}
}

function adjustPace(meta: Record<string, unknown>) {
  if (meta.slowInputs) {userModel.preferredPace = 'slow';}
  if (meta.fastInputs) {userModel.preferredPace = 'fast';}
}

function emitProfileUpdated() {
  emitEvent('ai:user-profile-updated', { userModel }, { source: 'socialEngine', priority: 4 });
}

export function updateUserModel(event: SocialEventPayload) {
  const key = event.tipo || event.action || 'interaction';
  updateUsagePattern(key);
  adjustSkill(event.metadata || {});
  adjustRisk(event.metadata || {});
  adjustPace(event.metadata || {});
  userModel.lastUpdated = Date.now();
  emitProfileUpdated();
}

export function inferEmotion(event: SocialEventPayload) {
  const score = inferEmotionScore(event);
  const emotionalState = mapEmotion(score);
  userModel.emotionalState = emotionalState;
  userModel.lastUpdated = Date.now();
  emitEvent(
    'ai:emotion-inferred',
    { emotionalState, score },
    { source: 'socialEngine', priority: 5 }
  );
  emitProfileUpdated();
  return emotionalState;
}

export function inferIntent(event: SocialEventPayload) {
  const intent =
    event.tipo === 'calc:updated'
      ? 'refinar_calculo'
      : event.tipo === 'calc:completed'
        ? 'finalizar_calculo'
        : 'navegar';

  emitEvent(
    'ai:user-intent-inferred',
    { intent, context: event.context },
    { source: 'socialEngine', priority: 4 }
  );
  return intent;
}

export function classifyUserProfile() {
  const profile = {
    emotionalState: userModel.emotionalState,
    skillLevel: userModel.skillLevel,
    riskTolerance: userModel.riskTolerance,
    preferredPace: userModel.preferredPace,
  };
  emitEvent(
    'ai:user-profile-updated',
    { userModel: profile },
    { source: 'socialEngine', priority: 3 }
  );
  return profile;
}

export function adaptInterface() {
  const adaptation = {
    showAdvanced: userModel.skillLevel === 'advanced',
    conciseMode: userModel.preferredPace === 'fast',
    detailedExplanations: userModel.skillLevel === 'beginner' || userModel.emotionalState === 'confused',
    tone:
      userModel.emotionalState === 'frustrated'
        ? 'calm'
        : userModel.emotionalState === 'rushed'
          ? 'concise'
          : 'neutral',
  };

  emitEvent(
    'ui:adaptive-interface-changed',
    { adaptation, userModel },
    { source: 'socialEngine', priority: 4 }
  );

  return adaptation;
}

