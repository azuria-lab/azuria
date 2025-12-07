// Conscious orchestrator tests
// Run with: node -r ts-node/register scripts/mode-deus-tests/run-conscious-tests.js
require('ts-node/register/transpile-only');

const { detectContradictions, generateCoherenceScore, validateRecommendation, predictSystemRisk } = require('../../src/azuria_ai/engines/consciousOrchestrator');
const { updateGlobalState } = require('../../src/azuria_ai/engines/integratedCoreEngine');

function assert(cond, msg) {
  if (!cond) throw new Error(msg);
}

function run() {
  console.log('Running conscious orchestrator tests...');

  updateGlobalState({
    risk: { level: 'high' },
    opportunity: { signal: 'strong' },
    temporal: { trend: 'decline' },
    evolution: { evolutionScore: 0.85 },
    operational: { load: 0.4 },
    consistency: { drift: false },
  });

  const issues = detectContradictions();
  const score = generateCoherenceScore(issues);
  assert(score >= 0 && score <= 1, 'Coherence score in range');

  const risk = predictSystemRisk();
  assert(risk >= 0 && risk <= 1, 'Risk in range');

  const validated = validateRecommendation({ message: 'Teste' });
  assert(validated.validatedBy === 'ConsciousLayer', 'Recommendation validated');

  console.log('Conscious orchestrator tests passed.');
}

run();

