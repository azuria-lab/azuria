/**
 * Insight Toast
 * 
 * Balãozinho que aparece automaticamente com insights da IA.
 */

import React, { useEffect, useState } from 'react';
import { type AzuriaEvent, on } from '../core/eventBus';
import { AlertTriangle, Info, Lightbulb, Sparkles, X } from 'lucide-react';

export type InsightType = 'info' | 'success' | 'warning' | 'insight' | 'suggestion';

export interface InsightToastProps {
  message: string;
  type?: InsightType;
  duration?: number;
  onDismiss?: () => void;
  onAction?: () => void;
  actionLabel?: string;
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
}

interface ToastItem extends InsightToastProps {
  id: string;
  timestamp: number;
}

export const InsightToast: React.FC<InsightToastProps> = ({
  message,
  type = 'insight',
  duration = 5000,
  onDismiss,
  onAction,
  actionLabel,
  position = 'bottom-right',
}) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        setIsVisible(false);
        setTimeout(() => onDismiss?.(), 300); // Wait for exit animation
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [duration, onDismiss]);

  const handleDismiss = () => {
    setIsVisible(false);
    setTimeout(() => onDismiss?.(), 300);
  };

  const typeStyles = {
    info: 'bg-blue-50 border-blue-200 text-blue-900',
    success: 'bg-green-50 border-green-200 text-green-900',
    warning: 'bg-yellow-50 border-yellow-200 text-yellow-900',
    insight: 'bg-cyan-50 border-cyan-200 text-cyan-900',
    suggestion: 'bg-purple-50 border-purple-200 text-purple-900',
  };

  const typeIcons = {
    info: Info,
    success: Sparkles,
    warning: AlertTriangle,
    insight: Sparkles,
    suggestion: Lightbulb,
  };

  const positionStyles = {
    'top-right': 'top-4 right-4',
    'top-left': 'top-4 left-4',
    'bottom-right': 'bottom-20 right-4',
    'bottom-left': 'bottom-20 left-4',
  };

  const Icon = typeIcons[type];

  return (
    <div
      className={`
        fixed ${positionStyles[position]} z-50
        transform transition-all duration-300 ease-out
        ${isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}
      `}
    >
      <div
        className={`
          max-w-sm w-full sm:w-96
          p-4 rounded-lg border-2 shadow-lg
          ${typeStyles[type]}
          backdrop-blur-sm
        `}
      >
        <div className="flex items-start gap-3">
          {/* Icon */}
          <div className="flex-shrink-0">
            <Icon className="w-5 h-5" />
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium">{message}</p>
            
            {/* Action button */}
            {actionLabel && onAction && (
              <button
                onClick={onAction}
                className="
                  mt-2 text-xs font-semibold
                  hover:underline
                  transition-all
                "
              >
                {actionLabel} →
              </button>
            )}
          </div>

          {/* Close button */}
          <button
            onClick={handleDismiss}
            className="
              flex-shrink-0 p-1
              hover:bg-black/10 rounded
              transition-colors
            "
            aria-label="Fechar"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

/**
 * Hook para gerenciar fila de toasts
 */
export function useInsightToasts() {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  useEffect(() => {
    // Escutar eventos de insights gerados
    const subscriptionId = on('insight:generated', (event: AzuriaEvent) => {
      const toast: ToastItem = {
        id: `toast-${Date.now()}-${Math.random()}`,
        message: event.payload.message || 'Novo insight disponível',
        type: event.payload.type || 'insight',
        duration: 5000,
        timestamp: event.timestamp,
      };

      setToasts((prev) => [...prev, toast]);
    });

    return () => {
      // Cleanup subscription
    };
  }, []);

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  const showToast = (props: Omit<InsightToastProps, 'onDismiss'>) => {
    const toast: ToastItem = {
      ...props,
      id: `toast-${Date.now()}-${Math.random()}`,
      timestamp: Date.now(),
    };

    setToasts((prev) => [...prev, toast]);
  };

  return {
    toasts,
    showToast,
    dismissToast,
  };
}

/**
 * Container component to render all active toasts
 */
export const InsightToastContainer: React.FC = () => {
  const { toasts, dismissToast } = useInsightToasts();

  return (
    <>
      {toasts.map((toast, index) => (
        <div
          key={toast.id}
          style={{
            transform: `translateY(-${index * 80}px)`,
          }}
        >
          <InsightToast
            {...toast}
            onDismiss={() => dismissToast(toast.id)}
          />
        </div>
      ))}
    </>
  );
};

export default InsightToast;
