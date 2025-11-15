import { useCallback, useEffect, useMemo, useState } from 'react';
import { BiddingPersistenceService } from '@/services/bidding/biddingPersistence';
import { logger } from '@/services/logger';
import {
  BiddingAnalyticsSnapshot,
  BiddingLifecycleCard,
  BiddingLifecycleStatus,
  BiddingProject,
  BiddingStatistics,
  BiddingStatus,
  BiddingStoreFilter,
  BiddingType,
  UseBiddingCenter,
} from '@/types/bidding';

const DEFAULT_FILTER: BiddingStoreFilter = {
  lifecycle: [BiddingLifecycleStatus.OPEN, BiddingLifecycleStatus.WON, BiddingLifecycleStatus.LOST],
};

const IN_PROGRESS_STATUSES: BiddingStatus[] = [
  BiddingStatus.EM_ANALISE,
  BiddingStatus.PROPOSTA_ENVIADA,
  BiddingStatus.EM_DISPUTA,
];

function buildStatistics(projects: BiddingProject[]): BiddingStatistics {
  const typeAccumulator = (Object.values(BiddingType) as BiddingType[]).reduce<Record<BiddingType, number>>((acc, type) => {
    acc[type] = 0;
    return acc;
  }, {} as Record<BiddingType, number>);

  let totalValue = 0;
  let totalMargin = 0;
  let marginCount = 0;
  let won = 0;
  let lost = 0;
  let drafts = 0;
  let inProgress = 0;

  const monthAccumulator = new Map<string, { count: number; value: number }>();

  projects.forEach((project) => {
    const { bidding, summary } = project;
    const status = bidding.data.status;
    const createdAt = bidding.data.createdAt || new Date();
    const monthKey = `${createdAt.getFullYear()}-${String(createdAt.getMonth() + 1).padStart(2, '0')}`;
    const summaryValue = summary.totalValue ?? bidding.result?.suggestedPrice ?? 0;

    totalValue += summaryValue;
    typeAccumulator[bidding.data.type] += 1;

    if (bidding.result?.profitMargin !== undefined) {
      totalMargin += bidding.result.profitMargin;
      marginCount += 1;
    }

    if (status === BiddingStatus.VENCEDOR) {
      won += 1;
    } else if (status === BiddingStatus.PERDEDOR || status === BiddingStatus.DESCLASSIFICADO) {
      lost += 1;
    } else if (status === BiddingStatus.RASCUNHO) {
      drafts += 1;
    } else if (IN_PROGRESS_STATUSES.includes(status)) {
      inProgress += 1;
    }

    const currentMonth = monthAccumulator.get(monthKey) || { count: 0, value: 0 };
    currentMonth.count += 1;
    currentMonth.value += summaryValue;
    monthAccumulator.set(monthKey, currentMonth);
  });

  const byMonth = Array.from(monthAccumulator.entries())
    .sort(([a], [b]) => (a > b ? 1 : -1))
    .map(([key, value]) => {
      const [year, month] = key.split('-').map(Number);
      const date = new Date(year, (month || 1) - 1);
      return {
        month: date.toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' }),
        count: value.count,
        value: value.value,
      };
    });

  const total = projects.length;

  return {
    total,
    won,
    lost,
    inProgress,
    drafts,
    totalValue,
    averageMargin: marginCount ? totalMargin / marginCount : 0,
    winRate: total ? won / total : 0,
    byType: typeAccumulator,
    byMonth,
  };
}

function buildLifecycleCards(projects: BiddingProject[]): BiddingLifecycleCard[] {
  const accumulator = new Map<BiddingLifecycleStatus, { count: number; totalValue: number }>();

  projects.forEach((project) => {
    const status = project.summary.lifecycleStatus;
    const current = accumulator.get(status) || { count: 0, totalValue: 0 };
    current.count += 1;
    current.totalValue += project.summary.totalValue ?? project.bidding.result?.suggestedPrice ?? 0;
    accumulator.set(status, current);
  });

  return (Object.values(BiddingLifecycleStatus) as BiddingLifecycleStatus[]).map((status) => {
    const entry = accumulator.get(status) || { count: 0, totalValue: 0 };
    return {
      status,
      count: entry.count,
      totalValue: entry.totalValue,
    };
  });
}

function pickLatestAnalytics(projects: BiddingProject[]): BiddingAnalyticsSnapshot | null {
  const analytics = projects
    .map((project) => project.analytics)
    .filter((value): value is BiddingAnalyticsSnapshot => Boolean(value))
    .sort((a, b) => {
      const timeA = a.generatedAt instanceof Date ? a.generatedAt.getTime() : new Date(a.generatedAt).getTime();
      const timeB = b.generatedAt instanceof Date ? b.generatedAt.getTime() : new Date(b.generatedAt).getTime();
      return timeB - timeA;
    });

  return analytics[0] || null;
}

export function useBiddingCenter(initialFilter?: BiddingStoreFilter): UseBiddingCenter {
  const [projects, setProjects] = useState<BiddingProject[]>([]);
  const [selectedProject, setSelectedProject] = useState<BiddingProject | null>(null);
  const [filters, setFilters] = useState<BiddingStoreFilter>(() => ({
    ...DEFAULT_FILTER,
    ...(initialFilter || {}),
  }));
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchProjects = useCallback(async (activeFilters: BiddingStoreFilter) => {
    setIsLoading(true);
    setError(null);
    try {
      const list = await BiddingPersistenceService.listProjects(activeFilters);
      setProjects(list);
      setSelectedProject((previous) => {
        if (!list.length) {
          return null;
        }
        if (!previous) {
          return list[0];
        }
        return list.find((project) => project.summary.id === previous.summary.id) || list[0];
      });
      setLastUpdated(new Date());
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Não foi possível carregar as licitações.';
      setError(message);
      logger.error('[useBiddingCenter] Falha ao carregar licitações', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchProjects(filters);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const refresh = useCallback(async () => {
    await fetchProjects(filters);
  }, [fetchProjects, filters]);

  const updateFilters = useCallback((changes: Partial<BiddingStoreFilter>) => {
    setFilters((prev) => ({
      ...prev,
      ...changes,
    }));
  }, []);

  const resetFilters = useCallback(() => {
    setFilters(DEFAULT_FILTER);
  }, []);

  const selectProject = useCallback(async (projectId: string) => {
    if (!projectId) {
      setSelectedProject(null);
      return;
    }

    const current = projects.find((project) => project.summary.id === projectId);
    if (current) {
      setSelectedProject(current);
      return;
    }

    try {
      const fetched = await BiddingPersistenceService.getById(projectId);
      if (fetched) {
        setSelectedProject(fetched);
      }
    } catch (err) {
      logger.error('[useBiddingCenter] Falha ao selecionar licitação', err);
      setError('Não foi possível carregar a licitação selecionada.');
    }
  }, [projects]);

  const saveProject = useCallback(async (project: BiddingProject) => {
    try {
      const saved = await BiddingPersistenceService.saveProject(project);
      await fetchProjects(filters);
      setSelectedProject(saved);
      return saved;
    } catch (err) {
      logger.error('[useBiddingCenter] Falha ao salvar licitação', err);
      throw err;
    }
  }, [fetchProjects, filters]);

  const deleteProject = useCallback(async (projectId: string) => {
    try {
      await BiddingPersistenceService.deleteProject(projectId);
      await fetchProjects(filters);
      setSelectedProject((current) => (current && current.summary.id === projectId ? null : current));
    } catch (err) {
      logger.error('[useBiddingCenter] Falha ao excluir licitação', err);
      throw err;
    }
  }, [fetchProjects, filters]);

  const updateLifecycle = useCallback(async (projectId: string, lifecycle: BiddingLifecycleStatus) => {
    try {
      await BiddingPersistenceService.updateLifecycleStatus(projectId, lifecycle);
      await fetchProjects(filters);
    } catch (err) {
      logger.error('[useBiddingCenter] Falha ao atualizar lifecycle', err);
      throw err;
    }
  }, [fetchProjects, filters]);

  const resetMockData = useCallback(async () => {
    try {
      await BiddingPersistenceService.resetToDefaults();
      await fetchProjects(filters);
    } catch (err) {
      logger.error('[useBiddingCenter] Falha ao restaurar dados padrão', err);
      throw err;
    }
  }, [fetchProjects, filters]);

  const statistics = useMemo(() => buildStatistics(projects), [projects]);
  const lifecycleCards = useMemo(() => buildLifecycleCards(projects), [projects]);
  const analyticsSummary = useMemo(() => pickLatestAnalytics(projects), [projects]);

  return {
    projects,
    selectedProject,
    filters,
    statistics,
    lifecycleCards,
    analyticsSummary,
    isLoading,
    error,
    lastUpdated,
    refresh,
    updateFilters,
    resetFilters,
    selectProject,
    saveProject,
    deleteProject,
    updateLifecycle,
    resetMockData,
  };
}
