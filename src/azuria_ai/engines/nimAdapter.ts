import fetch from 'node-fetch';

type NimConfig = {
  apiKey: string;
  baseUrl: string;
  defaultModel: string;
  timeoutMs?: number;
};

export class NimAdapter {
  private readonly config: NimConfig;

  constructor(cfg: NimConfig) {
    this.config = cfg;
  }

  async healthCheck(): Promise<boolean> {
    try {
      const res = await fetch(`${this.config.baseUrl}/health`, {
        headers: { Authorization: `Bearer ${this.config.apiKey}` },
        // @ts-expect-error node-fetch timeout
        timeout: 5000,
      });
      return res.ok;
    } catch {
      return false;
    }
  }

  async callModel(params: {
    model?: string;
    prompt: string;
    maxTokens?: number;
    temperature?: number;
  }) {
    const model = params.model || this.config.defaultModel;

    const body = {
      model,
      input: params.prompt,
      max_tokens: params.maxTokens ?? 512,
      temperature: params.temperature ?? 0.2,
    };

    const start = Date.now();
    const res = await fetch(`${this.config.baseUrl}/models/${model}/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.config.apiKey}`,
      },
      body: JSON.stringify(body),
      // @ts-expect-error node-fetch timeout
      timeout: this.config.timeoutMs ?? 30000,
    });

    const latencyMs = Date.now() - start;

    if (!res.ok) {
      const t = await res.text();
      throw new Error(`NIM error: ${res.status} ${t}`);
    }

    const raw = await res.json();
    const text =
      raw.output?.[0]?.content ||
      raw.generated_text ||
      JSON.stringify(raw);

    const tokensUsed = raw.usage?.total_tokens || 0;

    return {
      text,
      tokensUsed,
      raw,
      latencyMs,
      model,
    };
  }
}

