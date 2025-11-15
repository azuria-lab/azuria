/**
 * Keyboard Shortcuts Provider
 * 
 * Gerencia atalhos de teclado globais da aplicação
 */

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { KeyboardShortcut, KeyboardShortcutsContextType } from './types';

const KeyboardShortcutsContext = createContext<KeyboardShortcutsContextType | undefined>(undefined);

interface KeyboardShortcutsProviderProps {
  children: React.ReactNode;
}

export function KeyboardShortcutsProvider({ children }: Readonly<KeyboardShortcutsProviderProps>) {
  const [shortcuts, setShortcuts] = useState<KeyboardShortcut[]>([]);
  const [isShortcutsModalOpen, setIsShortcutsModalOpen] = useState(false);

  const registerShortcut = useCallback((shortcut: KeyboardShortcut) => {
    setShortcuts(prev => {
      // Remove se já existir
      const filtered = prev.filter(s => s.id !== shortcut.id);
      return [...filtered, shortcut];
    });
  }, []);

  const unregisterShortcut = useCallback((id: string) => {
    setShortcuts(prev => prev.filter(s => s.id !== id));
  }, []);

  const openShortcutsModal = useCallback(() => {
    setIsShortcutsModalOpen(true);
  }, []);

  const closeShortcutsModal = useCallback(() => {
    setIsShortcutsModalOpen(false);
  }, []);

  // Handler global de teclado
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent): void => {
      // Abre modal de ajuda com Ctrl/Cmd + /
      if ((e.ctrlKey || e.metaKey) && e.key === '/') {
        e.preventDefault();
        openShortcutsModal();
        return;
      }

      // Verifica shortcuts registrados
      for (const shortcut of shortcuts) {
        const ctrlMatch = shortcut.ctrl ? (e.ctrlKey || e.metaKey) : !e.ctrlKey && !e.metaKey;
        const shiftMatch = shortcut.shift ? e.shiftKey : !e.shiftKey;
        const altMatch = shortcut.alt ? e.altKey : !e.altKey;
        const keyMatch = e.key.toLowerCase() === shortcut.key.toLowerCase();

        if (ctrlMatch && shiftMatch && altMatch && keyMatch) {
          e.preventDefault();
          shortcut.action();
          break;
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [shortcuts, openShortcutsModal]);

  const contextValue = useMemo(() => ({
    shortcuts,
    registerShortcut,
    unregisterShortcut,
    isShortcutsModalOpen,
    openShortcutsModal,
    closeShortcutsModal
  }), [shortcuts, registerShortcut, unregisterShortcut, isShortcutsModalOpen, openShortcutsModal, closeShortcutsModal]);

  return (
    <KeyboardShortcutsContext.Provider value={contextValue}>
      {children}
    </KeyboardShortcutsContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useKeyboardShortcuts(): KeyboardShortcutsContextType {
  const context = useContext(KeyboardShortcutsContext);
  if (!context) {
    throw new Error('useKeyboardShortcuts must be used within KeyboardShortcutsProvider');
  }
  return context;
}
