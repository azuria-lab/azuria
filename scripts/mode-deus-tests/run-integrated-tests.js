// Integrated architecture tests (Level 10)
// Run with: node -r ts-node/register scripts/mode-deus-tests/run-integrated-tests.js
require('ts-node/register/transpile-only');

const { emitEvent } = require('../../src/azuria_ai/core/eventBus');
const { initializeIntegratedOrchestrator } = require('../../src/azuria_ai/core/integratedOrchestrator');
const { getGlobalState } = require('../../src/azuria_ai/engines/integratedCoreEngine');

function assert(cond, msg) {
  if (!cond) throw new Error(msg);
}

function simulateEvents() {
  const tipos = [
    'calc:updated',
    'ai:predictive-insight',
    'ai:trend-detected',
    'ai:future-state-predicted',
    'ai:temporal-anomaly',
    'ai:emotion-inferred',
    'ai:user-profile-updated',
    'ai:signal-quality',
    'ai:evolution-score-updated',
    'ai:consistency-warning',
  ];

  for (let i = 0; i < 40; i++) {
    const tipo = tipos[i % tipos.length];
    emitEvent(tipo, { idx: i, trend: 'growth', confidence: 0.7 }, { source: 'test' });
  }
}

function run() {
  console.log('Running integrated architecture tests...');
  initializeIntegratedOrchestrator();
  simulateEvents();
  const state = getGlobalState();
  assert(state.lastEvents.length > 0, 'Integrated state must track events');
  console.log('Integrated tests passed.');
}

run();

