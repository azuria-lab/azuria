// Revenue intelligence tests
// Run with: node -r ts-node/register scripts/mode-deus-tests/run-revenue-tests.js
require('ts-node/register/transpile-only');

const { analyzeRevenueOpportunity } = require('../../src/azuria_ai/engines/revenueIntelligenceEngine');
const { runPaywallExperiment } = require('../../src/azuria_ai/engines/smartPaywallEngine');

function assert(cond, msg) {
  if (!cond) throw new Error(msg);
}

function run() {
  console.log('Running revenue tests...');
  const signals = analyzeRevenueOpportunity({ sessions: 10, clicks: 120, errors: 0, timeSpent: 1200, paywallViews: 4, plan: 'free' });
  assert(signals.upgradeProbability !== undefined, 'Should compute upgrade probability');
  const variant = runPaywallExperiment('free', 1);
  assert(variant.variantId, 'Variant must exist');
  console.log('Revenue tests passed.');
}

run();

