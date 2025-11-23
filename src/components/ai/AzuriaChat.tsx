/**
 * Azuria Chat Component
 * 
 * Interface principal do chat com a Azuria AI
 */

import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Calculator,
  FileText,
  RefreshCw,
  Send,
  Sparkles,
  Trash2,
  TrendingUp,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useAzuriaChat } from '@/hooks/useAzuriaChat';
import { AzuriaAvatar } from './AzuriaAvatar';
import { MessageRole, MessageType } from '@/types/azuriaAI';
import { cn } from '@/lib/utils';
import ReactMarkdown from 'react-markdown';

interface AzuriaChatProps {
  className?: string;
  defaultOpen?: boolean;
}

export function AzuriaChat({ className, defaultOpen: _defaultOpen = false }: Readonly<AzuriaChatProps>) {
  const [inputValue, setInputValue] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);
  const {
    messages,
    isTyping,
    sendMessage,
    isSending,
    clearHistory,
    restartConversation,
    sendQuickAction,
  } = useAzuriaChat();

  // Auto-scroll para última mensagem
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const handleSend = () => {
    if (!inputValue.trim() || isSending) {return;}
    sendMessage(inputValue.trim());
    setInputValue('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const quickActions = [
    {
      label: 'Sugerir preço',
      icon: <TrendingUp className="w-4 h-4" />,
      action: 'Sugira um preço competitivo para meu produto',
    },
    {
      label: 'Analisar impostos',
      icon: <Calculator className="w-4 h-4" />,
      action: 'Analise meu regime tributário atual',
    },
    {
      label: 'Margem de lucro',
      icon: <FileText className="w-4 h-4" />,
      action: 'Calcule minha margem de lucro ideal',
    },
  ];

  const getMessageTypeIcon = (type: MessageType) => {
    switch (type) {
      case MessageType.PRICING_SUGGESTION:
        return <TrendingUp className="w-4 h-4 text-green-500" />;
      case MessageType.TAX_ANALYSIS:
        return <Calculator className="w-4 h-4 text-blue-500" />;
      case MessageType.COMPETITOR_ALERT:
        return <Sparkles className="w-4 h-4 text-orange-500" />;
      default:
        return null;
    }
  };

  return (
    <Card className={cn('flex flex-col h-[600px]', className)}>
      {/* Header */}
      <CardHeader className="border-b">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <AzuriaAvatar size="medium" isThinking={isTyping} emotion="neutral" />
            <div>
              <CardTitle className="text-lg">Azuria AI</CardTitle>
              <p className="text-xs text-muted-foreground">
                Assistente inteligente de precificação
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={restartConversation}
              title="Reiniciar conversa"
            >
              <RefreshCw className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={clearHistory}
              title="Limpar histórico"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardHeader>

      {/* Messages Area */}
      <ScrollArea className="flex-1 p-4" ref={scrollRef}>
        <div className="space-y-4">
          <AnimatePresence>
            {messages.map((message) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className={cn(
                  'flex gap-3',
                  message.role === MessageRole.USER ? 'flex-row-reverse' : 'flex-row'
                )}
              >
                {message.role === MessageRole.ASSISTANT && (
                  <AzuriaAvatar size="small" emotion="neutral" />
                )}

                  <div
                    className={cn(
                      'max-w-[80%] rounded-lg p-3 shadow-sm',
                      message.role === MessageRole.USER
                        ? 'bg-[#005BFF] text-white'
                        : 'bg-[#EAF6FF] border border-[#112B4A]/10 text-[#0A1930]'
                    )}
                >
                  {/* Message Type Badge */}
                  {message.type !== MessageType.TEXT && (
                    <Badge variant="outline" className="mb-2 text-xs">
                      {getMessageTypeIcon(message.type)}
                      <span className="ml-1">
                        {message.type.split('_').join(' ').toUpperCase()}
                      </span>
                    </Badge>
                  )}

                  {/* Message Content */}
                  <div className="prose prose-sm dark:prose-invert max-w-none">
                    <ReactMarkdown>{message.content}</ReactMarkdown>
                  </div>

                  {/* Quick Actions */}
                  {message.metadata?.quick_actions && Array.isArray(message.metadata.quick_actions) && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {(message.metadata.quick_actions as Array<{ label: string; action: string }>).map((action: { label: string; action: string }, i: number) => (
                        <Button
                          key={`quick-action-${i}-${action.label}`}
                          variant="outline"
                          size="sm"
                          onClick={() => sendQuickAction(action.action)}
                        >
                          {action.label}
                        </Button>
                      ))}
                    </div>
                  )}

                  {/* Timestamp */}
                  <p className="text-xs text-muted-foreground mt-2">
                    {new Date(message.timestamp).toLocaleTimeString('pt-BR', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Typing Indicator */}
          {isTyping && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex gap-3"
            >
              <AzuriaAvatar size="small" isThinking emotion="analyzing" />
              <div className="bg-muted rounded-lg p-3 shadow-sm">
                <div className="flex gap-1">
                  {[0, 1, 2].map((i) => (
                    <motion.div
                      key={i}
                      className="w-2 h-2 bg-[#00C2FF] rounded-full"
                      animate={{
                        scale: [1, 1.5, 1],
                        opacity: [0.5, 1, 0.5],
                      }}
                      transition={{
                        duration: 1,
                        repeat: Infinity,
                        delay: i * 0.2,
                      }}
                    />
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </ScrollArea>

      <Separator />

      {/* Quick Actions */}
      {messages.length <= 1 && (
        <div className="p-4 bg-muted/30">
          <p className="text-xs text-muted-foreground mb-2">Ações rápidas:</p>
          <div className="flex flex-wrap gap-2">
            {quickActions.map((action, index) => (
              <Button
                key={`quick-action-main-${index}-${action.label}`}
                variant="outline"
                size="sm"
                onClick={() => sendQuickAction(action.action)}
                className="text-xs"
              >
                {action.icon}
                <span className="ml-1">{action.label}</span>
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* Input Area */}
      <CardContent className="p-4 border-t">
        <div className="flex gap-2">
          <Input
            placeholder="Digite sua mensagem..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyPress}
            disabled={isSending}
            className="flex-1"
          />
          <Button
            onClick={handleSend}
            disabled={!inputValue.trim() || isSending}
            size="icon"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          Pressione Enter para enviar • Shift+Enter para quebra de linha
        </p>
      </CardContent>
    </Card>
  );
}

