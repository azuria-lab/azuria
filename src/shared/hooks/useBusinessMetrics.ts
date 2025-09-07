
import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';

export interface BusinessMetrics {
  mrr: number; // Monthly Recurring Revenue
  cac: number; // Customer Acquisition Cost
  ltv: number; // Customer Lifetime Value
  arpu: number; // Average Revenue Per User
  churnRate: number;
  growthRate: number;
  conversionFunnel: {
    visitors: number;
    signups: number;
    trials: number;
    conversions: number;
  };
}

export interface CohortData {
  month: string;
  newUsers: number;
  retainedUsers: number;
  retentionRate: number;
  revenue: number;
}

export interface TrendItem extends CohortData {
  index: number;
  cumulativeRevenue: number;
}

export const useBusinessMetrics = () => {
  const [trends, setTrends] = useState<TrendItem[]>([]);

  const { data: businessMetrics, isLoading } = useQuery({
    queryKey: ['business-metrics'],
    queryFn: async (): Promise<BusinessMetrics> => {
      // Simulate business metrics calculation
      return {
        mrr: Math.floor(Math.random() * 50000) + 25000,
        cac: Math.floor(Math.random() * 200) + 50,
        ltv: Math.floor(Math.random() * 2000) + 500,
        arpu: Math.floor(Math.random() * 100) + 30,
        churnRate: (Math.random() * 5) + 2,
        growthRate: (Math.random() * 20) + 5,
        conversionFunnel: {
          visitors: Math.floor(Math.random() * 10000) + 5000,
          signups: Math.floor(Math.random() * 1000) + 500,
          trials: Math.floor(Math.random() * 200) + 100,
          conversions: Math.floor(Math.random() * 50) + 25
        }
      };
    },
    refetchInterval: 60000 // Refresh every minute
  });

  const { data: cohortData } = useQuery({
    queryKey: ['cohort-analysis'],
    queryFn: async (): Promise<CohortData[]> => {
      // Generate mock cohort data for last 6 months
      return Array.from({ length: 6 }, (_, i) => {
        const date = new Date();
        date.setMonth(date.getMonth() - i);
        return {
          month: date.toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' }),
          newUsers: Math.floor(Math.random() * 200) + 50,
          retainedUsers: Math.floor(Math.random() * 150) + 30,
          retentionRate: (Math.random() * 40) + 40,
          revenue: Math.floor(Math.random() * 10000) + 5000
        };
      }).reverse();
    }
  });

  // Calculate trends
  useEffect(() => {
    if (businessMetrics && cohortData) {
  const trendData: TrendItem[] = cohortData.map((item, index) => ({
        ...item,
        index,
        cumulativeRevenue: cohortData.slice(0, index + 1).reduce((sum, curr) => sum + curr.revenue, 0)
      }));
      setTrends(trendData);
    }
  }, [businessMetrics, cohortData]);

  return {
    businessMetrics,
    cohortData: cohortData || [],
    trends,
    isLoading
  };
};
