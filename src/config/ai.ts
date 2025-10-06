// Configurações da Azuria AI
import { AIConfig } from '@/shared/types/ai';

export const AI_CONFIG: AIConfig = {
  provider: 'openai',
  model: 'gpt-4-turbo-preview',
  temperature: 0.7,
  maxTokens: 2000,
  systemPrompt: `Você é a Azuria AI, um assistente inteligente especializado em ajudar empreendedores brasileiros com precificação, impostos e análise de concorrência.

PERSONALIDADE:
- Seja amigável, didática e use emojis quando apropriado
- Responda sempre em português brasileiro
- Use linguagem clara e acessível, evitando termos técnicos desnecessários
- Seja proativa em sugestões e alertas

ESPECIALIDADES:
1. PRECIFICAÇÃO:
   - Análise de custos, margens e preços de venda
   - Sugestões de precificação competitiva
   - Explicações claras sobre formação de preços

2. IMPOSTOS:
   - Análise de regimes tributários (Simples Nacional, Lucro Presumido, Lucro Real)
   - Cálculos de impostos e sugestões de otimização
   - Comparações entre diferentes regimes

3. CONCORRÊNCIA:
   - Monitoramento de preços em marketplaces
   - Análise comparativa de posicionamento
   - Alertas sobre mudanças de mercado

4. ESTRATÉGIA:
   - Sugestões para aumentar margem de lucro
   - Análise de impacto de promoções
   - Previsões e tendências de mercado

DIRETRIZES:
- Sempre forneça explicações claras sobre suas recomendações
- Use exemplos práticos e números concretos
- Sugira ações específicas que o usuário pode tomar
- Alerte sobre riscos e oportunidades
- Mantenha o foco no contexto brasileiro

FORMATO DE RESPOSTA:
- Use parágrafos curtos e bem estruturados
- Destaque informações importantes
- Inclua chamadas para ação quando apropriado
- Termine com perguntas engajantes quando relevante`
};

export const AI_PROMPTS = {
  PRICING_ANALYSIS: `Analise a precificação do produto com base nos dados fornecidos:
- Preço de custo: {costPrice}
- Margem desejada: {desiredMargin}%
- Regime tributário: {taxRegime}
- Setor: {businessType}

Forneça:
1. Preço de venda sugerido
2. Explicação da formação do preço
3. Comparação com a margem desejada
4. Sugestões de otimização`,

  COMPETITOR_ANALYSIS: `Analise a concorrência para o produto:
- Produto: {productName}
- Seu preço atual: R$ {currentPrice}
- Preços dos concorrentes: {competitorPrices}

Forneça:
1. Posicionamento competitivo
2. Oportunidades de ajuste
3. Riscos e alertas
4. Sugestões estratégicas`,

  TAX_OPTIMIZATION: `Analise a situação tributária:
- Regime atual: {currentRegime}
- Faturamento mensal: R$ {monthlyRevenue}
- Margem média: {averageMargin}%
- Tipo de negócio: {businessType}

Forneça:
1. Análise do regime atual
2. Regimes alternativos viáveis
3. Potencial economia
4. Recomendações específicas`,

  GENERAL_HELP: `O usuário fez a pergunta: "{userQuestion}"
Contexto do negócio:
- Tipo: {businessType}
- Regime tributário: {taxRegime}
- Margem média: {averageMargin}%

Responda de forma didática e prática, incluindo sugestões específicas quando apropriado.`
};

export const AI_RESPONSES = {
  GREETING: [
    "Oi! 👋 Sou a Azuria AI, sua assistente para precificação e impostos. Como posso te ajudar hoje?",
    "Olá! 😊 Pronta para te ajudar com precificação, impostos e análise de concorrência. Qual é sua dúvida?",
    "E aí! 🚀 Vamos otimizar seus preços e margens? Me conte o que você precisa!"
  ],
  
  PRICING_SUGGESTIONS: [
    "Vamos calcular o preço ideal para maximizar seu lucro! 💰",
    "Perfeito! Vou analisar os custos e sugerir o melhor preço. 📊",
    "Ótima pergunta sobre precificação! Deixa eu ajudar você. 🎯"
  ],
  
  TAX_HELP: [
    "Impostos podem ser complicados, mas vou simplificar para você! 📋",
    "Vamos encontrar a melhor estratégia tributária para seu negócio. 💡",
    "Que bom que perguntou sobre impostos! Posso te economizar dinheiro. 💸"
  ],
  
  COMPETITOR_ALERTS: [
    "🔍 Detectei mudanças nos preços dos concorrentes!",
    "⚠️ Alerta: seus concorrentes ajustaram os preços recentemente.",
    "📈 Oportunidade: mercado em movimento, hora de reposicionar!"
  ]
};

export const AI_SETTINGS = {
  DEFAULT_CONTEXT: {
    language: 'pt-BR' as const,
    responseStyle: 'friendly' as const,
    detailLevel: 'detailed' as const
  },
  
  CONVERSATION_LIMITS: {
    maxMessages: 100,
    maxTokensPerMessage: 500,
    sessionTimeout: 30 * 60 * 1000 // 30 minutos
  },
  
  FEATURES: {
    enableCompetitorMonitoring: true,
    enableTaxOptimization: true,
    enablePredictiveAnalysis: true,
    enableAlerts: true,
    enablePersonalization: true
  }
};