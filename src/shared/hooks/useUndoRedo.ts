import { useCallback, useState } from 'react';
import { toast } from '@/hooks/use-toast';

interface UndoRedoState<T> {
  history: T[];
  currentIndex: number;
}

export const useUndoRedo = <T>(initialState: T, maxHistorySize = 50) => {
  const [state, setState] = useState<UndoRedoState<T>>({
    history: [initialState],
    currentIndex: 0
  });

  const current = state.history[state.currentIndex];

  const pushState = useCallback((newState: T) => {
    setState(prev => {
      const newHistory = [
        ...prev.history.slice(0, prev.currentIndex + 1),
        newState
      ].slice(-maxHistorySize);
      
      return {
        history: newHistory,
        currentIndex: newHistory.length - 1
      };
    });
  }, [maxHistorySize]);

  const undo = useCallback(() => {
    setState(prev => {
      if (prev.currentIndex > 0) {
        const newIndex = prev.currentIndex - 1;
        toast({
          title: "Ação desfeita",
          description: "Use Ctrl+Y para refazer",
        });
        return {
          ...prev,
          currentIndex: newIndex
        };
      }
      return prev;
    });
  }, []);

  const redo = useCallback(() => {
    setState(prev => {
      if (prev.currentIndex < prev.history.length - 1) {
        const newIndex = prev.currentIndex + 1;
        toast({
          title: "Ação refeita",
          description: "Use Ctrl+Z para desfazer novamente",
        });
        return {
          ...prev,
          currentIndex: newIndex
        };
      }
      return prev;
    });
  }, []);

  const canUndo = state.currentIndex > 0;
  const canRedo = state.currentIndex < state.history.length - 1;

  // Atalhos de teclado para undo/redo
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (event.ctrlKey && event.key === 'z' && !event.shiftKey) {
      event.preventDefault();
      undo();
    } else if (event.ctrlKey && (event.key === 'y' || (event.key === 'z' && event.shiftKey))) {
      event.preventDefault();
      redo();
    }
  }, [undo, redo]);

  return {
    current,
    pushState,
    undo,
    redo,
    canUndo,
    canRedo,
    handleKeyDown
  };
};