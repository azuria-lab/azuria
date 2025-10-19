import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuthContext } from "@/domains/auth";
import { logger } from "@/services/logger";

export interface ChartDataPoint {
  date: string;
  calculations: number;
  savings: number;
  products: number;
  time: number;
}

export function useDashboardCharts(days: number = 7) {
  const { user } = useAuthContext();
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user?.id) {
      setIsLoading(false);
      return;
    }

    fetchChartData();
  }, [user?.id, days]);

  const fetchChartData = async () => {
    if (!user?.id) {
      return;
    }

    setIsLoading(true);

    try {
      // Calcular data de início (X dias atrás)
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      // Buscar dados do período
      const { data, error } = await supabase
        .from("user_daily_stats")
        .select("*")
        .eq("user_id", user.id)
        .gte("date", startDate.toISOString().split("T")[0])
        .lte("date", endDate.toISOString().split("T")[0])
        .order("date", { ascending: true });

      if (error) {
        throw error;
      }

      // Criar array com todos os dias (incluindo dias sem dados)
      const chartPoints: ChartDataPoint[] = [];
      const currentDate = new Date(startDate);

      while (currentDate <= endDate) {
        const dateString = currentDate.toISOString().split("T")[0];
        const dayData = data?.find((d) => d.date === dateString);

        chartPoints.push({
          date: formatDateForChart(currentDate),
          calculations: dayData?.calculations_count || 0,
          savings: dayData?.total_savings || 0,
          products: dayData?.products_analyzed || 0,
          time: dayData?.time_saved_minutes || 0,
        });

        currentDate.setDate(currentDate.getDate() + 1);
      }

      setChartData(chartPoints);
      logger.info("📊 Dados do gráfico carregados", { 
        days, 
        points: chartPoints.length 
      });
    } catch (error) {
      logger.error("❌ Erro ao buscar dados do gráfico:", error);
      setChartData([]);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    chartData,
    isLoading,
    refresh: fetchChartData,
  };
}

function formatDateForChart(date: Date): string {
  const day = date.getDate();
  const month = date.getMonth() + 1;
  return `${day}/${month}`;
}
