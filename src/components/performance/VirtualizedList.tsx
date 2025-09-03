import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { throttle1 } from '@/utils/performance';

interface VirtualizedListProps<T> {
  items: T[];
  itemHeight: number;
  containerHeight: number;
  renderItem: (item: T, index: number) => React.ReactNode;
  overscan?: number;
  className?: string;
  onEndReached?: () => void;
  endReachedThreshold?: number;
}

export function VirtualizedList<T>({
  items,
  itemHeight,
  containerHeight,
  renderItem,
  overscan = 5,
  className = '',
  onEndReached,
  endReachedThreshold = 0.8
}: VirtualizedListProps<T>) {
  const [scrollTop, setScrollTop] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  // Calcular índices visíveis
  const visibleRange = useMemo(() => {
    const visibleCount = Math.ceil(containerHeight / itemHeight);
    const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
    const endIndex = Math.min(
      items.length - 1,
      startIndex + visibleCount + overscan * 2
    );

    return { startIndex, endIndex, visibleCount };
  }, [scrollTop, itemHeight, containerHeight, items.length, overscan]);

  // Throttled scroll handler
  const handleScroll = useCallback(
    throttle1<React.UIEvent<HTMLDivElement>>((e) => {
      const newScrollTop = e.currentTarget.scrollTop;
      setScrollTop(newScrollTop);

      // Verificar se chegou próximo ao fim
      if (onEndReached) {
        const scrollHeight = e.currentTarget.scrollHeight;
        const clientHeight = e.currentTarget.clientHeight;
        const scrollPercent = (newScrollTop + clientHeight) / scrollHeight;

        if (scrollPercent >= endReachedThreshold) {
          onEndReached();
        }
      }
  }, 16), // ~60fps
    [onEndReached, endReachedThreshold]
  );

  // Itens visíveis
  const visibleItems = useMemo(() => {
    const items_slice = items.slice(visibleRange.startIndex, visibleRange.endIndex + 1);
    return items_slice.map((item, index) => ({
      item,
      index: visibleRange.startIndex + index
    }));
  }, [items, visibleRange]);

  // Altura total da lista
  const totalHeight = items.length * itemHeight;

  // Offset do primeiro item visível
  const offsetY = visibleRange.startIndex * itemHeight;

  return (
    <div
      ref={containerRef}
      className={`relative overflow-auto ${className}`}
      style={{ height: containerHeight }}
      onScroll={handleScroll}
    >
      {/* Container phantom para manter altura total */}
      <div style={{ height: totalHeight, position: 'relative' }}>
        {/* Container dos itens visíveis */}
        <div
          style={{
            transform: `translateY(${offsetY}px)`,
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0
          }}
        >
          {visibleItems.map(({ item, index }) => (
            <div
              key={index}
              style={{
                height: itemHeight,
                overflow: 'hidden'
              }}
            >
              {renderItem(item, index)}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Hook para usar com infinite scroll
export const useInfiniteScroll = <T,>(
  initialItems: T[],
  loadMore: () => Promise<T[]>,
  hasMore: boolean = true
) => {
  const [items, setItems] = useState<T[]>(initialItems);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const handleEndReached = useCallback(async () => {
    if (loading || !hasMore) {return;}

    try {
      setLoading(true);
      setError(null);
      const newItems = await loadMore();
      setItems(prev => [...prev, ...newItems]);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to load more'));
    } finally {
      setLoading(false);
    }
  }, [loading, hasMore, loadMore]);

  return {
    items,
    loading,
    error,
    handleEndReached,
    setItems
  };
};

// Lista virtualizada com infinite scroll
export const InfiniteVirtualizedList = <T,>({
  initialItems,
  loadMore,
  hasMore = true,
  itemHeight,
  containerHeight,
  renderItem,
  loadingComponent,
  errorComponent,
  ...props
}: {
  initialItems: T[];
  loadMore: () => Promise<T[]>;
  hasMore?: boolean;
  loadingComponent?: React.ReactNode;
  errorComponent?: (error: Error, retry: () => void) => React.ReactNode;
} & Omit<VirtualizedListProps<T>, 'items' | 'onEndReached'>) => {
  
  const { items, loading, error, handleEndReached } = useInfiniteScroll(
    initialItems,
    loadMore,
    hasMore
  );

  if (error && errorComponent) {
    return <>{errorComponent(error, handleEndReached)}</>;
  }

  return (
    <div>
      <VirtualizedList
        items={items}
        itemHeight={itemHeight}
        containerHeight={containerHeight}
        renderItem={renderItem}
        onEndReached={handleEndReached}
        {...props}
      />
      {loading && (
        <div className="p-4 text-center">
          {loadingComponent || <div>Carregando mais itens...</div>}
        </div>
      )}
    </div>
  );
};

// Lista virtualizada simples para pequenas listas
export const SimpleVirtualizedList = <T,>({
  items,
  renderItem,
  itemHeight = 60,
  maxHeight = 400,
  className = ''
}: {
  items: T[];
  renderItem: (item: T, index: number) => React.ReactNode;
  itemHeight?: number;
  maxHeight?: number;
  className?: string;
}) => {
  const containerHeight = Math.min(items.length * itemHeight, maxHeight);

  return (
    <VirtualizedList
      items={items}
      itemHeight={itemHeight}
      containerHeight={containerHeight}
      renderItem={renderItem}
      className={className}
    />
  );
};