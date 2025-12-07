import { NimAdapter } from '../engines/nimAdapter';
import { selectModelForTask } from './modelRouter';
import { GeminiAdapter } from '../engines/geminiAdapter';

const nim = new NimAdapter({
  apiKey: process.env.NIM_API_KEY!,
  baseUrl: process.env.NIM_BASE_URL!,
  defaultModel: process.env.NIM_DEFAULT_MODEL || 'llama-3.1-70b',
});

const gemini = new GeminiAdapter({});

export async function callEngine(task: string, prompt: string, opts: any = {}) {
  const { engine, model } = selectModelForTask(task);

  try {
    if (engine === 'nim') {
      const r = await nim.callModel({ model, prompt, ...opts });
      return r;
    }

    return await gemini.callModel({ prompt, ...opts });
  } catch (err) {
    const fb = await gemini.callModel({ prompt, ...opts });
    return { ...fb, fallback: true };
  }
}

