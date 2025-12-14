/**
 * Global Keyboard Shortcuts
 * 
 * Registra atalhos de teclado globais da aplicação
 */

import { useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRegisterShortcut } from '@/components/keyboard';
import { useTheme } from '@/components/ui/theme-provider';
import { useTour } from '@/components/tour';

export function GlobalShortcuts() {
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();
  const { startTour } = useTour();

  // Atalho: Toggle Dark Mode (Ctrl+D)
  const toggleTheme = useCallback(() => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
  }, [theme, setTheme]);

  useRegisterShortcut({
    id: 'toggle-dark-mode',
    key: 'd',
    ctrl: true,
    description: 'Alternar tema escuro/claro',
    category: 'view',
    action: toggleTheme
  });

  // Atalho: Ir para Dashboard (G + D)
  useEffect(() => {
    let gPressed = false;
    let gTimeout: NodeJS.Timeout | null = null;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Reset após 1 segundo
      if (gTimeout) {
        clearTimeout(gTimeout);
      }

      if (e.key && e.key.toLowerCase() === 'g' && !e.ctrlKey && !e.metaKey) {
        gPressed = true;
        gTimeout = setTimeout(() => {
          gPressed = false;
        }, 1000);
      } else if (gPressed) {
        if (e.key.toLowerCase() === 'd') {
          e.preventDefault();
          navigate('/dashboard');
          gPressed = false;
        } else if (e.key.toLowerCase() === 'p') {
          e.preventDefault();
          navigate('/marketplace');
          gPressed = false;
        } else if (e.key.toLowerCase() === 'a') {
          e.preventDefault();
          navigate('/analytics');
          gPressed = false;
        } else if (e.key.toLowerCase() === 'c') {
          e.preventDefault();
          navigate('/calculadora-rapida');
          gPressed = false;
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      if (gTimeout) {
        clearTimeout(gTimeout);
      }
    };
  }, [navigate]);

  // Registrar atalhos de navegação no modal de ajuda
  const navigateToDashboard = useCallback(() => navigate('/dashboard'), [navigate]);
  const navigateToMarketplace = useCallback(() => navigate('/marketplace'), [navigate]);
  const navigateToAnalytics = useCallback(() => navigate('/analytics'), [navigate]);
  const navigateToCalculator = useCallback(() => navigate('/calculadora-rapida'), [navigate]);

  useRegisterShortcut({
    id: 'goto-dashboard',
    key: 'G → D',
    description: 'Ir para Dashboard',
    category: 'navigation',
    action: navigateToDashboard
  });

  useRegisterShortcut({
    id: 'goto-marketplace',
    key: 'G → P',
    description: 'Ir para Marketplaces',
    category: 'navigation',
    action: navigateToMarketplace
  });

  useRegisterShortcut({
    id: 'goto-analytics',
    key: 'G → A',
    description: 'Ir para Analytics',
    category: 'navigation',
    action: navigateToAnalytics
  });

  useRegisterShortcut({
    id: 'goto-calculator',
    key: 'G → C',
    description: 'Ir para Calculadora',
    category: 'navigation',
    action: navigateToCalculator
  });

  // Atalho: Iniciar Tour (Ctrl+Shift+T)
  const handleStartTour = useCallback(() => {
    // Detectar página atual e iniciar tour apropriado
    const path = globalThis.location.pathname;
    if (path.includes('marketplace')) {
      startTour('marketplace-dashboard');
    } else if (path.includes('analytics')) {
      startTour('analytics');
    } else {
      startTour('marketplace-dashboard');
    }
  }, [startTour]);

  useRegisterShortcut({
    id: 'start-tour',
    key: 't',
    ctrl: true,
    shift: true,
    description: 'Iniciar tour guiado',
    category: 'general',
    action: handleStartTour
  });

  // Atalho: Busca Global (Ctrl+K)
  const handleGlobalSearch = useCallback(() => {
    // Busca global será implementada em milestone futuro
    // Aguardando especificação de requisitos de pesquisa
  }, []);

  useRegisterShortcut({
    id: 'global-search',
    key: 'k',
    ctrl: true,
    description: 'Busca global (em breve)',
    category: 'general',
    action: handleGlobalSearch
  });

  return null;
}
