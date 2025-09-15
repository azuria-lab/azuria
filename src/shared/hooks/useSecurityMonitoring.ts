
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Json } from '@/types/supabase';
import { useAuthContext } from '@/domains/auth';

interface SecurityMetric {
  id: string;
  metric_type: 'rls_performance' | 'query_time' | 'failed_auth' | 'suspicious_activity';
  metric_value: number;
  metadata: Json;
  date: string;
  hour: number;
  created_at: string;
}

interface PerformanceAlert {
  id: string;
  alert_type: 'slow_query' | 'rls_warning' | 'high_load' | 'security_breach';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  message: string;
  data?: Json;
  is_resolved: boolean;
  created_at: string;
  resolved_at?: string;
}

export function useSecurityMetrics(timeRange: 'hour' | 'day' | 'week' = 'day') {
  const { user } = useAuthContext();

  return useQuery({
    queryKey: ['security-metrics', timeRange],
    queryFn: async () => {
      const startDate = new Date();
      
      switch (timeRange) {
        case 'hour':
          startDate.setHours(startDate.getHours() - 1);
          break;
        case 'day': 
          startDate.setDate(startDate.getDate() - 1);
          break;
        case 'week':
          startDate.setDate(startDate.getDate() - 7);
          break;
      }

      const { data, error } = await supabase
        .from('analytics_metrics')
        .select('*')
        .gte('created_at', startDate.toISOString())
        .in('metric_type', ['rls_performance', 'query_time', 'failed_auth', 'suspicious_activity'])
        .order('created_at', { ascending: false });

      if (error) {throw error;}
      return data as SecurityMetric[];
    },
    enabled: !!user,
    refetchInterval: 30000
  });
}

export function usePerformanceAlerts() {
  const { user } = useAuthContext();

  return useQuery({
    queryKey: ['performance-alerts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('automation_alerts')
        .select('*')
        .in('alert_type', ['slow_query', 'rls_warning', 'high_load', 'security_breach'])
        .eq('is_resolved', false)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) {throw error;}
      return data as PerformanceAlert[];
    },
    enabled: !!user,
    refetchInterval: 10000
  });
}

export function useLogSecurityMetric() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      metricType,
      value,
      metadata
    }: {
      metricType: 'rls_performance' | 'query_time' | 'failed_auth' | 'suspicious_activity';
      value: number;
  metadata?: Json;
    }) => {
      const { data, error } = await supabase
        .from('analytics_metrics')
        .insert({
          metric_type: metricType,
          metric_value: value,
          metadata: metadata || {}
        })
        .select()
        .single();

      if (error) {throw error;}
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['security-metrics'] });
    }
  });
}

export function useResolveAlert() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (alertId: string) => {
      const { error } = await supabase
        .from('automation_alerts')
        .update({ 
          is_resolved: true, 
          resolved_at: new Date().toISOString() 
        })
        .eq('id', alertId);

      if (error) {throw error;}
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['performance-alerts'] });
    }
  });
}

export function useCleanupExpiredRoles() {
  return useMutation({
    mutationFn: async () => {
      const { error } = await supabase.rpc('cleanup_expired_roles');
      if (error) {throw error;}
    }
  });
}

export function useOptimizeTables() {
  return useMutation({
    mutationFn: async () => {
      const { error } = await supabase.rpc('optimize_tables');
      if (error) {throw error;}
    }
  });
}

export function useCleanupOldAnalytics() {
  return useMutation({
    mutationFn: async () => {
      const { error } = await supabase.rpc('cleanup_old_analytics');
      if (error) {throw error;}
    }
  });
}

export function useMaintenanceCleanupMutation() {
  return useMutation({
    mutationFn: async () => {
      const { error } = await supabase.rpc('maintenance_cleanup_optimized');
      if (error) {throw error;}
    }
  });
}

export function useRLSPerformanceMetrics() {
  return useQuery({
    queryKey: ['rls-performance-metrics'],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_rls_performance_summary');
      if (error) {throw error;}
      return data;
    },
    refetchInterval: 60000 // Refetch every minute
  });
}
