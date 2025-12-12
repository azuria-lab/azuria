/**
 * @fileoverview CoPilot UI - Interface do Co-Piloto para usuários
 *
 * Widget flutuante que exibe sugestões do Co-Piloto de forma
 * não-intrusiva no canto da tela.
 *
 * @module azuria_ai/ui/CoPilot
 */

import React, { useCallback, useState } from 'react';
import {
  Bot,
  ChevronDown,
  ChevronUp,
  HelpCircle,
  Lightbulb,
  MessageSquare,
  Settings,
  ThumbsDown,
  ThumbsUp,
  X,
  Zap,
} from 'lucide-react';
import { AzuriaAvatarImage } from '@/components/ai/AzuriaAvatarImage';
import { useCoPilot } from '../hooks/useCoPilot';
import type { FeedbackType, Suggestion, SuggestionType } from '../types/operational';

// ============================================================================
// Types
// ============================================================================

export interface CoPilotProps {
  /** Posição do widget */
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
  /** Se está minimizado por padrão */
  defaultMinimized?: boolean;
  /** Callback quando sugestão é aceita */
  onSuggestionAccepted?: (suggestion: Suggestion, actionId?: string) => void;
  /** Callback quando sugestão é dispensada */
  onSuggestionDismissed?: (suggestion: Suggestion) => void;
  /** Classes CSS customizadas */
  className?: string;
}

// ============================================================================
// Helper Components
// ============================================================================

const SuggestionIcon: React.FC<{ type: SuggestionType }> = ({ type }) => {
  const icons: Record<SuggestionType, React.ReactNode> = {
    hint: <Lightbulb className="h-4 w-4" />,
    explanation: <HelpCircle className="h-4 w-4" />,
    warning: <Zap className="h-4 w-4" />,
    opportunity: <Lightbulb className="h-4 w-4" />,
    correction: <MessageSquare className="h-4 w-4" />,
    optimization: <Zap className="h-4 w-4" />,
    tutorial: <HelpCircle className="h-4 w-4" />,
    proactive: <Bot className="h-4 w-4" />,
  };

  return <>{icons[type] || <Lightbulb className="h-4 w-4" />}</>;
};

const priorityColors: Record<string, string> = {
  low: 'border-l-gray-400',
  medium: 'border-l-blue-500',
  high: 'border-l-orange-500',
  critical: 'border-l-red-500',
};

const SuggestionCard: React.FC<{
  suggestion: Suggestion;
  onAccept: (actionId?: string) => void;
  onDismiss: () => void;
  onFeedback: (type: FeedbackType) => void;
  isExpanded: boolean;
  onToggleExpand: () => void;
}> = ({
  suggestion,
  onAccept,
  onDismiss,
  onFeedback,
  isExpanded,
  onToggleExpand,
}) => {
  const [showFeedback, setShowFeedback] = useState(false);

  return (
    <div
      className={`
        bg-white rounded-lg shadow-md border-l-4 p-3 mb-2 
        transition-all duration-200 hover:shadow-lg
        ${priorityColors[suggestion.priority] || priorityColors.medium}
      `}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <span className="text-cyan-600 flex-shrink-0">
            <SuggestionIcon type={suggestion.type} />
          </span>
          <h4 className="font-medium text-sm text-gray-900 truncate">
            {suggestion.title}
          </h4>
        </div>
        <button
          onClick={onDismiss}
          className="text-gray-400 hover:text-gray-600 flex-shrink-0"
          aria-label="Fechar"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Message */}
      <p className="text-sm text-gray-600 mt-2 leading-relaxed">
        {suggestion.message}
      </p>

      {/* Details (expandable) */}
      {suggestion.details && (
        <div className="mt-2">
          <button
            onClick={onToggleExpand}
            className="text-xs text-cyan-600 hover:text-cyan-700 flex items-center gap-1"
          >
            {isExpanded ? (
              <>
                <ChevronUp className="h-3 w-3" /> Menos detalhes
              </>
            ) : (
              <>
                <ChevronDown className="h-3 w-3" /> Mais detalhes
              </>
            )}
          </button>
          {isExpanded && (
            <p className="text-xs text-gray-500 mt-2 p-2 bg-gray-50 rounded">
              {suggestion.details}
            </p>
          )}
        </div>
      )}

      {/* Actions */}
      {suggestion.actions && suggestion.actions.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-3">
          {suggestion.actions.map((action) => (
            <button
              key={action.id}
              onClick={() => {
                if (action.type === 'dismiss') {
                  onDismiss();
                } else {
                  onAccept(action.id);
                }
              }}
              className={`
                text-xs px-3 py-1.5 rounded-md transition-colors
                ${
                  action.type === 'primary'
                    ? 'bg-cyan-600 text-white hover:bg-cyan-700'
                    : action.type === 'secondary'
                      ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      : 'text-gray-500 hover:text-gray-700'
                }
              `}
            >
              {action.label}
            </button>
          ))}
        </div>
      )}

      {/* Feedback */}
      <div className="mt-3 pt-2 border-t border-gray-100">
        {!showFeedback ? (
          <button
            onClick={() => setShowFeedback(true)}
            className="text-xs text-gray-400 hover:text-gray-600"
          >
            Esta sugestão foi útil?
          </button>
        ) : (
          <div className="flex items-center gap-3">
            <span className="text-xs text-gray-500">Útil?</span>
            <button
              onClick={() => {
                onFeedback('helpful');
                setShowFeedback(false);
              }}
              className="text-green-500 hover:text-green-600"
              aria-label="Útil"
            >
              <ThumbsUp className="h-4 w-4" />
            </button>
            <button
              onClick={() => {
                onFeedback('not-helpful');
                setShowFeedback(false);
              }}
              className="text-red-500 hover:text-red-600"
              aria-label="Não útil"
            >
              <ThumbsDown className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

// ============================================================================
// Main Component
// ============================================================================

export const CoPilot: React.FC<CoPilotProps> = ({
  position = 'bottom-right',
  defaultMinimized = false,
  onSuggestionAccepted,
  onSuggestionDismissed,
  className = '',
}) => {
  const {
    suggestions,
    isEnabled,
    isReady,
    accept,
    dismiss,
    sendFeedback,
    toggle,
  } = useCoPilot();

  const [isMinimized, setIsMinimized] = useState(defaultMinimized);
  const [expandedSuggestions, setExpandedSuggestions] = useState<Set<string>>(
    new Set()
  );
  const [showSettings, setShowSettings] = useState(false);

  // Position classes
  const positionClasses: Record<string, string> = {
    'bottom-right': 'bottom-4 right-2',
    'bottom-left': 'bottom-4 left-2',
    'top-right': 'top-4 right-2',
    'top-left': 'top-4 left-2',
  };

  const handleAccept = useCallback(
    (suggestion: Suggestion, actionId?: string) => {
      accept(suggestion.id, actionId);
      onSuggestionAccepted?.(suggestion, actionId);
    },
    [accept, onSuggestionAccepted]
  );

  const handleDismiss = useCallback(
    (suggestion: Suggestion) => {
      dismiss(suggestion.id);
      onSuggestionDismissed?.(suggestion);
    },
    [dismiss, onSuggestionDismissed]
  );

  const handleFeedback = useCallback(
    (suggestionId: string, type: FeedbackType) => {
      sendFeedback(suggestionId, type);
    },
    [sendFeedback]
  );

  const toggleExpand = useCallback((suggestionId: string) => {
    setExpandedSuggestions((prev) => {
      const next = new Set(prev);
      if (next.has(suggestionId)) {
        next.delete(suggestionId);
      } else {
        next.add(suggestionId);
      }
      return next;
    });
  }, []);

  // Não renderizar se não estiver pronto ou desabilitado
  if (!isReady || !isEnabled) {
    return null;
  }

  // Badge de contagem
  const suggestionCount = suggestions.length;

  return (
    <div
      className={`
        fixed z-50 
        ${positionClasses[position]}
        ${className}
      `}
      style={{ maxWidth: '360px', width: '100%' }}
    >
      {/* Minimized State - Just the bubble */}
      {isMinimized ? (
        <button
          onClick={() => setIsMinimized(false)}
          className={`
            relative rounded-full shadow-lg 
            bg-gradient-to-br from-cyan-500 to-cyan-600 
            hover:from-cyan-600 hover:to-cyan-700
            transition-all duration-200 hover:scale-105
            p-1
          `}
          aria-label="Abrir Co-Piloto"
        >
          <AzuriaAvatarImage size="small" className="ring-2 ring-white" />
          {suggestionCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
              {suggestionCount > 9 ? '9+' : suggestionCount}
            </span>
          )}
        </button>
      ) : (
        /* Expanded State */
        <div className="bg-white rounded-xl shadow-xl border border-gray-200 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-cyan-500 to-cyan-600 px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2 text-white">
              <AzuriaAvatarImage size="tiny" className="ring-1 ring-white/50" />
              <span className="font-semibold text-sm">Co-Piloto Azuria</span>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setShowSettings(!showSettings)}
                className="p-1.5 text-white/80 hover:text-white hover:bg-white/10 rounded"
                aria-label="Configurações"
              >
                <Settings className="h-4 w-4" />
              </button>
              <button
                onClick={() => setIsMinimized(true)}
                className="p-1.5 text-white/80 hover:text-white hover:bg-white/10 rounded"
                aria-label="Minimizar"
              >
                <ChevronDown className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Settings Panel */}
          {showSettings && (
            <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-700">Co-Piloto ativo</span>
                <button
                  onClick={() => toggle()}
                  className={`
                    relative inline-flex h-6 w-11 items-center rounded-full
                    transition-colors focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2
                    ${isEnabled ? 'bg-cyan-600' : 'bg-gray-200'}
                  `}
                >
                  <span
                    className={`
                      inline-block h-4 w-4 transform rounded-full bg-white transition-transform
                      ${isEnabled ? 'translate-x-6' : 'translate-x-1'}
                    `}
                  />
                </button>
              </div>
            </div>
          )}

          {/* Content */}
          <div className="max-h-96 overflow-y-auto p-4">
            {suggestions.length === 0 ? (
              <div className="text-center py-6">
                <AzuriaAvatarImage size="large" className="mx-auto mb-2 opacity-50" />
                <p className="text-sm text-gray-500">
                  Nenhuma sugestão no momento
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  Continue navegando, estou aqui para ajudar!
                </p>
              </div>
            ) : (
              suggestions.map((suggestion) => (
                <SuggestionCard
                  key={suggestion.id}
                  suggestion={suggestion}
                  onAccept={(actionId) => handleAccept(suggestion, actionId)}
                  onDismiss={() => handleDismiss(suggestion)}
                  onFeedback={(type) => handleFeedback(suggestion.id, type)}
                  isExpanded={expandedSuggestions.has(suggestion.id)}
                  onToggleExpand={() => toggleExpand(suggestion.id)}
                />
              ))
            )}
          </div>

          {/* Footer */}
          {suggestions.length > 0 && (
            <div className="px-4 py-2 bg-gray-50 border-t border-gray-100">
              <p className="text-xs text-gray-400 text-center">
                {suggestions.length} sugestão{suggestions.length !== 1 ? 'ões' : ''} ativa{suggestions.length !== 1 ? 's' : ''}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// ============================================================================
// Compact Version (for inline use)
// ============================================================================

export const CoPilotInline: React.FC<{
  maxSuggestions?: number;
  className?: string;
}> = ({ maxSuggestions = 1, className = '' }) => {
  const { suggestions, accept, dismiss, sendFeedback } = useCoPilot();
  const [expandedSuggestions, setExpandedSuggestions] = useState<Set<string>>(
    new Set()
  );

  const visibleSuggestions = suggestions.slice(0, maxSuggestions);

  if (visibleSuggestions.length === 0) {
    return null;
  }

  return (
    <div className={`space-y-2 ${className}`}>
      {visibleSuggestions.map((suggestion) => (
        <SuggestionCard
          key={suggestion.id}
          suggestion={suggestion}
          onAccept={(actionId) => accept(suggestion.id, actionId)}
          onDismiss={() => dismiss(suggestion.id)}
          onFeedback={(type) => sendFeedback(suggestion.id, type)}
          isExpanded={expandedSuggestions.has(suggestion.id)}
          onToggleExpand={() => {
            setExpandedSuggestions((prev) => {
              const next = new Set(prev);
              if (next.has(suggestion.id)) {
                next.delete(suggestion.id);
              } else {
                next.add(suggestion.id);
              }
              return next;
            });
          }}
        />
      ))}
    </div>
  );
};

// ============================================================================
// Export
// ============================================================================

export default CoPilot;
