// Production hardening tests
// Run with: node -r ts-node/register scripts/mode-deus-tests/run-prod-hardening-tests.js
require('ts-node/register/transpile-only');

const { guardEventLoop, emitFallback } = require('../../src/azuria_ai/engines/safetyAndReliabilityEngine');
const { perfStart, perfEnd, getPerfStats } = require('../../src/azuria_ai/engines/performanceMonitorEngine');

function assert(cond, msg) {
  if (!cond) throw new Error(msg);
}

function run() {
  console.log('Running prod hardening tests...');

  // Loop guard
  for (let i = 0; i < 55; i++) {
    const ok = guardEventLoop('test-event');
    if (!ok) break;
  }
  emitFallback('Test fallback');

  // Perf monitor
  const p = perfStart('engine-A');
  // simulate work
  for (let i = 0; i < 1e5; i++) {}
  perfEnd(p);

  const stats = getPerfStats();
  assert(stats['engine-A'], 'Perf stats should track engine-A');

  console.log('Prod hardening tests passed.');
}

run();

