import { useCallback, useState } from 'react';

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
      setItems((prev) => [...prev, ...newItems]);
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
    setItems,
  };
};
