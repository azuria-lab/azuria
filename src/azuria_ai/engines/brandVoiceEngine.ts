import { emitEvent } from '../core/eventBus';
import { brandToneProfiles } from './brandToneProfiles';
import { personaProfiles } from './personaProfiles';

export type ToneProfileKey = keyof typeof brandToneProfiles;
export type PersonaKey = keyof typeof personaProfiles;

function sanitize(text: string, forbidEmojis?: boolean) {
  if (!forbidEmojis) {return text;}
  // remove caracteres fora do básico para evitar emoji
  return text.replaceAll(/[\u{1F300}-\u{1FAFF}]/gu, '');
}

export function getToneProfileForUser(userState?: any): ToneProfileKey {
  if (!userState) {return 'padrao';}
  if (userState?.motivationLevel && userState.motivationLevel < 0.4) {return 'motivador';}
  if (userState?.persona === 'operador-analitico') {return 'estrategico';}
  if (userState?.persona === 'comercial-agressivo') {return 'comercial';}
  if (userState?.skillLevel === 'beginner') {return 'educativo';}
  return 'padrao';
}

export function adaptPersona(userSignals?: any): PersonaKey {
  if (!userSignals) {return 'iniciante-inseguro';}
  if (userSignals?.advancedUsage) {return 'avancado-lucro';}
  if (userSignals?.commercialFocus) {return 'comercial-agressivo';}
  if (userSignals?.analyticBehavior) {return 'operador-analitico';}
  if (userSignals?.improving) {return 'intermediario-crescimento';}
  return 'iniciante-inseguro';
}

export function applyTone(text: string, toneProfile: ToneProfileKey = 'padrao') {
  const tone = brandToneProfiles[toneProfile] || brandToneProfiles.padrao;
  const refined = sanitize(`${text}`.trim(), tone.forbidEmojis);
  emitEvent('ai:tone-shift', { tone: toneProfile, refined }, { source: 'brandVoiceEngine', priority: 4 });
  return refined;
}

export function ensureConsistency(text: string) {
  const refined = sanitize(text, true);
  emitEvent('ai:communication-optimized', { text: refined }, { source: 'brandVoiceEngine', priority: 3 });
  return refined;
}

export function rewriteWithBrandVoice(text: string, toneProfile: ToneProfileKey = 'padrao') {
  const refined = applyTone(text, toneProfile);
  emitEvent('ai:brand-voice-applied', { refined, tone: toneProfile }, { source: 'brandVoiceEngine', priority: 5 });
  return refined;
}

export function speak(message: string, toneProfile: ToneProfileKey = 'padrao', context?: any) {
  const tone = toneProfile || getToneProfileForUser(context?.user);
  const refined = rewriteWithBrandVoice(message, tone);
  const persona = adaptPersona(context?.personaSignals);
  emitEvent('ai:persona-adapted', { persona }, { source: 'brandVoiceEngine', priority: 4 });
  return {
    message: refined,
    tone,
    persona,
  };
}

export function summarizeInBrandTone(text: string, toneProfile: ToneProfileKey = 'padrao') {
  const refined = rewriteWithBrandVoice(`Resumo: ${text}`, toneProfile);
  return refined;
}

export function explainInBrandTone(insight: { message: string; reason?: string }, toneProfile: ToneProfileKey = 'padrao') {
  const reason = insight.reason ? ` Motivo: ${insight.reason}` : '';
  return rewriteWithBrandVoice(`${insight.message}${reason}`, toneProfile);
}

export function adaptToneProfileFromPersona(persona: PersonaKey): ToneProfileKey {
  return personaProfiles[persona]?.tone as ToneProfileKey || 'padrao';
}

