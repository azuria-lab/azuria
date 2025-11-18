/**
 * useRegisterShortcut Hook
 * 
 * Hook customizado para registrar atalhos de teclado automaticamente
 */

import { useEffect, useRef } from 'react';
import { useKeyboardShortcuts } from './KeyboardShortcutsProvider';
import type { KeyboardShortcut } from './types';

export function useRegisterShortcut(shortcut: KeyboardShortcut) {
  const { registerShortcut, unregisterShortcut } = useKeyboardShortcuts();
  const shortcutIdRef = useRef(shortcut.id);

  useEffect(() => {
    // Atualizar ID se mudou
    if (shortcutIdRef.current !== shortcut.id) {
      unregisterShortcut(shortcutIdRef.current);
      shortcutIdRef.current = shortcut.id;
    }
    
    registerShortcut(shortcut);
    return () => {
      unregisterShortcut(shortcut.id);
    };
  }, [shortcut, registerShortcut, unregisterShortcut]);
}
