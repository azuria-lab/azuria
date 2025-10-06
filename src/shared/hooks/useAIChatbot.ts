
import { useCallback, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ChatMessage, ChatSession } from "@/types/ai";
import { logger } from '@/services/logger';

export const useAIChatbot = (userId?: string) => {
  const [session, setSession] = useState<ChatSession | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const startSession = useCallback(() => {
    const newSession: ChatSession = {
      id: `session_${Date.now()}`,
      userId: userId || 'guest',
      messages: [
        {
          id: 'welcome',
          content: 'Olá! Sou seu assistente de IA para precificação. Como posso ajudar você hoje?',
          role: 'assistant',
          timestamp: new Date(),
          metadata: {
            intent: 'greeting',
            confidence: 100,
            suggestedActions: [
              'Como calcular preço de venda?',
              'Análise de margem de lucro',
              'Comparar com concorrentes'
            ]
          }
        }
      ],
      startedAt: new Date(),
      status: 'active',
      context: {
        userId: userId || 'anonymous',
        conversationHistory: [],
        preferences: {
          domain: 'pricing',
          language: 'pt-BR'
        }
      }
    };

    setSession(newSession);
    setIsOpen(true);
    setError(null);
  }, [userId]);

  const sendMessage = useCallback(async (content: string) => {
    if (!session) {
      startSession();
      return;
    }

    // Add user message
    const userMessage: ChatMessage = {
      id: `msg_${Date.now()}`,
      content,
      role: 'user',
      timestamp: new Date()
    };

    setSession(prev => prev ? {
      ...prev,
      messages: [...prev.messages, userMessage]
    } : null);

    setIsTyping(true);
    setError(null);

    try {
      // Call Gemini API via Supabase Edge Function
      const { data, error: apiError } = await supabase.functions.invoke('ai-gemini-chat', {
        body: {
          message: content,
          context: 'pricing',
          userId: userId
        }
      });

      if (apiError) {
        throw new Error(apiError.message || 'Erro na API');
      }

      // Create assistant response
      const assistantMessage: ChatMessage = {
        id: `msg_${Date.now() + 1}`,
        content: data.response,
        role: 'assistant',
        timestamp: new Date(),
        metadata: {
          intent: 'pricing_assistance',
          confidence: data.cached ? 100 : 85,
          suggestedActions: extractSuggestedActions(data.response)
        }
      };

      setSession(prev => prev ? {
        ...prev,
        messages: [...prev.messages, assistantMessage]
      } : null);

    } catch (err) {
  logger.error('Error sending message:', err);
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
      
      // Add error message
      const errorMessage: ChatMessage = {
        id: `msg_${Date.now() + 1}`,
        content: 'Desculpe, ocorreu um erro. Tente novamente em alguns instantes.',
        role: 'assistant',
        timestamp: new Date(),
        metadata: {
          intent: 'error',
          confidence: 0
        }
      };

      setSession(prev => prev ? {
        ...prev,
        messages: [...prev.messages, errorMessage]
      } : null);
    } finally {
      setIsTyping(false);
    }
  }, [session, startSession, userId]);

  const closeSession = useCallback(() => {
    setSession(prev => prev ? { ...prev, status: 'closed' } : null);
    setIsOpen(false);
    setError(null);
  }, []);

  const toggleChat = useCallback(() => {
    if (!isOpen && !session) {
      startSession();
    } else {
      setIsOpen(!isOpen);
    }
  }, [isOpen, session, startSession]);

  return {
    session,
    isTyping,
    isOpen,
    error,
    startSession,
    sendMessage,
    closeSession,
    toggleChat
  };
};

// Helper function to extract suggested actions from AI response
function extractSuggestedActions(response: string): string[] {
  const suggestions = [];
  
  if (response.toLowerCase().includes('margem')) {
    suggestions.push('Calcular margem ideal');
  }
  if (response.toLowerCase().includes('concorrente')) {
    suggestions.push('Analisar concorrência');
  }
  if (response.toLowerCase().includes('custo')) {
    suggestions.push('Revisar estrutura de custos');
  }
  if (response.toLowerCase().includes('preço')) {
    suggestions.push('Simular cenários de preço');
  }
  
  return suggestions.slice(0, 3); // Limit to 3 suggestions
}
