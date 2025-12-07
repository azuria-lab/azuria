// Lightweight meta-intelligence tests
// Run with: node -r ts-node/register scripts/mode-deus-tests/run-meta-tests.js
require('ts-node/register/transpile-only');

const { setGoal, generatePlan, executePlan, adjustPlan, getCurrentPlan } = require('../../src/azuria_ai/engines/metaPlannerEngine');
const { updateState, getOperationalState } = require('../../src/azuria_ai/engines/operationalStateEngine');
const { analyzeAndAdjust } = require('../../src/azuria_ai/engines/continuousImprovementEngine');
const { runConsistencyCheck } = require('../../src/azuria_ai/engines/consistencyEngine');

function assert(condition, msg) {
  if (!condition) throw new Error(msg);
}

function run() {
  console.log('Running meta-intelligence tests...');

  const goal = { id: 'test-goal', objective: 'melhorar precisão' };
  setGoal(goal);
  const plan = generatePlan(goal);
  executePlan();
  adjustPlan(0.6);

  const current = getCurrentPlan();
  assert(current && current.status === 'adjusted', 'Plan should be adjusted');

  updateState({ load: 0.7, signalQuality: 0.5 });
  const state = getOperationalState();
  assert(state.signalQuality === 0.5, 'Signal quality should update');

  analyzeAndAdjust();
  const report = runConsistencyCheck({ watchersHealthy: true, eventsConsumed: true, uiReceiving: true });
  assert(report.watchersHealthy, 'Consistency check should pass');

  console.log('Meta-intelligence tests passed.');
}

run();

