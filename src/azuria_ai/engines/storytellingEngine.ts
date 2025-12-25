import { emitEvent } from '../core/eventBus';
import { storyProfiles } from './storyProfiles';
import { adaptToneProfileFromPersona, getToneProfileForUser, type PersonaKey, rewriteWithBrandVoice, speak, type ToneProfileKey } from './brandVoiceEngine';

function pickProfile(userLevel: string) {
  return storyProfiles[userLevel as keyof typeof storyProfiles] || storyProfiles.iniciante;
}

interface StoryEvent {
  tipo?: string;
  payload?: Record<string, unknown>;
  [key: string]: unknown;
}

interface StoryState {
  userLevel?: string;
  [key: string]: unknown;
}

export function generateContextStory(event: StoryEvent | Record<string, unknown>, state: StoryState | Record<string, unknown>) {
  const stateData = state as StoryState;
  const eventData = event as StoryEvent;
  const userLevel = typeof stateData?.userLevel === 'string' ? stateData.userLevel : 'iniciante';
  const profile = pickProfile(userLevel);
  const eventTipo = typeof eventData?.tipo === 'string' ? eventData.tipo : 'evento';
  const raw = `(${profile.tone}) ${eventTipo} processado. Contexto: ${Object.keys(
    eventData?.payload || {}
  )
    .slice(0, 3)
    .join(', ')}`;
  const tone = getToneProfileForUser(stateData as { motivationLevel?: number; persona?: string; skillLevel?: string });
  const spoken = speak(raw, tone, { user: stateData as { motivationLevel?: number; persona?: string; skillLevel?: string } });
  emitEvent(
    'ai:story-generated',
    { story: spoken.message, profile: profile.tone, brandTone: spoken.tone, persona: spoken.persona },
    { source: 'storytellingEngine', priority: 5 }
  );
  return spoken.message;
}

interface Insight {
  action?: string;
  reason?: string;
  persona?: string;
  [key: string]: unknown;
}

export function explainInsight(insight: Insight | Record<string, unknown>) {
  const insightData = insight as Insight;
  const raw = `Sugerimos ${insightData?.action || 'essa ação'} porque observamos ${insightData?.reason || 'padrões recentes'}.`;
  const personaValue = insightData?.persona;
  const persona: PersonaKey = typeof personaValue === 'string' && ['iniciante-inseguro', 'intermediario-crescimento', 'avancado-lucro', 'comercial-agressivo', 'operador-analitico'].includes(personaValue) 
    ? personaValue as PersonaKey 
    : 'iniciante-inseguro';
  const tone = adaptToneProfileFromPersona(persona);
  const refined = rewriteWithBrandVoice(raw, tone);
  emitEvent('ai:story-clarified', { story: refined, brandTone: tone }, { source: 'storytellingEngine', priority: 5 });
  return refined;
}

export function educateUser(topic: string, level: 'iniciante' | 'intermediario' | 'avancado' = 'iniciante') {
  const profile = pickProfile(level);
  const text = `(${profile.style}) Aula rápida: ${topic}.`;
  const refined = rewriteWithBrandVoice(text, 'educativo');
  emitEvent('ai:story-educational', { story: refined, level, brandTone: 'educativo' }, { source: 'storytellingEngine', priority: 4 });
  return refined;
}

interface MicroStoryData {
  message?: string;
  tone?: string;
  [key: string]: unknown;
}

export function createMicroStory(data: MicroStoryData | Record<string, unknown>) {
  const dataObj = data as MicroStoryData;
  const msg = typeof dataObj?.message === 'string' ? dataObj.message : 'História não especificada.';
  const toneValue = dataObj?.tone;
  const validTones: ToneProfileKey[] = ['comercial', 'padrao', 'motivador', 'estrategico', 'educativo'];
  const tone: ToneProfileKey = typeof toneValue === 'string' && validTones.includes(toneValue as ToneProfileKey) 
    ? toneValue as ToneProfileKey 
    : 'padrao';
  const refined = rewriteWithBrandVoice(msg, tone);
  emitEvent('ai:story-generated', { story: refined, brandTone: data?.tone || 'padrao' }, { source: 'storytellingEngine', priority: 4 });
  return refined;
}

export function rewriteForClarity(text: string) {
  const rewritten = `Em termos simples: ${text}`;
  const refined = rewriteWithBrandVoice(rewritten, 'educativo');
  emitEvent('ai:story-clarified', { story: refined, brandTone: 'educativo' }, { source: 'storytellingEngine', priority: 4 });
  return refined;
}

export function rewriteForSales(text: string) {
  const rewritten = `Benefício imediato: ${text}`;
  const refined = rewriteWithBrandVoice(rewritten, 'comercial');
  emitEvent('ai:story-commercial', { story: refined, brandTone: 'comercial' }, { source: 'storytellingEngine', priority: 4 });
  return refined;
}

export function rewriteForConfidence(text: string) {
  return rewriteWithBrandVoice(`Estamos confiantes porque ${text}`, 'padrao');
}

export function adaptTone(toneProfile: string) {
  return storyProfiles[toneProfile as keyof typeof storyProfiles] || storyProfiles.iniciante;
}

export function hallucinateMissingLinks() {
  return 'Com base em sinais indiretos, inferimos um possível ganho de margem.';
}

export function generateFuturePrediction() {
  return 'Prevemos aumento de engajamento se aplicar a recomendação sugerida.';
}

export function imagineAlternativePaths() {
  return ['Caminho A: manter preço', 'Caminho B: ajustar margem', 'Caminho C: campanha relâmpago'];
}

export function createCounterfactual(reason: string) {
  const story = `Se ${reason}, então o resultado seria diferente.`;
  const refined = rewriteWithBrandVoice(story, 'estrategico');
  emitEvent('ai:story-generated', { story: refined, type: 'counterfactual', brandTone: 'estrategico' }, { source: 'storytellingEngine', priority: 4 });
  return refined;
}

export function stabilizeImaginations() {
  return 'Imaginação estabilizada para evitar deriva.';
}

export function hallucinateForContext(event: StoryEvent | Record<string, unknown>, state: StoryState | Record<string, unknown>) {
  const story = generateContextStory(event, state);
  return story;
}

