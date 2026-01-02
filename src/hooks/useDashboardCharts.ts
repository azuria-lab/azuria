import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuthContext } from "@/domains/auth";
import { logger } from "@/services/logger";
import { endOfDay, format, startOfDay, subDays } from "date-fns";

export interface ChartDataPoint {
  date: string;
  value: number;
}

export interface DashboardChartsData {
  ticketMedio: ChartDataPoint[];
  valorFaturado: ChartDataPoint[];
  quantidadeCalculos: ChartDataPoint[];
  isLoading: boolean;
  error: string | null;
}

/**
 * Hook para buscar dados reais dos gráficos do dashboard
 * 
 * Busca dados de cálculo_history e advanced_calculation_history para gerar:
 * - Ticket médio (média dos preços de venda)
 * - Valor faturado (soma dos preços de venda)
 * - Quantidade de cálculos (contagem por data)
 */
export function useDashboardCharts(period: '7D' | '30D' | '90D' = '30D') {
  const { user } = useAuthContext();
  const [data, setData] = useState<DashboardChartsData>({
    ticketMedio: [],
    valorFaturado: [],
    quantidadeCalculos: [],
    isLoading: true,
    error: null,
  });

  const fetchChartData = useCallback(async () => {
    if (!user?.id) {
      setData(prev => ({ ...prev, isLoading: false }));
      return;
    }

    try {
      setData(prev => ({ ...prev, isLoading: true, error: null }));

      const days = period === '7D' ? 7 : period === '30D' ? 30 : 90;
      const startDate = startOfDay(subDays(new Date(), days));
      const endDate = endOfDay(new Date());

      // Buscar cálculos simples
      const { data: simpleCalculations, error: simpleError } = await supabase
        .from("calculation_history")
        .select("date, result")
        .eq("user_id", user.id)
        .gte("date", startDate.toISOString())
        .lte("date", endDate.toISOString())
        .order("date", { ascending: true });

      if (simpleError) {
        logger.error("❌ Erro ao buscar cálculos simples:", simpleError);
      } else {
        logger.info("✅ Cálculos simples encontrados:", simpleCalculations?.length || 0);
      }

      // Buscar cálculos avançados
      const { data: advancedCalculations, error: advancedError } = await supabase
        .from("advanced_calculation_history")
        .select("date, suggested_price")
        .eq("user_id", user.id)
        .gte("date", startDate.toISOString())
        .lte("date", endDate.toISOString())
        .order("date", { ascending: true });

      if (advancedError) {
        logger.error("❌ Erro ao buscar cálculos avançados:", advancedError);
      } else {
        logger.info("✅ Cálculos avançados encontrados:", advancedCalculations?.length || 0);
      }

      // Processar dados
      const allCalculations: Array<{
        date: string;
        price: number;
      }> = [];

      // Processar cálculos simples
      (simpleCalculations || []).forEach(calc => {
        try {
          const result = calc.result as any;
          // Verificar diferentes possíveis estruturas do result
          const price = result?.sellingPrice || result?.finalPrice || result?.price;
          if (price && typeof price === 'number' && price > 0) {
            allCalculations.push({
              date: calc.date,
              price: price,
            });
          }
        } catch (e) {
          logger.warn("⚠️ Erro ao processar cálculo simples:", e, calc);
        }
      });

      // Processar cálculos avançados
      (advancedCalculations || []).forEach(calc => {
        if (calc.suggested_price && typeof calc.suggested_price === 'number') {
          allCalculations.push({
            date: calc.date,
            price: calc.suggested_price,
          });
        }
      });

      // Agrupar por data (usar apenas a data, ignorando hora)
      const groupedByDate = new Map<string, number[]>();
      allCalculations.forEach(calc => {
        try {
          // Garantir que a data está no formato correto
          const calcDate = new Date(calc.date);
          const dateKey = format(calcDate, 'yyyy-MM-dd');
          if (!groupedByDate.has(dateKey)) {
            groupedByDate.set(dateKey, []);
          }
          groupedByDate.get(dateKey)!.push(calc.price);
        } catch (e) {
          logger.warn("⚠️ Erro ao processar data do cálculo:", e, calc);
        }
      });

      // Gerar dados para os gráficos
      const ticketMedioData: ChartDataPoint[] = [];
      const valorFaturadoData: ChartDataPoint[] = [];
      const quantidadeData: ChartDataPoint[] = [];

      // Criar array de todas as datas no período
      const dateArray: Date[] = [];
      for (let i = 0; i < days; i++) {
        dateArray.push(subDays(new Date(), days - 1 - i));
      }

      dateArray.forEach(date => {
        const dateKey = format(date, 'yyyy-MM-dd');
        const dateFormatted = format(date, 'dd/MM');
        const prices = groupedByDate.get(dateKey) || [];

        if (prices.length > 0) {
          const avgPrice = prices.reduce((sum, p) => sum + p, 0) / prices.length;
          const totalValue = prices.reduce((sum, p) => sum + p, 0);

          ticketMedioData.push({
            date: dateFormatted,
            value: Math.round(avgPrice * 100) / 100, // Arredondar para 2 casas decimais
          });

          valorFaturadoData.push({
            date: dateFormatted,
            value: Math.round(totalValue * 100) / 100,
          });

          quantidadeData.push({
            date: dateFormatted,
            value: prices.length,
          });
        }
        // Não adicionar zeros - apenas mostrar datas com dados reais
      });

      setData({
        ticketMedio: ticketMedioData,
        valorFaturado: valorFaturadoData,
        quantidadeCalculos: quantidadeData,
        isLoading: false,
        error: null,
      });

      // Log detalhado para debug
      logger.info("📊 Dados dos gráficos carregados", {
        period,
        totalCalculations: allCalculations.length,
        simpleCalculations: simpleCalculations?.length || 0,
        advancedCalculations: advancedCalculations?.length || 0,
        datesWithData: groupedByDate.size,
        ticketMedioPoints: ticketMedioData.length,
        valorFaturadoPoints: valorFaturadoData.length,
        quantidadePoints: quantidadeData.length,
        sampleCalculations: allCalculations.slice(0, 3),
        sampleGrouped: Array.from(groupedByDate.entries()).slice(0, 3),
        sampleData: {
          ticketMedio: ticketMedioData.slice(0, 5),
          valorFaturado: valorFaturadoData.slice(0, 5),
          quantidade: quantidadeData.slice(0, 5),
        }
      });
    } catch (error) {
      logger.error("❌ Erro ao buscar dados dos gráficos:", error);
      setData(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : "Erro desconhecido",
      }));
    }
  }, [user?.id, period]);

  useEffect(() => {
    fetchChartData();
  }, [fetchChartData]);

  return {
    ...data,
    refetch: fetchChartData,
  };
}

