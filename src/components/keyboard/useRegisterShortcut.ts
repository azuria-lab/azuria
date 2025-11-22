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

  const { id, key, ctrl, shift, alt, description, category, action } = shortcut;

  useEffect(() => {
    const s = { id, key, ctrl, shift, alt, description, category, action };
    registerShortcut(s);
    return () => {
      unregisterShortcut(id);
    };
  }, [
    id, 
    key, 
    ctrl, 
    shift, 
    alt, 
    description, 
    category, 
    action, 
    registerShortcut, 
    unregisterShortcut
  ]);
}
