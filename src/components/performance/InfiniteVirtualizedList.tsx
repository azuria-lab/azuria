import React from 'react';
import { useInfiniteScroll } from './useInfiniteScroll';
import { VirtualizedList } from './VirtualizedList';

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
