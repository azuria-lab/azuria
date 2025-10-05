/* eslint-disable @typescript-eslint/no-unused-vars */
import { ChatMessage, ChatSession, AIContext } from '@/shared/types/ai';
import { logger } from './logger';

class ChatService {
  private readonly sessions: Map<string, ChatSession> = new Map();

  /**
   * Cria uma nova sessão de chat
   */
  async createSession(userId: string, context: AIContext): Promise<ChatSession> {
    const session: ChatSession = {
      id: `session_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`,
      userId,
      messages: [],
      startedAt: new Date(),
      updatedAt: new Date(),
      status: 'active',
      context: context as unknown as Record<string, unknown>
    };
    
    this.sessions.set(session.id, session);
    return session;
  }

  /**
   * Processa uma mensagem e adiciona à sessão
   */
  async processMessage(sessionId: string, content: string): Promise<ChatMessage> {
    try {
      const message: ChatMessage = {
        id: `msg_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`,
        content,
        role: 'assistant',
        timestamp: new Date(),
        type: 'ai',
        metadata: {
          intent: 'greeting',
          confidence: 1.0,
          suggestedActions: []
        }
      };

      // Adiciona mensagem à sessão
      const session = this.sessions.get(sessionId);
      if (session) {
        session.messages.push(message);
        session.updatedAt = new Date();
      }

      logger.trackAIUsage('chat_message_processed', 0, true, {
        sessionId,
        messageCount: session?.messages.length || 0
      });

      return message;
    } catch (error) {
      logger.trackAIError('chat_process_message', error, { sessionId });
      throw new Error('Erro ao processar mensagem do chat');
    }
  }

  /**
   * Obtém uma sessão
   */
  getSession(sessionId: string): ChatSession | undefined {
    return this.sessions.get(sessionId);
  }

  /**
   * Obtém histórico de uma sessão
   */
  getSessionMessages(sessionId: string): ChatMessage[] {
    return this.sessions.get(sessionId)?.messages || [];
  }

  /**
   * Fecha uma sessão
   */
  closeSession(sessionId: string): void {
    const session = this.sessions.get(sessionId);
    if (session) {
      session.status = 'closed';
      session.updatedAt = new Date();
    }
  }

  /**
   * Limpa uma sessão
   */
  clearSession(sessionId: string): void {
    this.sessions.delete(sessionId);
  }
}

export const chatService = new ChatService();
