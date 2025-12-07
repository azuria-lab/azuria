// Multiagent tests
// Run with: node -r ts-node/register scripts/mode-deus-tests/run-agents-tests.js
require('ts-node/register/transpile-only');

const { TaxAgent } = require('../../src/azuria_ai/agents/TaxAgent');
const { PricingAgent } = require('../../src/azuria_ai/agents/PricingAgent');
const { MarketplaceAgent } = require('../../src/azuria_ai/agents/MarketplaceAgent');
const { RiskAgent } = require('../../src/azuria_ai/agents/RiskAgent');
const { OpportunityAgent } = require('../../src/azuria_ai/agents/OpportunityAgent');

function assert(cond, msg) {
  if (!cond) throw new Error(msg);
}

function run() {
  console.log('Running agents tests...');
  const state = {
    taxes: { icms: 0.35, origin: 'SP', destination: 'SP' },
    margin: 0.08,
    cost: 100,
    price: 110,
    marketplaceFees: 0.25,
    policyViolation: true,
    anomalyScore: 0.8,
    predictedLoss: 200,
    stock: 5,
    demand: 20,
  };

  const agents = [
    new TaxAgent(),
    new PricingAgent(),
    new MarketplaceAgent(),
    new RiskAgent(),
    new OpportunityAgent(),
  ];

  agents.forEach(agent => {
    agent.analyze(state);
    agent.emitEvents();
    const recs = agent.getRecommendations();
    assert(recs.length > 0, `${agent.constructor.name} should produce recommendations`);
  });

  console.log('Agents tests passed.');
}

run();

