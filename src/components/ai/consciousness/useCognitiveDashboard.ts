/**
 * ══════════════════════════════════════════════════════════════════════════════
 * USE COGNITIVE DASHBOARD - Hook para o Dashboard de Consciência
 * ══════════════════════════════════════════════════════════════════════════════
 *
 * Este hook coleta dados de todos os sistemas cognitivos para o dashboard:
 * - CentralNucleus
 * - EngineGovernance
 * - UnifiedStateStore
 * - UnifiedMemory
 * - GovernedEmitter
 * - CompatibilityAdapter
 *
 * @module components/ai/consciousness/useCognitiveDashboard
 */

import { useCallback, useEffect, useState } from 'react';

// ═══════════════════════════════════════════════════════════════════════════════
// TIPOS
// ═══════════════════════════════════════════════════════════════════════════════

/** Dados de um engine */
export interface EngineData {
  id: string;
  name: string;
  category: string;
  privilege: string;
  active: boolean;
  eventsEmitted: number;
  actionsExecuted: number;
}

/** Alerta do sistema */
export interface SystemAlert {
  severity: 'error' | 'warning' | 'info';
  title: string;
  message: string;
  timestamp: number;
}

/** Dados completos do dashboard */
export interface DashboardData {
  /** Status do CentralNucleus */
  nucleus: {
    isRunning: boolean;
    isPaused: boolean;
    uptimeMs: number | null;
    cycleCount: number;
    currentLevel: string;
    pendingActions: number;
  };

  /** Lista de engines */
  engines: EngineData[];

  /** Estatísticas de eventos */
  events: {
    total: number;
    approved: number;
    denied: number;
    cached: number;
    approvalRate: number;
    recentByType: Record<string, number>;
  };

  /** Estatísticas de governança */
  governance: {
    strictMode: boolean;
    totalRequests: number;
    granted: number;
    denied: number;
    enginesRegistered: number;
    cacheSize: number;
    adapterInstalled: boolean;
    adapterIntercepted: number;
  };

  /** Memória */
  memory: {
    syncEnabled: boolean;
    lastSyncAt: number | null;
    stm: {
      currentScreen: string;
      recentInteractions: number;
    };
    wm: {
      calculations: number;
      patterns: number;
      suggestionsShown: number;
    };
    ltm: {
      preferences: number;
      behaviorPatterns: number;
      feedback: number;
    };
  };

  /** Estado */
  state: {
    initialized: boolean;
    role: string;
    tier: string;
    sessionId: string;
    calculations: number;
    errors: number;
    engineSlices: number;
    healthScore: number;
  };

  /** Alertas */
  alerts: SystemAlert[];

  /** Timestamp da coleta */
  collectedAt: number;
}

/** Retorno do hook */
export interface UseCognitiveDashboardReturn {
  data: DashboardData | null;
  isLoading: boolean;
  error: string | null;
  refresh: () => void;
  togglePause: () => void;
}

// ═══════════════════════════════════════════════════════════════════════════════
// FUNÇÕES DE COLETA
// ═══════════════════════════════════════════════════════════════════════════════

async function collectDashboardData(): Promise<DashboardData> {
  const alerts: SystemAlert[] = [];

  // Valores default
  const nucleusData = {
    isRunning: false,
    isPaused: false,
    uptimeMs: null as number | null,
    cycleCount: 0,
    currentLevel: 'UNKNOWN',
    pendingActions: 0,
  };

  let enginesData: EngineData[] = [];

  let eventsData = {
    total: 0,
    approved: 0,
    denied: 0,
    cached: 0,
    approvalRate: 100,
    recentByType: {} as Record<string, number>,
  };

  let governanceData = {
    strictMode: false,
    totalRequests: 0,
    granted: 0,
    denied: 0,
    enginesRegistered: 0,
    cacheSize: 0,
    adapterInstalled: false,
    adapterIntercepted: 0,
  };

  let memoryData = {
    syncEnabled: false,
    lastSyncAt: null as number | null,
    stm: {
      currentScreen: '/',
      recentInteractions: 0,
    },
    wm: {
      calculations: 0,
      patterns: 0,
      suggestionsShown: 0,
    },
    ltm: {
      preferences: 0,
      behaviorPatterns: 0,
      feedback: 0,
    },
  };

  let stateData = {
    initialized: false,
    role: 'USER',
    tier: 'FREE',
    sessionId: '',
    calculations: 0,
    errors: 0,
    engineSlices: 0,
    healthScore: 1,
  };

  // Coletar dados do CentralNucleus
  try {
    const nucleus = await import('@/azuria_ai/consciousness/CentralNucleus');

    if (nucleus.isNucleusRunning) {
      nucleusData.isRunning = nucleus.isNucleusRunning();
    }

    if (nucleus.getNucleusStats) {
      const stats = nucleus.getNucleusStats();
      if (stats) {
        nucleusData.uptimeMs = stats.uptimeMs;
        nucleusData.cycleCount = stats.cycleCount;
        nucleusData.pendingActions = stats.pendingActions;
        nucleusData.currentLevel = stats.currentLevel || 'USER';
      }
    }
  } catch (_e) {
    // Nucleus não disponível
    alerts.push({
      severity: 'warning',
      title: 'CentralNucleus',
      message: 'Não foi possível carregar dados do Nucleus',
      timestamp: Date.now(),
    });
  }

  // Coletar dados do EngineGovernance
  try {
    const governance = await import('@/azuria_ai/governance/EngineGovernance');

    if (governance.getGovernanceStats) {
      const stats = governance.getGovernanceStats();

      governanceData = {
        strictMode: false,
        totalRequests: stats.totalRequests,
        granted: stats.granted,
        denied: stats.denied,
        enginesRegistered: stats.enginesRegistered,
        cacheSize: stats.cacheSize,
        adapterInstalled: false,
        adapterIntercepted: 0,
      };

      eventsData = {
        total: stats.totalRequests,
        approved: stats.granted,
        denied: stats.denied,
        cached: stats.cached,
        approvalRate: stats.totalRequests > 0 
          ? (stats.granted / stats.totalRequests) * 100 
          : 100,
        recentByType: {},
      };

      // Converter engines
      if (stats.engines) {
        enginesData = stats.engines.map((e: {
          id: string;
          name: string;
          category: string;
          privilege: string;
          active: boolean;
          stats: {
            eventsEmitted: number;
            actionsExecuted: number;
          };
        }) => ({
          id: e.id,
          name: e.name,
          category: e.category,
          privilege: e.privilege,
          active: e.active,
          eventsEmitted: e.stats?.eventsEmitted ?? 0,
          actionsExecuted: e.stats?.actionsExecuted ?? 0,
        }));
      }
    }
  } catch (_e) {
    // Governance não disponível
  }

  // Coletar dados do CompatibilityAdapter
  try {
    const adapter = await import('@/azuria_ai/governance/CompatibilityAdapter');

    if (adapter.isCompatibilityAdapterInstalled) {
      governanceData.adapterInstalled = adapter.isCompatibilityAdapterInstalled();
    }

    if (adapter.getCompatibilityAdapterStats) {
      const stats = adapter.getCompatibilityAdapterStats();
      governanceData.adapterIntercepted = stats.totalIntercepted;
    }
  } catch (_e) {
    // Adapter não disponível
  }

  // Coletar dados do UnifiedStateStore
  try {
    const store = await import('@/azuria_ai/state/UnifiedStateStore');

    if (store.getCoreState) {
      const core = store.getCoreState();

      stateData = {
        initialized: core.initialized,
        role: core.identity.role,
        tier: core.identity.tier,
        sessionId: core.session.id,
        calculations: core.session.metrics.calculationsCompleted,
        errors: core.session.metrics.errorsEncountered,
        engineSlices: store.listEngineSlices?.().length ?? 0,
        healthScore: core.systemHealth.overallScore,
      };

      // Verificar health baixo
      if (core.systemHealth.overallScore < 0.5) {
        alerts.push({
          severity: 'error',
          title: 'System Health Baixo',
          message: `Score atual: ${(core.systemHealth.overallScore * 100).toFixed(0)}%`,
          timestamp: Date.now(),
        });
      }

      // Verificar erros recentes
      if (core.systemHealth.lastErrors.length > 0) {
        const recentErrors = core.systemHealth.lastErrors.slice(0, 3);
        recentErrors.forEach((err: { engine: string; error: string }) => {
          alerts.push({
            severity: 'warning',
            title: `Erro em ${err.engine}`,
            message: err.error,
            timestamp: Date.now(),
          });
        });
      }
    }
  } catch (_e) {
    // Store não disponível
  }

  // Coletar dados do UnifiedMemory
  try {
    const memory = await import('@/azuria_ai/memory/UnifiedMemory');

    if (memory.getMemory) {
      const mem = memory.getMemory();

      if (mem) {
        memoryData = {
          syncEnabled: true, // Assumir que está habilitado se tem memória
          lastSyncAt: mem.ltm.lastSyncAt,
          stm: {
            currentScreen: mem.stm.context.screen,
            recentInteractions: mem.stm.recentInteractions.length,
          },
          wm: {
            calculations: mem.wm.calculations.length,
            patterns: mem.wm.patterns.length,
            suggestionsShown: mem.wm.counters.suggestionsShown,
          },
          ltm: {
            preferences: mem.ltm.preferences.length,
            behaviorPatterns: mem.ltm.behaviorPatterns.length,
            feedback: mem.ltm.feedback.length,
          },
        };
      }
    }
  } catch (_e) {
    // Memory não disponível
  }

  // Coletar dados do GovernedEmitter
  try {
    const emitter = await import('@/azuria_ai/core/GovernedEmitter');

    if (emitter.getGovernedEmitterStats) {
      const stats = emitter.getGovernedEmitterStats();

      // Atualizar eventos com dados do emitter
      eventsData.total += stats.totalEmitted;
      eventsData.approved += stats.approved;
      eventsData.denied += stats.denied;

      // Eventos por tipo
      if (stats.byEventType) {
        eventsData.recentByType = { ...stats.byEventType };
      }
    }
  } catch (_e) {
    // Emitter não disponível
  }

  // Verificar se Nucleus não está rodando
  if (!nucleusData.isRunning) {
    alerts.push({
      severity: 'warning',
      title: 'CentralNucleus Inativo',
      message: 'O núcleo de consciência não está em execução',
      timestamp: Date.now(),
    });
  }

  // Verificar taxa de negação alta
  if (eventsData.total > 10 && eventsData.approvalRate < 80) {
    alerts.push({
      severity: 'warning',
      title: 'Taxa de Aprovação Baixa',
      message: `Apenas ${eventsData.approvalRate.toFixed(0)}% dos eventos estão sendo aprovados`,
      timestamp: Date.now(),
    });
  }

  return {
    nucleus: nucleusData,
    engines: enginesData,
    events: eventsData,
    governance: governanceData,
    memory: memoryData,
    state: stateData,
    alerts,
    collectedAt: Date.now(),
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
// HOOK
// ═══════════════════════════════════════════════════════════════════════════════

export function useCognitiveDashboard(): UseCognitiveDashboardReturn {
  const [data, setData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      const newData = await collectDashboardData();
      setData(newData);
      setError(null);
    } catch (_e) {
      setError(String(e));
    } finally {
      setIsLoading(false);
    }
  }, []);

  const togglePause = useCallback(async () => {
    try {
      const nucleus = await import('@/azuria_ai/consciousness/CentralNucleus');

      if (data?.nucleus.isPaused) {
        nucleus.resumeNucleus?.();
      } else {
        nucleus.pauseNucleus?.();
      }

      // Refresh após toggle
      setTimeout(refresh, 100);
    } catch (_e) {
      // eslint-disable-next-line no-console
      console.error('Failed to toggle pause:', _e);
    }
  }, [data?.nucleus.isPaused, refresh]);

  // Carregar dados iniciais
  useEffect(() => {
    refresh();
  }, [refresh]);

  return {
    data,
    isLoading,
    error,
    refresh,
    togglePause,
  };
}

export default useCognitiveDashboard;
