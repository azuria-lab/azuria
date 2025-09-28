import { useCallback, useRef, useState } from 'react';

export interface ResizeObserverEntryInfo {
  width: number;
  height: number;
  target: Element;
}

export interface UseResizeObserverOptions {
  debounceMs?: number;
  disabled?: boolean;
  onError?: (error: Error) => void;
}

export const useResizeObserver = <T extends Element = HTMLDivElement>(
  callback: (entry: ResizeObserverEntryInfo) => void,
  _options: UseResizeObserverOptions = {}
) => {
  const ref = useRef<T>(null);
  const [dimensions] = useState({ width: 0, height: 0 });
  const [isResizing] = useState(false);
  const [error] = useState<Error | null>(null);

  const observe = useCallback(() => {
    // Implementação simplificada temporária
    return undefined;
  }, []);

  const unobserve = useCallback(() => {
    // Implementação simplificada temporária
  }, []);

  return {
    ref,
    dimensions,
    isResizing,
    error,
    observe,
    unobserve,
    start: observe,
    stop: unobserve,
    pause: unobserve,
    resume: observe,
    reconnect: observe,
    isObserving: false,
    cleanup: unobserve
  };
};

export const useElementSize = <T extends Element = HTMLDivElement>() => {
  const { ref, dimensions, isResizing } = useResizeObserver<T>(() => {});
  return { 
    ref, 
    dimensions, 
    isResizing,
    width: dimensions.width,
    height: dimensions.height
  };
};

export default useResizeObserver;
