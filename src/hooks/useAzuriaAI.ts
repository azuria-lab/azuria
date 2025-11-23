import { useCallback, useEffect, useState } from 'react';
import { AIContext, BusinessProfile, ChatSession } from '@/shared/types/ai';
import { chatService } from '@/services/ai/chatService';
import { logger } from '@/services/logger';

interface UseAzuriaAIReturn {
  isOpen: boolean;
  session: ChatSession | null;
  openChat: () => void;
  closeChat: () => void;
  toggleChat: () => void;
  updateBusinessProfile: (profile: BusinessProfile) => void;
  hasActiveSession: boolean;
}

export const useAzuriaAI = (initialContext?: Partial<AIContext>): UseAzuriaAIReturn => {
  const [isOpen, setIsOpen] = useState(false);
  const [session, setSession] = useState<ChatSession | null>(null);

  /**
   * Inicializa a sessão de chat
   */
  const initializeSession = useCallback(async () => {
    if (!session) {
      const defaultContext: AIContext = {
        userId: 'dashboard-user',
        businessType: 'comercio',
        conversationHistory: [],
        preferences: {
          language: 'pt-BR',
          responseStyle: 'friendly',
          detailLevel: 'detailed'
        },
        ...initialContext
      };

      try {
        const newSessionResult = await chatService.createSession('dashboard-user', defaultContext);
        // Converte o resultado para ChatSession
        const newSession: ChatSession = {
          id: newSessionResult.id,
          userId: newSessionResult.userId,
          messages: [],
          startedAt: new Date(),
          status: newSessionResult.status as 'active' | 'closed',
          context: defaultContext,
        };
        setSession(newSession);

        // Mensagem de boas-vindas personalizada para o dashboard
        setTimeout(async () => {
          await chatService.processMessage(newSession.id, 'Olá! Sou a Azuria AI. Como posso ajudar você hoje?');
          // Não precisa fazer nada com a resposta aqui
        }, 500);
      } catch (error) {
        logger.error('Erro ao inicializar sessão da Azuria AI:', error);
      }
    }
  }, [session, initialContext]);

  /**
   * Abre o chat
   */
  const openChat = useCallback(() => {
    setIsOpen(true);
    initializeSession();
  }, [initializeSession]);

  /**
   * Fecha o chat
   */
  const closeChat = useCallback(() => {
    setIsOpen(false);
  }, []);

  /**
   * Alterna o estado do chat
   */
  const toggleChat = useCallback(() => {
    if (isOpen) {
      closeChat();
    } else {
      openChat();
    }
  }, [isOpen, openChat, closeChat]);

  /**
   * Atualiza o perfil empresarial no contexto
   */
  const updateBusinessProfile = useCallback((profile: BusinessProfile) => {
    if (session) {
      const updatedContext: AIContext = {
        userId: session.userId,
        conversationHistory: session.messages,
        preferences: session.context.preferences,
        businessProfile: profile,
        businessType: profile.businessType,
      };

      const updatedSession: ChatSession = {
        ...session,
        context: updatedContext,
        updatedAt: new Date()
      };

      setSession(updatedSession);
      
      // Nota: A atualização do contexto na sessão será feita através do processMessage
      // quando o usuário interagir novamente com o chat
    }
  }, [session]);

  /**
   * Verifica se há uma sessão ativa
   */
  const hasActiveSession = Boolean(session && session.status === 'active');

  /**
   * Carrega sessão persistente ao montar o componente
   */
  useEffect(() => {
    // Aqui você poderia carregar uma sessão salva do localStorage
    const savedSessionId = localStorage.getItem('azuria-ai-session-id');
    if (savedSessionId) {
      const savedSessionResult = chatService.getSession(savedSessionId);
      if (savedSessionResult && savedSessionResult.status === 'active') {
        // Converte para ChatSession
        const savedSession: ChatSession = {
          id: savedSessionResult.id,
          userId: savedSessionResult.userId,
          messages: savedSessionResult.messages as ChatMessage[],
          startedAt: savedSessionResult.startedAt,
          status: savedSessionResult.status as 'active' | 'closed',
          context: savedSessionResult.context as AIContext,
        };
        setSession(savedSession);
      }
    }
  }, []);

  /**
   * Salva a sessão no localStorage quando ela muda
   */
  useEffect(() => {
    if (session) {
      localStorage.setItem('azuria-ai-session-id', session.id);
    }
  }, [session]);

  /**
   * Cleanup ao desmontar
   */
  useEffect(() => {
    return () => {
      if (session && isOpen) {
        // Marca a sessão como inativa ao fechar
        chatService.closeSession(session.id);
      }
    };
  }, [session, isOpen]);

  return {
    isOpen,
    session,
    openChat,
    closeChat,
    toggleChat,
    updateBusinessProfile,
    hasActiveSession
  };
};