/**
 * Global Keyboard Shortcuts
 * 
 * Registra atalhos de teclado globais da aplicação
 */

import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRegisterShortcut } from '@/components/keyboard';
import { useTheme } from '@/components/ui/theme-provider';
import { useTour } from '@/components/tour';

export function GlobalShortcuts() {
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();
  const { startTour } = useTour();

  // Atalho: Toggle Dark Mode (Ctrl+D)
  useRegisterShortcut({
    id: 'toggle-dark-mode',
    key: 'd',
    ctrl: true,
    description: 'Alternar tema escuro/claro',
    category: 'view',
    action: () => {
      const newTheme = theme === 'dark' ? 'light' : 'dark';
      setTheme(newTheme);
    }
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

      if (e.key.toLowerCase() === 'g' && !e.ctrlKey && !e.metaKey) {
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
          navigate('/calculadora-simples');
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
  useRegisterShortcut({
    id: 'goto-dashboard',
    key: 'G → D',
    description: 'Ir para Dashboard',
    category: 'navigation',
    action: () => navigate('/dashboard')
  });

  useRegisterShortcut({
    id: 'goto-marketplace',
    key: 'G → P',
    description: 'Ir para Marketplaces',
    category: 'navigation',
    action: () => navigate('/marketplace')
  });

  useRegisterShortcut({
    id: 'goto-analytics',
    key: 'G → A',
    description: 'Ir para Analytics',
    category: 'navigation',
    action: () => navigate('/analytics')
  });

  useRegisterShortcut({
    id: 'goto-calculator',
    key: 'G → C',
    description: 'Ir para Calculadora',
    category: 'navigation',
    action: () => navigate('/calculadora-simples')
  });

  // Atalho: Iniciar Tour (Ctrl+Shift+T)
  useRegisterShortcut({
    id: 'start-tour',
    key: 't',
    ctrl: true,
    shift: true,
    description: 'Iniciar tour guiado',
    category: 'general',
    action: () => {
      // Detectar página atual e iniciar tour apropriado
      const path = window.location.pathname;
      if (path.includes('marketplace')) {
        startTour('marketplace-dashboard');
      } else if (path.includes('analytics')) {
        startTour('analytics');
      } else {
        startTour('marketplace-dashboard');
      }
    }
  });

  // Atalho: Busca Global (Ctrl+K)
  useRegisterShortcut({
    id: 'global-search',
    key: 'k',
    ctrl: true,
    description: 'Busca global (em breve)',
    category: 'general',
    action: () => {
      // TODO: Implementar busca global
      // Placeholder - será implementado futuramente
    }
  });

  return null;
}
