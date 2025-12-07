// Lightweight mock tests for Cognitive Engine
// Run with: node -r ts-node/register scripts/mode-deus-tests/run-cognitive-tests.js

require('ts-node/register/transpile-only');

const {
  updateMemory,
  detectPatterns,
  generateForecast,
  detectAnomalies,
  getMemorySnapshot,
} = require('../../src/azuria_ai/engines/cognitiveEngine');

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

function run() {
  console.log('Running Cognitive Engine mock tests...');

  updateMemory('calc', { margemLucro: 5, tipo: 'tax' }, 'test');
  updateMemory('calc', { margemLucro: 6, tipo: 'tax' }, 'test');
  updateMemory('calc', { margemLucro: 7, tipo: 'tax' }, 'test');
  updateMemory('intent', { category: 'tax' }, 'test');
  updateMemory('prediction', { riskLevel: 'alert' }, 'test');

  const snapshot = getMemorySnapshot();
  assert(snapshot.length === 5, 'Memory should store entries');

  detectPatterns();
  generateForecast();
  detectAnomalies();

  console.log('Cognitive tests passed.');
}

run();

