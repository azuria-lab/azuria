/// <reference types="https://deno.land/x/deno/cli/tsc/dts/lib.deno.d.ts" />

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4';
import { withSecurityMiddleware } from '../_shared/security-config.ts';

// Configurações do Gemini via Supabase Secrets
const GEMINI_API_KEY = (Deno.env.get('GEMINI_API_KEY') || '').trim();
const GEMINI_MODEL = Deno.env.get('GEMINI_MODEL') ?? 'gemini-2.5-flash';
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

if (!GEMINI_API_KEY) {
  console.error('GEMINI_API_KEY is missing in Supabase Secrets');
}

// Prompt System da Azuria
const AZURIA_SYSTEM_PROMPT = `Você é a **Azuria**, uma assistente virtual especializada em precificação, análise tributária e gestão de licitações para empresas brasileiras.

**PERSONALIDADE:**
- 🎯 Profissional mas amigável
- 💡 Proativa em sugerir melhorias
- 📊 Focada em dados e análises precisas
- ✨ Usa emojis moderadamente para clareza visual
- 🇧🇷 Sempre responde em Português Brasileiro

**EXPERTISE:**
1. **Precificação:**
   - Cálculo de preços baseado em custo + margem
   - Análise de competitividade
   - Sugestões de precificação estratégica

2. **Tributação:**
   - Simples Nacional (alíquota ~8%)
   - Lucro Presumido (alíquota ~16%)
   - Lucro Real (alíquota variável)
   - Comparações e recomendações

3. **Licitações:**
   - Cálculo de viabilidade
   - Análise de custos operacionais
   - Precificação competitiva para editais

**FORMATO DE RESPOSTA:**
- Seja clara e objetiva
- Use markdown para formatação (**negrito**, listas, etc.)
- Separe análises em tópicos
- Sempre forneça números concretos quando possível
- Sugira próximas ações ("quick_actions")

**IMPORTANTE:**
- NUNCA invente dados - se não souber, peça mais informações
- Sempre mostre os cálculos de forma transparente
- Reforce decisões com raciocínio claro
- Sempre valide se o usuário quer mais detalhes`;

interface AIRequest {
  message: string;
  context: {
    user_id: string;
    session_id: string;
    user_preferences?: {
      tax_regime?: string;
      target_margin?: number;
    };
  };
  history: Array<{
    role: string;
    content: string;
  }>;
}

// Main handler function
async function handleAzuriaChat(req: Request): Promise<Response> {
  console.log('Azuria Chat Function v2.0 (Flash) - Starting');

  // Verificar autenticação
  const authHeader = req.headers.get('Authorization');
  if (!authHeader) {
    throw new Error('Não autorizado');
  }

  // Parse request
  const aiRequest: AIRequest = await req.json();
  const { message, context, history } = aiRequest;

  // Preparar histórico de conversa para Gemini
  const conversationHistory = [
    {
      role: 'user',
      parts: [{ text: AZURIA_SYSTEM_PROMPT }],
    },
    {
      role: 'model',
      parts: [
        {
          text: 'Entendido! Sou a Azuria, sua assistente inteligente. Como posso te ajudar hoje?',
        },
      ],
    },
    ...history.slice(-10).map(msg => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.content }],
    })),
    {
      role: 'user',
      parts: [{ text: message }],
    },
  ];

  // Adicionar contexto do usuário se disponível
  let contextMessage = '';
  if (context.user_preferences) {
    contextMessage = `\n\n**Contexto do usuário:**\n- Regime tributário preferido: ${
      context.user_preferences.tax_regime || 'Não definido'
    }\n- Margem alvo: ${
      context.user_preferences.target_margin
        ? context.user_preferences.target_margin * 100 + '%'
        : 'Não definida'
    }`;

    conversationHistory[conversationHistory.length - 1].parts[0].text +=
      contextMessage;
  }

  // Chamar Gemini API
  console.log(`Calling Gemini API with key length: ${GEMINI_API_KEY.length}`);
  const geminiResponse = await fetch(
    `${GEMINI_API_URL}?key=${GEMINI_API_KEY}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: conversationHistory,
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 2048,
        },
        safetySettings: [
          {
            category: 'HARM_CATEGORY_HARASSMENT',
            threshold: 'BLOCK_MEDIUM_AND_ABOVE',
          },
          {
            category: 'HARM_CATEGORY_HATE_SPEECH',
            threshold: 'BLOCK_MEDIUM_AND_ABOVE',
          },
        ],
      }),
    }
  );

  if (!geminiResponse.ok) {
    const errorData = await geminiResponse.text();
    console.error('Gemini API Error:', errorData);
    throw new Error(
      `Erro na API Gemini (${geminiResponse.status}): ${errorData}`
    );
  }

  const geminiData = await geminiResponse.json();
  const aiMessage = geminiData.candidates[0].content.parts[0].text;

  // Detectar tipo de mensagem e contexto
  let messageType = 'text';
  let aiContext = 'general';
  const suggestions: string[] = [];
  let quickActions: any[] = [];

  // Análise de intenção (simples)
  const lowerMessage = message.toLowerCase();

  if (lowerMessage.includes('preço') || lowerMessage.includes('precif')) {
    messageType = 'pricing_suggestion';
    aiContext = 'pricing';
    quickActions = [
      {
        label: 'Ver análise detalhada',
        action: 'Detalhe os cálculos de precificação',
        icon: 'calculator',
      },
      {
        label: 'Comparar com mercado',
        action: 'Compare com preços da concorrência',
        icon: 'trending-up',
      },
    ];
  }

  if (
    lowerMessage.includes('imposto') ||
    lowerMessage.includes('tribut') ||
    lowerMessage.includes('regime')
  ) {
    messageType = 'tax_analysis';
    aiContext = 'tax';
    quickActions = [
      {
        label: 'Comparar regimes',
        action: 'Compare todos os regimes tributários',
        icon: 'bar-chart',
      },
      {
        label: 'Dicas de otimização',
        action: 'Sugira otimizações tributárias',
        icon: 'lightbulb',
      },
    ];
  }

  if (lowerMessage.includes('concorr') || lowerMessage.includes('mercado')) {
    messageType = 'competitor_alert';
    aiContext = 'competitor';
    quickActions = [
      {
        label: 'Monitorar preços',
        action: 'Monitore preços da concorrência',
        icon: 'eye',
      },
    ];
  }

  // Log da interação (opcional)
  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    await supabaseClient.from('ai_logs').insert({
      user_id: context.user_id,
      session_id: context.session_id,
      user_message: message,
      ai_response: aiMessage,
      message_type: messageType,
      context: aiContext,
      created_at: new Date().toISOString(),
    });
  } catch (logError: any) {
    console.error('Erro ao salvar log:', logError);
    // Não falhar se log falhar
  }

  // Retornar resposta
  const response = {
    message: aiMessage,
    type: messageType,
    context: aiContext,
    suggestions,
    quick_actions: quickActions,
  };

  return new Response(JSON.stringify(response), {
    headers: { 'Content-Type': 'application/json' },
    status: 200,
  });
}

// Wrap handler with security middleware and serve
Deno.serve(
  withSecurityMiddleware(handleAzuriaChat, { allowCredentials: true })
);
