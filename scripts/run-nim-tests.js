/* eslint-disable no-console */
const { NimAdapter } = require('../src/azuria_ai/engines/nimAdapter');

(async () => {
  const nim = new NimAdapter({
    apiKey: process.env.NIM_API_KEY,
    baseUrl: process.env.NIM_BASE_URL,
    defaultModel: process.env.NIM_DEFAULT_MODEL,
  });

  console.log('Health:', await nim.healthCheck());

  const r = await nim.callModel({
    prompt: 'Explique o Azuria em uma frase.',
  });

  console.log('Output:', r.text);
  console.log('Tokens:', r.tokensUsed);
  console.log('Latency:', r.latencyMs);
})();

