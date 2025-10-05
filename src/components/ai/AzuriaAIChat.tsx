import React, { useEffect, useRef, useState } from 'react';
import { Loader2, Mic, Paperclip, Send, Settings, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { AIAction, AIContext, ChatMessage } from '@/shared/types/ai';
import { AzuriaAIMessage } from './AzuriaAIMessage';
import { AzuriaAIAvatar } from './AzuriaAIAvatar';
import { chatService } from '@/services/ai/chatService';

interface AzuriaAIChatProps {
  className?: string;
  isMinimized?: boolean;
  onMinimize?: () => void;
  onClose?: () => void;
  context?: Partial<AIContext>;
}

export const AzuriaAIChat: React.FC<AzuriaAIChatProps> = ({
  className,
  isMinimized = false,
  onMinimize,
  onClose,
  context = {}
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Contexto padrão do usuário
  const defaultContext: AIContext = {
    userId: 'user-1', // Em produção, obter do sistema de auth
    businessType: 'comercio',
    taxRegime: 'simples_nacional',
    averageMargin: 30,
    preferences: {
      language: 'pt-BR',
      responseStyle: 'friendly',
      detailLevel: 'detailed'
    },
    ...context
  };

  // Sugestões rápidas
  const quickSuggestions = [
    '💰 Como calcular o preço de um produto?',
    '📊 Qual é o melhor regime tributário?',
    '🔍 Analisar concorrência',
    '⚠️ Ver alertas importantes'
  ];

  // Inicializa sessão de chat
  useEffect(() => {
    const initializeChat = async () => {
      try {
        const session = await chatService.createSession('user-1', defaultContext);
        setSessionId(session.id);
        
        // Mensagem de boas-vindas
        const welcomeMessage: ChatMessage = {
          id: 'welcome-1',
          role: 'assistant',
          type: 'ai',
          content: `Oi! 👋 Sou a Azuria AI, sua assistente especializada em precificação e impostos.

Posso te ajudar com:
💰 **Precificação inteligente** - calcular preços ideais
📋 **Análise tributária** - otimizar impostos  
🔍 **Monitoramento** - acompanhar concorrentes
📊 **Estratégia** - aumentar suas margens

Como posso te ajudar hoje? 😊`,
          timestamp: new Date(),
          metadata: {
            intent: 'greeting',
            suggestedActions: quickSuggestions
          }
        };
        
        setMessages([welcomeMessage]);
      } catch (error) {
        console.error('Erro ao inicializar chat:', error);
      }
    };

    if (!sessionId) {
      initializeChat();
    }
  }, [sessionId]);

  // Auto-scroll para última mensagem
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || !sessionId || isLoading) {return;}

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: inputMessage.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);
    setIsTyping(true);

    try {
      // Simula delay de processamento
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const response = await chatService.processMessage(sessionId, userMessage.content);
      
      const aiMessage: ChatMessage = {
        id: `ai-${Date.now()}`,
        role: 'assistant',
        type: 'ai',
        content: response.message,
        timestamp: new Date(),
        metadata: {
          suggestedActions: response.suggestions,
          data: { actions: response.actions }
        }
      };

      setMessages(prev => [...prev, aiMessage]);

    } catch (error) {
      console.error('Erro ao processar mensagem:', error);
      
      const errorMessage: ChatMessage = {
        id: `error-${Date.now()}`,
        role: 'assistant',
        type: 'ai',
        content: 'Desculpe, ocorreu um erro ao processar sua mensagem. Pode tentar novamente? 😅',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
      setIsTyping(false);
      inputRef.current?.focus();
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleActionClick = (action: AIAction) => {
    // Converte ação em mensagem do usuário
    const actionMessage = action.label;
    setInputMessage(actionMessage);
    
    // Envia automaticamente se for uma sugestão
    if (action.type === 'prediction' && action.data?.suggestion) {
      setTimeout(() => {
        handleSendMessage();
      }, 100);
    }
  };

  const handleQuickSuggestion = (suggestion: string) => {
    setInputMessage(suggestion);
    inputRef.current?.focus();
  };

  const handleFeedback = (messageId: string, feedback: 'positive' | 'negative') => {
    console.log('Feedback:', messageId, feedback);
    // Implementar lógica de feedback
  };

  const handleCopy = (content: string) => {
    navigator.clipboard.writeText(content);
    // Mostrar toast de sucesso
  };

  if (isMinimized) {
    return (
      <div className={cn(
        'fixed bottom-4 right-4 z-50',
        className
      )}>
        <Button
          onClick={onMinimize}
          className="rounded-full w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 shadow-lg"
        >
          <AzuriaAIAvatar size="md" />
        </Button>
      </div>
    );
  }

  return (
    <Card className={cn(
      'flex flex-col h-[600px] w-[400px] shadow-xl',
      className
    )}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b bg-gradient-to-r from-blue-50 to-purple-50">
        <div className="flex items-center space-x-3">
          <AzuriaAIAvatar size="md" isTyping={isTyping} />
          <div>
            <h3 className="font-semibold text-gray-900">Azuria AI</h3>
            <p className="text-sm text-gray-500">
              {isTyping ? 'Digitando...' : 'Assistente de Precificação'}
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-1">
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0"
          >
            <Settings className="w-4 h-4" />
          </Button>
          
          {onMinimize && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onMinimize}
              className="h-8 w-8 p-0"
            >
              <X className="w-4 h-4" />
            </Button>
          )}
          
          {onClose && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-8 w-8 p-0"
            >
              <X className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Messages Area */}
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {messages.map((message) => (
            <AzuriaAIMessage
              key={message.id}
              message={message}
              onActionClick={handleActionClick}
              onFeedback={handleFeedback}
              onCopy={handleCopy}
            />
          ))}
          
          {/* Loading indicator */}
          {isLoading && (
            <div className="flex justify-start">
              <div className="flex items-center space-x-3">
                <AzuriaAIAvatar size="md" isTyping />
                <div className="bg-gray-100 rounded-lg px-4 py-3">
                  <div className="flex items-center space-x-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span className="text-sm text-gray-600">Pensando...</span>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      {/* Quick Suggestions (mostrar apenas quando não há mensagens do usuário) */}
      {messages.length <= 1 && (
        <>
          <Separator />
          <div className="p-3">
            <div className="text-xs text-gray-500 mb-2">Sugestões rápidas:</div>
            <div className="flex flex-wrap gap-1">
              {quickSuggestions.map((suggestion, index) => (
                <Badge
                  key={`quick-${suggestion.substring(0, 10)}-${index}`}
                  variant="outline"
                  className="text-xs cursor-pointer hover:bg-blue-50"
                  onClick={() => handleQuickSuggestion(suggestion)}
                >
                  {suggestion}
                </Badge>
              ))}
            </div>
          </div>
        </>
      )}

      {/* Input Area */}
      <div className="p-4 border-t bg-white">
        <div className="flex items-center space-x-2">
          <div className="flex-1 relative">
            <Input
              ref={inputRef}
              placeholder="Digite sua pergunta..."
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={isLoading}
              className="pr-20"
            />
            
            <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center space-x-1">
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0"
                disabled
              >
                <Paperclip className="w-3 h-3" />
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0"
                disabled
              >
                <Mic className="w-3 h-3" />
              </Button>
            </div>
          </div>
          
          <Button
            onClick={handleSendMessage}
            disabled={!inputMessage.trim() || isLoading}
            className="h-10 w-10 p-0 bg-blue-600 hover:bg-blue-700"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </Button>
        </div>
        
        <div className="text-xs text-gray-400 mt-2 text-center">
          Azuria AI pode cometer erros. Verifique informações importantes.
        </div>
      </div>
    </Card>
  );
};

export default AzuriaAIChat;