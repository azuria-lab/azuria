export class GeminiAdapter {
  constructor(_cfg: any = {}) {}

  async callModel(params: { prompt: string; temperature?: number; maxTokens?: number }) {
    // Placeholder local adapter
    return {
      text: `Fallback response for: ${params.prompt}`,
      tokensUsed: 0,
      raw: {},
      latencyMs: 0,
      model: 'gemini-fallback',
    };
  }
}

