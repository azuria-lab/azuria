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
  ChatMessage,
  ConversationContext,
  MessageRole,
  MessageType,
} from '@/types/azuriaAI';
import { v4 as uuidv4 } from 'uuid';
import { useToast } from '@/hooks/use-toast';
import { geminiAdapter } from '@/azuria_ai/engines/geminiAdapter';

const CHAT_HISTORY_KEY = 'azuria_chat_history';

// System prompt para a Azúria
const AZURIA_SYSTEM_PROMPT = `Você é a Azúria, assistente inteligente de precificação e gestão comercial do Azuria.

Você ajuda usuários brasileiros com:
- Cálculos de preço de venda, margem, markup e BDI
- Análise de custos e impostos (ICMS, PIS, COFINS, ISS)
- Estratégias de precificação para e-commerce, marketplace e licitações
- Simulações tributárias (Simples Nacional, Lucro Presumido, Lucro Real)
- Monitoramento de concorrência e alertas de preços
- Licitações e pregões eletrônicos

Diretrizes:
- Seja concisa, profissional e amigável
- Use português brasileiro natural
- Formate respostas com markdown quando apropriado (negrito, listas, etc)
- Use emojis com moderação para tornar a conversa mais agradável
- Dê exemplos práticos quando possível
- Se não souber algo, admita e sugira alternativas`;

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
          parsed.map((msg: ChatMessage) => ({
            ...msg,
            timestamp: new Date(msg.timestamp),
          }))
        );
      } catch {
        // Ignorar erro ao carregar histórico
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
      content: `Olá! 👋 Sou a **Azúria**, sua assistente de precificação e licitações.

Posso ajudar com:
📊 Precificação inteligente
💰 Análise tributária
🎯 Monitoramento de concorrência
📈 Margens de lucro

**Como posso ajudar hoje?**`,
      type: MessageType.TEXT,
      context: AIContext.GENERAL,
      timestamp: new Date(),
    };
    setMessages([welcomeMessage]);
  };

  /**
   * Obtém contexto da conversa
   */
  const _getConversationContext =
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
   * Formata histórico de mensagens para contexto
   */
  const formatHistoryForContext = (msgs: ChatMessage[]): string => {
    return msgs
      .slice(-6) // Últimas 6 mensagens
      .map(
        m =>
          `${m.role === MessageRole.USER ? 'Usuário' : 'Azúria'}: ${m.content}`
      )
      .join('\n\n');
  };

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

      // Formatar histórico para contexto
      const history = messages.slice(-10).map(m => ({
        role: m.role === MessageRole.USER ? 'user' : 'assistant',
        content: m.content,
      }));

      // Obter usuário atual
      const {
        data: { user },
      } = await supabase.auth.getUser();

      // Tentar via Edge Function (seguro - API key no servidor)
      try {
        const { data, error } = await supabase.functions.invoke('azuria-chat', {
          body: {
            message: userMessage,
            context: {
              user_id: user?.id || 'anonymous',
              session_id: sessionId,
              user_preferences: {
                tax_regime: 'simples_nacional',
                target_margin: 0.2,
              },
            },
            history,
          },
        });

        if (error) {
          throw error;
        }

        return {
          text: data.message,
          model: 'gemini-2.5-flash (Edge Function)',
          tokensUsed: 0,
          latencyMs: 0,
        };
      } catch (edgeFunctionError) {
        // Fallback para chamada direta (apenas em desenvolvimento)
        // eslint-disable-next-line no-console
        console.warn(
          '[useAzuriaChat] Edge Function falhou, usando fallback local:',
          edgeFunctionError
        );

        const historyContext = formatHistoryForContext(messages);
        const promptWithContext = historyContext
          ? `Histórico recente da conversa:\n${historyContext}\n\nNova mensagem do usuário: ${userMessage}`
          : userMessage;

        const response = await geminiAdapter.callModel({
          prompt: promptWithContext,
          systemPrompt: AZURIA_SYSTEM_PROMPT,
          temperature: 0.7,
          maxTokens: 1536,
        });

        return response;
      }
    },
    onSuccess: response => {
      // Adicionar resposta da IA
      const assistantMsg: ChatMessage = {
        id: uuidv4(),
        role: MessageRole.ASSISTANT,
        content: response.text,
        type: MessageType.TEXT,
        context: AIContext.GENERAL,
        metadata: {
          model: response.model,
          tokensUsed: response.tokensUsed,
          latencyMs: response.latencyMs,
        },
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, assistantMsg]);
      setIsTyping(false);
    },
    onError: (error: Error) => {
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
