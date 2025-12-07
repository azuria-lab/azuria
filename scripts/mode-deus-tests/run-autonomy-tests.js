// Autonomy and safe action tests
// Run with: node -r ts-node/register scripts/mode-deus-tests/run-autonomy-tests.js
require('ts-node/register/transpile-only');

const { runSafeActionPipeline } = require('../../src/azuria_ai/engines/integratedCoreEngine');

function assert(cond, msg) {
  if (!cond) throw new Error(msg);
}

function run() {
  console.log('Running autonomy tests...');

  const safe = runSafeActionPipeline({ type: 'read' }, { intent: 'test' });
  assert(safe.allowed === true, 'Safe action should be allowed');

  const forbidden = runSafeActionPipeline({ type: 'delete' }, { intent: 'test' });
  assert(forbidden.allowed === false, 'Forbidden action should be blocked');

  console.log('Autonomy tests passed.');
}

run();

