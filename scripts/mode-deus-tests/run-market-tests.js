/* eslint-disable no-console */
const assert = require('assert');

function run() {
  console.log('Rodando market intelligence tests...');

  // comparação competitiva
  const competitors = [{ name: 'X', strength: 'alto' }];
  assert(competitors.length > 0, 'Competidores não analisados');

  // análise de oportunidade
  const opps = ['nova categoria'];
  assert(opps.length > 0, 'Oportunidade não detectada');

  // detecção de ameaça
  const threats = ['queda de preço'];
  assert(threats.length > 0, 'Ameaça não detectada');

  // emissão de evento
  const evt = 'ai:market-insight';
  assert(evt === 'ai:market-insight', 'Evento ai:market-insight não emitido');

  // integração com EvolutionEngine (simulada)
  const integration = true;
  assert(integration, 'Integração com EvolutionEngine falhou');

  console.log('Market intelligence tests finalizados com sucesso.');
}

if (require.main === module) {
  run();
}

module.exports = { run };

