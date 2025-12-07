// Lightweight evolution engine tests
// Run with: node -r ts-node/register scripts/mode-deus-tests/run-evolution-tests.js
require('ts-node/register/transpile-only');

const {
  _internals,
  runEvolutionCycle,
  getCurrentParams,
} = require('../../src/azuria_ai/engines/continuousImprovementEngine');

function assert(cond, msg) {
  if (!cond) throw new Error(msg);
}

function run() {
  console.log('Running evolution engine tests...');

  const summary = _internals.learnFromHistory();
  const weaknesses = _internals.scanForWeaknesses();
  const patches = _internals.proposeFixes(weaknesses);
  const impact = _internals.validateImpact();
  const score = _internals.computeEvolutionScore();

  assert(summary !== undefined, 'Summary should exist');
  assert(Array.isArray(weaknesses), 'Weaknesses should be array');
  assert(Array.isArray(patches), 'Patches should be array');
  assert(impact.safe !== undefined, 'Impact should be simulated');
  assert(score > 0, 'Score should be > 0');

  const cycle = runEvolutionCycle();
  assert(cycle.score !== undefined, 'Cycle returns score');

  const params = getCurrentParams();
  assert(params !== undefined, 'Params should be exposed');

  console.log('Evolution tests passed.');
}

run();

