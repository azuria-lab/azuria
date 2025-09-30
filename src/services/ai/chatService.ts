import { 
  AIConfig, 
  AIContext, 
  AIResponse,
  ChatMessage,
  ChatSession
} from '@/shared/types/ai';
import { AI_CONFIG } from '@/config/ai';
import { logger } from './logger';
import { pricingService } from './pricingService';
import { taxService } from './taxService';
import { competitorService } from './competitorService';
import { advancedTaxService } from './advancedTaxService';
import { alertsAndForecastingService } from './alertsAndForecastingService';
import { generateSecureMessageId, generateSecureSessionId } from '../../utils/secureRandom';

class ChatService {
  private sessions: Map<string, ChatSession> = new Map();
  private config: AIConfig = AI_CONFIG;

  /**
   * Cria uma nova sessão de chat
   */
  async createSession(userId: string, context: AIContext): Promise<ChatSession> {
    const sessionId = this.generateSessionId();
    const session: ChatSession = {
      id: sessionId,
      userId,
      messages: [],
      context,
      startedAt: new Date(),
      status: 'active',
      updatedAt: new Date(),
      isActive: true
    };

    this.sessions.set(sessionId, session);
    logger.info('Nova sessão de chat criada', { sessionId, userId });
    
    return session;
  }

  /**
   * Processa uma mensagem do usuário e gera resposta da IA
   */
  async processMessage(
    sessionId: string, 
    userMessage: string
  ): Promise<AIResponse> {
    const session = this.sessions.get(sessionId);
    if (!session) {
      throw new Error('Sessão não encontrada');
    }

    try {
      // Adiciona mensagem do usuário
      const userMessage_: ChatMessage = {
        id: this.generateMessageId(),
        type: 'user',
        role: 'user',
        content: userMessage,
        timestamp: new Date()
      };

      session.messages.push(userMessage_);

      // Detecta intenção e rota para serviço apropriado
      const intent = await this.detectIntent(userMessage);
      const response = await this.generateResponse(userMessage, intent, session.context);

      // Adiciona resposta da IA
      const aiMessage: ChatMessage = {
        id: this.generateMessageId(),
        type: 'ai',
        role: 'assistant',
        content: response.message,
        timestamp: new Date(),
        metadata: {
          action: intent,
          data: response.data
        }
      };

      session.messages.push(aiMessage);
      if (session.updatedAt !== undefined) {
        session.updatedAt = new Date();
      }

      logger.info('Mensagem processada', { 
        sessionId, 
        intent, 
        userMessage: userMessage.substring(0, 100) + '...' 
      });

      return response;

    } catch (error) {
      logger.error('Erro ao processar mensagem', { sessionId, error });
      return {
        message: 'Desculpe, ocorreu um erro ao processar sua mensagem. Pode tentar novamente? 😅',
        suggestions: [
          'Reformular a pergunta',
          'Tentar novamente',
          'Falar com suporte'
        ]
      };
    }
  }

  /**
   * Detecta a intenção da mensagem do usuário
   */
  private async detectIntent(message: string): Promise<string> {
    const lowerMessage = message.toLowerCase();
    
    // Palavras-chave para precificação
    if (this.containsKeywords(lowerMessage, [
      'preço', 'precificar', 'quanto cobrar', 'margem', 'lucro',
      'custo', 'vender por', 'valor', 'calcular preço'
    ])) {
      return 'pricing';
    }

    // Palavras-chave para impostos
    if (this.containsKeywords(lowerMessage, [
      'imposto', 'tributação', 'simples nacional', 'lucro presumido',
      'lucro real', 'regime tributário', 'alíquota', 'icms', 'pis', 'cofins'
    ])) {
      return 'tax';
    }

    // Palavras-chave para concorrência
    if (this.containsKeywords(lowerMessage, [
      'concorrente', 'mercado livre', 'shopee', 'amazon', 
      'concorrência', 'competição', 'outros vendedores'
    ])) {
      return 'competitor';
    }

    // Palavras-chave para alertas
    if (this.containsKeywords(lowerMessage, [
      'alerta', 'aviso', 'notificação', 'prejuízo', 'perda'
    ])) {
      return 'alert';
    }

    return 'general';
  }

  /**
   * Gera resposta baseada na intenção detectada
   */
  private async generateResponse(
    message: string, 
    intent: string, 
    context: AIContext
  ): Promise<AIResponse> {
    switch (intent) {
      case 'pricing':
        return await this.handlePricingQuery(message, context);
      
      case 'tax':
        return await this.handleTaxQuery(message, context);
      
      case 'competitor':
        return await this.handleCompetitorQuery(message, context);
      
      case 'alert':
        return await this.handleAlertQuery(message, context);
      
      default:
        return await this.handleGeneralQuery(message, context);
    }
  }

  /**
   * Trata consultas sobre precificação
   */
  private async handlePricingQuery(message: string, context: AIContext): Promise<AIResponse> {
    try {
      // Extrai dados da mensagem ou usa contexto
      const analysisData = this.extractPricingData(message, context);
      
      if (!analysisData.costPrice) {
        return {
          message: `Para te ajudar com a precificação, preciso de algumas informações! 💰

📋 **Me conta:**
- Qual o preço de custo do produto?
- Que margem de lucro você quer?
- Em qual regime tributário sua empresa está?

Exemplo: *"Tenho um produto que custa R$ 50, quero 40% de margem e estou no Simples Nacional"*`,
          suggestions: [
            'Informar preço de custo',
            'Definir margem desejada',
            'Confirmar regime tributário'
          ]
        };
      }

      const analysis = await pricingService.analyzePricing(analysisData);
      
      return {
        message: `💡 **Análise de Precificação**

🎯 **Preço sugerido:** R$ ${analysis.suggestedPrice.toFixed(2)}

📊 **Detalhamento:**
- Preço de custo: R$ ${analysis.costPrice.toFixed(2)}
- Impostos: R$ ${analysis.taxes.toFixed(2)}
- Margem líquida: ${((analysis.suggestedPrice - analysis.costPrice - analysis.taxes) / analysis.suggestedPrice * 100).toFixed(1)}%

💭 **Por que esse preço?**
${analysis.explanation}

${analysis.competitorAnalysis?.length ? 
  '🔍 **Comparação com concorrentes:**\n' + 
  analysis.competitorAnalysis.map(comp => 
    `- ${comp.platform}: R$ ${comp.price.toFixed(2)} (${comp.seller})`
  ).join('\n') : ''}`,
        data: analysis,
        actions: [
          {
            type: 'pricing',
            label: 'Ver análise detalhada',
            data: analysis
          }
        ]
      };

    } catch (error) {
      logger.error('Erro na análise de precificação', { error });
      return {
        message: 'Ops! Tive um problema ao analisar a precificação. Pode me dar mais detalhes sobre o produto? 🤔'
      };
    }
  }

  /**
   * Trata consultas sobre impostos
   */
  private async handleTaxQuery(message: string, context: AIContext): Promise<AIResponse> {
    try {
      const taxAnalysis = await taxService.analyzeTaxOptimization({
        currentRegime: context.taxRegime || 'simples_nacional',
        monthlyRevenue: this.extractRevenue(message),
        businessType: context.businessType || 'comercio'
      });

      const alternativeRegimesText = taxAnalysis.alternativeRegimes.length > 0 ? 
        '🔍 **Regimes alternativos:**\n' +
        taxAnalysis.alternativeRegimes.map(regime => 
          `- ${regime.description}: ${regime.rate}%`
        ).join('\n') + '\n' : '';

      const economyText = taxAnalysis.potentialSavings > 0 ? 
        `💸 **Economia potencial:** R$ ${taxAnalysis.potentialSavings.toFixed(2)}/mês` : '';

      return {
        message: `📋 **Análise Tributária**

🏛️ **Seu regime atual:** ${taxAnalysis.currentRegime.description}
💰 **Alíquota efetiva:** ${taxAnalysis.currentRegime.rate}%

${alternativeRegimesText}

💡 **Recomendações:**
${taxAnalysis.recommendations.map(rec => `• ${rec}`).join('\n')}

${economyText}`,
        data: taxAnalysis,
        actions: [
          {
            type: 'tax',
            label: 'Simular mudança de regime',
            data: taxAnalysis
          }
        ]
      };

    } catch (error) {
      logger.error('Erro na análise tributária', { error });
      return {
        message: 'Preciso de mais informações para analisar sua situação tributária. Qual seu faturamento mensal aproximado? 📊'
      };
    }
  }

  /**
   * Trata consultas sobre concorrência
   */
  private async handleCompetitorQuery(message: string, context: AIContext): Promise<AIResponse> {
    try {
      const productName = this.extractProductName(message);
      const competitorData = await competitorService.analyzeCompetitors(productName);

      return {
        message: `🔍 **Análise da Concorrência**

📦 **Produto:** ${productName}

💰 **Preços encontrados:**
${competitorData.map(comp => 
  `• ${comp.platform}: R$ ${comp.price.toFixed(2)} - ${comp.seller}`
).join('\n')}

📊 **Preço médio:** R$ ${(competitorData.reduce((sum, comp) => sum + comp.price, 0) / competitorData.length).toFixed(2)}

💡 **Recomendação:**
Para ser competitivo, sugiro um preço entre R$ ${Math.min(...competitorData.map(c => c.price)).toFixed(2)} e R$ ${Math.max(...competitorData.map(c => c.price)).toFixed(2)}.`,
        data: competitorData,
        actions: [
          {
            type: 'competitor',
            label: 'Monitorar preços',
            data: { productName, competitors: competitorData }
          }
        ]
      };

    } catch (error) {
      logger.error('Erro na análise de concorrência', { error });
      return {
        message: 'Para analisar a concorrência, preciso saber qual produto você está vendendo. Pode me contar mais detalhes? 🔍'
      };
    }
  }

  /**
   * Análise tributária avançada
   */
  private async handleAdvancedTaxQuery(message: string, context: AIContext): Promise<AIResponse> {
    try {
      // Verifica se a mensagem solicita análise completa
      const needsFullAnalysis = message.toLowerCase().includes('análise completa') || 
                              message.toLowerCase().includes('otimização') ||
                              message.toLowerCase().includes('planejamento');

      if (needsFullAnalysis && context.businessProfile) {
        const analysis = await advancedTaxService.performComprehensiveTaxAnalysis(context.businessProfile);
        
        return {
          message: `📊 **Análise Tributária Completa**

🎯 **Regime Atual:** ${analysis.currentAnalysis.currentRegime}
💰 **Carga Tributária:** ${analysis.currentAnalysis.effectiveRate.toFixed(2)}%

${analysis.optimizationPlan ? 
  `🚀 **Oportunidade Identificada!**
  
  **Regime Recomendado:** ${analysis.optimizationPlan.recommendedRegime}
  **Economia Anual:** R$ ${analysis.optimizationPlan.potentialSavingsAnnual.toLocaleString('pt-BR')}
  **Timeline:** ${analysis.optimizationPlan.timeline}
  
  **Próximos Passos:**
  ${analysis.optimizationPlan.implementationSteps.slice(0, 3).map(step => 
    `${step.step}. ${step.description} (${step.deadline})`
  ).join('\n  ')}` : 
  '✅ **Regime Atual Otimizado**\n\nSeu regime tributário atual já é o mais adequado para seu perfil.'
}

📈 **Projeções (12 meses):**
- Cenário conservador: R$ ${analysis.forecast.scenarios.conservative.taxes.toLocaleString('pt-BR')} em impostos
- Cenário realista: R$ ${analysis.forecast.scenarios.realistic.taxes.toLocaleString('pt-BR')} em impostos

💡 **Recomendações Estratégicas:**
${analysis.strategicRecommendations.slice(0, 3).join('\n')}`,
          data: analysis,
          actions: [
            {
              type: 'tax_plan',
              label: 'Ver plano detalhado',
              data: analysis.optimizationPlan
            },
            {
              type: 'tax_scenarios',
              label: 'Comparar regimes',
              data: analysis.scenarios
            }
          ]
        };
      }

      // Análise básica usando o serviço original
      const basicAnalysis = await taxService.analyzeTaxOptimization({
        currentRegime: context.taxRegime || 'simples_nacional',
        monthlyRevenue: this.extractRevenue(message),
        businessType: context.businessType || 'comercio'
      });

      return {
        message: `💰 **Análise Tributária**

📊 **Regime Atual:** ${basicAnalysis.currentRegime}
💸 **Carga Tributária:** ${basicAnalysis.effectiveRate.toFixed(2)}%
💰 **Impostos Mensais:** R$ ${basicAnalysis.monthlyTax.toFixed(2)}

${basicAnalysis.alternativeRegimes.length > 0 ? 
  '🔍 **Regimes Alternativos:**\n' +
  basicAnalysis.alternativeRegimes.map(regime => 
    `• ${regime.type}: ${regime.rate.toFixed(2)}% (R$ ${((this.extractRevenue(message) * regime.rate) / 100).toFixed(2)}/mês)`
  ).join('\n') : ''}

${basicAnalysis.recommendations.length > 0 ? 
  '\n💡 **Recomendações:**\n' + 
  basicAnalysis.recommendations.join('\n') : ''}

Quer uma **análise completa** com planejamento personalizado?`,
        data: basicAnalysis,
        suggestions: [
          'Análise completa de tributação',
          'Comparar todos os regimes',
          'Planejamento tributário personalizado'
        ]
      };

    } catch (error) {
      logger.error('Erro na análise tributária avançada', { error });
      return {
        message: 'Para fazer a análise tributária, preciso saber seu faturamento mensal e tipo de empresa. Pode me passar essas informações? 📊'
      };
    }
  }

  /**
   * Trata consultas sobre alertas
   */
  private async handleAlertQuery(message: string, context: AIContext): Promise<AIResponse> {
    try {
      // Verifica se usuário quer análise completa de alertas
      const wantsFullAnalysis = message.toLowerCase().includes('completa') || 
                               message.toLowerCase().includes('detalhada') ||
                               message.toLowerCase().includes('previsão');

      if (wantsFullAnalysis && context.businessProfile) {
        const monitoring = await alertsAndForecastingService.runMonitoringCycle(context.businessProfile);
        
        return {
          message: `� **Monitoramento Completo do Negócio**

🏥 **Saúde do Negócio:** ${monitoring.healthScore}/100
${this.getHealthStatusEmoji(monitoring.healthScore)}

⚠️ **Alertas Ativos:** ${monitoring.alerts.length}
${monitoring.alerts.length > 0 ? 
  monitoring.alerts.slice(0, 3).map(alert => 
    `• ${this.getAlertSeverityEmoji(alert.severity)} ${alert.title}`
  ).join('\n') : '✅ Nenhum alerta crítico'}

📈 **Previsões (3 meses):**
• Receita: R$ ${monitoring.forecast.forecasts.revenue.prediction.toLocaleString('pt-BR')} (tendência ${this.getTrendEmoji(monitoring.forecast.forecasts.revenue.trend)})
• Margem: ${monitoring.forecast.forecasts.margin.prediction.toFixed(1)}%
• Market Share: ${monitoring.forecast.forecasts.marketShare.prediction.toFixed(1)}%

🎯 **Ações Imediatas:**
${monitoring.immediateActions.slice(0, 3).join('\n')}`,
          data: monitoring,
          actions: [
            {
              type: 'alert',
              label: 'Ver todos os alertas',
              data: monitoring.alerts
            },
            {
              type: 'prediction',
              label: 'Análise preditiva detalhada',
              data: monitoring.forecast
            }
          ]
        };
      }

      // Análise básica de alertas
      const activeAlerts = alertsAndForecastingService.getActiveAlerts();
      
      return {
        message: `�🔔 **Sistema de Alertas Ativo**

📊 **Status Atual:**
• Alertas ativos: ${activeAlerts.length}
• Monitoramento: ✅ Ativo 24/7

🔍 **Estou monitorando:**
• ⚠️ Margens negativas
• 📊 Mudanças de preços dos concorrentes  
• 💰 Oportunidades de otimização tributária
• 🎯 Impacto de promoções
• 📈 Tendências de mercado
• 🏥 Saúde geral do negócio

${activeAlerts.length > 0 ? 
  '\n🚨 **Alertas Recentes:**\n' + 
  activeAlerts.slice(0, 3).map(alert => 
    `• ${alert.title} (${alert.severity})`
  ).join('\n') : ''}

Quer uma **análise completa** com previsões?`,
        suggestions: [
          'Análise completa de alertas',
          'Configurar alertas personalizados',
          'Ver previsões de negócio',
          'Analisar impacto de promoção'
        ]
      };

    } catch (error) {
      logger.error('Erro na análise de alertas', { error });
      return {
        message: `🔔 **Sistema de Alertas**

Estou sempre monitorando seu negócio e te aviso quando algo importante acontece!

Para ativar monitoramento personalizado, me conte mais sobre seu negócio. 📊`
      };
    }
  }

  /**
   * Trata consultas gerais
   */
  private async handleGeneralQuery(message: string, context: AIContext): Promise<AIResponse> {
    return {
      message: `Oi! 👋 Sou a Azuria AI, sua assistente especializada em:

💰 **Precificação Inteligente**
• Cálculo automático de preços
• Análise de margens e custos
• Sugestões de otimização

📋 **Análise Tributária**
• Comparação de regimes fiscais
• Cálculo de impostos
• Estratégias de economia

🔍 **Monitoramento de Concorrência**
• Comparação de preços em marketplaces
• Alertas de mudanças no mercado
• Posicionamento competitivo

Como posso te ajudar hoje? 😊`,
      suggestions: [
        'Calcular preço de um produto',
        'Analisar impostos',
        'Comparar com concorrentes',
        'Ver alertas importantes'
      ]
    };
  }

  // Métodos auxiliares
  private containsKeywords(text: string, keywords: string[]): boolean {
    return keywords.some(keyword => text.includes(keyword));
  }

  private extractPricingData(message: string, context: AIContext) {
    // Regex para extrair números (preços)
    const numbers = message.match(/\d+[.,]?\d*/g)?.map(n => parseFloat(n.replace(',', '.'))) || [];
    
    return {
      costPrice: numbers[0] || 0,
      desiredMargin: numbers[1] || (context.averageMargin || 30),
      taxRegime: context.taxRegime || 'simples_nacional',
      businessType: context.businessType || 'comercio'
    };
  }

  private extractRevenue(message: string): number {
    const numbers = message.match(/\d+[.,]?\d*/g)?.map(n => parseFloat(n.replace(',', '.'))) || [];
    return Math.max(...numbers) || 10000; // Default 10k
  }

  private extractProductName(message: string): string {
    // Lógica simples para extrair nome do produto
    const words = message.split(' ');
    const commonWords = ['preço', 'produto', 'vender', 'concorrente', 'mercado'];
    const productWords = words.filter(word => 
      word.length > 3 && !commonWords.includes(word.toLowerCase())
    );
    
    return productWords.slice(0, 3).join(' ') || 'produto';
  }

  private generateSessionId(): string {
    return generateSecureSessionId();
  }

  private generateMessageId(): string {
    return generateSecureMessageId();
  }

  /**
   * Obtém sessão por ID
   */
  getSession(sessionId: string): ChatSession | undefined {
    return this.sessions.get(sessionId);
  }

  /**
   * Lista sessões ativas de um usuário
   */
  getUserSessions(userId: string): ChatSession[] {
    return Array.from(this.sessions.values())
      .filter(session => session.userId === userId && (session.isActive ?? session.status === 'active'));
  }

  /**
   * Encerra uma sessão
   */
  closeSession(sessionId: string): void {
    const session = this.sessions.get(sessionId);
    if (session) {
      session.status = 'closed';
      if (session.isActive !== undefined) {
        session.isActive = false;
      }
      if (session.updatedAt !== undefined) {
        session.updatedAt = new Date();
      }
      logger.info('Sessão encerrada', { sessionId });
    }
  }

  /**
   * Métodos auxiliares para formatação
   */
  private getHealthStatusEmoji(healthScore: number): string {
    if (healthScore >= 80) {return '💚 Excelente';}
    if (healthScore >= 60) {return '💛 Atenção necessária';}
    return '🔴 Situação crítica';
  }

  private getAlertSeverityEmoji(severity: string): string {
    if (severity === 'critical') {return '🚨';}
    if (severity === 'high') {return '⚠️';}
    return 'ℹ️';
  }

  private getTrendEmoji(trend: string): string {
    if (trend === 'up') {return '📈';}
    if (trend === 'down') {return '📉';}
    return '➡️';
  }
}

export const chatService = new ChatService();