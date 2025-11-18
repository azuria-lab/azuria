import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { endOfMonth, format, startOfMonth, subDays } from 'date-fns';

interface AnalyticsData {
  totalCalculations: number;
  totalUsers: number;
  proUsers: number;
  conversionRate: number;
  avgCalculationsPerUser: number;
  dailyStats: Array<{
    date: string;
    calculations: number;
    users: number;
    proUpgrades: number;
  }>;
  topTemplates: Array<{
    name: string;
    downloads: number;
    category: string;
  }>;
  userEngagement: {
    avgSessionTime: number;
    bounceRate: number;
    returnUserRate: number;
    calculationsPerSession: number;
  };
}

export function useAnalytics() {
  return useQuery<AnalyticsData>({
    queryKey: ['analytics'],
    queryFn: async () => {
      const currentDate = new Date();
      const startDate = startOfMonth(currentDate);
      const endDate = endOfMonth(currentDate);
      
      // Buscar dados de cálculos
      const { data: calculations } = await supabase
        .from('calculation_history')
        .select('*')
        .gte('date', startDate.toISOString())
        .lte('date', endDate.toISOString());

      // Buscar dados de usuários
      const { data: users } = await supabase
        .from('user_profiles')
        .select('*');

      // Buscar templates mais baixados
      const { data: templates } = await supabase
        .from('calculation_templates')
        .select('name, downloads_count, category')
        .order('downloads_count', { ascending: false })
        .limit(5);

      const totalCalculations = calculations?.length || 0;
      const totalUsers = users?.length || 0;
      const proUsers = users?.filter((user: any) => user?.is_pro)?.length || 0;
      const conversionRate = totalUsers > 0 ? (proUsers / totalUsers) * 100 : 0;

      // Gerar dados diários dos últimos 7 dias
      const dailyStats = [];
      for (let i = 6; i >= 0; i--) {
        const date = subDays(currentDate, i);
        const dateStr = format(date, 'dd/MM');
        
        const dayCalculations = calculations?.filter((calc: any) => 
          calc?.date && format(new Date(calc.date), 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd')
        )?.length || 0;

        dailyStats.push({
          date: dateStr,
          calculations: dayCalculations,
          users: Math.floor(dayCalculations * 0.7), // Estimativa
          proUpgrades: Math.floor(dayCalculations * 0.05) // Estimativa
        });
      }

      return {
        totalCalculations,
        totalUsers,
        proUsers,
        conversionRate,
        avgCalculationsPerUser: totalUsers > 0 ? totalCalculations / totalUsers : 0,
        dailyStats,
        topTemplates: templates?.map((t: any) => ({
          name: t?.name || '',
          downloads: t?.downloads_count || 0,
          category: t?.category || ''
        })) || [],
        userEngagement: {
          avgSessionTime: 11.4, // Dados mockados - necessário integração com analytics
          bounceRate: 24.5,
          returnUserRate: 67.8,
          calculationsPerSession: 2.3
        }
      };
    },
    staleTime: 5 * 60 * 1000, // 5 minutos
  });
}

export function useRevenueAnalytics() {
  return useQuery({
    queryKey: ['revenue-analytics'],
    queryFn: async () => {
      // Buscar dados de usuários PRO para calcular receita
      const { data: proUsers } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('is_pro', true);

      const monthlyRevenue = (proUsers?.length || 0) * 29.90; // Preço mensal PRO
      const annualRevenue = monthlyRevenue * 12;

      return {
        monthlyRevenue,
        annualRevenue,
        proSubscribers: proUsers?.length || 0,
        churnRate: 3.8, // Dados mockados
        ltv: 287 // Dados mockados
      };
    },
    staleTime: 10 * 60 * 1000, // 10 minutos
  });
}