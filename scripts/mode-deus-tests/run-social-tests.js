// Lightweight mock tests for Social Engine
// Run with: node -r ts-node/register scripts/mode-deus-tests/run-social-tests.js

require('ts-node/register/transpile-only');

const {
  updateUserModel,
  inferEmotion,
  inferIntent,
  classifyUserProfile,
  adaptInterface,
} = require('../../src/azuria_ai/engines/socialEngine');
const { userModel } = require('../../src/azuria_ai/core/userModel');

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

function run() {
  console.log('Running Social Engine mock tests...');

  inferEmotion({ metadata: { hesitation: true, repeatClicks: true } });
  assert(userModel.emotionalState !== undefined, 'Emotional state should be set');

  inferIntent({ tipo: 'calc:updated', context: {} });

  updateUserModel({ tipo: 'calc:completed', metadata: { advancedFlows: true } });
  classifyUserProfile();
  const adaptation = adaptInterface();
  assert(adaptation !== undefined, 'Adaptation should return a configuration');

  console.log('Social tests passed.');
}

run();

