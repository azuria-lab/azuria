// Perception and context reconstruction tests
// Run with: node -r ts-node/register scripts/mode-deus-tests/run-perception-tests.js
require('ts-node/register/transpile-only');

const { sampleSignals, reconstructState, detectSilentFailures, predictBehaviorFromNoise } = require('../../src/azuria_ai/engines/perceptionEngine');
const { rebuildContext } = require('../../src/azuria_ai/engines/contextRebuilder');

function assert(cond, msg) {
  if (!cond) throw new Error(msg);
}

function run() {
  console.log('Running perception tests...');
  const sample = sampleSignals({ logs: { anomalies: ['x'] }, silent: ['engineA'], contrast: ['lowRate'] });
  const reconstructed = reconstructState(sample);
  assert(reconstructed.reconstructedState !== undefined, 'Reconstructed state exists');
  rebuildContext(sample);
  detectSilentFailures(sample);
  predictBehaviorFromNoise(sample);
  console.log('Perception tests passed.');
}

run();

