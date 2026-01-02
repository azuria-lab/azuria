/**
 * ══════════════════════════════════════════════════════════════════════════════
 * CONSCIOUSNESS TOAST - Componente de UI para Mensagens do Modo Deus
 * ══════════════════════════════════════════════════════════════════════════════
 * 
 * Este componente exibe as mensagens/insights do ConsciousnessCore
 * de forma elegante e não-intrusiva.
 */

import React, { useMemo } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { 
  AlertCircle,
  AlertTriangle,
  CheckCircle,
  Info,
  Lightbulb,
  Sparkles,
  TrendingUp,
  X,
} from 'lucide-react';
import { useConsciousnessContext } from '../ConsciousnessProvider';
import type { MessageSeverity, MessageType, OutputMessage } from '../types';

// ═══════════════════════════════════════════════════════════════════════════════
// TIPOS
// ═══════════════════════════════════════════════════════════════════════════════

interface ConsciousnessToastProps {
  /** Posição na tela */
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
  /** Máximo de toasts visíveis */
  maxVisible?: number;
}

// ═══════════════════════════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════════════════════════

function getIcon(type: MessageType, _severity: MessageSeverity): React.ReactNode {
  switch (type) {
    case 'insight':
      return <Lightbulb className="w-5 h-5" />;
    case 'suggestion':
      return <TrendingUp className="w-5 h-5" />;
    case 'warning':
      return <AlertTriangle className="w-5 h-5" />;
    case 'error':
      return <AlertCircle className="w-5 h-5" />;
    case 'tip':
      return <Info className="w-5 h-5" />;
    case 'explanation':
      return <Info className="w-5 h-5" />;
    case 'confirmation':
      return <CheckCircle className="w-5 h-5" />;
    case 'celebration':
      return <Sparkles className="w-5 h-5" />;
    default:
      return <Info className="w-5 h-5" />;
  }
}

function getColorClasses(type: MessageType, severity: MessageSeverity): string {
  // Por severidade primeiro
  if (severity === 'critical') {
    return 'bg-gradient-to-r from-red-500/20 to-red-600/10 border-red-500/50 text-red-100';
  }
  if (severity === 'high') {
    return 'bg-gradient-to-r from-orange-500/20 to-orange-600/10 border-orange-500/50 text-orange-100';
  }
  
  // Depois por tipo
  switch (type) {
    case 'insight':
      return 'bg-gradient-to-r from-blue-500/20 to-cyan-500/10 border-blue-500/50 text-blue-100';
    case 'suggestion':
      return 'bg-gradient-to-r from-emerald-500/20 to-teal-500/10 border-emerald-500/50 text-emerald-100';
    case 'warning':
      return 'bg-gradient-to-r from-amber-500/20 to-yellow-500/10 border-amber-500/50 text-amber-100';
    case 'error':
      return 'bg-gradient-to-r from-red-500/20 to-rose-500/10 border-red-500/50 text-red-100';
    case 'tip':
      return 'bg-gradient-to-r from-violet-500/20 to-purple-500/10 border-violet-500/50 text-violet-100';
    case 'confirmation':
      return 'bg-gradient-to-r from-green-500/20 to-emerald-500/10 border-green-500/50 text-green-100';
    case 'celebration':
      return 'bg-gradient-to-r from-fuchsia-500/20 to-pink-500/10 border-fuchsia-500/50 text-fuchsia-100';
    default:
      return 'bg-gradient-to-r from-slate-500/20 to-gray-500/10 border-slate-500/50 text-slate-100';
  }
}

function getIconColorClass(type: MessageType, severity: MessageSeverity): string {
  if (severity === 'critical') {
    return 'text-red-400';
  }
  if (severity === 'high') {
    return 'text-orange-400';
  }
  
  switch (type) {
    case 'insight': return 'text-blue-400';
    case 'suggestion': return 'text-emerald-400';
    case 'warning': return 'text-amber-400';
    case 'error': return 'text-red-400';
    case 'tip': return 'text-violet-400';
    case 'confirmation': return 'text-green-400';
    case 'celebration': return 'text-fuchsia-400';
    default: return 'text-slate-400';
  }
}

function getPositionClasses(position: string): string {
  switch (position) {
    case 'top-right':
      return 'top-4 right-4';
    case 'top-left':
      return 'top-4 left-4';
    case 'bottom-right':
      return 'bottom-4 right-4';
    case 'bottom-left':
      return 'bottom-4 left-4';
    default:
      return 'top-4 right-4';
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// COMPONENTE DE TOAST INDIVIDUAL
// ═══════════════════════════════════════════════════════════════════════════════

interface ToastItemProps {
  message: OutputMessage;
  onDismiss: () => void;
  onAccept: () => void;
}

const ToastItem = React.forwardRef<HTMLDivElement, ToastItemProps>(
  ({ message, onDismiss, onAccept }, ref) => {
    const colorClasses = getColorClasses(message.type, message.severity);
    const iconColorClass = getIconColorClass(message.type, message.severity);
    
    return (
      <motion.div
        ref={ref}
        layout
        initial={{ opacity: 0, x: 50, scale: 0.9 }}
        animate={{ opacity: 1, x: 0, scale: 1 }}
        exit={{ opacity: 0, x: 50, scale: 0.9 }}
        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
        className={`
          relative w-80 p-4 rounded-xl border backdrop-blur-xl
          shadow-2xl shadow-black/30
          ${colorClasses}
        `}
      >
      {/* Header */}
      <div className="flex items-start gap-3">
        {/* Icon */}
        <div className={`flex-shrink-0 mt-0.5 ${iconColorClass}`}>
          {getIcon(message.type, message.severity)}
        </div>
        
        {/* Content */}
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-sm leading-tight mb-1">
            {message.title}
          </h4>
          <p className="text-xs opacity-80 leading-relaxed">
            {message.message}
          </p>
        </div>
        
        {/* Dismiss button */}
        {message.dismissable && (
          <button
            onClick={onDismiss}
            className="flex-shrink-0 p-1 rounded-lg opacity-60 hover:opacity-100 
                       hover:bg-white/10 transition-all"
            aria-label="Dispensar"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
      
      {/* Actions */}
      {message.actions && message.actions.length > 0 && (
        <div className="mt-3 flex gap-2">
          {message.actions.map((action) => (
            <button
              key={action.id}
              onClick={() => {
                onAccept();
                // Executar handler se existir
              }}
              className={`
                px-3 py-1.5 text-xs font-medium rounded-lg transition-all
                ${action.type === 'primary' 
                  ? 'bg-white/20 hover:bg-white/30' 
                  : action.type === 'danger'
                    ? 'bg-red-500/20 hover:bg-red-500/30 text-red-200'
                    : 'bg-white/10 hover:bg-white/20'
                }
              `}
            >
              {action.label}
            </button>
          ))}
        </div>
      )}
      
      {/* Progress bar (TTL indicator) */}
      <motion.div
        className="absolute bottom-0 left-0 h-0.5 bg-white/30 rounded-full"
        initial={{ width: '100%' }}
        animate={{ width: '0%' }}
        transition={{ duration: message.ttl / 1000, ease: 'linear' }}
      />
    </motion.div>
    );
  }
);

ToastItem.displayName = 'ToastItem';

// ═══════════════════════════════════════════════════════════════════════════════
// COMPONENTE PRINCIPAL
// ═══════════════════════════════════════════════════════════════════════════════

export const ConsciousnessToast: React.FC<ConsciousnessToastProps> = ({
  position = 'top-right',
  maxVisible = 5,
}) => {
  const { activeMessages, dismiss, accept } = useConsciousnessContext();
  
  // Limitar mensagens visíveis
  const visibleMessages = useMemo(
    () => activeMessages.slice(0, maxVisible),
    [activeMessages, maxVisible]
  );
  
  const positionClasses = getPositionClasses(position);
  
  return (
    <div className={`fixed ${positionClasses} z-50 flex flex-col gap-3`}>
      <AnimatePresence mode="popLayout">
        {visibleMessages.map((message, index) => {
          // Criar chave única combinando múltiplos identificadores
          const uniqueKey = `${message.id}-${message.context.timestamp}-${message.context.eventId}-${message.semanticHash}-${index}`;
          return (
            <ToastItem
              key={uniqueKey}
              message={message}
              onDismiss={() => dismiss(message.id)}
              onAccept={() => accept(message.id)}
            />
          );
        })}
      </AnimatePresence>
    </div>
  );
};

export default ConsciousnessToast;

