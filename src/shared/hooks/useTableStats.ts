
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface TableStats {
  table_name: string;
  row_count: number;
  table_size: string;
  index_usage_ratio: number;
}

export function useTableStats() {
  return useQuery({
    queryKey: ['table-stats'],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_table_stats_optimized');
      if (error) {throw error;}
      return data as TableStats[];
    },
    refetchInterval: 300000, // 5 minutes
    staleTime: 240000 // 4 minutes
  });
}

export function useMaintenanceCleanup() {
  return async () => {
    const { error } = await supabase.rpc('maintenance_cleanup_optimized');
    if (error) {throw error;}
  };
}
