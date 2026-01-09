/**
 * ══════════════════════════════════════════════════════════════════════════════
 * ADMIN DASHBOARD - Dashboard do Modo Deus para Administradores
 * ══════════════════════════════════════════════════════════════════════════════
 * 
 * Dashboard completo para monitorar e gerenciar o Modo Deus.
 * Apenas para usuários ADMIN.
 */

import React, { useCallback, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Activity,
  AlertTriangle,
  BarChart3,
  Brain,
  CheckCircle,
  MessageSquare,
  RefreshCw,
  Shield,
  Sparkles,
  TrendingDown,
  TrendingUp,
  Zap,
} from 'lucide-react';
import { useConsciousnessContext } from '../ConsciousnessProvider';
import { getGlobalState } from '../GlobalState';
import { getDecisionStats } from '../DecisionEngine';
import { getOutputStats, type OutputStats } from '../OutputGate';
import { getAIStats } from '../AIRouter';
import { getLearningStats } from '../learning/FeedbackLearning';

// ═══════════════════════════════════════════════════════════════════════════════
// TIPOS
// ═══════════════════════════════════════════════════════════════════════════════

interface DashboardStats {
  events: {
    received: number;
    processed: number;
    filtered: number;
  };
  decisions: {
    emit: number;
    silence: number;
    delegate: number;
    escalate: number;
  };
  output: OutputStats;
  ai: {
    cacheSize: number;
    geminiAvailable: boolean;
    successRate: number;
  };
  learning: {
    totalFeedback: number;
    acceptanceRate: number;
    preferredTopics: string[];
    avoidedTopics: string[];
  };
  system: {
    healthScore: number;
    activeEngines: number;
    lastErrors: number;
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
// COMPONENTES AUXILIARES
// ═══════════════════════════════════════════════════════════════════════════════
// HELPER FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════════

const getTrendColor = (trend: 'up' | 'down' | 'neutral'): string => {
  if (trend === 'up') {return 'text-emerald-400';}
  if (trend === 'down') {return 'text-red-400';}
  return 'text-slate-400';
};

const getTrendLabel = (trend: 'up' | 'down' | 'neutral'): string => {
  if (trend === 'up') {return 'Aumentando';}
  if (trend === 'down') {return 'Diminuindo';}
  return 'Estável';
};

const getStatusDotClass = (status: 'active' | 'warning' | 'error' | 'inactive'): string => {
  if (status === 'active') {return 'bg-emerald-400 animate-pulse';}
  if (status === 'warning') {return 'bg-amber-400';}
  if (status === 'error') {return 'bg-red-400';}
  return 'bg-slate-400';
};

const getHealthLabel = (score: number): string => {
  if (score >= 90) {return 'Excelente';}
  if (score >= 70) {return 'Bom';}
  return 'Atenção';
};

const getHealthTrend = (score: number): 'up' | 'down' | 'neutral' => {
  if (score >= 90) {return 'up';}
  if (score < 70) {return 'down';}
  return 'neutral';
};

// ═══════════════════════════════════════════════════════════════════════════════
// COMPONENTS
// ═══════════════════════════════════════════════════════════════════════════════

const StatCard: React.FC<{
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  trend?: 'up' | 'down' | 'neutral';
  color?: string;
}> = ({ title, value, subtitle, icon, trend, color = 'cyan' }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className={`
      p-4 rounded-xl bg-slate-800/60 border border-slate-700/50
      hover:border-${color}-500/30 transition-all
    `}
  >
    <div className="flex items-start justify-between">
      <div>
        <p className="text-xs text-slate-400 uppercase tracking-wider">{title}</p>
        <p className={`text-2xl font-bold text-${color}-400 mt-1`}>{value}</p>
        {subtitle && (
          <p className="text-xs text-slate-500 mt-1">{subtitle}</p>
        )}
      </div>
      <div className={`p-2 rounded-lg bg-${color}-500/10`}>
        {icon}
      </div>
    </div>
    {trend && (
      <div className="mt-3 flex items-center gap-1">
        {trend === 'up' && <TrendingUp className="w-3 h-3 text-emerald-400" />}
        {trend === 'down' && <TrendingDown className="w-3 h-3 text-red-400" />}
        <span className={`text-xs ${getTrendColor(trend)}`}>
          {getTrendLabel(trend)}
        </span>
      </div>
    )}
  </motion.div>
);

const ProgressBar: React.FC<{
  value: number;
  max: number;
  label: string;
  color?: string;
}> = ({ value, max, label, color = 'cyan' }) => {
  const percentage = max > 0 ? (value / max) * 100 : 0;
  
  return (
    <div className="mb-3">
      <div className="flex justify-between text-xs mb-1">
        <span className="text-slate-400">{label}</span>
        <span className="text-slate-300">{value}/{max}</span>
      </div>
      <div className="h-2 bg-slate-700/50 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          className={`h-full bg-${color}-500 rounded-full`}
        />
      </div>
    </div>
  );
};

const StatusBadge: React.FC<{
  status: 'active' | 'warning' | 'error' | 'inactive';
  label: string;
}> = ({ status, label }) => {
  const colors = {
    active: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    warning: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    error: 'bg-red-500/20 text-red-400 border-red-500/30',
    inactive: 'bg-slate-500/20 text-slate-400 border-slate-500/30',
  };
  
  return (
    <span className={`
      inline-flex items-center gap-1.5 px-2 py-1 text-xs font-medium
      rounded-full border ${colors[status]}
    `}>
      <span className={`w-1.5 h-1.5 rounded-full ${getStatusDotClass(status)}`} />
      {label}
    </span>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// COMPONENTE PRINCIPAL
// ═══════════════════════════════════════════════════════════════════════════════

export const AdminDashboard: React.FC = () => {
  const { userRole, initialized } = useConsciousnessContext();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);
  
  // Coletar estatísticas
  const collectStats = (): DashboardStats => {
    const globalState = getGlobalState();
    const decisionStats = getDecisionStats();
    const outputStats = getOutputStats();
    const aiStats = getAIStats();
    const learningStats = getLearningStats();
    
    return {
      events: {
        received: 0, // TODO: conectar com ConsciousnessCore.getStats()
        processed: 0,
        filtered: 0,
      },
      decisions: {
        emit: decisionStats.emit,
        silence: decisionStats.silence,
        delegate: decisionStats.delegate,
        escalate: decisionStats.escalate,
      },
      output: outputStats,
      ai: {
        cacheSize: aiStats.cacheSize,
        geminiAvailable: globalState.systemHealth.aiAvailability.gemini,
        successRate: Object.values(aiStats.successRates).reduce((a, b) => a + b, 0) / Object.values(aiStats.successRates).length,
      },
      learning: {
        totalFeedback: learningStats.totalFeedback,
        acceptanceRate: learningStats.overallAcceptanceRate,
        preferredTopics: learningStats.preferredTopics,
        avoidedTopics: learningStats.avoidedTopics,
      },
      system: {
        healthScore: globalState.systemHealth.overallScore * 100,
        activeEngines: globalState.systemHealth.activeEngines.length,
        lastErrors: globalState.systemHealth.lastErrors.length,
      },
    };
  };
  
  const refreshStats = useCallback(() => {
    setRefreshing(true);
    const newStats = collectStats();
    setStats(newStats);
    setTimeout(() => setRefreshing(false), 500);
  }, []);
  
  // Auto-refresh (hooks devem vir antes de qualquer return condicional)
  useEffect(() => {
    if (userRole !== 'ADMIN' || !initialized) {
      return;
    }
    
    refreshStats();
    
    if (autoRefresh) {
      const interval = setInterval(refreshStats, 5000);
      return () => clearInterval(interval);
    }
  }, [initialized, autoRefresh, userRole, refreshStats]);
  
  // Verificar se é ADMIN (após hooks)
  if (userRole !== 'ADMIN') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-slate-400">
        <Shield className="w-16 h-16 mb-4 opacity-50" />
        <h2 className="text-xl font-semibold mb-2">Acesso Restrito</h2>
        <p className="text-sm">Esta área é exclusiva para administradores.</p>
      </div>
    );
  }
  
  if (!stats) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <RefreshCw className="w-8 h-8 text-cyan-400 animate-spin" />
      </div>
    );
  }
  
  return (
    <div className="p-6 space-y-6 bg-slate-900/50 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Brain className="w-8 h-8 text-cyan-400" />
          <div>
            <h1 className="text-2xl font-bold text-white">Modo Deus - Dashboard</h1>
            <p className="text-sm text-slate-400">Monitoramento e controle do sistema de IA</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 text-sm text-slate-400">
            <input
              type="checkbox"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
              className="rounded bg-slate-700 border-slate-600"
            />
            Auto-refresh
          </label>
          
          <button
            onClick={refreshStats}
            disabled={refreshing}
            aria-label="Atualizar estatísticas"
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 
                       text-slate-400 hover:text-white transition-all"
          >
            <RefreshCw className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>
      
      {/* Status Geral */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard
          title="Saúde do Sistema"
          value={`${stats.system.healthScore.toFixed(0)}%`}
          subtitle={getHealthLabel(stats.system.healthScore)}
          icon={<Activity className="w-5 h-5 text-cyan-400" />}
          trend={getHealthTrend(stats.system.healthScore)}
          color="cyan"
        />
        
        <StatCard
          title="Taxa de Aceitação"
          value={`${(stats.learning.acceptanceRate * 100).toFixed(1)}%`}
          subtitle={`${stats.learning.totalFeedback} feedbacks`}
          icon={<CheckCircle className="w-5 h-5 text-emerald-400" />}
          trend={stats.learning.acceptanceRate > 0.5 ? 'up' : 'down'}
          color="emerald"
        />
        
        <StatCard
          title="Mensagens Emitidas"
          value={stats.output.totalEmitted}
          subtitle={`${stats.output.totalSilenced} silenciadas`}
          icon={<MessageSquare className="w-5 h-5 text-violet-400" />}
          color="violet"
        />
        
        <StatCard
          title="Erros Recentes"
          value={stats.system.lastErrors}
          subtitle={stats.system.lastErrors === 0 ? 'Nenhum erro' : 'Verificar logs'}
          icon={<AlertTriangle className="w-5 h-5 text-amber-400" />}
          trend={stats.system.lastErrors > 0 ? 'down' : 'up'}
          color="amber"
        />
      </div>
      
      {/* Detalhes */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Decisões */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="p-5 rounded-xl bg-slate-800/60 border border-slate-700/50"
        >
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Zap className="w-5 h-5 text-amber-400" />
            Decisões do Núcleo
          </h3>
          
          <div className="space-y-3">
            <ProgressBar
              value={stats.decisions.emit}
              max={stats.decisions.emit + stats.decisions.silence}
              label="Emitidas"
              color="emerald"
            />
            <ProgressBar
              value={stats.decisions.silence}
              max={stats.decisions.emit + stats.decisions.silence}
              label="Silenciadas"
              color="slate"
            />
            <ProgressBar
              value={stats.decisions.escalate}
              max={Math.max(stats.decisions.escalate, 10)}
              label="Escaladas"
              color="amber"
            />
            <ProgressBar
              value={stats.decisions.delegate}
              max={Math.max(stats.decisions.delegate, 10)}
              label="Delegadas"
              color="violet"
            />
          </div>
        </motion.div>
        
        {/* IA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="p-5 rounded-xl bg-slate-800/60 border border-slate-700/50"
        >
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-cyan-400" />
            Modelos de IA
          </h3>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Gemini Flash</span>
              <StatusBadge 
                status={stats.ai.geminiAvailable ? 'active' : 'inactive'}
                label={stats.ai.geminiAvailable ? 'Online' : 'Offline'}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Local (Fallback)</span>
              <StatusBadge status="active" label="Sempre" />
            </div>
            
            <div className="pt-3 border-t border-slate-700/50">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-400">Cache</span>
                <span className="text-cyan-400">{stats.ai.cacheSize} entradas</span>
              </div>
              <div className="flex items-center justify-between text-sm mt-2">
                <span className="text-slate-400">Taxa de Sucesso</span>
                <span className="text-emerald-400">{(stats.ai.successRate * 100).toFixed(0)}%</span>
              </div>
            </div>
          </div>
        </motion.div>
        
        {/* Aprendizado */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="p-5 rounded-xl bg-slate-800/60 border border-slate-700/50"
        >
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-emerald-400" />
            Aprendizado
          </h3>
          
          <div className="space-y-4">
            <div>
              <p className="text-xs text-slate-400 uppercase mb-2">Tópicos Preferidos</p>
              <div className="flex flex-wrap gap-1">
                {stats.learning.preferredTopics.length > 0 ? (
                  stats.learning.preferredTopics.slice(0, 5).map(topic => (
                    <span 
                      key={topic}
                      className="px-2 py-0.5 text-xs bg-emerald-500/20 text-emerald-400 rounded"
                    >
                      {topic}
                    </span>
                  ))
                ) : (
                  <span className="text-xs text-slate-500">Coletando dados...</span>
                )}
              </div>
            </div>
            
            <div>
              <p className="text-xs text-slate-400 uppercase mb-2">Tópicos Evitados</p>
              <div className="flex flex-wrap gap-1">
                {stats.learning.avoidedTopics.length > 0 ? (
                  stats.learning.avoidedTopics.slice(0, 5).map(topic => (
                    <span 
                      key={topic}
                      className="px-2 py-0.5 text-xs bg-red-500/20 text-red-400 rounded"
                    >
                      {topic}
                    </span>
                  ))
                ) : (
                  <span className="text-xs text-slate-500">Nenhum</span>
                )}
              </div>
            </div>
            
            <div className="pt-3 border-t border-slate-700/50">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-400">Total Feedbacks</span>
                <span className="text-white">{stats.learning.totalFeedback}</span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
      
      {/* Razões de Silêncio */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="p-5 rounded-xl bg-slate-800/60 border border-slate-700/50"
      >
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-violet-400" />
          Razões de Silenciamento
        </h3>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Object.entries(stats.output.silenceReasons).map(([reason, count]) => (
            <div 
              key={reason}
              className="p-3 rounded-lg bg-slate-900/50 border border-slate-700/30"
            >
              <p className="text-xs text-slate-400 capitalize">
                {reason.replaceAll('_', ' ')}
              </p>
              <p className="text-xl font-bold text-violet-400 mt-1">{count}</p>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
};

export default AdminDashboard;

