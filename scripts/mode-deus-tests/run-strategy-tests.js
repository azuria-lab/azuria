// Strategy and holistic tests
// Run with: node -r ts-node/register scripts/mode-deus-tests/run-strategy-tests.js
require('ts-node/register/transpile-only');

const { analyzeGlobalState, detectStrategicConflicts } = require('../../src/azuria_ai/engines/strategicEngine');
const { scanWholeSystem } = require('../../src/azuria_ai/engines/holisticStateEngine');

function assert(cond, msg) {
  if (!cond) throw new Error(msg);
}

function run() {
  console.log('Running strategy tests...');
  const state = {
    operational: { load: 0.9 },
    consistency: { drift: true },
    risk: { level: 'high' },
    opportunity: { signal: 'strong' },
    evolution: { evolutionScore: 0.8 },
  };
  const res = analyzeGlobalState(state);
  assert(res.plan && res.plan.length > 0, 'Strategic plan generated');
  const conflicts = detectStrategicConflicts(state);
  assert(conflicts.length > 0, 'Conflicts detected');
  const snapshot = scanWholeSystem(state);
  assert(snapshot.health !== undefined, 'Health computed');
  console.log('Strategy tests passed.');
}

run();

