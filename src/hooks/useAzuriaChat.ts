/**
 * useAzuriaChat Hook
 *
 * Hook personalizado para gerenciar o chat com a Azuria AI
 */

import { useCallback, useEffect, useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import {
  AIContext,
  AIRequest,
  AIResponse,
  ChatMessage,
  ConversationContext,
  MessageRole,
  MessageType,
} from '@/types/azuriaAI';
import { v4 as uuidv4 } from 'uuid';
import { useToast } from '@/hooks/use-toast';

const AZURIA_AI_EDGE_FUNCTION = 'azuria-chat';
const CHAT_HISTORY_KEY = 'azuria_chat_history';

/**
 * Hook principal do chat
 */
export function useAzuriaChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [sessionId] = useState<string>(() => uuidv4());
  const { toast } = useToast();

  // Carregar histórico do localStorage
  useEffect(() => {
    const savedHistory = localStorage.getItem(CHAT_HISTORY_KEY);
    if (savedHistory) {
      try {
        const parsed = JSON.parse(savedHistory);
        setMessages(
          parsed.map((msg: any) => ({
            ...msg,
            timestamp: new Date(msg.timestamp),
          }))
        );
      } catch (error) {
        console.error('Erro ao carregar histórico:', error);
      }
    } else {
      // Mensagem de boas-vindas
      addWelcomeMessage();
    }
  }, []);

  // Salvar histórico no localStorage
  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem(CHAT_HISTORY_KEY, JSON.stringify(messages));
    }
  }, [messages]);

  /**
   * Adiciona mensagem de boas-vindas
   */
  const addWelcomeMessage = () => {
    const welcomeMessage: ChatMessage = {
      id: uuidv4(),
      role: MessageRole.ASSISTANT,
      content: `Olá! 👋 Eu sou a **Azuria**, sua assistente inteligente de precificação e análise de licitações!

Posso te ajudar com:
📊 **Precificação inteligente** - sugestões baseadas em custos e mercado
💰 **Análise tributária** - simulações por regime (Simples, Presumido, Real)
🎯 **Monitoramento de concorrência** - alertas de preços
📈 **Margens de lucro** - análise de viabilidade

**Como posso te ajudar hoje?**`,
      type: MessageType.TEXT,
      context: AIContext.GENERAL,
      timestamp: new Date(),
    };
    setMessages([welcomeMessage]);
  };

  /**
   * Obtém contexto da conversa
   */
  const getConversationContext =
    useCallback(async (): Promise<ConversationContext> => {
      const { data: userData } = await supabase.auth.getUser();
      const userId = userData.user?.id || 'anonymous';

      return {
        user_id: userId,
        session_id: sessionId,
        user_preferences: {
          tax_regime: 'simples_nacional',
          target_margin: 0.2,
        },
      };
    }, [sessionId]);

  /**
   * Enviar mensagem para a IA
   */
  const sendMessage = useMutation({
    mutationFn: async (userMessage: string) => {
      setIsTyping(true);

      // Adicionar mensagem do usuário
      const userMsg: ChatMessage = {
        id: uuidv4(),
        role: MessageRole.USER,
        content: userMessage,
        type: MessageType.TEXT,
        context: AIContext.GENERAL,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, userMsg]);

      // Preparar contexto
      const context = await getConversationContext();

      // Preparar request
      const aiRequest: AIRequest = {
        message: userMessage,
        context,
        history: messages.slice(-10), // Últimas 10 mensagens para contexto
      };

      // Chamar Edge Function
      const { data, error } = await supabase.functions.invoke(
        AZURIA_AI_EDGE_FUNCTION,
        {
          body: aiRequest,
        }
      );

      if (error) {
        throw new Error(error.message || 'Erro ao se comunicar com a IA');
      }

      const aiResponse: AIResponse = data;

      // Adicionar resposta da IA
      const assistantMsg: ChatMessage = {
        id: uuidv4(),
        role: MessageRole.ASSISTANT,
        content: aiResponse.message,
        type: aiResponse.type,
        context: aiResponse.context,
        metadata: {
          data: aiResponse.data,
          suggestions: aiResponse.suggestions,
          quick_actions: aiResponse.quick_actions,
        },
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, assistantMsg]);
      setIsTyping(false);

      return aiResponse;
    },
    onError: (error: any) => {
      setIsTyping(false);
      toast({
        title: 'Erro ao enviar mensagem',
        description:
          error.message || 'Não foi possível se comunicar com a Azuria AI.',
        variant: 'destructive',
      });

      // Mensagem de erro da IA
      const errorMsg: ChatMessage = {
        id: uuidv4(),
        role: MessageRole.ASSISTANT,
        content: `Desculpe, tive um problema ao processar sua mensagem. 😔\n\nPor favor, tente novamente ou reformule sua pergunta.`,
        type: MessageType.TEXT,
        context: AIContext.GENERAL,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMsg]);
    },
  });

  /**
   * Limpar histórico
   */
  const clearHistory = useCallback(() => {
    setMessages([]);
    localStorage.removeItem(CHAT_HISTORY_KEY);
    addWelcomeMessage();
    toast({
      title: 'Histórico limpo',
      description: 'O histórico do chat foi limpo com sucesso.',
    });
  }, [toast]);

  /**
   * Reiniciar conversa
   */
  const restartConversation = useCallback(() => {
    clearHistory();
  }, [clearHistory]);

  /**
   * Enviar ação rápida
   */
  const sendQuickAction = useCallback(
    (action: string) => {
      sendMessage.mutate(action);
    },
    [sendMessage]
  );

  return {
    messages,
    isTyping,
    sendMessage: sendMessage.mutate,
    isSending: sendMessage.isPending,
    clearHistory,
    restartConversation,
    sendQuickAction,
  };
}
