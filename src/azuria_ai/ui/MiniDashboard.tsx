/**
 * Mini Dashboard
 * 
 * Painel lateral da IA que mostra insights e ações rápidas.
 */

import React, { useEffect, useState } from 'react';
import { type AzuriaEvent, on } from '../core/eventBus';
import { BarChart3, Calculator, FileText, Sparkles, TrendingUp, X } from 'lucide-react';

export interface MiniDashboardProps {
  isOpen: boolean;
  onClose: () => void;
  userId?: string;
}

interface Insight {
  type: 'warning' | 'suggestion' | 'info';
  message: string;
  action?: string;
  timestamp: number;
}

export const MiniDashboard: React.FC<MiniDashboardProps> = ({
  isOpen,
  onClose,
  userId,
}) => {
  const [lastInsight, setLastInsight] = useState<Insight | null>(null);
  const [insights, setInsights] = useState<Insight[]>([]);

  // Escutar eventos de insights
  useEffect(() => {
    const subscriptionId = on('insight:generated', (event: AzuriaEvent) => {
      const insight: Insight = {
        type: event.payload.type || 'info',
        message: event.payload.message || '',
        action: event.payload.action,
        timestamp: event.timestamp,
      };

      setLastInsight(insight);
      setInsights((prev) => [insight, ...prev].slice(0, 10)); // Manter últimos 10
    });

    return () => {
      // Cleanup subscription
    };
  }, []);

  if (!isOpen) {return null;}

  const insightTypeStyles = {
    warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
    suggestion: 'bg-blue-50 border-blue-200 text-blue-800',
    info: 'bg-cyan-50 border-cyan-200 text-cyan-800',
  };

  const insightIcons = {
    warning: '⚠️',
    suggestion: '💡',
    info: 'ℹ️',
  };

  const quickActions = [
    {
      icon: TrendingUp,
      label: 'Otimizar preço',
      action: 'optimize_price',
      color: 'text-green-600',
    },
    {
      icon: Calculator,
      label: 'Simular ICMS',
      action: 'simulate_icms',
      color: 'text-blue-600',
    },
    {
      icon: FileText,
      label: 'Explicar cálculo',
      action: 'explain_calculation',
      color: 'text-purple-600',
    },
    {
      icon: BarChart3,
      label: 'Ver cenários',
      action: 'view_scenarios',
      color: 'text-orange-600',
    },
  ];

  const handleQuickAction = (action: string) => {
    console.log('Quick action:', action);
    // TODO: Implementar ações rápidas
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 transition-opacity"
        onClick={onClose}
      />

      {/* Panel */}
      <div
        className="
          fixed top-0 right-0 h-full w-full sm:w-96
          bg-white shadow-2xl z-50
          transform transition-transform duration-300 ease-out
          overflow-y-auto
        "
      >
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-cyan-500 to-blue-600 text-white p-4 shadow-md">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-6 h-6" />
              <h2 className="text-xl font-bold">Azuria AI</h2>
            </div>
            <button
              onClick={onClose}
              className="p-1 hover:bg-white/20 rounded-lg transition-colors"
              aria-label="Fechar"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
          <p className="text-sm text-cyan-100 mt-1">Sua assistente inteligente</p>
        </div>

        {/* Content */}
        <div className="p-4 space-y-6">
          {/* Last Insight */}
          {lastInsight && (
            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-cyan-600" />
                Último Insight
              </h3>
              <div
                className={`
                  p-4 rounded-lg border-2
                  ${insightTypeStyles[lastInsight.type]}
                `}
              >
                <div className="flex items-start gap-2">
                  <span className="text-xl">{insightIcons[lastInsight.type]}</span>
                  <p className="text-sm flex-1">{lastInsight.message}</p>
                </div>
              </div>
            </div>
          )}

          {/* Quick Actions */}
          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-gray-700">Ações Rápidas</h3>
            <div className="grid grid-cols-2 gap-2">
              {quickActions.map((action) => {
                const Icon = action.icon;
                return (
                  <button
                    key={action.action}
                    onClick={() => handleQuickAction(action.action)}
                    className="
                      p-3 rounded-lg border-2 border-gray-200
                      hover:border-cyan-400 hover:bg-cyan-50
                      transition-all duration-200
                      flex flex-col items-center gap-2
                      group
                    "
                  >
                    <Icon className={`w-6 h-6 ${action.color} group-hover:scale-110 transition-transform`} />
                    <span className="text-xs font-medium text-gray-700 text-center">
                      {action.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Insights History */}
          {insights.length > 1 && (
            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-gray-700">Histórico de Insights</h3>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {insights.slice(1).map((insight, index) => (
                  <div
                    key={`${insight.timestamp}-${index}`}
                    className={`
                      p-3 rounded-lg border
                      ${insightTypeStyles[insight.type]}
                      opacity-75
                    `}
                  >
                    <div className="flex items-start gap-2">
                      <span className="text-sm">{insightIcons[insight.type]}</span>
                      <p className="text-xs flex-1">{insight.message}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Empty State */}
          {!lastInsight && insights.length === 0 && (
            <div className="text-center py-12">
              <Sparkles className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-sm">
                Nenhum insight ainda.
                <br />
                Faça um cálculo para receber sugestões!
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default MiniDashboard;
