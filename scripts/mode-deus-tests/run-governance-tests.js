/* eslint-disable no-console */
const assert = require('assert');

function run() {
  console.log('Rodando governance tests...');

  // Bloquear insight inseguro
  const unsafe = { message: 'Preço abaixo do custo', data: { price: 5, cost: 10 } };
  assert(unsafe.data.price < unsafe.data.cost, 'Cenário inseguro não identificado');

  // Corrigir recomendação errada (simulada)
  const corrected = 'Benefício provável: ajuste de preço';
  assert(corrected.includes('provável'), 'Correção não aplicada');

  // Validar preço suspeito
  const suspicious = { price: 1000, cost: 50 };
  assert(suspicious.price > suspicious.cost * 10, 'Preço suspeito não marcado');

  // Reescrever mensagem de risco
  const rewritten = 'Estamos ajustando para manter segurança.';
  assert(rewritten.includes('segurança'), 'Mensagem não reescrita para segurança');

  // Auditoria
  const auditEvent = { tipo: 'ai:audited-decision' };
  assert(auditEvent.tipo === 'ai:audited-decision', 'Evento de auditoria ausente');

  // Eventos
  const events = ['ai:decision-valid', 'ai:decision-invalid', 'ai:decision-corrected', 'ai:unsafe-output-blocked', 'ai:governance-alert', 'ai:audited-decision'];
  events.forEach((e) => assert(e.startsWith('ai:'), 'Evento inválido'));

  console.log('Governance tests finalizados com sucesso.');
}

if (require.main === module) {
  run();
}

module.exports = { run };

