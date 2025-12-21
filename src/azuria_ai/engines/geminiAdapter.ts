/**
 * GeminiAdapter - Integração com Google Gemini API
 *
 * Motor de UX rápida do Modo Deus:
 * - Explicações simples e rápidas
 * - Sugestões contextuais
 * - Chat conversacional
 *
 * @module azuria_ai/engines/geminiAdapter
 */

export interface GeminiConfig {
  apiKey?: string;
  model?: string;
  maxTokens?: number;
  temperature?: number;
}

export interface GeminiResponse {
  text: string;
  tokensUsed: number;
  raw: unknown;
  latencyMs: number;
  model: string;
}

const GEMINI_API_URL =
  'https://generativelanguage.googleapis.com/v1beta/models';
const DEFAULT_MODEL = 'gemini-1.5-pro';

export class GeminiAdapter {
  private readonly apiKey: string;
  private readonly model: string;
  private readonly maxTokens: number;
  private readonly temperature: number;

  constructor(config: GeminiConfig = {}) {
    // SEGURANÇA: API key NUNCA deve vir de variáveis de ambiente do frontend
    // Em produção, usar Edge Function azuria-chat
    this.apiKey = config.apiKey || '';
    this.model = config.model || 'gemini-2.5-flash';
    this.maxTokens = config.maxTokens || 1024;
    this.temperature = config.temperature || 0.7;

    if (!config.apiKey && typeof window !== 'undefined') {
      console.warn(
        '[GeminiAdapter] ⚠️ Em produção, use Edge Function. API key não deve estar no frontend.'
      );
    }
  }

  /**
   * Verifica se a API está configurada
   */
  isConfigured(): boolean {
    return this.apiKey.length > 0;
  }

  /**
   * Testa conectividade com a API
   */
  async healthCheck(): Promise<boolean> {
    if (!this.isConfigured()) {
      return false;
    }

    try {
      const response = await fetch(
        `${GEMINI_API_URL}/${this.model}?key=${this.apiKey}`,
        { method: 'GET' }
      );
      return response.ok;
    } catch {
      return false;
    }
  }

  /**
   * Chama o modelo Gemini para gerar resposta
   */
  async callModel(params: {
    prompt: string;
    systemPrompt?: string;
    temperature?: number;
    maxTokens?: number;
  }): Promise<GeminiResponse> {
    if (!this.isConfigured()) {
      // Fallback local quando não configurado
      return {
        text: `[Gemini não configurado] Resposta local para: ${params.prompt.substring(
          0,
          50
        )}...`,
        tokensUsed: 0,
        raw: {},
        latencyMs: 0,
        model: 'local-fallback',
      };
    }

    const startTime = Date.now();

    const contents = [];

    // System prompt como primeira mensagem de contexto
    if (params.systemPrompt) {
      contents.push({
        role: 'user',
        parts: [{ text: `[Contexto do Sistema]: ${params.systemPrompt}` }],
      });
      contents.push({
        role: 'model',
        parts: [{ text: 'Entendido. Vou seguir essas diretrizes.' }],
      });
    }

    // Mensagem do usuário
    contents.push({
      role: 'user',
      parts: [{ text: params.prompt }],
    });

    const requestBody = {
      contents,
      generationConfig: {
        temperature: params.temperature ?? this.temperature,
        maxOutputTokens: params.maxTokens ?? this.maxTokens,
        topP: 0.95,
        topK: 40,
      },
      safetySettings: [
        { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_ONLY_HIGH' },
        { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_ONLY_HIGH' },
        {
          category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
          threshold: 'BLOCK_ONLY_HIGH',
        },
        {
          category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
          threshold: 'BLOCK_ONLY_HIGH',
        },
      ],
    };

    try {
      const response = await fetch(
        `${GEMINI_API_URL}/${this.model}:generateContent?key=${this.apiKey}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestBody),
        }
      );

      const latencyMs = Date.now() - startTime;

      if (!response.ok) {
        const errorText = await response.text();
        console.error('[GeminiAdapter] API Error:', response.status, errorText);
        throw new Error(`Gemini API error: ${response.status}`);
      }

      const data = await response.json();

      // Extrair texto da resposta
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
      const tokensUsed = data.usageMetadata?.totalTokenCount || 0;

      return {
        text,
        tokensUsed,
        raw: data,
        latencyMs,
        model: this.model,
      };
    } catch (error) {
      console.error('[GeminiAdapter] Error:', error);

      // Fallback em caso de erro
      return {
        text: `[Erro temporário] Não foi possível processar sua solicitação.`,
        tokensUsed: 0,
        raw: { error },
        latencyMs: Date.now() - startTime,
        model: 'error-fallback',
      };
    }
  }

  /**
   * Método simplificado para chat rápido
   */
  async chat(message: string): Promise<string> {
    const response = await this.callModel({ prompt: message });
    return response.text;
  }

  /**
   * Explica um conceito de forma simples (UX)
   */
  async explain(topic: string, context?: string): Promise<string> {
    const systemPrompt = `Você é a Azúria, assistente inteligente de precificação e gestão comercial.
Seja concisa, clara e profissional. Use linguagem brasileira natural.
Responda em no máximo 3 parágrafos curtos.`;

    const prompt = context
      ? `Explique de forma simples: ${topic}\n\nContexto: ${context}`
      : `Explique de forma simples: ${topic}`;

    const response = await this.callModel({ prompt, systemPrompt });
    return response.text;
  }

  /**
   * Gera sugestão contextual rápida
   */
  async suggest(
    situation: string,
    data?: Record<string, unknown>
  ): Promise<string> {
    const systemPrompt = `Você é a Azúria, assistente de precificação.
Dê sugestões práticas e diretas. Seja objetiva.
Responda em no máximo 2 frases.`;

    const dataContext = data ? `\nDados: ${JSON.stringify(data)}` : '';
    const prompt = `Situação: ${situation}${dataContext}\n\nQual sua sugestão?`;

    const response = await this.callModel({
      prompt,
      systemPrompt,
      maxTokens: 256,
    });
    return response.text;
  }
}

// Instância singleton para uso global
export const geminiAdapter = new GeminiAdapter();

export default GeminiAdapter;
