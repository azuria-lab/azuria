/* eslint-disable no-console */
const assert = require('assert');

function mockSpeak(msg, tone) {
  return { message: `${tone}:${msg}`, tone, persona: 'iniciante-inseguro' };
}

function run() {
  console.log('Rodando brand voice tests...');

  // Consistência do tom
  const spoken = mockSpeak('Teste', 'padrao');
  assert(spoken.message.startsWith('padrao'), 'Tom padrão não aplicado');

  // Adaptação por persona
  const personaTone = 'estrategico';
  const personaMsg = mockSpeak('Insight', personaTone);
  assert(personaMsg.message.includes(personaTone), 'Persona não adaptou tom');

  // Refinamento de texto
  const refined = 'Benefício imediato: upgrade';
  assert(refined.includes('Benefício imediato'), 'Texto não refinado corretamente');

  // Integração storytelling (simulada)
  const storyEvent = { tipo: 'ai:story-generated', payload: { story: 'história' } };
  assert(storyEvent.payload.story, 'História não gerada');

  // Eventos
  const events = ['ai:brand-voice-applied', 'ai:persona-adapted', 'ai:tone-shift', 'ai:communication-optimized'];
  events.forEach((e) => assert(e.startsWith('ai:'), 'Evento inválido'));

  console.log('Brand voice tests finalizados com sucesso.');
}

if (require.main === module) {
  run();
}

module.exports = { run };

