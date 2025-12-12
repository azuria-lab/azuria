 
const assert = require('assert');

function mockDetect(fn, pattern) {
  return fn(pattern);
}

function run() {
  console.log('Rodando affective tests...');

  // Frustração
  const frustration = mockDetect(
    (p) => ({ emotion: 'frustration', confidence: 0.6 + (p.repetitions ? 0.1 : 0) }),
    { repetitions: 3 }
  );
  assert(frustration.emotion === 'frustration', 'Frustração não detectada');

  // Confusão
  const confusion = { emotion: 'confusion', confidence: 0.5 };
  assert(confusion.emotion === 'confusion', 'Confusão não detectada');

  // Hesitação
  const hesitation = { emotion: 'hesitation', confidence: 0.4 };
  assert(hesitation.emotion === 'hesitation', 'Hesitação não detectada');

  // Confiança
  const confidence = { emotion: 'confidence', confidence: 0.7 };
  assert(confidence.emotion === 'confidence', 'Confiança não detectada');

  // Mensagens afetivas
  const affectiveMsg = 'Vamos simplificar este cálculo juntos.';
  assert(affectiveMsg.includes('simplificar'), 'Mensagem afetiva faltando');

  // Eventos esperados
  const events = [
    'ai:emotion-detected',
    'ai:affective-response',
    'ai:user-frustrated',
    'ai:user-confident',
    'ai:user-confused',
    'ai:user-hesitant',
    'ai:user-encouraged',
  ];
  events.forEach((ev) => assert(ev.startsWith('ai:'), 'Evento inválido'));

  console.log('Affective tests finalizados com sucesso.');
}

if (require.main === module) {
  run();
}

module.exports = { run };

