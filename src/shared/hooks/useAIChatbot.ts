import { useCallback, useState } from 'react';
import { ChatMessage, ChatSession } from '@/types/ai';
import { logger } from '@/services/logger';
import { geminiAdapter } from '@/azuria_ai/engines/geminiAdapter';

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
          content:
            'Olá! Sou a Azúria, sua assistente de IA para precificação e gestão comercial. Como posso ajudar você hoje?',
          role: 'assistant',
          timestamp: new Date(),
          metadata: {
            intent: 'greeting',
            confidence: 100,
            suggestedActions: [
              'Como calcular preço de venda?',
              'Análise de margem de lucro',
              'Comparar com concorrentes',
            ],
          },
        },
      ],
      startedAt: new Date(),
      status: 'active',
      context: {
        userId: userId || 'anonymous',
        conversationHistory: [],
        preferences: {
          domain: 'pricing',
          language: 'pt-BR',
        },
      },
    };

    setSession(newSession);
    setIsOpen(true);
    setError(null);
  }, [userId]);

  const sendMessage = useCallback(
    async (content: string) => {
      if (!session) {
        startSession();
        return;
      }

      // Add user message
      const userMessage: ChatMessage = {
        id: `msg_${Date.now()}`,
        content,
        role: 'user',
        timestamp: new Date(),
      };

      setSession(prev =>
        prev
          ? {
              ...prev,
              messages: [...prev.messages, userMessage],
            }
          : null
      );

      setIsTyping(true);
      setError(null);

      try {
        // Call Gemini directly via local adapter
        const response = await geminiAdapter.callModel({
          prompt: content,
          systemPrompt: `Você é a Azúria, assistente inteligente de precificação e gestão comercial.
Você ajuda usuários brasileiros com:
- Cálculos de preço de venda, margem, markup
- Análise de custos e impostos (ICMS, PIS, COFINS)
- Estratégias de precificação para e-commerce e marketplace
- Licitações e pregões eletrônicos

Seja concisa, profissional e útil. Responda sempre em português brasileiro.
Use exemplos práticos quando apropriado.`,
          temperature: 0.7,
          maxTokens: 1024,
        });

        // Create assistant response
        const assistantMessage: ChatMessage = {
          id: `msg_${Date.now() + 1}`,
          content: response.text,
          role: 'assistant',
          timestamp: new Date(),
          metadata: {
            intent: 'pricing_assistance',
            confidence: 85,
            suggestedActions: extractSuggestedActions(response.text),
          },
        };

        setSession(prev =>
          prev
            ? {
                ...prev,
                messages: [...prev.messages, assistantMessage],
              }
            : null
        );
      } catch (err) {
        logger.error('Error sending message:', err);
        setError(err instanceof Error ? err.message : 'Erro desconhecido');

        // Add error message
        const errorMessage: ChatMessage = {
          id: `msg_${Date.now() + 1}`,
          content:
            'Desculpe, ocorreu um erro. Verifique se a API Key do Gemini está configurada corretamente.',
          role: 'assistant',
          timestamp: new Date(),
          metadata: {
            intent: 'error',
            confidence: 0,
          },
        };

        setSession(prev =>
          prev
            ? {
                ...prev,
                messages: [...prev.messages, errorMessage],
              }
            : null
        );
      } finally {
        setIsTyping(false);
      }
    },
    [session, startSession]
  );

  const closeSession = useCallback(() => {
    setSession(prev => (prev ? { ...prev, status: 'closed' } : null));
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
    toggleChat,
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
