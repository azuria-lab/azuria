/**
 * Watchers Registry (bridge)
 *
 * Exports os hooks de watchers a partir de paths esperados no manifesto.
 * Mantém compatibilidade com chamadas que importam de core/watchers.
 */
export * from './useCalcWatcher';
export * from './useAdvancedCalcWatcher';
export * from './useTaxCalcWatcher';
export * from './useBidCalcWatcher';
export * from './screenContextWatcher';

