// UX adaptive tests
// Run with: node -r ts-node/register scripts/mode-deus-tests/run-ux-adaptive-tests.js
require('ts-node/register/transpile-only');

const { proposeAdaptiveUX } = require('../../src/azuria_ai/engines/adaptiveUXEngine');
const { processSocialPresence } = require('../../src/azuria_ai/engines/socialPresenceEngine');

function assert(cond, msg) {
  if (!cond) throw new Error(msg);
}

function run() {
  console.log('Running UX adaptive tests...');
  const layout = proposeAdaptiveUX({ intent: 'pricing', frequentPaths: ['calc', 'dashboard'], lowUseSections: ['reports'] });
  assert(layout !== undefined, 'Layout suggestion must exist');
  processSocialPresence({ payload: { metadata: { repeatClicks: true } } });
  console.log('UX adaptive tests passed.');
}

run();

