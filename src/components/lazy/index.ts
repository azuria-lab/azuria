/**
 * @fileoverview Lazy loading de componentes pesados (modais, dialogs, etc.)
 *
 * Estes componentes são carregados sob demanda para reduzir o bundle inicial
 * Adicione novos componentes conforme eles forem implementados
 */

import { ComponentType, lazy, LazyExoticComponent } from 'react';

/**
 * Cria um componente lazy com fallback null (para modais que não precisam de skeleton)
 */
export function lazyModal<T extends ComponentType<unknown>>(
  importFn: () => Promise<{ default: T }>
): LazyExoticComponent<T> {
  return lazy(importFn);
}

// ============================================================================
// Modais e Dialogs Lazy-loaded
// ============================================================================

/**
 * Modal de upgrade para PRO
 */
export const LazyUpgradeModal = lazy(
  () => import('@/components/subscription/UpgradeModal')
);
