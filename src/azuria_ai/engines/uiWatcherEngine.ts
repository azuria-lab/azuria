/**
 * UIWatcher - Motor de Monitoramento de Interações da UI
 *
 * Este engine é responsável por:
 * - Observar interações do usuário com a UI (clicks, hovers, scrolls, etc.)
 * - Detectar padrões de navegação e comportamento
 * - Identificar elementos que causam confusão ou hesitação
 * - Emitir eventos para o Co-Piloto reagir
 *
 * @module azuria_ai/engines/uiWatcherEngine
 */

import { eventBus } from '../core/eventBus';
import type { UserActivityState } from '../types/operational';

// ============================================================================
// Constants
// ============================================================================

/** Tempo mínimo de hover para considerar "interesse" (ms) */
const HOVER_INTEREST_THRESHOLD = 2000;

/** Tempo mínimo em um elemento para considerar "hesitação" (ms) */
const HESITATION_THRESHOLD = 5000;

/** Tempo sem interação para considerar "idle" (ms) */
const IDLE_THRESHOLD = 30000;

/** Intervalo de verificação de idle (ms) */
const IDLE_CHECK_INTERVAL = 5000;

/** Máximo de eventos armazenados */
const MAX_EVENTS_STORED = 200;

/** Debounce para eventos de scroll (ms) */
const SCROLL_DEBOUNCE = 200;

/** Debounce para eventos de resize (ms) */
const RESIZE_DEBOUNCE = 500;

// ============================================================================
// Types
// ============================================================================

/** Tipo de interação monitorada */
export type InteractionType =
  | 'click'
  | 'double-click'
  | 'right-click'
  | 'hover-start'
  | 'hover-end'
  | 'focus'
  | 'blur'
  | 'input'
  | 'scroll'
  | 'resize'
  | 'visibility-change'
  | 'keypress'
  | 'copy'
  | 'paste';

/** Evento de interação registrado */
export interface UIInteractionEvent {
  /** ID único do evento */
  id: string;
  /** Tipo de interação */
  type: InteractionType;
  /** Timestamp */
  timestamp: number;
  /** Elemento alvo (seletor simplificado) */
  target: string;
  /** ID do elemento (se disponível) */
  targetId?: string;
  /** Classes do elemento */
  targetClasses?: string[];
  /** Tipo do elemento (button, input, etc.) */
  targetType?: string;
  /** Posição do cursor */
  position?: { x: number; y: number };
  /** Dados adicionais */
  data?: Record<string, unknown>;
}

/** Configuração do UIWatcher */
export interface UIWatcherConfig {
  /** Se está habilitado */
  enabled: boolean;
  /** Monitorar clicks */
  trackClicks: boolean;
  /** Monitorar hovers */
  trackHovers: boolean;
  /** Monitorar scroll */
  trackScroll: boolean;
  /** Monitorar inputs */
  trackInputs: boolean;
  /** Monitorar teclado */
  trackKeyboard: boolean;
  /** Monitorar visibilidade da página */
  trackVisibility: boolean;
  /** Seletores a ignorar */
  ignoreSelectors: string[];
  /** Seletores de interesse especial */
  interestSelectors: string[];
}

/** Estado interno do engine */
interface WatcherState {
  initialized: boolean;
  config: UIWatcherConfig;
  events: UIInteractionEvent[];
  lastInteractionAt: number;
  idleCheckTimer: ReturnType<typeof setInterval> | null;
  hoverTimers: Map<string, ReturnType<typeof setTimeout>>;
  focusTimers: Map<string, { startTime: number; timer: ReturnType<typeof setTimeout> }>;
  scrollDebounceTimer: ReturnType<typeof setTimeout> | null;
  resizeDebounceTimer: ReturnType<typeof setTimeout> | null;
  activityState: UserActivityState;
  cleanupFunctions: (() => void)[];
}

// ============================================================================
// Default Config
// ============================================================================

const DEFAULT_CONFIG: UIWatcherConfig = {
  enabled: true,
  trackClicks: true,
  trackHovers: true,
  trackScroll: true,
  trackInputs: true,
  trackKeyboard: true,
  trackVisibility: true,
  ignoreSelectors: [
    '.copilot-widget', // Ignorar o próprio Co-Piloto
    '.tooltip',
    '.dropdown-overlay',
    '[data-ignore-tracking]',
  ],
  interestSelectors: [
    'button[type="submit"]',
    '.price-input',
    '.calculator-input',
    '.help-trigger',
    '.info-icon',
    '[data-track-interest]',
  ],
};

// ============================================================================
// Engine State
// ============================================================================

const state: WatcherState = {
  initialized: false,
  config: { ...DEFAULT_CONFIG },
  events: [],
  lastInteractionAt: 0,
  idleCheckTimer: null,
  hoverTimers: new Map(),
  focusTimers: new Map(),
  scrollDebounceTimer: null,
  resizeDebounceTimer: null,
  activityState: 'idle',
  cleanupFunctions: [],
};

// ============================================================================
// Core Functions
// ============================================================================

/**
 * Inicializa o UIWatcher
 */
export function initUIWatcher(config?: Partial<UIWatcherConfig>): void {
  if (state.initialized) {
    return;
  }

  // Check if we're in a browser environment
  if (globalThis.window === undefined || typeof document === 'undefined') {
    // SSR/Node environment - skip initialization
    return;
  }

  // Merge config
  state.config = { ...DEFAULT_CONFIG, ...config };
  state.lastInteractionAt = Date.now();

  // Setup event listeners
  setupEventListeners();

  // Start idle checker
  state.idleCheckTimer = setInterval(checkIdle, IDLE_CHECK_INTERVAL);

  state.initialized = true;

  eventBus.emit('system:init', {
    component: 'ui-watcher',
    status: 'ready',
  }, {
    source: 'ui-watcher',
  });
}

/**
 * Encerra o UIWatcher
 */
export function shutdownUIWatcher(): void {
  if (!state.initialized) {
    return;
  }

  // Clear timers
  if (state.idleCheckTimer) {
    clearInterval(state.idleCheckTimer);
    state.idleCheckTimer = null;
  }

  if (state.scrollDebounceTimer) {
    clearTimeout(state.scrollDebounceTimer);
    state.scrollDebounceTimer = null;
  }

  if (state.resizeDebounceTimer) {
    clearTimeout(state.resizeDebounceTimer);
    state.resizeDebounceTimer = null;
  }

  // Clear hover timers
  for (const timer of state.hoverTimers.values()) {
    clearTimeout(timer);
  }
  state.hoverTimers.clear();

  // Clear focus timers
  for (const { timer } of state.focusTimers.values()) {
    clearTimeout(timer);
  }
  state.focusTimers.clear();

  // Remove event listeners
  for (const cleanup of state.cleanupFunctions) {
    cleanup();
  }
  state.cleanupFunctions = [];

  state.events = [];
  state.initialized = false;
}

/**
 * Atualiza configuração
 */
export function updateUIWatcherConfig(config: Partial<UIWatcherConfig>): void {
  state.config = { ...state.config, ...config };
}

/**
 * Obtém eventos recentes
 */
export function getRecentEvents(limit = 50): UIInteractionEvent[] {
  return state.events.slice(-limit);
}

/**
 * Obtém eventos por tipo
 */
export function getEventsByType(type: InteractionType, limit = 20): UIInteractionEvent[] {
  return state.events.filter((e) => e.type === type).slice(-limit);
}

/**
 * Obtém eventos de um elemento específico
 */
export function getEventsForElement(targetId: string, limit = 20): UIInteractionEvent[] {
  return state.events.filter((e) => e.targetId === targetId).slice(-limit);
}

/**
 * Obtém estado de atividade atual
 */
export function getActivityState(): UserActivityState {
  return state.activityState;
}

/**
 * Limpa histórico de eventos
 */
export function clearEventHistory(): void {
  state.events = [];
}

// ============================================================================
// Event Recording
// ============================================================================

/**
 * Registra um evento de interação
 */
function recordEvent(
  type: InteractionType,
  target: HTMLElement,
  data?: Record<string, unknown>
): void {
  if (!state.config.enabled) {return;}

  // Check ignore selectors
  if (shouldIgnoreElement(target)) {return;}

  const event: UIInteractionEvent = {
    id: generateEventId(),
    type,
    timestamp: Date.now(),
    target: getElementSelector(target),
    targetId: target.id || undefined,
    targetClasses: target.className ? target.className.split(' ').filter(Boolean) : undefined,
    targetType: target.tagName.toLowerCase(),
    data,
  };

  // Add position for mouse events
  if (data?.clientX !== undefined && data?.clientY !== undefined) {
    event.position = {
      x: data.clientX as number,
      y: data.clientY as number,
    };
  }

  // Store event
  state.events.push(event);

  // Trim if too many events
  if (state.events.length > MAX_EVENTS_STORED) {
    state.events = state.events.slice(-MAX_EVENTS_STORED);
  }

  // Update last interaction
  state.lastInteractionAt = event.timestamp;

  // Update activity state
  updateActivityState(type);

  // Check if element is of special interest
  if (isInterestElement(target)) {
    emitInterestEvent(event, target);
  }

  // Emit to event bus
  eventBus.emit('user:input', {
    interactionType: type,
    target: event.target,
    targetId: event.targetId,
    data,
  }, {
    source: 'ui-watcher',
  });
}

// ============================================================================
// Event Handlers
// ============================================================================

function handleClick(e: MouseEvent): void {
  if (!state.config.trackClicks) {return;}
  const target = e.target as HTMLElement;
  if (!target) {return;}

  recordEvent('click', target, {
    clientX: e.clientX,
    clientY: e.clientY,
    button: e.button,
  });
}

function handleDoubleClick(e: MouseEvent): void {
  if (!state.config.trackClicks) {return;}
  const target = e.target as HTMLElement;
  if (!target) {return;}

  recordEvent('double-click', target, {
    clientX: e.clientX,
    clientY: e.clientY,
  });
}

function handleContextMenu(e: MouseEvent): void {
  if (!state.config.trackClicks) {return;}
  const target = e.target as HTMLElement;
  if (!target) {return;}

  recordEvent('right-click', target, {
    clientX: e.clientX,
    clientY: e.clientY,
  });
}

function handleMouseEnter(e: MouseEvent): void {
  if (!state.config.trackHovers) {return;}
  const target = e.target as HTMLElement;
  if (!target || shouldIgnoreElement(target)) {return;}

  const elementKey = getElementKey(target);

  // Clear any existing timer
  const existingTimer = state.hoverTimers.get(elementKey);
  if (existingTimer !== undefined) {
    clearTimeout(existingTimer);
  }

  // Set timer for hover interest detection
  const timer = setTimeout(() => {
    recordEvent('hover-start', target, {
      duration: HOVER_INTEREST_THRESHOLD,
      interested: true,
    });

    // Emit hesitation event if it's an input
    if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
      eventBus.emit('user:input', {
        inputId: target.id || getElementSelector(target),
        event: 'hover-interest',
        duration: HOVER_INTEREST_THRESHOLD,
      }, {
        source: 'ui-watcher',
      });
    }
  }, HOVER_INTEREST_THRESHOLD);

  state.hoverTimers.set(elementKey, timer);
}

function handleMouseLeave(e: MouseEvent): void {
  if (!state.config.trackHovers) {return;}
  const target = e.target as HTMLElement;
  if (!target) {return;}

  const elementKey = getElementKey(target);

  // Clear hover timer
  const existingHoverTimer = state.hoverTimers.get(elementKey);
  if (existingHoverTimer !== undefined) {
    clearTimeout(existingHoverTimer);
    state.hoverTimers.delete(elementKey);
  }
}

function handleFocus(e: FocusEvent): void {
  if (!state.config.trackInputs) {return;}
  const target = e.target as HTMLElement;
  if (!target) {return;}

  const elementKey = getElementKey(target);

  recordEvent('focus', target);

  // Set timer for hesitation detection
  const timer = setTimeout(() => {
    const inputValue = (target as HTMLInputElement).value;
    if (!inputValue || inputValue.trim() === '') {
      eventBus.emit('user:input', {
        inputId: target.id || getElementSelector(target),
        event: 'hesitation',
        duration: HESITATION_THRESHOLD,
      }, {
        source: 'ui-watcher',
      });
    }
  }, HESITATION_THRESHOLD);

  state.focusTimers.set(elementKey, { startTime: Date.now(), timer });
}

function handleBlur(e: FocusEvent): void {
  if (!state.config.trackInputs) {return;}
  const target = e.target as HTMLElement;
  if (!target) {return;}

  const elementKey = getElementKey(target);

  // Calculate focus duration
  const focusData = state.focusTimers.get(elementKey);
  let focusDuration = 0;

  if (focusData) {
    clearTimeout(focusData.timer);
    focusDuration = Date.now() - focusData.startTime;
    state.focusTimers.delete(elementKey);
  }

  recordEvent('blur', target, {
    focusDuration,
    value: (target as HTMLInputElement).value ? '[has value]' : '[empty]',
  });
}

function handleInput(e: Event): void {
  if (!state.config.trackInputs) {return;}
  const target = e.target as HTMLInputElement;
  if (!target) {return;}

  recordEvent('input', target, {
    valueLength: target.value?.length || 0,
    inputType: (e as InputEvent).inputType,
  });
}

function handleScroll(): void {
  if (!state.config.trackScroll) {return;}

  // Debounce scroll events
  if (state.scrollDebounceTimer) {
    clearTimeout(state.scrollDebounceTimer);
  }

  state.scrollDebounceTimer = setTimeout(() => {
    const scrollPosition = {
      x: window.scrollX,
      y: window.scrollY,
      maxY: document.documentElement.scrollHeight - window.innerHeight,
    };

    const scrollPercent = scrollPosition.maxY > 0
      ? Math.round((scrollPosition.y / scrollPosition.maxY) * 100)
      : 0;

    recordEvent('scroll', document.body, {
      ...scrollPosition,
      scrollPercent,
    });
  }, SCROLL_DEBOUNCE);
}

function handleResize(): void {
  if (state.resizeDebounceTimer) {
    clearTimeout(state.resizeDebounceTimer);
  }

  state.resizeDebounceTimer = setTimeout(() => {
    recordEvent('resize', document.body, {
      width: window.innerWidth,
      height: window.innerHeight,
    });
  }, RESIZE_DEBOUNCE);
}

function handleVisibilityChange(): void {
  if (!state.config.trackVisibility) {return;}

  recordEvent('visibility-change', document.body, {
    visible: !document.hidden,
    visibilityState: document.visibilityState,
  });

  // Emit tab change event
  eventBus.emit('user:navigation', {
    event: 'visibility-change',
    visible: !document.hidden,
  }, {
    source: 'ui-watcher',
  });
}

function handleKeyDown(e: KeyboardEvent): void {
  if (!state.config.trackKeyboard) {return;}

  // Only track special keys, not regular typing
  const isSpecialKey = e.ctrlKey || e.metaKey || e.altKey || e.key === 'Escape' || e.key === 'Enter';
  if (!isSpecialKey) {return;}

  const target = e.target as HTMLElement;
  if (!target) {return;}

  recordEvent('keypress', target, {
    key: e.key,
    ctrlKey: e.ctrlKey,
    metaKey: e.metaKey,
    altKey: e.altKey,
    shiftKey: e.shiftKey,
  });
}

function handleCopy(): void {
  recordEvent('copy', document.activeElement as HTMLElement || document.body);
}

function handlePaste(): void {
  recordEvent('paste', document.activeElement as HTMLElement || document.body);
}

// ============================================================================
// Helper Functions
// ============================================================================

function generateEventId(): string {
  return `evt_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
}

function getElementSelector(el: HTMLElement): string {
  if (el.id) {return `#${el.id}`;}

  const tag = el.tagName.toLowerCase();
  const classes = el.className
    ? `.${el.className.split(' ').filter(Boolean).slice(0, 2).join('.')}`
    : '';

  return `${tag}${classes}`;
}

function getElementKey(el: HTMLElement): string {
  return el.id || `${el.tagName}_${el.className}_${getElementSelector(el)}`;
}

function shouldIgnoreElement(el: HTMLElement): boolean {
  return state.config.ignoreSelectors.some((selector) => {
    try {
      return el.matches(selector);
    } catch {
      return false;
    }
  });
}

function isInterestElement(el: HTMLElement): boolean {
  return state.config.interestSelectors.some((selector) => {
    try {
      return el.matches(selector);
    } catch {
      return false;
    }
  });
}

function updateActivityState(interactionType: InteractionType): void {
  let newState: UserActivityState = 'browsing';

  switch (interactionType) {
    case 'input':
    case 'focus':
      newState = 'filling-form';
      break;
    case 'scroll':
    case 'click':
    default:
      // newState already initialized to 'browsing'
      break;
  }

  if (newState !== state.activityState) {
    state.activityState = newState;
  }
}

function checkIdle(): void {
  const now = Date.now();
  const timeSinceLastInteraction = now - state.lastInteractionAt;

  if (timeSinceLastInteraction > IDLE_THRESHOLD && state.activityState !== 'idle') {
    state.activityState = 'idle';

    eventBus.emit('user:input', {
      event: 'idle',
      duration: timeSinceLastInteraction,
    }, {
      source: 'ui-watcher',
    });
  }
}

function emitInterestEvent(event: UIInteractionEvent, target: HTMLElement): void {
  eventBus.emit('user:input', {
    event: 'interest',
    interactionType: event.type,
    target: event.target,
    targetId: event.targetId,
    elementType: target.tagName.toLowerCase(),
    data: event.data,
  }, {
    source: 'ui-watcher',
  });
}

function setupEventListeners(): void {
  // Click events
  document.addEventListener('click', handleClick, { capture: true, passive: true });
  state.cleanupFunctions.push(() =>
    document.removeEventListener('click', handleClick, { capture: true })
  );

  document.addEventListener('dblclick', handleDoubleClick, { capture: true, passive: true });
  state.cleanupFunctions.push(() =>
    document.removeEventListener('dblclick', handleDoubleClick, { capture: true })
  );

  document.addEventListener('contextmenu', handleContextMenu, { capture: true, passive: true });
  state.cleanupFunctions.push(() =>
    document.removeEventListener('contextmenu', handleContextMenu, { capture: true })
  );

  // Hover events (use event delegation)
  document.addEventListener('mouseover', handleMouseEnter, { capture: true, passive: true });
  state.cleanupFunctions.push(() =>
    document.removeEventListener('mouseover', handleMouseEnter, { capture: true })
  );

  document.addEventListener('mouseout', handleMouseLeave, { capture: true, passive: true });
  state.cleanupFunctions.push(() =>
    document.removeEventListener('mouseout', handleMouseLeave, { capture: true })
  );

  // Focus events
  document.addEventListener('focusin', handleFocus, { capture: true, passive: true });
  state.cleanupFunctions.push(() =>
    document.removeEventListener('focusin', handleFocus, { capture: true })
  );

  document.addEventListener('focusout', handleBlur, { capture: true, passive: true });
  state.cleanupFunctions.push(() =>
    document.removeEventListener('focusout', handleBlur, { capture: true })
  );

  // Input events
  document.addEventListener('input', handleInput, { capture: true, passive: true });
  state.cleanupFunctions.push(() =>
    document.removeEventListener('input', handleInput, { capture: true })
  );

  // Scroll and resize
  window.addEventListener('scroll', handleScroll, { passive: true });
  state.cleanupFunctions.push(() => window.removeEventListener('scroll', handleScroll));

  window.addEventListener('resize', handleResize, { passive: true });
  state.cleanupFunctions.push(() => window.removeEventListener('resize', handleResize));

  // Visibility
  document.addEventListener('visibilitychange', handleVisibilityChange);
  state.cleanupFunctions.push(() =>
    document.removeEventListener('visibilitychange', handleVisibilityChange)
  );

  // Keyboard
  document.addEventListener('keydown', handleKeyDown, { capture: true, passive: true });
  state.cleanupFunctions.push(() =>
    document.removeEventListener('keydown', handleKeyDown, { capture: true })
  );

  // Copy/Paste
  document.addEventListener('copy', handleCopy);
  state.cleanupFunctions.push(() => document.removeEventListener('copy', handleCopy));

  document.addEventListener('paste', handlePaste);
  state.cleanupFunctions.push(() => document.removeEventListener('paste', handlePaste));
}

// ============================================================================
// Exports
// ============================================================================

export const uiWatcher = {
  init: initUIWatcher,
  shutdown: shutdownUIWatcher,
  updateConfig: updateUIWatcherConfig,
  getRecentEvents,
  getEventsByType,
  getEventsForElement,
  getActivityState,
  clearHistory: clearEventHistory,
};

export default uiWatcher;
