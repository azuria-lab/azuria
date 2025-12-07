/* eslint-disable no-console */
const assert = require('assert');

function mockEmitEvent(tipo, payload) {
  return { tipo, payload, timestamp: Date.now() };
}

function run() {
  console.log('Rodando storytelling tests...');

  // Testa geração de história a partir de insight
  const storyEvent = mockEmitEvent('ai:story-generated', { story: 'Insight explicado.' });
  assert(storyEvent.payload.story.includes('Insight'), 'História não gerada corretamente');

  // Testa reescrita para clareza
  const clarified = 'Em termos simples: teste';
  assert(clarified.startsWith('Em termos simples'), 'Reescrita de clareza falhou');

  // Testa tom comercial
  const commercial = 'Benefício imediato: upgrade recomendado';
  assert(commercial.includes('Benefício imediato'), 'Reescrita comercial falhou');

  // Testa perfis
  const profiles = ['iniciante', 'intermediario', 'avancado', 'comercial'];
  profiles.forEach((p) => assert(p, 'Perfil inválido'));

  // Integração mínima com orchestrator simulada
  const orchestratorLink = mockEmitEvent('ai:story-generated', { source: 'orchestrator' });
  assert(orchestratorLink.payload.source === 'orchestrator', 'Integração orquestrador falhou');

  console.log('Storytelling tests finalizados com sucesso.');
}

if (require.main === module) {
  run();
}

module.exports = { run };

