/**
 * Keyboard Shortcuts Modal
 * 
 * Exibe todos os atalhos de teclado disponíveis organizados por categoria
 */

import { Keyboard } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useKeyboardShortcuts } from './KeyboardShortcutsProvider';

const categoryNames: Record<string, string> = {
  navigation: 'Navegação',
  actions: 'Ações',
  view: 'Visualização',
  general: 'Geral'
};

export function KeyboardShortcutsModal() {
  const { shortcuts, isShortcutsModalOpen, closeShortcutsModal } = useKeyboardShortcuts();

  // Agrupa shortcuts por categoria
  const groupedShortcuts = shortcuts.reduce((acc, shortcut) => {
    const category = shortcut.category;
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(shortcut);
    return acc;
  }, {} as Record<string, typeof shortcuts>);

  const formatShortcut = (shortcut: typeof shortcuts[0]) => {
    const keys: string[] = [];
    
    if (shortcut.ctrl) {
      keys.push(navigator.platform.includes('Mac') ? '⌘' : 'Ctrl');
    }
    if (shortcut.shift) {
      keys.push('Shift');
    }
    if (shortcut.alt) {
      keys.push('Alt');
    }
    keys.push(shortcut.key.toUpperCase());
    
    return keys.join(' + ');
  };

  return (
    <Dialog open={isShortcutsModalOpen} onOpenChange={closeShortcutsModal}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <Keyboard className="h-5 w-5 text-blue-600 dark:text-blue-500" />
            <DialogTitle>Atalhos de Teclado</DialogTitle>
          </div>
          <DialogDescription>
            Use estes atalhos para navegar rapidamente pela aplicação
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {Object.entries(groupedShortcuts).map(([category, categoryShortcuts]) => (
            <div key={category}>
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
                {categoryNames[category] || category}
              </h3>
              <div className="space-y-2">
                {categoryShortcuts.map((shortcut) => (
                  <div
                    key={shortcut.id}
                    className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  >
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      {shortcut.description}
                    </span>
                    <kbd className="px-3 py-1 text-xs font-mono bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded border border-gray-300 dark:border-gray-600 shadow-sm">
                      {formatShortcut(shortcut)}
                    </kbd>
                  </div>
                ))}
              </div>
            </div>
          ))}

          {shortcuts.length === 0 && (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <Keyboard className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>Nenhum atalho registrado</p>
            </div>
          )}
        </div>

        <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
          <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
            Pressione <kbd className="px-2 py-0.5 text-xs font-mono bg-gray-100 dark:bg-gray-700 rounded">
              {navigator.platform.includes('Mac') ? '⌘' : 'Ctrl'} + /
            </kbd> para abrir esta janela novamente
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
