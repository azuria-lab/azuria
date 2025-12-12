import { emitEvent } from '../core/eventBus';
import { userModel } from '../core/userModel';

type EmotionalSignal = 'frustrated' | 'confused' | 'rushed' | 'discovering' | 'neutral';

function detectSignal(payload: any): EmotionalSignal {
  const meta = payload?.metadata || {};
  if (meta.errors || meta.repeatClicks || meta.undo) {return 'frustrated';}
  if (meta.longHover || meta.helpRequested) {return 'confused';}
  if (meta.fastInputs || meta.shortSessions) {return 'rushed';}
  if (meta.exploring || meta.newFeature) {return 'discovering';}
  return 'neutral';
}

function adaptTone(state: EmotionalSignal) {
  if (state === 'frustrated') {return 'calm';}
  if (state === 'confused') {return 'clear';}
  if (state === 'rushed') {return 'concise';}
  if (state === 'discovering') {return 'enthusiastic';}
  return 'neutral';
}

function buildMessage(state: EmotionalSignal) {
  switch (state) {
    case 'frustrated':
      return 'Percebemos dificuldade. Quer ajuda passo a passo?';
    case 'confused':
      return 'Posso explicar rapidamente ou abrir a documentação curta.';
    case 'rushed':
      return 'Tudo pronto em poucos cliques. Quer um atalho rápido?';
    case 'discovering':
      return 'Legal explorar! Quer ver exemplos e dicas rápidas?';
    default:
      return 'Estou aqui para ajudar quando precisar.';
  }
}

export function processSocialPresence(event: any) {
  const state = detectSignal(event.payload);
  userModel.emotionalState = state === 'neutral' ? 'neutral' : state;
  userModel.lastUpdated = Date.now();

  emitEvent(
    'ui:emotion-updated',
    { emotionalState: state, tone: adaptTone(state), message: buildMessage(state) },
    { source: 'socialPresenceEngine', priority: 5 }
  );
}

export function getPresenceStatus() {
  return {
    emotionalState: userModel.emotionalState,
    tone: adaptTone(userModel.emotionalState as EmotionalSignal),
  };
}

