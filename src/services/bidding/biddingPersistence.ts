import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/services/logger';
import {
  Bidding,
  BiddingAnalyticsSnapshot,
  BiddingLifecycleStatus,
  BiddingMode,
  BiddingProject,
  BiddingStatus,
  BiddingStoreFilter,
  BiddingTaxRegime,
  BiddingType,
  ViabilityLevel,
} from '@/types/bidding';

const STORAGE_KEY = 'azuria_bidding_projects_v1';
const ISO_DATE_REGEX = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?Z$/;

export class BiddingPersistenceService {
  private static memoryStore: BiddingProject[] = cloneProjects(createMockProjects());

  static async listProjects(filter?: BiddingStoreFilter): Promise<BiddingProject[]> {
    const projects = await this.loadProjects();
    return this.applyFilters(projects, filter);
  }

  static async getById(projectId: string): Promise<BiddingProject | undefined> {
    const projects = await this.loadProjects();
    return projects.find((project) => project.summary.id === projectId);
  }

  static async saveProject(project: BiddingProject): Promise<BiddingProject> {
    const normalized = this.normalizeProject(project);
    const projects = await this.loadProjects();
    const existingIndex = projects.findIndex((item) => item.summary.id === normalized.summary.id);

    if (existingIndex >= 0) {
      projects[existingIndex] = normalized;
    } else {
      projects.unshift(normalized);
    }

    await this.persistProjects(projects);
    return normalized;
  }

  static async updateLifecycleStatus(
    projectId: string,
    lifecycle: BiddingLifecycleStatus,
  ): Promise<BiddingProject | null> {
    const projects = await this.loadProjects();
    const index = projects.findIndex((project) => project.summary.id === projectId);

    if (index === -1) {
      return null;
    }

    const project = { ...projects[index] };
    const now = new Date();

    project.summary = {
      ...project.summary,
      lifecycleStatus: lifecycle,
    };

    project.bidding = {
      ...project.bidding,
      data: {
        ...project.bidding.data,
        lifecycleStatus: lifecycle,
        updatedAt: now,
      },
      history: project.bidding.history,
    };

    project.history = [
      {
        id: this.generateId('history'),
        biddingId: project.bidding.data.id ?? projectId,
        action: 'status_changed',
        description: `Status atualizado para ${lifecycle}`,
        timestamp: now,
      },
      ...(project.history || []),
    ];

    projects[index] = project;
    await this.persistProjects(projects);
    return project;
  }

  static async deleteProject(projectId: string): Promise<void> {
    const projects = await this.loadProjects();
    const filtered = projects.filter((project) => project.summary.id !== projectId);
    await this.persistProjects(filtered);
  }

  static async resetToDefaults(): Promise<void> {
    const defaults = cloneProjects(createMockProjects());
    await this.persistProjects(defaults);
  }

  private static async loadProjects(): Promise<BiddingProject[]> {
    if (this.isSupabaseAvailable()) {
      try {
        return await this.loadFromSupabase();
      } catch (error) {
        logger.warn('[BiddingPersistence] Supabase indisponível, usando localStorage.', error);
      }
    }

    const localProjects = this.getFromLocalStorage();

    if (localProjects.length > 0) {
      return localProjects;
    }

    await this.persistProjects(this.memoryStore);
    return cloneProjects(this.memoryStore);
  }

  private static async persistProjects(projects: BiddingProject[]): Promise<void> {
    if (this.isSupabaseAvailable()) {
      try {
        await this.saveToSupabase(projects);
        return;
      } catch (error) {
        logger.warn('[BiddingPersistence] Falha ao salvar no Supabase, usando localStorage.', error);
      }
    }

    this.saveToLocalStorage(projects);
  }

  private static getFromLocalStorage(): BiddingProject[] {
    if (!hasLocalStorage()) {
      return cloneProjects(this.memoryStore);
    }

    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        return [];
      }

      const parsed = JSON.parse(raw, (_key, value) => {
        if (typeof value === 'string' && ISO_DATE_REGEX.test(value)) {
          return new Date(value);
        }
        return value;
      });

      return parsed as BiddingProject[];
    } catch (error) {
      logger.error('[BiddingPersistence] Erro ao ler localStorage, usando memória.', error);
      return cloneProjects(this.memoryStore);
    }
  }

  private static saveToLocalStorage(projects: BiddingProject[]): void {
    if (!hasLocalStorage()) {
      this.memoryStore = cloneProjects(projects);
      return;
    }

    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
    } catch (error) {
      logger.error('[BiddingPersistence] Erro ao salvar localStorage, mantendo memória.', error);
      this.memoryStore = cloneProjects(projects);
    }
  }

  private static async loadFromSupabase(): Promise<BiddingProject[]> {
    void supabase;
    throw new Error('Supabase persistence for bidding projects not implemented yet.');
  }

  private static async saveToSupabase(_projects: BiddingProject[]): Promise<void> {
    void supabase;
    throw new Error('Supabase persistence for bidding projects not implemented yet.');
  }

  private static normalizeProject(project: BiddingProject): BiddingProject {
    const biddingId = project.summary.id || this.generateId('bidding');

    const summary = {
      ...project.summary,
      id: biddingId,
      lifecycleStatus: project.summary.lifecycleStatus || project.bidding.data.lifecycleStatus,
    };

    const biddingData = {
      ...project.bidding.data,
      id: project.bidding.data.id || biddingId,
      lifecycleStatus: summary.lifecycleStatus,
      createdAt: project.bidding.data.createdAt || new Date(),
      updatedAt: new Date(),
    };

    const normalized: BiddingProject = {
      ...project,
      summary,
      bidding: {
        ...project.bidding,
        data: biddingData,
      },
      attachments: project.attachments || project.bidding.attachments || [],
      requirements: project.requirements || [],
      history: project.history || [],
    };

    return normalized;
  }

  private static applyFilters(
    projects: BiddingProject[],
    filter?: BiddingStoreFilter,
  ): BiddingProject[] {
    if (!filter) {
      return projects;
    }

    return projects.filter((project) => {
      if (filter.lifecycle && filter.lifecycle.length > 0 && !filter.lifecycle.includes(project.summary.lifecycleStatus)) {
        return false;
      }

      if (filter.status && filter.status.length > 0 && !filter.status.includes(project.bidding.data.status)) {
        return false;
      }

      if (filter.organ && project.summary.organ !== filter.organ) {
        return false;
      }

      if (filter.search) {
        const needle = filter.search.toLowerCase();
        const haystack = [
          project.summary.title,
          project.summary.organ,
          project.bidding.data.editalNumber,
          project.bidding.data.description || '',
        ]
          .join(' ')
          .toLowerCase();

        if (!haystack.includes(needle)) {
          return false;
        }
      }

      return true;
    });
  }

  private static isSupabaseAvailable(): boolean {
    const env = import.meta.env;
    return Boolean(env?.VITE_SUPABASE_URL && env?.VITE_SUPABASE_ANON_KEY);
  }

  private static generateId(prefix: string): string {
    return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  }
}

function hasLocalStorage(): boolean {
  try {
    return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
  } catch (error) {
    logger.error('[BiddingPersistence] localStorage indisponível.', error);
    return false;
  }
}

function cloneProjects(projects: BiddingProject[]): BiddingProject[] {
  return JSON.parse(JSON.stringify(projects), (_key, value) => {
    if (typeof value === 'string' && ISO_DATE_REGEX.test(value)) {
      return new Date(value);
    }
    return value;
  });
}

interface MockProjectSeed {
  id: string;
  title: string;
  organ: string;
  type: BiddingType;
  mode: BiddingMode;
  status: BiddingStatus;
  lifecycle: BiddingLifecycleStatus;
  totalValue: number;
  totalItems: number;
  winProbability: number;
  viability: ViabilityLevel;
  createdDaysAgo: number;
  deadlineInDays: number;
}

function createMockProjects(): BiddingProject[] {
  const seeds: MockProjectSeed[] = [
    {
      id: 'bid-001',
      title: 'Fornecimento de Equipamentos Hospitalares',
      organ: 'Prefeitura de São Paulo',
      type: BiddingType.PREGAO_ELETRONICO,
      mode: BiddingMode.MENOR_PRECO,
      status: BiddingStatus.EM_ANALISE,
      lifecycle: BiddingLifecycleStatus.OPEN,
      totalValue: 485000,
      totalItems: 3,
      winProbability: 0.62,
      viability: ViabilityLevel.BOM,
      createdDaysAgo: 12,
      deadlineInDays: 8,
    },
    {
      id: 'bid-002',
      title: 'Contratação de Serviços de TI - Datacenter',
      organ: 'Governo do Estado do Pará',
      type: BiddingType.CONCORRENCIA,
      mode: BiddingMode.TECNICA_E_PRECO,
      status: BiddingStatus.VENCEDOR,
      lifecycle: BiddingLifecycleStatus.WON,
      totalValue: 2200000,
      totalItems: 5,
      winProbability: 0.93,
      viability: ViabilityLevel.EXCELENTE,
      createdDaysAgo: 40,
      deadlineInDays: -5,
    },
    {
      id: 'bid-003',
      title: 'Aquisição de Kits Educacionais',
      organ: 'Secretaria de Educação de Minas Gerais',
      type: BiddingType.TOMADA_PRECOS,
      mode: BiddingMode.MAIOR_DESCONTO,
      status: BiddingStatus.PERDEDOR,
      lifecycle: BiddingLifecycleStatus.LOST,
      totalValue: 310000,
      totalItems: 2,
      winProbability: 0.18,
      viability: ViabilityLevel.CRITICO,
      createdDaysAgo: 25,
      deadlineInDays: -3,
    },
  ];

  return seeds.map(buildMockProject);
}

function buildMockProject(seed: MockProjectSeed): BiddingProject {
  const createdAt = addDays(new Date(), -seed.createdDaysAgo);
  const deadline = addDays(new Date(), seed.deadlineInDays);

  const bidding: Bidding = {
    data: {
      id: seed.id,
      editalNumber: `ED-${seed.id.toUpperCase()}`,
      organ: seed.organ,
      type: seed.type,
      mode: seed.mode,
      openingDate: deadline,
      status: seed.status,
      lifecycleStatus: seed.lifecycle,
      priority: 'medium',
      createdAt,
      updatedAt: createdAt,
      description: seed.title,
      observations: 'Dados preenchidos automaticamente para validação do módulo.',
    },
    items: [
      {
        id: `${seed.id}-item-1`,
        itemNumber: 1,
        description: `${seed.title} - Item 1`,
        quantity: 10,
        unit: 'un',
        unitCost: seed.totalValue / seed.totalItems / 1.12,
        logisticsCost: 1500,
        otherCosts: 800,
        totalCost: seed.totalValue / seed.totalItems,
        score: 78,
      },
      {
        id: `${seed.id}-item-2`,
        itemNumber: 2,
        description: `${seed.title} - Item 2`,
        quantity: 5,
        unit: 'un',
        unitCost: seed.totalValue / seed.totalItems / 1.08,
        logisticsCost: 900,
        otherCosts: 600,
        totalCost: (seed.totalValue / seed.totalItems) * 0.92,
        score: 65,
      },
    ],
    taxConfig: {
      regime: BiddingTaxRegime.LUCRO_PRESUMIDO,
      pis: 1.65,
      cofins: 7.6,
      irpj: 4.8,
      csll: 2.88,
      icms: 18,
      iss: 0,
      socialCharges: 8,
      laborCharges: 5,
    },
    strategy: {
      desiredMargin: 18,
      minimumMargin: 8,
      maximumDiscount: 15,
      breakEvenPrice: seed.totalValue * 0.82,
      useAI: true,
    },
    result: {
      totalCost: seed.totalValue * 0.78,
      totalTaxes: seed.totalValue * 0.12,
      totalGuarantee: seed.totalValue * 0.03,
      costWithTaxes: seed.totalValue * 0.9,
      suggestedPrice: seed.totalValue,
      minimumPrice: seed.totalValue * 0.86,
      breakEvenPrice: seed.totalValue * 0.82,
      netProfit: seed.totalValue * 0.14,
      profitMargin: 14,
      grossMargin: 22,
      viability: seed.viability,
      viabilityScore: seed.viability === ViabilityLevel.EXCELENTE ? 92 : seed.viability === ViabilityLevel.BOM ? 78 : 55,
      warnings: [],
      suggestions: ['Rever impostos estaduais antes do envio final.'],
      risks: seed.lifecycle === BiddingLifecycleStatus.LOST ? ['Preço acima da média prevista.'] : [],
    },
    attachments: [
      {
        id: `${seed.id}-att-1`,
        name: 'Edital Oficial.pdf',
        type: 'edital',
        uploadedAt: createdAt,
      },
    ],
    requirements: [
      {
        id: `${seed.id}-req-1`,
        title: 'Certidão Negativa de Débitos',
        status: seed.lifecycle === BiddingLifecycleStatus.OPEN ? 'pending' : 'fulfilled',
        dueDate: deadline,
      },
    ],
    competitors: [
      {
        id: `${seed.id}-comp-1`,
        name: 'Concorrente Alfa',
        lastKnownPrice: seed.totalValue * 0.97,
        lastUpdate: createdAt,
        estimatedMargin: 11,
        status: 'known',
      },
    ],
    history: [
      {
        id: `${seed.id}-history-1`,
        biddingId: seed.id,
        action: 'created',
        description: 'Licitação cadastrada automaticamente.',
        timestamp: createdAt,
      },
    ],
    analyticsSnapshot: createBaseAnalytics(seed),
  };

  return {
    summary: {
      id: seed.id,
      title: seed.title,
      organ: seed.organ,
      lifecycleStatus: seed.lifecycle,
      deadline,
      nextStep: seed.lifecycle === BiddingLifecycleStatus.WON ? 'Preparar assinatura do contrato' : 'Montar documentação complementar',
      totalItems: seed.totalItems,
      totalValue: seed.totalValue,
      winProbability: seed.winProbability,
    },
    bidding,
    attachments: bidding.attachments || [],
    requirements: bidding.requirements || [],
    history: bidding.history || [],
    analytics: bidding.analyticsSnapshot,
  };
}

function createBaseAnalytics(seed: MockProjectSeed): BiddingAnalyticsSnapshot {
  return {
    generatedAt: new Date(),
    totalParticipated: 24,
    totalWon: 11,
    totalLost: 9,
    winRate: 0.46,
    totalValueParticipated: 9_500_000,
    totalValueWon: 4_300_000,
    averageMargin: 0.16,
    estimatedSavings: 1_150_000,
    lifecycleBreakdown: {
      [BiddingLifecycleStatus.OPEN]: 8,
      [BiddingLifecycleStatus.WON]: 7,
      [BiddingLifecycleStatus.LOST]: 6,
      [BiddingLifecycleStatus.ARCHIVED]: 3,
    },
    topOrgans: [
      { organ: seed.organ, count: 4, value: seed.totalValue },
      { organ: 'FNDE', count: 3, value: 1_200_000 },
    ],
  };
}

function addDays(date: Date, days: number): Date {
  const clone = new Date(date);
  clone.setDate(clone.getDate() + days);
  return clone;
}
