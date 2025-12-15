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
  LayoutDashboard,
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
import { MiniDashboard } from './MiniDashboard';
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
  /** Se o usuário é admin (para mostrar informações sensíveis) */
  isAdmin?: boolean;
  /** ID do usuário */
  userId?: string;
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
  low: 'border-l-muted-foreground/40',
  medium: 'border-l-primary/60',
  high: 'border-l-orange-500/60',
  critical: 'border-l-destructive/60',
};

/**
 * Helper function to get action button classes based on type
 */
const getActionButtonClass = (type: string): string => {
  switch (type) {
    case 'primary':
      return 'bg-primary text-primary-foreground hover:bg-primary/90';
    case 'secondary':
      return 'bg-muted text-muted-foreground hover:bg-muted/80';
    default:
      return 'text-muted-foreground hover:text-foreground';
  }
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
        bg-card rounded-lg shadow-sm border-l-2 border p-3 mb-2 
        transition-all duration-200 hover:shadow-md hover:border-l-4
        ${priorityColors[suggestion.priority] || priorityColors.medium}
      `}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <span className="text-primary flex-shrink-0">
            <SuggestionIcon type={suggestion.type} />
          </span>
          <h4 className="font-medium text-sm text-foreground truncate">
            {suggestion.title}
          </h4>
        </div>
        <button
          onClick={onDismiss}
          className="text-muted-foreground hover:text-foreground flex-shrink-0 transition-colors"
          aria-label="Fechar"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Message */}
      <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
        {suggestion.message}
      </p>

      {/* Details (expandable) */}
      {suggestion.details && (
        <div className="mt-2">
          <button
            onClick={onToggleExpand}
            className="text-xs text-primary hover:text-primary/80 flex items-center gap-1 transition-colors"
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
            <p className="text-xs text-muted-foreground mt-2 p-2 bg-muted/50 rounded">
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
                ${getActionButtonClass(action.type)}
              `}
            >
              {action.label}
            </button>
          ))}
        </div>
      )}

      {/* Feedback */}
      <div className="mt-3 pt-2 border-t border-border/50">
        {showFeedback ? (
          <div className="flex items-center gap-3">
            <span className="text-xs text-muted-foreground">Útil?</span>
            <button
              onClick={() => {
                onFeedback('helpful');
                setShowFeedback(false);
              }}
              className="text-green-600 hover:text-green-700 transition-colors"
              aria-label="Útil"
            >
              <ThumbsUp className="h-4 w-4" />
            </button>
            <button
              onClick={() => {
                onFeedback('not-helpful');
                setShowFeedback(false);
              }}
              className="text-destructive hover:text-destructive/80 transition-colors"
              aria-label="Não útil"
            >
              <ThumbsDown className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <button
            onClick={() => setShowFeedback(true)}
            className="text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            Esta sugestão foi útil?
          </button>
        )}
      </div>
    </div>
  );
};

// ============================================================================
// Helper Components for CoPilot
// ============================================================================

interface MinimizedButtonProps {
  onMouseDown: (e: React.MouseEvent) => void;
  onClick: () => void;
  isDragging: boolean;
  suggestionCount: number;
}

const MinimizedButton: React.FC<MinimizedButtonProps> = ({
  onMouseDown,
  onClick,
  isDragging,
  suggestionCount,
}) => (
  <button
    onMouseDown={onMouseDown}
    onClick={onClick}
    className={`
      relative w-16 h-16 rounded-full shadow-lg backdrop-blur-sm
      border-2 border-border/60 hover:border-border
      transition-all duration-300 hover:shadow-xl
      overflow-hidden
      ${isDragging ? 'cursor-grabbing scale-95 opacity-80' : 'cursor-grab'}
    `}
    aria-label="Abrir Co-Piloto"
  >
    <div className="absolute inset-0 flex items-center justify-center overflow-hidden rounded-full">
      <img
        src="/halo-ai-chat-avatar-v2.jpg"
        alt="Azuria AI"
        className="w-full h-full object-cover"
        loading="eager"
        decoding="async"
      />
    </div>
    {suggestionCount > 0 && (
      <span className="absolute -top-0.5 -right-0.5 bg-primary text-primary-foreground text-xs font-medium rounded-full h-5 w-5 flex items-center justify-center shadow-sm border-2 border-background z-10">
        {suggestionCount > 9 ? '9+' : suggestionCount}
      </span>
    )}
  </button>
);

interface SettingsPanelProps {
  isEnabled: boolean;
  toggle: () => void;
}

const SettingsPanel: React.FC<SettingsPanelProps> = ({ isEnabled, toggle }) => (
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
);

// ============================================================================
// Main Component
// ============================================================================

export const CoPilot: React.FC<CoPilotProps> = ({
  position = 'bottom-right',
  defaultMinimized = false,
  onSuggestionAccepted,
  onSuggestionDismissed,
  className = '',
  isAdmin = false,
  userId,
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
  const [isDashboardOpen, setIsDashboardOpen] = useState(false);
  
  // Estado para posição arrastável
  const [dragPosition, setDragPosition] = useState<{ x: number; y: number } | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [hasMoved, setHasMoved] = useState(false); // Para detectar se houve movimento durante o arrasto

  // Position classes
  const positionClasses: Record<string, string> = {
    'bottom-right': 'bottom-2 right-2',
    'bottom-left': 'bottom-2 left-2',
    'top-right': 'top-2 right-2',
    'top-left': 'top-2 left-2',
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

  // Handlers de arrastar com snap zones
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.button === 0) { // Apenas botão esquerdo
      setIsDragging(true);
      setHasMoved(false);
      const rect = e.currentTarget.getBoundingClientRect();
      setDragOffset({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      });
      e.preventDefault();
      e.stopPropagation();
    }
  }, []);

  const snapToEdge = useCallback((x: number, y: number) => {
    if (typeof globalThis.window === 'undefined') {
      return { x, y };
    }
    
    const threshold = 50; // Distância para ativar snap
    const elementWidth = isMinimized ? 64 : 360; // Tamanho do botão circular (64px)
    const elementHeight = isMinimized ? 64 : 400; // Altura aproximada do painel expandido
    const margin = 16; // Margem das bordas
    
    let snappedX = x;
    let snappedY = y;
    
    // Snap horizontal
    if (x < threshold) {
      snappedX = margin;
    } else if (x > window.innerWidth - threshold - elementWidth) {
      snappedX = window.innerWidth - elementWidth - margin;
    }
    
    // Snap vertical
    if (y < threshold) {
      snappedY = margin;
    } else if (y > window.innerHeight - threshold - elementHeight) {
      snappedY = window.innerHeight - elementHeight - margin;
    }
    
    return { x: snappedX, y: snappedY };
  }, [isMinimized]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (isDragging) {
      // Detectar se houve movimento significativo
      const movement = Math.abs(e.movementX) + Math.abs(e.movementY);
      if (movement > 3) {
        setHasMoved(true);
      }
      
      const newX = e.clientX - dragOffset.x;
      const newY = e.clientY - dragOffset.y;
      setDragPosition({ x: newX, y: newY });
    }
  }, [isDragging, dragOffset]);

  const handleMouseUp = useCallback(() => {
    if (isDragging && dragPosition) {
      // Aplicar snap quando soltar
      const snapped = snapToEdge(dragPosition.x, dragPosition.y);
      setDragPosition(snapped);
    }
    setIsDragging(false);
    // Reset hasMoved após um pequeno delay para permitir que o onClick seja processado
    setTimeout(() => setHasMoved(false), 100);
  }, [isDragging, dragPosition, snapToEdge]);

  // Adicionar/remover event listeners
  React.useEffect(() => {
    if (isDragging) {
      globalThis.addEventListener('mousemove', handleMouseMove);
      globalThis.addEventListener('mouseup', handleMouseUp);
      return () => {
        globalThis.removeEventListener('mousemove', handleMouseMove);
        globalThis.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp]);

  // Não renderizar se não estiver pronto ou desabilitado
  if (!isReady || !isEnabled) {
    return null;
  }

  // Badge de contagem
  const suggestionCount = suggestions.length;

  // Estilo de posição (arrastável ou fixa)
  const getContainerStyle = () => {
    if (dragPosition && typeof window !== 'undefined') {
      const maxWidth = isMinimized ? 56 : 360;
      const maxHeight = isMinimized ? 56 : 600;
      return {
        position: 'fixed' as const,
        left: `${Math.max(8, Math.min(dragPosition.x, window.innerWidth - maxWidth - 8))}px`,
        top: `${Math.max(8, Math.min(dragPosition.y, window.innerHeight - maxHeight - 8))}px`,
        maxWidth: isMinimized ? '56px' : '360px',
        width: '100%',
        transition: isDragging ? 'none' : 'left 0.3s ease-out, top 0.3s ease-out'
      };
    }
    if (dragPosition) {
      return {
        position: 'fixed' as const,
        left: `${dragPosition.x}px`,
        top: `${dragPosition.y}px`,
        maxWidth: isMinimized ? '56px' : '360px',
        width: '100%',
        transition: isDragging ? 'none' : 'left 0.3s ease-out, top 0.3s ease-out'
      };
    }
    return { maxWidth: isMinimized ? '56px' : '360px', width: '100%' };
  };
  
  const containerStyle = getContainerStyle();

  return (
    <div
      className={`
        fixed z-50 
        ${dragPosition ? '' : positionClasses[position]}
        ${className}
      `}
      style={containerStyle}
    >
      {/* Minimized State - Just the bubble */}
      {isMinimized ? (
        <MinimizedButton
          onMouseDown={handleMouseDown}
          onClick={() => {
            // Só expandir se não houve movimento (não foi arrasto)
            if (!hasMoved && !isDragging) {
              setIsMinimized(false);
            }
          }}
          isDragging={isDragging}
          suggestionCount={suggestionCount}
        />
      ) : (
        /* Expanded State */
        <div className="bg-background rounded-xl shadow-xl border border-border overflow-hidden backdrop-blur-sm">
          {/* Header - arrastável */}
          <div 
            className="bg-card border-b border-border px-4 py-3 flex items-center justify-between cursor-grab active:cursor-grabbing select-none"
            onMouseDown={handleMouseDown}
          >
            <div className="flex items-center gap-2 text-foreground">
              <AzuriaAvatarImage size="tiny" className="ring-1 ring-border/30" />
              <span className="font-medium text-sm">Co-Piloto Azuria</span>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsDashboardOpen(true);
                }}
                onMouseDown={(e) => e.stopPropagation()}
                className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-accent rounded transition-colors"
                aria-label="Abrir Dashboard"
                title="Ver Dashboard Completo"
              >
                <LayoutDashboard className="h-4 w-4" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowSettings(!showSettings);
                }}
                onMouseDown={(e) => e.stopPropagation()}
                className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-accent rounded transition-colors"
                aria-label="Configurações"
              >
                <Settings className="h-4 w-4" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsMinimized(true);
                }}
                onMouseDown={(e) => e.stopPropagation()}
                className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-accent rounded transition-colors"
                aria-label="Minimizar"
              >
                <ChevronDown className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Settings Panel */}
          {showSettings && (
            <SettingsPanel isEnabled={isEnabled} toggle={toggle} />
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
                {suggestions.length} sugest{suggestions.length === 1 ? 'ão ativa' : 'ões ativas'}
              </p>
            </div>
          )}
        </div>
      )}

      {/* MiniDashboard integrado */}
      <MiniDashboard
        isOpen={isDashboardOpen}
        onClose={() => setIsDashboardOpen(false)}
        userId={userId}
        isAdmin={isAdmin}
      />
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
