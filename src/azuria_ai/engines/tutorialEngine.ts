/**
 * TutorialEngine - Motor de Tutoriais Passo-a-Passo
 *
 * Este engine é responsável por:
 * - Gerenciar tutoriais interativos
 * - Guiar o usuário através de fluxos complexos
 * - Adaptar tutoriais ao nível do usuário
 * - Rastrear progresso e conquistas
 * - Sugerir tutoriais relevantes
 *
 * @module azuria_ai/engines/tutorialEngine
 */

import type { CreateSuggestionInput, UserContext } from '../types/operational';
import { eventBus } from '../core/eventBus';

// ============================================================================
// Types
// ============================================================================

/** Status de um passo do tutorial */
export type TutorialStepStatus = 'pending' | 'active' | 'completed' | 'skipped';

/** Status geral do tutorial */
export type TutorialStatus = 'not-started' | 'in-progress' | 'completed' | 'abandoned';

/** Tipo de ação esperada em um passo */
export type StepActionType =
  | 'click'
  | 'input'
  | 'select'
  | 'navigate'
  | 'calculate'
  | 'read'
  | 'wait'
  | 'confirm';

/** Definição de um passo do tutorial */
export interface TutorialStep {
  /** ID único do passo */
  id: string;
  /** Ordem do passo */
  order: number;
  /** Título do passo */
  title: string;
  /** Instrução principal */
  instruction: string;
  /** Explicação detalhada (opcional) */
  explanation?: string;
  /** Dica (opcional) */
  hint?: string;
  /** Tipo de ação esperada */
  actionType: StepActionType;
  /** Seletor do elemento alvo (CSS selector) */
  targetSelector?: string;
  /** Tela onde o passo ocorre */
  screen?: string;
  /** Validação para considerar completo */
  validation?: {
    /** Tipo de validação */
    type: 'element-exists' | 'value-changed' | 'navigation' | 'custom';
    /** Valor esperado (se aplicável) */
    expectedValue?: string | number;
    /** Função de validação customizada */
    customValidator?: string;
  };
  /** Se pode ser pulado */
  skippable: boolean;
  /** Duração estimada (segundos) */
  estimatedDuration: number;
  /** Ação ao completar */
  onComplete?: {
    /** Próximo passo (se não for sequencial) */
    nextStepId?: string;
    /** Evento a emitir */
    emitEvent?: string;
    /** Mensagem de sucesso */
    successMessage?: string;
  };
}

/** Definição de um tutorial */
export interface Tutorial {
  /** ID único */
  id: string;
  /** Título */
  title: string;
  /** Descrição */
  description: string;
  /** Categoria */
  category: 'getting-started' | 'pricing' | 'tax' | 'bidding' | 'advanced' | 'tips';
  /** Nível de dificuldade */
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  /** Passos do tutorial */
  steps: TutorialStep[];
  /** Tela inicial */
  startScreen: string;
  /** Pré-requisitos (IDs de outros tutoriais) */
  prerequisites?: string[];
  /** Duração total estimada (minutos) */
  estimatedDuration: number;
  /** Tags para busca */
  tags: string[];
  /** Se está habilitado */
  enabled: boolean;
  /** Versão */
  version: number;
}

/** Progresso do usuário em um tutorial */
export interface TutorialProgress {
  /** ID do tutorial */
  tutorialId: string;
  /** Status */
  status: TutorialStatus;
  /** Passo atual */
  currentStepIndex: number;
  /** Passos completados */
  completedSteps: string[];
  /** Passos pulados */
  skippedSteps: string[];
  /** Quando iniciou */
  startedAt: number;
  /** Quando completou (se aplicável) */
  completedAt?: number;
  /** Tempo total gasto (ms) */
  timeSpent: number;
  /** Última atualização */
  lastUpdatedAt: number;
}

/** Conquista do usuário */
export interface TutorialAchievement {
  /** ID da conquista */
  id: string;
  /** Título */
  title: string;
  /** Descrição */
  description: string;
  /** Ícone */
  icon: string;
  /** Quando desbloqueou */
  unlockedAt: number;
  /** Tutorial relacionado */
  tutorialId?: string;
}

/** Callback para eventos do tutorial */
export type TutorialEventCallback = (event: {
  type: 'step-completed' | 'step-skipped' | 'tutorial-completed' | 'tutorial-abandoned';
  tutorialId: string;
  stepId?: string;
  progress: TutorialProgress;
}) => void;

// ============================================================================
// Tutorial Definitions
// ============================================================================

const TUTORIALS: Tutorial[] = [
  // Getting Started
  {
    id: 'getting-started',
    title: 'Primeiros Passos no Azuria',
    description: 'Aprenda os conceitos básicos e navegue pela plataforma.',
    category: 'getting-started',
    difficulty: 'beginner',
    startScreen: '/',
    estimatedDuration: 3,
    tags: ['iniciante', 'básico', 'navegação'],
    enabled: true,
    version: 1,
    steps: [
      {
        id: 'welcome',
        order: 1,
        title: 'Bem-vindo ao Azuria!',
        instruction: 'Vamos conhecer a plataforma. Clique em "Próximo" para continuar.',
        explanation: 'O Azuria é uma plataforma completa para cálculos de precificação, impostos e licitações.',
        actionType: 'read',
        skippable: false,
        estimatedDuration: 10,
      },
      {
        id: 'nav-calculator',
        order: 2,
        title: 'Acesse a Calculadora',
        instruction: 'Clique no menu "Calculadora" para acessar as ferramentas de cálculo.',
        hint: 'O menu está no topo da página.',
        actionType: 'click',
        targetSelector: '[data-nav="calculator"], a[href*="calculator"]',
        skippable: true,
        estimatedDuration: 5,
        onComplete: {
          successMessage: 'Ótimo! Você encontrou a calculadora.',
        },
      },
      {
        id: 'first-calc-intro',
        order: 3,
        title: 'Sua Primeira Calculadora',
        instruction: 'Esta é a calculadora de preço de venda. Ela ajuda a definir o preço ideal.',
        explanation: 'Com ela, você pode calcular preços considerando custos, despesas e margem desejada.',
        actionType: 'read',
        screen: '/calculator',
        skippable: false,
        estimatedDuration: 15,
      },
      {
        id: 'input-cost',
        order: 4,
        title: 'Informe o Custo',
        instruction: 'Digite o custo do seu produto no campo "Custo".',
        hint: 'Use um valor de exemplo como R$ 100,00.',
        actionType: 'input',
        targetSelector: '[data-field="cost"], input[name*="cost"], #cost',
        skippable: true,
        estimatedDuration: 10,
        validation: {
          type: 'value-changed',
        },
      },
      {
        id: 'complete',
        order: 5,
        title: 'Tutorial Concluído!',
        instruction: 'Parabéns! Você completou o tutorial inicial.',
        explanation: 'Agora você conhece o básico. Explore os outros tutoriais para aprender mais.',
        actionType: 'confirm',
        skippable: false,
        estimatedDuration: 5,
        onComplete: {
          emitEvent: 'tutorial:getting-started-completed',
          successMessage: 'Você ganhou a conquista "Primeiro Passo"!',
        },
      },
    ],
  },

  // Pricing Tutorial
  {
    id: 'pricing-basics',
    title: 'Formação de Preço de Venda',
    description: 'Aprenda a calcular o preço de venda ideal para seus produtos.',
    category: 'pricing',
    difficulty: 'beginner',
    startScreen: '/calculator',
    estimatedDuration: 5,
    tags: ['preço', 'margem', 'markup', 'custo'],
    enabled: true,
    version: 1,
    steps: [
      {
        id: 'intro',
        order: 1,
        title: 'Calculando o Preço Ideal',
        instruction: 'Vamos aprender a calcular o preço de venda corretamente.',
        explanation:
          'O preço de venda deve cobrir custos, despesas e ainda gerar o lucro desejado.',
        actionType: 'read',
        skippable: false,
        estimatedDuration: 15,
      },
      {
        id: 'understand-cost',
        order: 2,
        title: 'Entenda o Custo',
        instruction: 'O custo é quanto você paga pelo produto ou serviço.',
        explanation: 'Inclua todos os custos diretos: compra, frete, embalagem, etc.',
        hint: 'Não esqueça custos "escondidos" como perdas e devoluções.',
        actionType: 'read',
        skippable: false,
        estimatedDuration: 20,
      },
      {
        id: 'input-cost',
        order: 3,
        title: 'Informe o Custo',
        instruction: 'Digite o custo do produto no campo apropriado.',
        actionType: 'input',
        targetSelector: '[data-field="cost"]',
        skippable: true,
        estimatedDuration: 10,
      },
      {
        id: 'understand-expenses',
        order: 4,
        title: 'Despesas Variáveis',
        instruction: 'São despesas que variam conforme a venda.',
        explanation:
          'Incluem impostos (ICMS, PIS, COFINS), comissões, taxas de cartão, etc.',
        actionType: 'read',
        skippable: false,
        estimatedDuration: 20,
      },
      {
        id: 'input-expenses',
        order: 5,
        title: 'Informe as Despesas',
        instruction: 'Preencha o percentual total de despesas variáveis.',
        hint: 'Some todos os impostos e taxas que incidem sobre a venda.',
        actionType: 'input',
        targetSelector: '[data-field="expenses"], [data-field="variable-expenses"]',
        skippable: true,
        estimatedDuration: 15,
      },
      {
        id: 'understand-margin',
        order: 6,
        title: 'Margem de Lucro',
        instruction: 'A margem é o lucro que você quer ter em cada venda.',
        explanation:
          'Margem é calculada sobre o preço de venda, não sobre o custo! 30% de margem não é custo × 1,3.',
        hint: 'Considere o mercado e a concorrência ao definir sua margem.',
        actionType: 'read',
        skippable: false,
        estimatedDuration: 25,
      },
      {
        id: 'input-margin',
        order: 7,
        title: 'Defina sua Margem',
        instruction: 'Informe a margem de lucro desejada.',
        actionType: 'input',
        targetSelector: '[data-field="margin"]',
        skippable: true,
        estimatedDuration: 10,
      },
      {
        id: 'calculate',
        order: 8,
        title: 'Calcule o Preço',
        instruction: 'Clique no botão para calcular o preço de venda.',
        actionType: 'click',
        targetSelector: '[data-action="calculate"], button[type="submit"]',
        skippable: false,
        estimatedDuration: 5,
      },
      {
        id: 'review-result',
        order: 9,
        title: 'Analise o Resultado',
        instruction: 'Veja o preço calculado e os indicadores.',
        explanation:
          'O sistema mostra o preço ideal, markup resultante e validações.',
        actionType: 'read',
        skippable: false,
        estimatedDuration: 20,
        onComplete: {
          successMessage: 'Parabéns! Você aprendeu a calcular preços!',
        },
      },
    ],
  },

  // BDI Tutorial
  {
    id: 'bdi-calculation',
    title: 'Cálculo de BDI para Licitações',
    description: 'Aprenda a calcular o BDI conforme metodologia TCU.',
    category: 'bidding',
    difficulty: 'intermediate',
    startScreen: '/bdi-calculator',
    estimatedDuration: 8,
    tags: ['bdi', 'licitação', 'tcu', 'obras', 'serviços'],
    enabled: true,
    version: 1,
    steps: [
      {
        id: 'intro',
        order: 1,
        title: 'O que é BDI?',
        instruction: 'BDI significa Bonificação e Despesas Indiretas.',
        explanation:
          'É o percentual aplicado sobre custos diretos para formar o preço em licitações.',
        actionType: 'read',
        skippable: false,
        estimatedDuration: 20,
      },
      {
        id: 'select-type',
        order: 2,
        title: 'Selecione o Tipo',
        instruction: 'Escolha o tipo de contrato: Obras, Serviços ou Fornecimento.',
        hint: 'Cada tipo tem faixas de BDI diferentes recomendadas pelo TCU.',
        actionType: 'select',
        targetSelector: '[data-field="contract-type"]',
        skippable: false,
        estimatedDuration: 10,
      },
      {
        id: 'components-intro',
        order: 3,
        title: 'Componentes do BDI',
        instruction: 'O BDI é composto por: AC, Seguros, Riscos, Garantias, DF, Lucro e Tributos.',
        explanation:
          'Cada componente tem faixas recomendadas pelo TCU. Valores fora podem ser questionados.',
        actionType: 'read',
        skippable: false,
        estimatedDuration: 30,
      },
      {
        id: 'fill-components',
        order: 4,
        title: 'Preencha os Componentes',
        instruction: 'Informe os percentuais de cada componente do BDI.',
        hint: 'Use os valores sugeridos como referência inicial.',
        actionType: 'input',
        skippable: true,
        estimatedDuration: 60,
      },
      {
        id: 'calculate',
        order: 5,
        title: 'Calcule o BDI',
        instruction: 'Clique para calcular usando a fórmula TCU.',
        explanation: 'Fórmula: BDI = [(1+AC+S+R+G) × (1+DF) × (1+L) / (1-I)] - 1',
        actionType: 'click',
        targetSelector: '[data-action="calculate-bdi"]',
        skippable: false,
        estimatedDuration: 5,
      },
      {
        id: 'review-alerts',
        order: 6,
        title: 'Verifique os Alertas',
        instruction: 'Analise se o BDI está dentro da faixa TCU.',
        explanation:
          'BDI fora da faixa não impede participação, mas pode gerar questionamentos.',
        actionType: 'read',
        skippable: false,
        estimatedDuration: 20,
        onComplete: {
          successMessage: 'Excelente! Você dominou o cálculo de BDI!',
        },
      },
    ],
  },
];

// ============================================================================
// Achievements
// ============================================================================

const ACHIEVEMENTS: Omit<TutorialAchievement, 'unlockedAt'>[] = [
  {
    id: 'first-step',
    title: 'Primeiro Passo',
    description: 'Completou o tutorial inicial',
    icon: '🎯',
    tutorialId: 'getting-started',
  },
  {
    id: 'pricing-master',
    title: 'Mestre da Precificação',
    description: 'Completou o tutorial de formação de preço',
    icon: '💰',
    tutorialId: 'pricing-basics',
  },
  {
    id: 'bdi-expert',
    title: 'Expert em BDI',
    description: 'Completou o tutorial de cálculo de BDI',
    icon: '📊',
    tutorialId: 'bdi-calculation',
  },
  {
    id: 'completionist',
    title: 'Completista',
    description: 'Completou todos os tutoriais',
    icon: '🏆',
  },
  {
    id: 'speed-learner',
    title: 'Aprendiz Rápido',
    description: 'Completou um tutorial em menos de 2 minutos',
    icon: '⚡',
  },
];

// ============================================================================
// State
// ============================================================================

interface EngineState {
  initialized: boolean;
  activeTutorial: string | null;
  progress: Map<string, TutorialProgress>;
  achievements: TutorialAchievement[];
  eventCallbacks: TutorialEventCallback[];
}

const state: EngineState = {
  initialized: false,
  activeTutorial: null,
  progress: new Map(),
  achievements: [],
  eventCallbacks: [],
};

// ============================================================================
// Core Functions
// ============================================================================

/**
 * Inicializa o TutorialEngine
 */
export function initTutorialEngine(): void {
  if (state.initialized) {return;}

  state.initialized = true;
  state.activeTutorial = null;
  state.progress = new Map();
  state.achievements = [];
}

/**
 * Encerra o TutorialEngine
 */
export function shutdownTutorialEngine(): void {
  state.initialized = false;
  state.activeTutorial = null;
  state.progress.clear();
  state.eventCallbacks = [];
}

/**
 * Registra callback para eventos
 */
export function onTutorialEvent(callback: TutorialEventCallback): () => void {
  state.eventCallbacks.push(callback);
  return () => {
    state.eventCallbacks = state.eventCallbacks.filter((cb) => cb !== callback);
  };
}

// ============================================================================
// Tutorial Management
// ============================================================================

/**
 * Obtém todos os tutoriais disponíveis
 */
export function getAvailableTutorials(
  userContext?: UserContext
): Tutorial[] {
  let tutorials = TUTORIALS.filter((t) => t.enabled);

  // Filtrar por nível do usuário
  if (userContext) {
    const skillLevel = userContext.skillLevel;
    tutorials = tutorials.filter((t) => {
      if (skillLevel === 'beginner') {
        return t.difficulty === 'beginner';
      }
      if (skillLevel === 'intermediate') {
        return t.difficulty !== 'advanced';
      }
      return true; // advanced e expert veem todos
    });
  }

  return tutorials;
}

/**
 * Obtém um tutorial específico
 */
export function getTutorial(tutorialId: string): Tutorial | null {
  return TUTORIALS.find((t) => t.id === tutorialId) ?? null;
}

/**
 * Obtém tutoriais por categoria
 */
export function getTutorialsByCategory(
  category: Tutorial['category']
): Tutorial[] {
  return TUTORIALS.filter((t) => t.enabled && t.category === category);
}

/**
 * Busca tutoriais por texto
 */
export function searchTutorials(query: string): Tutorial[] {
  const q = query.toLowerCase();
  return TUTORIALS.filter(
    (t) =>
      t.enabled &&
      (t.title.toLowerCase().includes(q) ||
        t.description.toLowerCase().includes(q) ||
        t.tags.some((tag) => tag.toLowerCase().includes(q)))
  );
}

/**
 * Inicia um tutorial
 */
export function startTutorial(tutorialId: string): TutorialProgress | null {
  const tutorial = getTutorial(tutorialId);
  if (!tutorial) {return null;}

  // Verificar pré-requisitos
  if (tutorial.prerequisites) {
    for (const prereq of tutorial.prerequisites) {
      const prereqProgress = state.progress.get(prereq);
      if (prereqProgress?.status !== 'completed') {
        return null; // Pré-requisito não completado
      }
    }
  }

  const now = Date.now();
  const progress: TutorialProgress = {
    tutorialId,
    status: 'in-progress',
    currentStepIndex: 0,
    completedSteps: [],
    skippedSteps: [],
    startedAt: now,
    timeSpent: 0,
    lastUpdatedAt: now,
  };

  state.progress.set(tutorialId, progress);
  state.activeTutorial = tutorialId;

  // Emitir evento
  eventBus.emit('user:navigation', {
    event: 'tutorial-started',
    tutorialId,
    tutorialTitle: tutorial.title,
    timestamp: now,
    source: 'tutorial-engine',
  });

  return progress;
}

/**
 * Avança para o próximo passo
 */
export function nextStep(): TutorialStep | null {
  if (!state.activeTutorial) {return null;}

  const progress = state.progress.get(state.activeTutorial);
  const tutorial = getTutorial(state.activeTutorial);

  if (!progress || !tutorial) {return null;}

  const currentStep = tutorial.steps[progress.currentStepIndex];
  if (!currentStep) {return null;}

  // Marcar passo atual como completo
  progress.completedSteps.push(currentStep.id);
  progress.currentStepIndex++;
  progress.lastUpdatedAt = Date.now();

  // Notificar callbacks
  for (const cb of state.eventCallbacks) {
    cb({
      type: 'step-completed',
      tutorialId: state.activeTutorial,
      stepId: currentStep.id,
      progress,
    });
  }

  // Verificar se tutorial acabou
  if (progress.currentStepIndex >= tutorial.steps.length) {
    completeTutorial();
    return null;
  }

  return tutorial.steps[progress.currentStepIndex];
}

/**
 * Pula o passo atual
 */
export function skipStep(): TutorialStep | null {
  if (!state.activeTutorial) {return null;}

  const progress = state.progress.get(state.activeTutorial);
  const tutorial = getTutorial(state.activeTutorial);

  if (!progress || !tutorial) {return null;}

  const currentStep = tutorial.steps[progress.currentStepIndex];
  if (!currentStep?.skippable) {return null;}

  // Marcar como pulado
  progress.skippedSteps.push(currentStep.id);
  progress.currentStepIndex++;
  progress.lastUpdatedAt = Date.now();

  // Notificar callbacks
  for (const cb of state.eventCallbacks) {
    cb({
      type: 'step-skipped',
      tutorialId: state.activeTutorial,
      stepId: currentStep.id,
      progress,
    });
  }

  // Verificar se tutorial acabou
  if (progress.currentStepIndex >= tutorial.steps.length) {
    completeTutorial();
    return null;
  }

  return tutorial.steps[progress.currentStepIndex];
}

/**
 * Obtém o passo atual
 */
export function getCurrentStep(): TutorialStep | null {
  if (!state.activeTutorial) {return null;}

  const progress = state.progress.get(state.activeTutorial);
  const tutorial = getTutorial(state.activeTutorial);

  if (!progress || !tutorial) {return null;}

  return tutorial.steps[progress.currentStepIndex] ?? null;
}

/**
 * Completa o tutorial atual
 */
export function completeTutorial(): void {
  if (!state.activeTutorial) {return;}

  const progress = state.progress.get(state.activeTutorial);
  const tutorial = getTutorial(state.activeTutorial);

  if (!progress || !tutorial) {return;}

  const now = Date.now();
  progress.status = 'completed';
  progress.completedAt = now;
  progress.timeSpent = now - progress.startedAt;
  progress.lastUpdatedAt = now;

  // Verificar conquistas
  checkAndGrantAchievements(state.activeTutorial, progress);

  // Notificar callbacks
  for (const cb of state.eventCallbacks) {
    cb({
      type: 'tutorial-completed',
      tutorialId: state.activeTutorial,
      progress,
    });
  }

  // Emitir evento
  eventBus.emit('user:navigation', {
    event: 'tutorial-completed',
    tutorialId: state.activeTutorial,
    tutorialTitle: tutorial.title,
    timeSpent: progress.timeSpent,
    timestamp: now,
    source: 'tutorial-engine',
  });

  state.activeTutorial = null;
}

/**
 * Abandona o tutorial atual
 */
export function abandonTutorial(): void {
  if (!state.activeTutorial) {return;}

  const progress = state.progress.get(state.activeTutorial);

  if (!progress) {return;}

  const now = Date.now();
  progress.status = 'abandoned';
  progress.timeSpent = now - progress.startedAt;
  progress.lastUpdatedAt = now;

  // Notificar callbacks
  for (const cb of state.eventCallbacks) {
    cb({
      type: 'tutorial-abandoned',
      tutorialId: state.activeTutorial,
      progress,
    });
  }

  state.activeTutorial = null;
}

/**
 * Obtém progresso de um tutorial
 */
export function getTutorialProgress(tutorialId: string): TutorialProgress | null {
  return state.progress.get(tutorialId) ?? null;
}

/**
 * Obtém progresso de todos os tutoriais
 */
export function getAllProgress(): Map<string, TutorialProgress> {
  return new Map(state.progress);
}

/**
 * Verifica se tutorial foi completado
 */
export function isTutorialCompleted(tutorialId: string): boolean {
  const progress = state.progress.get(tutorialId);
  return progress?.status === 'completed';
}

// ============================================================================
// Achievements
// ============================================================================

/**
 * Verifica e concede conquistas
 */
function checkAndGrantAchievements(
  tutorialId: string,
  progress: TutorialProgress
): void {
  const now = Date.now();

  // Conquista do tutorial específico
  const tutorialAchievement = ACHIEVEMENTS.find((a) => a.tutorialId === tutorialId);
  if (tutorialAchievement && !hasAchievement(tutorialAchievement.id)) {
    state.achievements.push({ ...tutorialAchievement, unlockedAt: now });
  }

  // Speed learner (menos de 2 minutos)
  if (progress.timeSpent < 120000 && !hasAchievement('speed-learner')) {
    const speedAchievement = ACHIEVEMENTS.find((a) => a.id === 'speed-learner');
    if (speedAchievement) {
      state.achievements.push({ ...speedAchievement, unlockedAt: now });
    }
  }

  // Completionist (todos os tutoriais)
  const allCompleted = TUTORIALS.every(
    (t) => !t.enabled || isTutorialCompleted(t.id)
  );
  if (allCompleted && !hasAchievement('completionist')) {
    const completionistAchievement = ACHIEVEMENTS.find(
      (a) => a.id === 'completionist'
    );
    if (completionistAchievement) {
      state.achievements.push({ ...completionistAchievement, unlockedAt: now });
    }
  }
}

/**
 * Verifica se tem conquista
 */
export function hasAchievement(achievementId: string): boolean {
  return state.achievements.some((a) => a.id === achievementId);
}

/**
 * Obtém todas as conquistas
 */
export function getAchievements(): TutorialAchievement[] {
  return [...state.achievements];
}

/**
 * Obtém conquistas disponíveis (não desbloqueadas)
 */
export function getAvailableAchievements(): Omit<TutorialAchievement, 'unlockedAt'>[] {
  return ACHIEVEMENTS.filter((a) => !hasAchievement(a.id));
}

// ============================================================================
// Suggestions
// ============================================================================

/**
 * Sugere tutoriais baseado no contexto
 */
export function suggestTutorials(userContext?: UserContext): CreateSuggestionInput[] {
  const suggestions: CreateSuggestionInput[] = [];

  // Se nunca fez o getting started
  if (!isTutorialCompleted('getting-started')) {
    suggestions.push({
      type: 'tutorial',
      priority: 'medium',
      category: 'general',
      title: 'Conheça o Azuria',
      message: 'Complete o tutorial inicial para aprender os conceitos básicos.',
      actions: [{ label: 'Iniciar', type: 'primary' }],
      context: { trigger: 'new_user' },
      confidence: 0.9,
    });
  }

  // Baseado na tela atual
  if (userContext?.currentScreen?.includes('calculator') && !isTutorialCompleted('pricing-basics')) {
    suggestions.push({
      type: 'tutorial',
      priority: 'low',
      category: 'pricing',
      title: 'Tutorial de Precificação',
      message: 'Quer aprender a formar preços corretamente?',
      actions: [{ label: 'Ver Tutorial', type: 'secondary' }],
      context: { screen: userContext.currentScreen },
      confidence: 0.7,
    });
  }

  if (userContext?.currentScreen?.includes('bdi') && !isTutorialCompleted('bdi-calculation')) {
    suggestions.push({
      type: 'tutorial',
      priority: 'medium',
      category: 'bidding',
      title: 'Aprenda BDI',
      message: 'Entenda como calcular o BDI conforme metodologia TCU.',
      actions: [{ label: 'Iniciar Tutorial', type: 'primary' }],
      context: { screen: userContext.currentScreen },
      confidence: 0.8,
    });
  }

  return suggestions;
}

// ============================================================================
// Stats
// ============================================================================

/**
 * Obtém estatísticas do engine
 */
export function getTutorialStats(): {
  initialized: boolean;
  activeTutorial: string | null;
  totalTutorials: number;
  completedTutorials: number;
  totalAchievements: number;
  unlockedAchievements: number;
} {
  const completedCount = Array.from(state.progress.values()).filter(
    (p) => p.status === 'completed'
  ).length;

  return {
    initialized: state.initialized,
    activeTutorial: state.activeTutorial,
    totalTutorials: TUTORIALS.filter((t) => t.enabled).length,
    completedTutorials: completedCount,
    totalAchievements: ACHIEVEMENTS.length,
    unlockedAchievements: state.achievements.length,
  };
}

// ============================================================================
// Exports
// ============================================================================

export const tutorialEngine = {
  init: initTutorialEngine,
  shutdown: shutdownTutorialEngine,
  onEvent: onTutorialEvent,
  getAvailable: getAvailableTutorials,
  get: getTutorial,
  getByCategory: getTutorialsByCategory,
  search: searchTutorials,
  start: startTutorial,
  next: nextStep,
  skip: skipStep,
  getCurrent: getCurrentStep,
  complete: completeTutorial,
  abandon: abandonTutorial,
  getProgress: getTutorialProgress,
  getAllProgress,
  isCompleted: isTutorialCompleted,
  hasAchievement,
  getAchievements,
  getAvailableAchievements,
  suggest: suggestTutorials,
  getStats: getTutorialStats,
};

export default tutorialEngine;
