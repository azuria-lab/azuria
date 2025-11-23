/**
 * Chat Service - Azuria AI
 *
 * Serviço responsável pela comunicação com a IA
 */

import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/services/logger';
import {
  AIRequest,
  AIResponse,
  AIContext as AzuriaAIContext,
  ChatMessage,
  MessageRole,
  MessageType,
} from '@/types/azuriaAI';
import type { AIContext as SharedAIContext } from '@/shared/types/ai';

/**
 * Envia mensagem para a Azuria AI
 */
export async function sendMessageToAzuria(
  request: AIRequest
): Promise<AIResponse> {
  try {
    // Chamar Edge Function
    const { data, error } = await supabase.functions.invoke('azuria-chat', {
      body: request,
    });

    if (error) {
      throw error;
    }

    return data as AIResponse;
  } catch (error) {
    logger.error('Erro ao comunicar com Azuria AI:', error);

    // Fallback response
    return {
      message:
        'Desculpe, estou com dificuldades técnicas no momento. 😅 Pode tentar novamente em alguns segundos?',
      type: MessageType.TEXT,
      context: AzuriaAIContext.GENERAL,
    };
  }
}

/**
 * Detecta a intenção do usuário
 */
export function detectIntent(message: string): AzuriaAIContext {
  const lowerMessage = message.toLowerCase();

  // Precificação
  if (
    lowerMessage.includes('preço') ||
    lowerMessage.includes('precificar') ||
    lowerMessage.includes('cobrar') ||
    lowerMessage.includes('vender') ||
    lowerMessage.includes('margem')
  ) {
    return AzuriaAIContext.PRICING;
  }

  // Impostos
  if (
    lowerMessage.includes('imposto') ||
    lowerMessage.includes('tributo') ||
    lowerMessage.includes('simples') ||
    lowerMessage.includes('lucro presumido') ||
    lowerMessage.includes('lucro real') ||
    lowerMessage.includes('alíquota')
  ) {
    return AzuriaAIContext.TAX;
  }

  // Concorrência
  if (
    lowerMessage.includes('concorr') ||
    lowerMessage.includes('competidor') ||
    lowerMessage.includes('mercado livre') ||
    lowerMessage.includes('shopee') ||
    lowerMessage.includes('amazon')
  ) {
    return AzuriaAIContext.COMPETITOR;
  }

  // Marketplace
  if (
    lowerMessage.includes('marketplace') ||
    lowerMessage.includes('e-commerce') ||
    lowerMessage.includes('loja') ||
    lowerMessage.includes('venda online')
  ) {
    return AzuriaAIContext.MARKETPLACE;
  }

  return AzuriaAIContext.GENERAL;
}

/**
 * Cria mensagem de boas-vindas
 */
export function getWelcomeMessage(): ChatMessage {
  return {
    id: crypto.randomUUID(),
    role: MessageRole.ASSISTANT,
    content: `Oi! 👋 Eu sou a **Azuria**, sua assistente inteligente de precificação!

Estou aqui para te ajudar com:
• 💰 Cálculos de preços e margens
• 📊 Análise de impostos por regime tributário
• 🎯 Monitoramento de concorrentes
• 📈 Estratégias para aumentar lucro

Como posso te ajudar hoje?`,
    type: MessageType.TEXT,
    context: AzuriaAIContext.GENERAL,
    timestamp: new Date(),
  };
}

/**
 * Formata histórico de mensagens para enviar à IA
 */
export function formatHistoryForAI(messages: ChatMessage[]): string {
  return messages
    .slice(-10) // Últimas 10 mensagens
    .map(msg => {
      const role = msg.role === MessageRole.USER ? 'Usuário' : 'Azuria';
      return `${role}: ${msg.content}`;
    })
    .join('\n');
}

/**
 * Extrai dados do contexto do usuário
 */
export function extractUserContext(
  history: ChatMessage[]
): Record<string, string | number | boolean> {
  const context: Record<string, string | number | boolean> = {};

  // Procurar menções a valores numéricos
  const lastMessages = history.slice(-5);

  lastMessages.forEach(msg => {
    if (msg.role === MessageRole.USER) {
      // Extrair valores monetários
      const priceMatch = msg.content.match(/R\$\s?(\d+(?:[.,]\d+)?)/i);
      if (priceMatch) {
        context.mentioned_price = parseFloat(priceMatch[1].replace(',', '.'));
      }

      // Extrair percentuais
      const percentMatch = msg.content.match(/(\d+(?:[.,]\d+)?)\s?%/);
      if (percentMatch) {
        context.mentioned_percentage = parseFloat(
          percentMatch[1].replace(',', '.')
        );
      }
    }
  });

  return context;
}

/**
 * Salva mensagem no histórico
 */
export async function saveMessageToHistory(
  userId: string,
  sessionId: string,
  message: ChatMessage
): Promise<void> {
  try {
    // @ts-expect-error - chat_history table not in generated types yet
    await supabase.from('chat_history').insert({
      user_id: userId,
      session_id: sessionId,
      role: message.role,
      content: message.content,
      type: message.type,
      context: message.context,
      metadata: message.metadata,
      timestamp: message.timestamp,
    });
  } catch (error) {
    logger.error('Erro ao salvar mensagem:', error);
  }
}

/**
 * Carrega histórico de conversas
 */
export async function loadChatHistory(
  userId: string,
  sessionId: string
): Promise<ChatMessage[]> {
  try {
    const { data, error } = await supabase
      // @ts-expect-error - chat_history table not in generated types yet
      .from('chat_history')
      .select('*')
      .eq('user_id', userId)
      .eq('session_id', sessionId)
      .order('timestamp', { ascending: true });

    if (error) {
      throw error;
    }

    return (data || []).map(row => ({
      id: row.id,
      role: row.role,
      content: row.content,
      type: row.type,
      context: row.context,
      metadata: row.metadata,
      timestamp: new Date(row.timestamp),
    }));
  } catch (error) {
    logger.error('Erro ao carregar histórico:', error);
    return [];
  }
}

/**
 * Cria uma nova sessão de chat
 */
export async function createSession(
  userId: string,
  context: AzuriaAIContext | SharedAIContext | { userId: string; businessType?: string; conversationHistory?: unknown[]; preferences?: Record<string, unknown> }
): Promise<{ id: string; userId: string; status: string; context: AzuriaAIContext }> {
  const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  // Se context é um enum AIContext, usa diretamente
  let contextObj: AzuriaAIContext;
  if (typeof context === 'string' || typeof context === 'number') {
    // É um enum, usa diretamente
    contextObj = context as AzuriaAIContext;
  } else if ('businessType' in context) {
    // É um objeto SharedAIContext, extrai o tipo de negócio
    const businessType = (context as SharedAIContext).businessType;
    contextObj = businessType === 'comercio' ? AzuriaAIContext.PRICING :
                 businessType === 'servicos' ? AzuriaAIContext.TAX :
                 AzuriaAIContext.GENERAL;
  } else {
    // Contexto padrão
    contextObj = AzuriaAIContext.GENERAL;
  }
  
  return {
    id: sessionId,
    userId,
    status: 'active',
    context: contextObj,
  };
}

/**
 * Processa uma mensagem e retorna resposta
 */
export async function processMessage(
  sessionId: string,
  message: string
): Promise<ChatMessage> {
  const intent = detectIntent(message);
  const request: AIRequest = {
    message,
    context: {
      user_id: sessionId,
      session_id: sessionId,
      conversationHistory: [],
    },
    history: [],
    intent,
  };

  const response = await sendMessageToAzuria(request);
  
  return {
    id: `msg_${Date.now()}`,
    role: MessageRole.ASSISTANT,
    content: response.message,
    type: response.type,
    context: response.context,
    metadata: {
      data: response.data,
      suggestions: response.suggestions,
      quick_actions: response.quick_actions,
    },
    timestamp: new Date(),
  };
}

/**
 * Obtém uma sessão (stub - implementação futura)
 */
export function getSession(sessionId: string): { id: string; userId: string; status: string; messages: unknown[]; startedAt: Date; context: unknown } | null {
  // Stub implementation - retorna null por enquanto
  // No futuro, buscará do localStorage ou banco de dados
  return null;
}

/**
 * Fecha uma sessão (stub - implementação futura)
 */
export function closeSession(sessionId: string): void {
  // Stub implementation - apenas log
  logger.info('Sessão fechada:', sessionId);
}

/**
 * Objeto de serviço para compatibilidade com imports existentes
 */
export const chatService = {
  sendMessage: sendMessageToAzuria,
  detectIntent,
  getWelcomeMessage,
  formatHistory: formatHistoryForAI,
  extractContext: extractUserContext,
  saveMessage: saveMessageToHistory,
  loadHistory: loadChatHistory,
  createSession,
  processMessage,
  getSession,
  closeSession,
};
