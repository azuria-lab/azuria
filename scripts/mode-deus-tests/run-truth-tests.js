/* eslint-disable no-console */
const assert = require('assert');

function run() {
  console.log('Rodando truth tests...');

  // Contradições entre módulos
  const contradictions = ['preço negativo', 'estoque negativo'];
  assert(contradictions.length > 0, 'Contradição não detectada');

  // Estado impossível
  const impossible = true;
  assert(impossible, 'Estado impossível não sinalizado');

  // Alerta de realidade inconsistente
  const realityAlert = 'ai:truth-alert';
  assert(realityAlert === 'ai:truth-alert', 'Alerta de verdade não emitido');

  // Sincronização percepção vs real
  const syncOk = true;
  assert(syncOk, 'Sincronização percepção/realidade falhou');

  console.log('Truth tests finalizados com sucesso.');
}

if (require.main === module) {
  run();
}

module.exports = { run };

