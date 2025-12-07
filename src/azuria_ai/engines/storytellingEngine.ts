import { emitEvent } from '../core/eventBus';
import { storyProfiles } from './storyProfiles';
import { speak, rewriteWithBrandVoice, getToneProfileForUser, adaptToneProfileFromPersona } from './brandVoiceEngine';

function pickProfile(userLevel: string) {
  return storyProfiles[userLevel as keyof typeof storyProfiles] || storyProfiles.iniciante;
}

export function generateContextStory(event: any, state: any) {
  const profile = pickProfile(state?.userLevel || 'iniciante');
  const raw = `(${profile.tone}) ${event?.tipo || 'evento'} processado. Contexto: ${Object.keys(
    event?.payload || {}
  )
    .slice(0, 3)
    .join(', ')}`;
  const tone = getToneProfileForUser(state);
  const spoken = speak(raw, tone, { user: state });
  emitEvent(
    'ai:story-generated',
    { story: spoken.message, profile: profile.tone, brandTone: spoken.tone, persona: spoken.persona },
    { source: 'storytellingEngine', priority: 5 }
  );
  return spoken.message;
}

export function explainInsight(insight: any) {
  const raw = `Sugerimos ${insight?.action || 'essa ação'} porque observamos ${insight?.reason || 'padrões recentes'}.`;
  const tone = adaptToneProfileFromPersona(insight?.persona || 'iniciante-inseguro');
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

export function createMicroStory(data: any) {
  const msg = data?.message || 'História não especificada.';
  const refined = rewriteWithBrandVoice(msg, data?.tone || 'padrao');
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

export function hallucinateForContext(event: any, state: any) {
  const story = generateContextStory(event, state);
  return story;
}

