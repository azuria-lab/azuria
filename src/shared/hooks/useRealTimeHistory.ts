
import { useCallback, useEffect, useState } from "react";
import type { CalculationHistory, CalculationResult } from "@/types/simpleCalculator";
import { supabase } from "@/integrations/supabase/client";
import { useAuthContext } from "@/domains/auth";

export const useRealTimeHistory = () => {
  const { user } = useAuthContext();
  const [history, setHistory] = useState<CalculationHistory[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Carregar histórico inicial
  const loadHistory = useCallback(async () => {
    if (!user?.id) {return;}

    try {
      setIsLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from("calculation_history")
        .select("*")
        .eq("user_id", user.id)
        .order("date", { ascending: false })
        .limit(50);

      if (error) {throw error;}

      const formattedHistory = (data || []).map(item => {
        const jsonResult = item.result as unknown;
        const result = jsonResult as CalculationResult; // trusted shape from DB
        return {
          id: item.id,
          date: new Date(item.date),
          cost: item.cost,
          margin: item.margin,
          tax: item.tax || "",
          cardFee: item.card_fee || "",
          shipping: item.shipping || "",
          otherCosts: item.other_costs || "",
          includeShipping: item.include_shipping || false,
          result,
        };
      });

      setHistory(formattedHistory);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao carregar histórico';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  // Configurar realtime para atualizações automáticas
  useEffect(() => {
    if (!user?.id) {return;}

    loadHistory();

    const channel = supabase
      .channel('calculation-history-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'calculation_history',
          filter: `user_id=eq.${user.id}`
        },
        () => {
          // Recarregar dados quando houver mudanças
          loadHistory();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id, loadHistory]);

  const deleteHistoryItem = useCallback(async (id: string) => {
    try {
      setError(null);
      const { error } = await supabase
        .from("calculation_history")
        .delete()
        .eq("id", id);

      if (error) {throw error;}
      
      // O realtime vai atualizar automaticamente
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao deletar item';
      setError(message);
    }
  }, []);

  const clearAllHistory = useCallback(async () => {
    if (!user?.id) {return;}

    try {
      setError(null);
      const { error } = await supabase
        .from("calculation_history")
        .delete()
        .eq("user_id", user.id);

      if (error) {throw error;}
      
      // O realtime vai atualizar automaticamente
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao limpar histórico';
      setError(message);
    }
  }, [user?.id]);

  return {
    history,
    isLoading,
    error,
    deleteHistoryItem,
    clearAllHistory,
    refreshHistory: loadHistory
  };
};
