/**
 * useRegisterShortcut Hook
 * 
 * Hook customizado para registrar atalhos de teclado automaticamente
 */

import { useEffect } from 'react';
import { useKeyboardShortcuts } from './KeyboardShortcutsProvider';
import type { KeyboardShortcut } from './types';

export function useRegisterShortcut(shortcut: KeyboardShortcut) {
  const { registerShortcut, unregisterShortcut } = useKeyboardShortcuts();

  useEffect(() => {
    registerShortcut(shortcut);
    return () => {
      unregisterShortcut(shortcut.id);
    };
  }, [shortcut, registerShortcut, unregisterShortcut]);
}
