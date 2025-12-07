// Adaptive agents tests
// Run with: node -r ts-node/register scripts/mode-deus-tests/run-adaptive-tests.js
require('ts-node/register/transpile-only');

const { updateAgentHeuristics, adjustConfidence, autoTuneParameters } = require('../../src/azuria_ai/engines/adaptiveEngine');
const { getAgentMemory } = require('../../src/azuria_ai/core/agentMemory');

function assert(cond, msg) {
  if (!cond) throw new Error(msg);
}

function run() {
  console.log('Running adaptive tests...');
  updateAgentHeuristics('PricingAgent', { threshold: 0.6 });
  autoTuneParameters('PricingAgent', { delta: 0.1 });
  adjustConfidence('PricingAgent', 0.1);

  const mem = getAgentMemory('PricingAgent');
  assert(mem.heuristics.threshold !== undefined, 'Heuristic threshold updated');
  assert(mem.performance.confidence !== undefined, 'Confidence adjusted');

  console.log('Adaptive tests passed.');
}

run();

