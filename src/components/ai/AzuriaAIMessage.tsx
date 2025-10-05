import React from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { AIAction, ChatMessage } from '@/shared/types/ai';
import { AzuriaAIAvatar } from './AzuriaAIAvatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  AlertTriangle, 
  Calculator, 
  Copy, 
  FileText,
  Lightbulb,
  ThumbsDown,
  ThumbsUp,
  TrendingUp
} from 'lucide-react';

interface AzuriaAIMessageProps {
  message: ChatMessage;
  onActionClick?: (action: AIAction) => void;
  onFeedback?: (messageId: string, feedback: 'positive' | 'negative') => void;
  onCopy?: (content: string) => void;
  showActions?: boolean;
}

export const AzuriaAIMessage: React.FC<AzuriaAIMessageProps> = ({
  message,
  onActionClick,
  onFeedback,
  onCopy,
  showActions = true
}) => {
  const isUser = message.role === 'user';
  const isAI = message.role === 'assistant' || message.type === 'ai';

  const getActionIcon = (actionType: string) => {
    switch (actionType) {
      case 'pricing':
        return Calculator;
      case 'tax':
        return FileText;
      case 'competitor':
        return TrendingUp;
      case 'alert':
        return AlertTriangle;
      case 'prediction':
        return Lightbulb;
      default:
        return Lightbulb;
    }
  };

  const formatMessageContent = (content: string) => {
    // Converte markdown simples para JSX
    return content
      .split('\n')
      .map((line, index) => {
        const key = `line-${index}-${line.substring(0, 10)}`;
        
        if (line.startsWith('**') && line.endsWith('**')) {
          return (
            <div key={key} className="font-semibold text-gray-900 mb-2">
              {line.replace(/\*\*/g, '')}
            </div>
          );
        }
        
        if (line.startsWith('• ') || line.startsWith('- ')) {
          return (
            <div key={key} className="flex items-start space-x-2 mb-1">
              <span className="text-blue-500 mt-1">•</span>
              <span>{line.substring(2)}</span>
            </div>
          );
        }
        
        if (line.trim() === '') {
          return <div key={key} className="h-2" />;
        }
        
        return (
          <div key={key} className="mb-1">
            {line}
          </div>
        );
      });
  };

  return (
    <div className={cn(
      'flex w-full mb-4',
      isUser ? 'justify-end' : 'justify-start'
    )}>
      <div className={cn(
        'flex max-w-[80%] space-x-3',
        isUser ? 'flex-row-reverse space-x-reverse' : 'flex-row'
      )}>
        {/* Avatar */}
        {isAI && (
          <AzuriaAIAvatar size="md" className="flex-shrink-0 mt-1" />
        )}
        
        {isUser && (
          <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center flex-shrink-0 mt-1">
            <span className="text-gray-600 text-sm font-medium">Você</span>
          </div>
        )}

        {/* Conteúdo da mensagem */}
        <div className={cn(
          'flex flex-col space-y-2',
          isUser ? 'items-end' : 'items-start'
        )}>
          {/* Balão da mensagem */}
          <div className={cn(
            'px-4 py-3 rounded-lg shadow-sm',
            isUser 
              ? 'bg-blue-600 text-white rounded-br-sm' 
              : 'bg-gray-100 text-gray-900 rounded-bl-sm'
          )}>
            <div className="text-sm leading-relaxed">
              {isAI ? formatMessageContent(message.content) : message.content}
            </div>
          </div>

          {/* Actions da IA */}
          {isAI && showActions && message.metadata?.data?.actions && (
            <div className="flex flex-wrap gap-2 mt-2">
              {message.metadata.data.actions.map((action: AIAction, index: number) => {
                const IconComponent = getActionIcon(action.type);
                return (
                  <Button
                    key={`action-${action.type}-${action.label}-${index}`}
                    variant="outline"
                    size="sm"
                    onClick={() => onActionClick?.(action)}
                    className="flex items-center space-x-2 text-xs"
                  >
                    <IconComponent className="w-3 h-3" />
                    <span>{action.label}</span>
                  </Button>
                );
              })}
            </div>
          )}

          {/* Sugestões */}
          {isAI && message.metadata?.suggestedActions && (
            <div className="flex flex-wrap gap-1 mt-2">
              {message.metadata.suggestedActions.map((suggestion: string, index: number) => (
                <Badge 
                  key={`suggestion-${suggestion}-${index}`}
                  variant="secondary"
                  className="text-xs cursor-pointer hover:bg-blue-100"
                  onClick={() => {
                    // Trigger suggestion as new user message
                    if (onActionClick) {
                      onActionClick({
                        type: 'prediction',
                        label: suggestion,
                        data: { suggestion }
                      });
                    }
                  }}
                >
                  {suggestion}
                </Badge>
              ))}
            </div>
          )}

          {/* Controles da mensagem */}
          <div className={cn(
            'flex items-center space-x-2 mt-1',
            isUser ? 'justify-end' : 'justify-start'
          )}>
            {/* Timestamp */}
            <span className="text-xs text-gray-500">
              {format(message.timestamp, 'HH:mm', { locale: ptBR })}
            </span>

            {/* Controles da IA */}
            {isAI && (
              <div className="flex items-center space-x-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onCopy?.(message.content)}
                  className="h-6 w-6 p-0 hover:bg-gray-200"
                >
                  <Copy className="w-3 h-3" />
                </Button>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onFeedback?.(message.id, 'positive')}
                  className="h-6 w-6 p-0 hover:bg-green-100 hover:text-green-600"
                >
                  <ThumbsUp className="w-3 h-3" />
                </Button>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onFeedback?.(message.id, 'negative')}
                  className="h-6 w-6 p-0 hover:bg-red-100 hover:text-red-600"
                >
                  <ThumbsDown className="w-3 h-3" />
                </Button>
              </div>
            )}
          </div>

          {/* Status/Intent badge */}
          {message.metadata?.intent && (
            <div className={cn(
              'mt-1',
              isUser ? 'self-end' : 'self-start'
            )}>
              <Badge variant="outline" className="text-xs">
                {message.metadata.intent}
              </Badge>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AzuriaAIMessage;