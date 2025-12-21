/**
 * Insight Toast
 * 
 * Balãozinho que aparece automaticamente com insights da IA.
 */

import React, { useEffect, useRef, useState } from 'react';
import { type AzuriaEvent, emitEvent, on, unsubscribeFromEvent } from '../core/eventBus';
import { AlertTriangle, Info, Lightbulb, Sparkles, X } from 'lucide-react';
import { rewriteWithBrandVoice } from '../engines/brandVoiceEngine';

export type InsightType = 'info' | 'success' | 'warning' | 'insight' | 'suggestion' | 'forecast';

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
  brandTone?: string;
  persona?: string;
  refinedMessage?: string;
  emotion?: string;
  affectiveMessage?: string;
  emotionConfidence?: number;
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
  forecast: 'bg-indigo-50 border-indigo-200 text-indigo-900',
  };

  const typeIcons = {
    info: Info,
    success: Sparkles,
    warning: AlertTriangle,
    insight: Sparkles,
    suggestion: Lightbulb,
  forecast: Sparkles,
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
  const processed = useRef<Set<string>>(new Set());

  useEffect(() => {
    let changed = false;
    const updated = toasts.map((toast) => {
      if (processed.current.has(toast.id)) {return toast;}
      const tone = toast.brandTone || 'padrao';
      const refined = rewriteWithBrandVoice(toast.message, tone as any);
      processed.current.add(toast.id);
      if (refined !== toast.message || !toast.refinedMessage) {
        changed = true;
        return { ...toast, message: refined, refinedMessage: refined, brandTone: tone };
      }
      return toast;
    });
    if (changed) {setToasts(updated);}
  }, [toasts]);

  useEffect(() => {
    // Escutar eventos de insights gerados
    const subscriptionId = on('insight:generated', (event: AzuriaEvent) => {
      const toast: ToastItem = {
        id: `toast-${Date.now()}-${Math.random()}`,
        message: event.payload.message || 'Novo insight disponível',
        type: event.payload.type || 'insight',
        duration: 5000,
        timestamp: event.timestamp,
        brandTone: event.payload.brandTone,
        persona: event.payload.persona,
        refinedMessage: event.payload.refinedMessage,
        emotion: event.payload.emotion,
        emotionConfidence: event.payload.emotionConfidence,
        affectiveMessage: event.payload.affectiveMessage,
        actionLabel: event.payload?.suggestion ? 'Ver sugestão' : undefined,
        onAction: event.payload?.suggestion
          ? () =>
              emitEvent('ui:actionClicked', {
                suggestion: event.payload?.suggestion,
                source: event.payload?.sourceModule,
              })
          : undefined,
      };

      setToasts((prev) => [...prev, toast]);
    });

    // Escutar eventos preditivos dedicados
    const predictiveSubscription = on('ai:predictive-insight', (event: AzuriaEvent) => {
      const suggested = event.payload?.suggestedActions?.[0];
      const toast: ToastItem = {
        id: event.payload?.id || `forecast-${Date.now()}`,
        message:
          event.payload?.message ||
          'Possível queda de margem prevista. Ajuste antes que aconteça.',
        type: 'forecast',
        duration: 6000,
        timestamp: event.timestamp,
        actionLabel: suggested || 'Aplicar recomendação',
        onAction: () =>
          emitEvent('ui:actionClicked', {
            suggestion: suggested,
            context: event.payload?.context,
            type: 'forecast',
          }),
      };

      setToasts((prev) => [...prev, toast]);
    });

    const cognitiveSubscription = on('ai:pattern-detected', (event: AzuriaEvent) => {
      const message =
        event.payload?.patterns?.join('; ') ||
        'Padrão de uso identificado. Deseja agilizar esta tarefa?';
      const toast: ToastItem = {
        id: `pattern-${Date.now()}`,
        message,
        type: 'insight',
        duration: 6000,
        timestamp: event.timestamp,
      };
      setToasts(prev => [...prev, toast]);
    });

    const forecastSubscription = on('ai:forecast-generated', (event: AzuriaEvent) => {
      const toast: ToastItem = {
        id: `cog-forecast-${Date.now()}`,
        message: event.payload?.message || 'Previsão gerada com base no seu uso.',
        type: 'forecast',
        duration: 6000,
        timestamp: event.timestamp,
      };
      setToasts(prev => [...prev, toast]);
    });

    const anomalySubscription = on('ai:anomaly-detected', (event: AzuriaEvent) => {
      const toast: ToastItem = {
        id: `anomaly-${Date.now()}`,
        message: event.payload?.message || 'Detectamos um comportamento fora do padrão.',
        type: 'warning',
        duration: 6000,
        timestamp: event.timestamp,
      };
      setToasts(prev => [...prev, toast]);
    });

    const emotionSubscription = on('ai:emotion-inferred', (event: AzuriaEvent) => {
      const toast: ToastItem = {
        id: `emotion-${Date.now()}`,
        message: `Percebemos que você está ${event.payload?.emotionalState || 'em outro estado'}. Ajustaremos o tom das sugestões.`,
        type: 'insight',
        duration: 5000,
        timestamp: event.timestamp,
      };
      setToasts(prev => [...prev, toast]);
    });

    const profileSubscription = on('ai:user-profile-updated', (event: AzuriaEvent) => {
      const toast: ToastItem = {
        id: `profile-${Date.now()}`,
        message: 'Perfil adaptativo atualizado com base no seu uso recente.',
        type: 'info',
        duration: 4000,
        timestamp: event.timestamp,
      };
      setToasts(prev => [...prev, toast]);
    });

    const adaptiveSubscription = on('ui:adaptive-interface-changed', (event: AzuriaEvent) => {
      const mode = event.payload?.adaptation?.conciseMode ? 'modo conciso' : 'modo detalhado';
      const toast: ToastItem = {
        id: `adaptive-${Date.now()}`,
        message: `Interface ajustada para ${mode}.`,
        type: 'info',
        duration: 4000,
        timestamp: event.timestamp,
      };
      setToasts(prev => [...prev, toast]);
    });

    const driftSubscription = on('ai:internal-drift', (event: AzuriaEvent) => {
      const toast: ToastItem = {
        id: `drift-${Date.now()}`,
        message: 'Detectamos drift interno. Ajustando parâmetros de forma segura.',
        type: 'warning',
        duration: 5000,
        timestamp: event.timestamp,
      };
      setToasts(prev => [...prev, toast]);
    });

    const consistencySubscription = on('ai:consistency-warning', (event: AzuriaEvent) => {
      const toast: ToastItem = {
        id: `consistency-${Date.now()}`,
        message: event.payload?.message || 'Aviso de consistência interna.',
        type: 'warning',
        duration: 5000,
        timestamp: event.timestamp,
      };
      setToasts(prev => [...prev, toast]);
    });

    const stabilitySubscription = on('ai:stability-restored', (event: AzuriaEvent) => {
      const toast: ToastItem = {
        id: `stability-${Date.now()}`,
        message: 'Estabilidade interna restaurada.',
        type: 'success',
        duration: 4000,
        timestamp: event.timestamp,
      };
      setToasts(prev => [...prev, toast]);
    });

    const trendSubscription = on('ai:trend-detected', (event: AzuriaEvent) => {
      const toast: ToastItem = {
        id: `trend-${Date.now()}`,
        message: 'Padrão emergente identificado.',
        type: 'insight',
        duration: 4000,
        timestamp: event.timestamp,
      };
      setToasts(prev => [...prev, toast]);
    });

    const futureSubscription = on('ai:future-state-predicted', (event: AzuriaEvent) => {
      const toast: ToastItem = {
        id: `future-${Date.now()}`,
        message: 'Estado futuro previsto — veja o dashboard.',
        type: 'forecast',
        duration: 4000,
        timestamp: event.timestamp,
      };
      setToasts(prev => [...prev, toast]);
    });

    const temporalAnomalySubscription = on('ai:temporal-anomaly', (event: AzuriaEvent) => {
      const toast: ToastItem = {
        id: `tanomaly-${Date.now()}`,
        message: 'Anomalia temporal detectada — atenção!',
        type: 'warning',
        duration: 5000,
        timestamp: event.timestamp,
      };
      setToasts(prev => [...prev, toast]);
    });

    const emotionUpdateSub = on('ui:emotion-updated', (event: AzuriaEvent) => {
      const toast: ToastItem = {
        id: `emotion-ui-${Date.now()}`,
        message: event.payload?.message || 'Ajustamos o tom da interface.',
        type: 'insight',
        duration: 4000,
        timestamp: event.timestamp,
      };
      setToasts(prev => [...prev, toast]);
    });

    const adaptiveLayoutSub = on('ui:adaptive-layout', (event: AzuriaEvent) => {
      const toast: ToastItem = {
        id: `adaptive-ui-${Date.now()}`,
        message: 'Layout adaptado às suas preferências.',
        type: 'info',
        duration: 4000,
        timestamp: event.timestamp,
      };
      setToasts(prev => [...prev, toast]);
    });

    const internalInsightSub = on('ai:internal-insight', (event: AzuriaEvent) => {
      const toast: ToastItem = {
        id: `internal-${Date.now()}`,
        message: event.payload?.reason || 'Insight interno registrado.',
        type: 'insight',
        duration: 4000,
        timestamp: event.timestamp,
      };
      setToasts(prev => [...prev, toast]);
    });

    const contradictionSub = on('ai:contradiction-detected', (event: AzuriaEvent) => {
      const toast: ToastItem = {
        id: `contradiction-${Date.now()}`,
        message: 'Contradição interna detectada.',
        type: 'warning',
        duration: 5000,
        timestamp: event.timestamp,
      };
      setToasts(prev => [...prev, toast]);
    });

    const contextReconstructedSub = on('ai:context-reconstructed', (event: AzuriaEvent) => {
      const toast: ToastItem = {
        id: `context-${Date.now()}`,
        message: `Contexto reconstruído (confiança ${(event.payload?.confidence ?? 0.5) * 100}% ).`,
        type: 'info',
        duration: 5000,
        timestamp: event.timestamp,
      };
      setToasts(prev => [...prev, toast]);
    });

    const silentFailureSub = on('ai:silent-failure-detected', (event: AzuriaEvent) => {
      const toast: ToastItem = {
        id: `silent-${Date.now()}`,
        message: 'Falha silenciosa detectada.',
        type: 'warning',
        duration: 5000,
        timestamp: event.timestamp,
      };
      setToasts(prev => [...prev, toast]);
    });

    const strategicPlanSub = on('ai:strategic-plan-generated', (event: AzuriaEvent) => {
      const toast: ToastItem = {
        id: `plan-${Date.now()}`,
        message: 'Plano estratégico gerado.',
        type: 'insight',
        duration: 5000,
        timestamp: event.timestamp,
      };
      setToasts(prev => [...prev, toast]);
    });

    const strategicRiskSub = on('ai:structural-risk-detected', (event: AzuriaEvent) => {
      const toast: ToastItem = {
        id: `srisk-${Date.now()}`,
        message: 'Risco estrutural detectado.',
        type: 'warning',
        duration: 5000,
        timestamp: event.timestamp,
      };
      setToasts(prev => [...prev, toast]);
    });

    // ai:future-predicted removido - não existe no EventType
    // Use ai:future-state-predicted ao invés

    const engagementSub = on('ai:engagement-progress', (event: AzuriaEvent) => {
      const toast: ToastItem = {
        id: `eng-${Date.now()}`,
        message: `Streak atual: ${event.payload?.streak ?? 0}`,
        type: 'info',
        duration: 4000,
        timestamp: event.timestamp,
      };
      setToasts(prev => [...prev, toast]);
    });

    const dropSub = on('ai:engagement-drop-detected', (event: AzuriaEvent) => {
      const toast: ToastItem = {
        id: `drop-${Date.now()}`,
        message: 'Queda de uso detectada. Vamos retomar?',
        type: 'warning',
        duration: 5000,
        timestamp: event.timestamp,
      };
      setToasts(prev => [...prev, toast]);
    });

    const achievementSub = on('ai:achievement-unlocked', (event: AzuriaEvent) => {
      const toast: ToastItem = {
        id: `ach-${Date.now()}`,
        message: 'Conquista desbloqueada! 🎉',
        type: 'success',
        duration: 4000,
        timestamp: event.timestamp,
      };
      setToasts(prev => [...prev, toast]);
    });

    const nextActionSub = on('ai:next-best-action', (event: AzuriaEvent) => {
      const toast: ToastItem = {
        id: `nba-${Date.now()}`,
        message: event.payload?.action || 'Próxima ação sugerida.',
        type: 'insight',
        duration: 4000,
        timestamp: event.timestamp,
      };
      setToasts(prev => [...prev, toast]);
    });

    const storySub = on('ai:story-generated', (event: AzuriaEvent) => {
      const toast: ToastItem = {
        id: `story-${Date.now()}`,
        message: event.payload?.story || 'História gerada.',
        type: 'insight',
        duration: 5000,
        timestamp: event.timestamp,
      };
      setToasts(prev => [...prev, toast]);
    });

    const ethicalSub = on('ai:ethical-warning', (event: AzuriaEvent) => {
      const toast: ToastItem = {
        id: `eth-${Date.now()}`,
        message: event.payload?.message || '⚠️ Alerta ético emitido.',
        type: 'warning',
        duration: 6000,
        timestamp: event.timestamp,
      };
      setToasts(prev => [...prev, toast]);
    });

    const alignmentSub = on('ai:alignment-corrected', (event: AzuriaEvent) => {
      const toast: ToastItem = {
        id: `align-${Date.now()}`,
        message: event.payload?.message || '⚠️ Intenção divergente corrigida.',
        type: 'info',
        duration: 5000,
        timestamp: event.timestamp,
      };
      setToasts(prev => [...prev, toast]);
    });

    const safetySub = on('ai:safety-break', (event: AzuriaEvent) => {
      const toast: ToastItem = {
        id: `safety-${Date.now()}`,
        message: event.payload?.reason ? `🚫 Ação bloqueada: ${event.payload.reason}` : '🚫 Ação bloqueada por segurança',
        type: 'warning',
        duration: 6000,
        timestamp: event.timestamp,
      };
      setToasts(prev => [...prev, toast]);
    });

    const mindWarnSub = on('ai:mind-warning', (event: AzuriaEvent) => {
      const toast: ToastItem = {
        id: `mindwarn-${Date.now()}`,
        message: event.payload?.anomalies?.join(', ') || '⚠️ Alerta cognitivo interno.',
        type: 'warning',
        duration: 5000,
        timestamp: event.timestamp,
      };
      setToasts(prev => [...prev, toast]);
    });

    const mindSnapshotSub = on('ai:mind-snapshot', (event: AzuriaEvent) => {
      const toast: ToastItem = {
        id: `mindsnap-${Date.now()}`,
        message: 'Mapa cognitivo atualizado.',
        type: 'info',
        duration: 4000,
        timestamp: event.timestamp,
      };
      setToasts(prev => [...prev, toast]);
    });

    const realitySub = on('ai:reality-updated', (event: AzuriaEvent) => {
      const forces = event.payload?.forces ? Object.entries(event.payload.forces).map(([k,v]) => `${k}:${v}`).join(', ') : '';
      const toast: ToastItem = {
        id: `reality-${Date.now()}`,
        message: event.payload?.message || `Mudança detectada: ${forces || 'contexto atualizado'}.`,
        type: 'insight',
        duration: 5000,
        timestamp: event.timestamp,
      };
      setToasts(prev => [...prev, toast]);
    });

    const truthSub = on('ai:truth-alert', (event: AzuriaEvent) => {
      const toast: ToastItem = {
        id: `truth-${Date.now()}`,
        message: `Alerta de verdade: ${event.payload?.severity || 'verifique contexto'}`,
        type: 'warning',
        duration: 6000,
        timestamp: event.timestamp,
      };
      setToasts(prev => [...prev, toast]);
    });

    const stabilitySub = on('ai:stability-alert', (event: AzuriaEvent) => {
      const toast: ToastItem = {
        id: `stab-${Date.now()}`,
        message: `Estabilidade: risco ${Math.round((event.payload?.riskLevel || 0) * 100)}%`,
        type: event.payload?.severity === 'critical' ? 'warning' : 'info',
        duration: 5000,
        timestamp: event.timestamp,
      };
      setToasts(prev => [...prev, toast]);
    });

    const marketSub = on('ai:market-insight', (event: AzuriaEvent) => {
      const toast: ToastItem = {
        id: `market-${Date.now()}`,
        message: event.payload?.suggestion || event.payload?.topic || 'Nova insight de mercado detectado.',
        type: 'insight',
        duration: 5000,
        timestamp: event.timestamp,
      };
      setToasts(prev => [...prev, toast]);
    });

    const metaLayerSub = on('ai:meta-layer-updated', (event: AzuriaEvent) => {
      const toast: ToastItem = {
        id: `metalayer-${Date.now()}`,
        message: 'Pipeline cognitiva completa atualizada.',
        type: 'info',
        duration: 4000,
        timestamp: event.timestamp,
      };
      setToasts(prev => [...prev, toast]);
    });

    return () => {
      unsubscribeFromEvent(subscriptionId);
      unsubscribeFromEvent(predictiveSubscription);
      unsubscribeFromEvent(cognitiveSubscription);
      unsubscribeFromEvent(forecastSubscription);
      unsubscribeFromEvent(anomalySubscription);
      unsubscribeFromEvent(emotionSubscription);
      unsubscribeFromEvent(profileSubscription);
      unsubscribeFromEvent(adaptiveSubscription);
      unsubscribeFromEvent(driftSubscription);
      unsubscribeFromEvent(consistencySubscription);
      unsubscribeFromEvent(stabilitySubscription);
      unsubscribeFromEvent(trendSubscription);
      unsubscribeFromEvent(futureSubscription);
      unsubscribeFromEvent(temporalAnomalySubscription);
      unsubscribeFromEvent(emotionUpdateSub);
      unsubscribeFromEvent(adaptiveLayoutSub);
      unsubscribeFromEvent(internalInsightSub);
      unsubscribeFromEvent(contradictionSub);
      unsubscribeFromEvent(contextReconstructedSub);
      unsubscribeFromEvent(silentFailureSub);
      unsubscribeFromEvent(strategicPlanSub);
      unsubscribeFromEvent(strategicRiskSub);
      // futurePredSub removido
      unsubscribeFromEvent(engagementSub);
      unsubscribeFromEvent(dropSub);
      unsubscribeFromEvent(achievementSub);
      unsubscribeFromEvent(nextActionSub);
      unsubscribeFromEvent(storySub);
      unsubscribeFromEvent(ethicalSub);
      unsubscribeFromEvent(alignmentSub);
      unsubscribeFromEvent(safetySub);
      unsubscribeFromEvent(mindWarnSub);
      unsubscribeFromEvent(mindSnapshotSub);
      unsubscribeFromEvent(realitySub);
      unsubscribeFromEvent(truthSub);
      unsubscribeFromEvent(stabilitySub);
      unsubscribeFromEvent(marketSub);
      unsubscribeFromEvent(metaLayerSub);
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
