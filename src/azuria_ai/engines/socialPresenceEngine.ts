import { emitEvent } from '../core/eventBus';
import { userModel, type UserModel } from '../core/userModel';

// Tipo de sinal detectado internamente no engine
type InternalSignal =
  | 'frustrated'
  | 'confused'
  | 'rushed'
  | 'discovering'
  | 'neutral';

// Tipo compatível com userModel.emotionalState
type UserEmotionalState = UserModel['emotionalState'];

// Mapeamento de sinais internos para estados do userModel
function mapToUserState(signal: InternalSignal): UserEmotionalState {
  switch (signal) {
    case 'frustrated':
      return 'frustrated';
    case 'confused':
      return 'confused';
    case 'rushed':
      return 'rushed';
    case 'discovering':
      return 'engaged'; // discovering → engaged
    case 'neutral':
    default:
      return 'neutral';
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function detectSignal(payload: any): InternalSignal {
  const meta = payload?.metadata || {};
  if (meta.errors || meta.repeatClicks || meta.undo) {
    return 'frustrated';
  }
  if (meta.longHover || meta.helpRequested) {
    return 'confused';
  }
  if (meta.fastInputs || meta.shortSessions) {
    return 'rushed';
  }
  if (meta.exploring || meta.newFeature) {
    return 'discovering';
  }
  return 'neutral';
}

function adaptTone(state: InternalSignal) {
  if (state === 'frustrated') {
    return 'calm';
  }
  if (state === 'confused') {
    return 'clear';
  }
  if (state === 'rushed') {
    return 'concise';
  }
  if (state === 'discovering') {
    return 'enthusiastic';
  }
  return 'neutral';
}

function buildMessage(state: InternalSignal) {
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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function processSocialPresence(event: any) {
  const signal = detectSignal(event.payload);
  userModel.emotionalState = mapToUserState(signal);
  userModel.lastUpdated = Date.now();

  emitEvent(
    'ui:emotion-updated',
    {
      emotionalState: signal,
      tone: adaptTone(signal),
      message: buildMessage(signal),
    },
    { source: 'socialPresenceEngine', priority: 5 }
  );
}

export function getPresenceStatus() {
  const emotionalState = userModel.emotionalState;
  // Map back para InternalSignal para adaptTone
  const internalSignal: InternalSignal =
    emotionalState === 'engaged'
      ? 'discovering'
      : emotionalState === 'focused'
      ? 'neutral'
      : (emotionalState as InternalSignal);

  return {
    emotionalState,
    tone: adaptTone(internalSignal),
  };
}
