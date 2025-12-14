import { useCallback, useEffect, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/hooks/use-toast';

interface KeyboardShortcut {
  key: string;
  ctrl?: boolean;
  alt?: boolean;
  shift?: boolean;
  action: () => void;
  description: string;
}

export const useKeyboardShortcuts = () => {
  const navigate = useNavigate();

  const openCommandPalette = useCallback(() => {
    toast({
      title: "Paleta de Comandos",
      description: "Em breve disponível!",
    });
  }, []);

  const helpRef = useRef<() => void>(() => {});

  const shortcuts: KeyboardShortcut[] = useMemo(() => ([
    {
      key: 'h',
      ctrl: true,
      action: () => navigate('/'),
      description: 'Ir para Home'
    },
    {
      key: 'd',
      ctrl: true,
      action: () => navigate('/dashboard'),
      description: 'Ir para Dashboard'
    },
    {
      key: 'c',
      ctrl: true,
      action: () => navigate('/calculadora-rapida'),
      description: 'Calculadora Rápida'
    },
    {
      key: 'v',
      ctrl: true,
      action: () => navigate('/calculadora-avancada'),
      description: 'Calculadora Avançada'
    },
    {
      key: 't',
      ctrl: true,
      action: () => navigate('/calculadora-tributaria'),
      description: 'Calculadora Tributária'
    },
    {
      key: 'a',
      ctrl: true,
      action: () => navigate('/analytics'),
      description: 'Analytics'
    },
    {
      key: 's',
      ctrl: true,
      action: () => navigate('/configuracoes'),
      description: 'Configurações'
    },
    {
      key: '?',
      ctrl: true,
      action: () => helpRef.current(),
      description: 'Mostrar atalhos'
    },
    {
      key: 'k',
      ctrl: true,
      action: () => openCommandPalette(),
      description: 'Paleta de comandos'
    }
  ]), [navigate, openCommandPalette]);

  const showShortcutsHelp = useCallback(() => {
    const list = shortcuts
      .map(s => `${s.ctrl ? 'Ctrl+' : ''}${s.key.toUpperCase()}: ${s.description}`)
      .join('\n');
    toast({ title: "Atalhos de Teclado", description: list });
  }, [shortcuts]);

  useEffect(() => {
    helpRef.current = showShortcutsHelp;
  }, [showShortcutsHelp]);

  // callbacks defined above for stable references

  useEffect(() => {
    const handleKeydown = (event: KeyboardEvent) => {
      if (event.target instanceof HTMLInputElement || 
          event.target instanceof HTMLTextAreaElement) {
        return;
      }

      const shortcut = shortcuts.find(s => 
        event.key.toLowerCase() === s.key.toLowerCase() &&
        !!event.ctrlKey === !!s.ctrl &&
        !!event.altKey === !!s.alt &&
        !!event.shiftKey === !!s.shift
      );

      if (shortcut) {
        event.preventDefault();
        shortcut.action();
      }
    };

    document.addEventListener('keydown', handleKeydown);
    return () => document.removeEventListener('keydown', handleKeydown);
  }, [shortcuts]);

  return { shortcuts, showShortcutsHelp };
};