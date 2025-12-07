// Lightweight temporal engine tests
// Run with: node -r ts-node/register scripts/mode-deus-tests/run-temporal-tests.js
require('ts-node/register/transpile-only');

const {
  recordTemporalEvent,
  getTimeline,
  computeTrends,
  predictFutureState,
  detectTemporalAnomaly,
} = require('../../src/azuria_ai/engines/temporalEngine');

function assert(cond, msg) {
  if (!cond) throw new Error(msg);
}

function run() {
  console.log('Running temporal engine tests...');

  recordTemporalEvent('calculation', 'calc:updated', { status: 'success' });
  recordTemporalEvent('calculation', 'calc:updated', { status: 'success' });
  recordTemporalEvent('calculation', 'calc:updated', { status: 'error' });
  recordTemporalEvent('calculation', 'calc:completed', { status: 'success' });

  const timeline = getTimeline('calculation');
  assert(timeline.length >= 4, 'Timeline should have events');

  const trend = computeTrends('calculation');
  predictFutureState('calculation');

  recordTemporalEvent('calculation', 'calc:updated', { status: 'success' });
  recordTemporalEvent('calculation', 'calc:updated', { status: 'success' });
  recordTemporalEvent('calculation', 'calc:updated', { status: 'success' });
  detectTemporalAnomaly('calculation');

  console.log('Temporal tests passed.');
}

run();

