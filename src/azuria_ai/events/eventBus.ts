/**
 * @fileoverview Re-export do eventBus para compatibilidade
 * 
 * Alguns engines importam de events/eventBus, mas o eventBus
 * está em core/eventBus. Este arquivo serve como alias.
 */

export * from '../core/eventBus';

// Criar objeto eventBus agrupado para export nomeado
import {
  clearEventHistory,
  emitEvent,
  getEventBusStats,
  getEventHistory,
  on,
  once,
  registerEvent,
  removeAllListeners,
  unsubscribeFromEvent,
} from '../core/eventBus';

export const eventBus = {
  emit: emitEvent,
  on,
  once,
  off: unsubscribeFromEvent,
  register: registerEvent,
  getHistory: getEventHistory,
  clearHistory: clearEventHistory,
  getStats: getEventBusStats,
  removeAllListeners,
};

export default eventBus;
