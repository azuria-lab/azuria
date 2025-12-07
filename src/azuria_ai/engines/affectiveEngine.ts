import { emitEvent } from '../core/eventBus';
import { emotionProfiles } from './emotionProfiles';
import { speak, adaptToneProfileFromPersona, rewriteWithBrandVoice } from './brandVoiceEngine';
import { createMicroStory } from './storytellingEngine';

export type EmotionType = 'frustration' | 'confidence' | 'confusion' | 'achievement' | 'hesitation' | 'encouraged';

interface EmotionState {
  type: EmotionType | null;
  confidence: number;
  lastMessage?: string;
}

const state: EmotionState = {
  type: null,
  confidence: 0,
};

function setEmotion(type: EmotionType, confidence: number, meta?: any) {
  state.type = type;
  state.confidence = confidence;
  emitEvent('ai:emotion-detected', { emotion: type, confidence, meta }, { source: 'affectiveEngine', priority: 6 });
  switch (type) {
    case 'frustration':
      emitEvent('ai:user-frustrated', { confidence }, { source: 'affectiveEngine', priority: 7 });
      break;
    case 'confidence':
      emitEvent('ai:user-confident', { confidence }, { source: 'affectiveEngine', priority: 6 });
      break;
    case 'confusion':
      emitEvent('ai:user-confused', { confidence }, { source: 'affectiveEngine', priority: 7 });
      break;
    case 'hesitation':
      emitEvent('ai:user-hesitant', { confidence }, { source: 'affectiveEngine', priority: 6 });
      break;
    case 'achievement':
      emitEvent('ai:user-encouraged', { confidence }, { source: 'affectiveEngine', priority: 5 });
      break;
    default:
      break;
  }
}

function patternConfidence(pattern?: any) {
  if (!pattern) return 0.35;
  const score =
    (pattern.repetitions ? Math.min(pattern.repetitions / 5, 0.4) : 0) +
    (pattern.abandonments ? Math.min(pattern.abandonments / 3, 0.3) : 0) +
    (pattern.revisions ? Math.min(pattern.revisions / 4, 0.2) : 0);
  return Math.min(1, 0.3 + score);
}

export function inferUserEmotion(userState: any, event: any) {
  const pattern = event?.payload?.pattern || event?.payload;
  if (pattern?.frustrationSignals) return detectFrustration(pattern);
  if (pattern?.confusionSignals) return detectConfusion(pattern);
  if (pattern?.confidenceSignals) return detectConfidence(pattern);
  if (pattern?.hesitationSignals) return detectHesitation(pattern);
  if (pattern?.achievementSignals) return detectAchievement(pattern);
  // fallback: based on usage speed or pauses
  if (pattern?.pausesMs > 15000) return detectHesitation({ pauses: pattern.pausesMs });
  return { emotion: state.type, confidence: state.confidence };
}

export function detectFrustration(pattern: any) {
  const confidence = patternConfidence(pattern);
  setEmotion('frustration', confidence, pattern);
  return { emotion: 'frustration', confidence };
}

export function detectConfidence(pattern: any) {
  const confidence = Math.min(1, 0.5 + (pattern?.successes || 0) * 0.1);
  setEmotion('confidence', confidence, pattern);
  return { emotion: 'confidence', confidence };
}

export function detectConfusion(pattern: any) {
  const confidence = Math.min(1, 0.4 + (pattern?.undoActions || 0) * 0.1);
  setEmotion('confusion', confidence, pattern);
  return { emotion: 'confusion', confidence };
}

export function detectAchievement(pattern: any) {
  const confidence = Math.min(1, 0.5 + (pattern?.achievements || 1) * 0.1);
  setEmotion('achievement', confidence, pattern);
  return { emotion: 'achievement', confidence };
}

export function detectHesitation(pattern: any) {
  const confidence = Math.min(1, 0.35 + (pattern?.pauses || 1) * 0.05);
  setEmotion('hesitation', confidence, pattern);
  return { emotion: 'hesitation', confidence };
}

function craftResponse(text: string, tone: string, persona?: string) {
  const toneProfile = persona ? adaptToneProfileFromPersona(persona as any) : (tone as any);
  const spoken = speak(text, toneProfile as any, { personaSignals: persona });
  state.lastMessage = spoken.message;
  emitEvent('ai:affective-response', { message: spoken.message, tone: spoken.tone, persona: spoken.persona }, { source: 'affectiveEngine', priority: 5 });
  createMicroStory({ message: spoken.message, tone: spoken.tone });
  return spoken.message;
}

export function respondWithEmpathy(context?: any) {
  const text = 'Vamos simplificar este cálculo juntos.';
  return craftResponse(text, 'educativo', context?.persona);
}

export function respondWithConfidenceBoost(context?: any) {
  const text = 'Boa escolha — você está no rumo certo.';
  return craftResponse(text, 'estrategico', context?.persona);
}

export function respondWithReassurance(context?: any) {
  const text = 'Estamos ajustando tudo com segurança. Conte comigo.';
  return craftResponse(text, 'educativo', context?.persona);
}

export function respondWithEncouragement(context?: any) {
  const text = 'Está indo bem — vamos concluir este passo agora.';
  return craftResponse(text, 'motivador', context?.persona);
}

export function respondWithSimplification(context?: any) {
  const text = 'Posso mostrar a versão resumida. Quer tentar?';
  return craftResponse(text, 'educativo', context?.persona);
}

export function getEmotionState() {
  return { ...state };
}

