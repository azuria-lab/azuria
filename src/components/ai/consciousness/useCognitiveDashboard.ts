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
// FUNÇÕES DE COLETA - HELPERS
// ═══════════════════════════════════════════════════════════════════════════════

interface CollectResult<T> {
  data: T;
  alert?: SystemAlert;
}

// Helper para coletar dados do Nucleus
async function collectNucleusData(): Promise<CollectResult<typeof defaultNucleusData>> {
  const data = { ...defaultNucleusData };
  try {
    const nucleus = await import('@/azuria_ai/consciousness/CentralNucleus');
    if (nucleus.isNucleusRunning) {data.isRunning = nucleus.isNucleusRunning();}
    if (nucleus.getNucleusStats) {
      const stats = nucleus.getNucleusStats();
      if (stats) {
        data.uptimeMs = stats.uptimeMs;
        data.cycleCount = stats.cycleCount;
        data.pendingActions = stats.pendingActions;
        data.currentLevel = stats.currentLevel || 'USER';
      }
    }
    return { data };
  } catch (error_) {
    return {
      data,
      alert: { severity: 'warning', title: 'CentralNucleus', message: `Não foi possível carregar: ${String(error_)}`, timestamp: Date.now() },
    };
  }
}

// Helper para coletar dados de Governance
async function collectGovernanceData(): Promise<CollectResult<{ governance: typeof defaultGovernanceData; events: typeof defaultEventsData; engines: EngineData[] }>> {
  const governance = { ...defaultGovernanceData };
  const events = { ...defaultEventsData };
  let engines: EngineData[] = [];
  
  try {
    const governanceModule = await import('@/azuria_ai/governance/EngineGovernance');
    if (governanceModule.getGovernanceStats) {
      const stats = governanceModule.getGovernanceStats();
      governance.totalRequests = stats.totalRequests;
      governance.granted = stats.granted;
      governance.denied = stats.denied;
      governance.enginesRegistered = stats.enginesRegistered;
      governance.cacheSize = stats.cacheSize;
      
      events.total = stats.totalRequests;
      events.approved = stats.granted;
      events.denied = stats.denied;
      events.cached = stats.cached;
      events.approvalRate = stats.totalRequests > 0 ? (stats.granted / stats.totalRequests) * 100 : 100;
      
      if (stats.engines) {
        engines = stats.engines.map((e: { id: string; name: string; category: string; privilege: string; active: boolean; stats: { eventsEmitted: number; actionsExecuted: number } }) => ({
          id: e.id, name: e.name, category: e.category, privilege: e.privilege, active: e.active,
          eventsEmitted: e.stats?.eventsEmitted ?? 0, actionsExecuted: e.stats?.actionsExecuted ?? 0,
        }));
      }
    }
    return { data: { governance, events, engines } };
  } catch (error_) {
    return {
      data: { governance, events, engines },
      alert: { severity: 'info', title: 'Governance', message: `Não disponível: ${String(error_)}`, timestamp: Date.now() },
    };
  }
}

// Helper para coletar dados do Adapter
async function collectAdapterData(governance: typeof defaultGovernanceData): Promise<CollectResult<typeof defaultGovernanceData>> {
  const data = { ...governance };
  try {
    const adapter = await import('@/azuria_ai/governance/CompatibilityAdapter');
    if (adapter.isCompatibilityAdapterInstalled) {data.adapterInstalled = adapter.isCompatibilityAdapterInstalled();}
    if (adapter.getCompatibilityAdapterStats) {
      const stats = adapter.getCompatibilityAdapterStats();
      data.adapterIntercepted = stats.totalIntercepted;
    }
    return { data };
  } catch (error_) {
    return {
      data,
      alert: { severity: 'info', title: 'Adapter', message: `Não disponível: ${String(error_)}`, timestamp: Date.now() },
    };
  }
}

// Valores default
const defaultNucleusData = {
  isRunning: false,
  isPaused: false,
  uptimeMs: null as number | null,
  cycleCount: 0,
  currentLevel: 'UNKNOWN',
  pendingActions: 0,
};

const defaultEventsData = {
  total: 0,
  approved: 0,
  denied: 0,
  cached: 0,
  approvalRate: 100,
  recentByType: {} as Record<string, number>,
};

const defaultGovernanceData = {
  strictMode: false,
  totalRequests: 0,
  granted: 0,
  denied: 0,
  enginesRegistered: 0,
  cacheSize: 0,
  adapterInstalled: false,
  adapterIntercepted: 0,
};

const defaultMemoryData = {
  syncEnabled: false,
  lastSyncAt: null as number | null,
  stm: { currentScreen: '/', recentInteractions: 0 },
  wm: { calculations: 0, patterns: 0, suggestionsShown: 0 },
  ltm: { preferences: 0, behaviorPatterns: 0, feedback: 0 },
};

const defaultStateData = {
  initialized: false,
  role: 'USER',
  tier: 'FREE',
  sessionId: '',
  calculations: 0,
  errors: 0,
  engineSlices: 0,
  healthScore: 1,
};

// ═══════════════════════════════════════════════════════════════════════════════
// FUNÇÕES DE COLETA PRINCIPAL
// ═══════════════════════════════════════════════════════════════════════════════

async function collectDashboardData(): Promise<DashboardData> {
  const alerts: SystemAlert[] = [];

  // Usar helpers para coleta paralela
  const nucleusResult = await collectNucleusData();
  if (nucleusResult.alert) {alerts.push(nucleusResult.alert);}
  
  const govResult = await collectGovernanceData();
  if (govResult.alert) {alerts.push(govResult.alert);}
  
  const adapterResult = await collectAdapterData(govResult.data.governance);
  if (adapterResult.alert) {alerts.push(adapterResult.alert);}

  // Coletar dados do UnifiedStateStore
  let stateData = { ...defaultStateData };
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
      
      // Alertas de health
      if (core.systemHealth.overallScore < 0.5) {
        alerts.push({ severity: 'error', title: 'System Health Baixo', message: `Score: ${(core.systemHealth.overallScore * 100).toFixed(0)}%`, timestamp: Date.now() });
      }
      core.systemHealth.lastErrors.slice(0, 3).forEach((err: { engine: string; error: string }) => {
        alerts.push({ severity: 'warning', title: `Erro em ${err.engine}`, message: err.error, timestamp: Date.now() });
      });
    }
  } catch (error_) {
    alerts.push({ severity: 'info', title: 'State Store', message: `Não disponível: ${String(error_)}`, timestamp: Date.now() });
  }

  // Coletar dados do UnifiedMemory
  let memoryData = { ...defaultMemoryData };
  try {
    const memory = await import('@/azuria_ai/memory/UnifiedMemory');
    if (memory.getMemory) {
      const mem = memory.getMemory();
      if (mem) {
        memoryData = {
          syncEnabled: true,
          lastSyncAt: mem.ltm.lastSyncAt,
          stm: { currentScreen: mem.stm.context.screen, recentInteractions: mem.stm.recentInteractions.length },
          wm: { calculations: mem.wm.calculations.length, patterns: mem.wm.patterns.length, suggestionsShown: mem.wm.counters.suggestionsShown },
          ltm: { preferences: mem.ltm.preferences.length, behaviorPatterns: mem.ltm.behaviorPatterns.length, feedback: mem.ltm.feedback.length },
        };
      }
    }
  } catch (error_) {
    alerts.push({ severity: 'info', title: 'Memory', message: `Não disponível: ${String(error_)}`, timestamp: Date.now() });
  }

  return {
    nucleus: nucleusResult.data,
    engines: govResult.data.engines,
    events: govResult.data.events,
    governance: adapterResult.data,
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
    } catch (error_) {
      setError(String(error_));
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
    } catch (error_) {
      // eslint-disable-next-line no-console
      console.error('Failed to toggle pause:', error_);
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
    refresh: () => { void refresh(); },
    togglePause: () => { void togglePause(); },
  };
}

export default useCognitiveDashboard;
