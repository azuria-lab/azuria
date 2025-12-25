/**
 * Screen Context Watcher
 *
 * Detecta mudanças de rota/tela no app e emite eventos contextuais.
 * Permite que a IA entenda em qual tela o usuário está.
 */

import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { emitEvent } from '../core/eventBus';

export interface ScreenContext {
  screen: string;
  path: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  metadata: Record<string, any>;
  timestamp: number;
}

/**
 * Mapeia URLs para nomes de tela
 */
function mapPathToScreen(path: string): string {
  const pathMap: Record<string, string> = {
    '/': 'home',
    '/dashboard': 'dashboard',
    '/calculadora': 'calculator_basic',
    '/calculadora-avancada': 'calculator_advanced',
    '/regime-tributario': 'calculator_tax',
    '/licitacoes': 'calculator_bidding',
    '/historico': 'history',
    '/lote-inteligente': 'smart_lot',
    '/ia-precificacao': 'pricing_ai',
    '/marketplace': 'marketplace',
    '/analytics': 'analytics',
    '/configuracoes': 'settings',
    '/perfil': 'profile',
  };

  // Busca exata primeiro
  if (pathMap[path]) {
    return pathMap[path];
  }

  // Busca por prefixo
  for (const [key, value] of Object.entries(pathMap)) {
    if (path.startsWith(key) && key !== '/') {
      return value;
    }
  }

  return 'unknown';
}

/**
 * Hook que monitora mudanças de tela
 */
export function useScreenContextWatcher() {
  const location = useLocation();
  const previousPathRef = useRef<string>('');

  useEffect(() => {
    const currentPath = location.pathname;

    // Detectar mudança de tela
    if (currentPath !== previousPathRef.current) {
      const screenName = mapPathToScreen(currentPath);

      const context: ScreenContext = {
        screen: screenName,
        path: currentPath,
        metadata: {
          search: location.search,
          hash: location.hash,
          state: location.state,
        },
        timestamp: Date.now(),
      };

      // Emitir evento de mudança de tela
      emitEvent('screen:changed', context, {
        source: 'screenContextWatcher',
        priority: 3,
        metadata: {
          previousScreen: mapPathToScreen(previousPathRef.current),
        },
      });

      previousPathRef.current = currentPath;
    }
  }, [location]);
}

/**
 * Função para emitir atualização de dados da tela atual
 */
export function emitScreenDataUpdate(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: any,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  metadata?: Record<string, any>
) {
  const context = {
    data,
    metadata: metadata || {},
    timestamp: Date.now(),
  };

  emitEvent('screen:dataUpdated', context, {
    source: 'screenContextWatcher',
    priority: 4,
  });
}

export default useScreenContextWatcher;
