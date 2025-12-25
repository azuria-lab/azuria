import { type AzuriaEvent, emitEvent } from '../core/eventBus';
import { adaptToneProfileFromPersona, type PersonaKey, speak, type ToneProfileKey } from './brandVoiceEngine';
import { createMicroStory } from './storytellingEngine';

// Type guard para verificar se é EmotionPattern
function isEmotionPattern(obj: unknown): obj is EmotionPattern {
  if (typeof obj !== 'object' || obj === null) {
    return false;
  }
  const candidate = obj as Record<string, unknown>;
  return (
    typeof candidate.repetitions === 'number' ||
    typeof candidate.abandonments === 'number' ||
    typeof candidate.revisions === 'number' ||
    typeof candidate.frustrationSignals === 'boolean' ||
    typeof candidate.confusionSignals === 'boolean' ||
    typeof candidate.confidenceSignals === 'boolean' ||
    typeof candidate.hesitationSignals === 'boolean' ||
    typeof candidate.achievementSignals === 'boolean' ||
    typeof candidate.successes === 'number' ||
    typeof candidate.undoActions === 'number' ||
    typeof candidate.achievements === 'number' ||
    typeof candidate.pauses === 'number' ||
    typeof candidate.pausesMs === 'number'
  );
}

export type EmotionType = 'frustration' | 'confidence' | 'confusion' | 'achievement' | 'hesitation' | 'encouraged';

interface EmotionState {
  type: EmotionType | null;
  confidence: number;
  lastMessage?: string;
}

interface EmotionPattern {
  repetitions?: number;
  abandonments?: number;
  revisions?: number;
  frustrationSignals?: boolean;
  confusionSignals?: boolean;
  confidenceSignals?: boolean;
  hesitationSignals?: boolean;
  achievementSignals?: boolean;
  successes?: number;
  undoActions?: number;
  achievements?: number;
  pauses?: number;
  pausesMs?: number;
}

interface UserState {
  motivationLevel?: number;
  persona?: string;
  skillLevel?: string;
  [key: string]: unknown;
}

interface ResponseContext {
  persona?: PersonaKey;
  [key: string]: unknown;
}

const state: EmotionState = {
  type: null,
  confidence: 0,
};

function setEmotion(type: EmotionType, confidence: number, meta?: Record<string, unknown>) {
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

function patternConfidence(pattern?: EmotionPattern) {
  if (!pattern) {return 0.35;}
  const score =
    (pattern.repetitions ? Math.min(pattern.repetitions / 5, 0.4) : 0) +
    (pattern.abandonments ? Math.min(pattern.abandonments / 3, 0.3) : 0) +
    (pattern.revisions ? Math.min(pattern.revisions / 4, 0.2) : 0);
  return Math.min(1, 0.3 + score);
}

export function inferUserEmotion(
  userState: UserState | undefined, 
  event: AzuriaEvent | { payload?: EmotionPattern | Record<string, unknown> }
): { emotion: EmotionType | null; confidence: number } {
  const payload = event?.payload;
  if (!payload) {
    return { emotion: state.type, confidence: state.confidence };
  }

  // Extrair pattern do payload
  let pattern: EmotionPattern | undefined;
  
  if (isEmotionPattern(payload)) {
    pattern = payload;
  } else if (
    typeof payload === 'object' && 
    payload !== null && 
    'pattern' in payload
  ) {
    const payloadObj = payload as Record<string, unknown>;
    const patternValue = payloadObj.pattern;
    if (isEmotionPattern(patternValue)) {
      pattern = patternValue;
    }
  }

  if (!pattern) {
    return { emotion: state.type, confidence: state.confidence };
  }

  if (pattern.frustrationSignals) {return detectFrustration(pattern);}
  if (pattern.confusionSignals) {return detectConfusion(pattern);}
  if (pattern.confidenceSignals) {return detectConfidence(pattern);}
  if (pattern.hesitationSignals) {return detectHesitation(pattern);}
  if (pattern.achievementSignals) {return detectAchievement(pattern);}
  // fallback: based on usage speed or pauses
  if (typeof pattern.pausesMs === 'number' && pattern.pausesMs > 15000) {
    return detectHesitation({ pauses: pattern.pausesMs });
  }
  return { emotion: state.type, confidence: state.confidence };
}

export function detectFrustration(pattern: EmotionPattern): { emotion: EmotionType; confidence: number } {
  const confidence = patternConfidence(pattern);
  setEmotion('frustration', confidence, pattern as Record<string, unknown>);
  return { emotion: 'frustration' as const, confidence };
}

export function detectConfidence(pattern: EmotionPattern): { emotion: EmotionType; confidence: number } {
  const confidence = Math.min(1, 0.5 + (pattern?.successes || 0) * 0.1);
  setEmotion('confidence', confidence, pattern as Record<string, unknown>);
  return { emotion: 'confidence' as const, confidence };
}

export function detectConfusion(pattern: EmotionPattern): { emotion: EmotionType; confidence: number } {
  const confidence = Math.min(1, 0.4 + (pattern?.undoActions || 0) * 0.1);
  setEmotion('confusion', confidence, pattern as Record<string, unknown>);
  return { emotion: 'confusion' as const, confidence };
}

export function detectAchievement(pattern: EmotionPattern): { emotion: EmotionType; confidence: number } {
  const confidence = Math.min(1, 0.5 + (pattern?.achievements || 1) * 0.1);
  setEmotion('achievement', confidence, pattern as Record<string, unknown>);
  return { emotion: 'achievement' as const, confidence };
}

export function detectHesitation(pattern: EmotionPattern): { emotion: EmotionType; confidence: number } {
  const confidence = Math.min(1, 0.35 + (pattern?.pauses || 1) * 0.05);
  setEmotion('hesitation', confidence, pattern as Record<string, unknown>);
  return { emotion: 'hesitation' as const, confidence };
}

function craftResponse(text: string, tone: string, persona?: PersonaKey) {
  const toneProfile = persona ? adaptToneProfileFromPersona(persona) : (tone as ToneProfileKey);
  const spoken = speak(text, toneProfile, persona ? { personaSignals: {} } : undefined);
  state.lastMessage = spoken.message;
  emitEvent('ai:affective-response', { message: spoken.message, tone: spoken.tone, persona: spoken.persona }, { source: 'affectiveEngine', priority: 5 });
  createMicroStory({ message: spoken.message, tone: spoken.tone });
  return spoken.message;
}

export function respondWithEmpathy(context?: ResponseContext) {
  const text = 'Vamos simplificar este cálculo juntos.';
  return craftResponse(text, 'educativo', context?.persona);
}

export function respondWithConfidenceBoost(context?: ResponseContext) {
  const text = 'Boa escolha — você está no rumo certo.';
  return craftResponse(text, 'estrategico', context?.persona);
}

export function respondWithReassurance(context?: ResponseContext) {
  const text = 'Estamos ajustando tudo com segurança. Conte comigo.';
  return craftResponse(text, 'educativo', context?.persona);
}

export function respondWithEncouragement(context?: ResponseContext) {
  const text = 'Está indo bem — vamos concluir este passo agora.';
  return craftResponse(text, 'motivador', context?.persona);
}

export function respondWithSimplification(context?: ResponseContext) {
  const text = 'Posso mostrar a versão resumida. Quer tentar?';
  return craftResponse(text, 'educativo', context?.persona);
}

export function getEmotionState() {
  return { ...state };
}

