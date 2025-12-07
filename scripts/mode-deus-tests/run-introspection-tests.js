// Introspection and coherence tests
// Run with: node -r ts-node/register scripts/mode-deus-tests/run-introspection-tests.js
require('ts-node/register/transpile-only');

const { generateRationale, detectContradictions, validateLogic, explainDecision } = require('../../src/azuria_ai/engines/coherenceEngine');

function assert(cond, msg) {
  if (!cond) throw new Error(msg);
}

function run() {
  console.log('Running introspection tests...');

  const state = { risk: { level: 'high' }, opportunity: { signal: 'strong' }, temporal: { trend: 'decline' }, evolution: { evolutionScore: 0.9 } };
  const contradictions = detectContradictions(state);
  assert(contradictions.length > 0, 'Should detect contradictions');

  const ok = validateLogic(state);
  assert(ok === false, 'Logic should be invalid with contradictions');

  const rationale = generateRationale({ tipo: 'test', payload: { a: 1, b: 2 } });
  assert(rationale.reason !== undefined, 'Rationale should be generated');

  const expl = explainDecision({ message: 'Teste', values: { confidence: 0.8 } });
  assert(expl.confidence === 0.8, 'Explain decision should carry confidence');

  console.log('Introspection tests passed.');
}

run();

