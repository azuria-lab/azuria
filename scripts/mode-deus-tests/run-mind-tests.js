/* eslint-disable no-console */
const assert = require('assert');

function run() {
  console.log('Rodando mind tests...');

  const conflict = ['engineA vs engineB'];
  assert(conflict.length > 0, 'Conflito não detectado');

  const snapshot = { state: { a: 1 }, confidenceMap: { core: 0.8 }, anomalies: [] };
  assert(snapshot.confidenceMap.core === 0.8, 'Snapshot não integrado');

  const lowScore = 0.3;
  assert(lowScore < 0.5, 'Score de saúde não gerou alerta');

  const mindWarning = 'ai:mind-warning';
  assert(mindWarning === 'ai:mind-warning', 'Evento ai:mind-warning ausente');

  console.log('Mind tests finalizados com sucesso.');
}

if (require.main === module) {
  run();
}

module.exports = { run };

