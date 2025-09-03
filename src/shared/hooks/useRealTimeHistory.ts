
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { CalculationHistory } from "@/types/simpleCalculator";
import { useAuthContext } from "@/domains/auth";

export const useRealTimeHistory = () => {
  const { user } = useAuthContext();
  const [history, setHistory] = useState<CalculationHistory[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Carregar histórico inicial
  const loadHistory = async () => {
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

      const formattedHistory = (data || []).map(item => ({
        id: item.id,
        date: new Date(item.date),
        cost: item.cost,
        margin: item.margin,
        tax: item.tax || "",
        cardFee: item.card_fee || "",
        shipping: item.shipping || "",
        otherCosts: item.other_costs || "",
        includeShipping: item.include_shipping || false,
        result: item.result as any
      }));

      setHistory(formattedHistory);
    } catch (err: any) {
      console.error("Erro ao carregar histórico:", err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

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
  }, [user?.id]);

  const deleteHistoryItem = async (id: string) => {
    try {
      setError(null);
      const { error } = await supabase
        .from("calculation_history")
        .delete()
        .eq("id", id);

      if (error) {throw error;}
      
      // O realtime vai atualizar automaticamente
    } catch (err: any) {
      console.error("Erro ao deletar item:", err);
      setError(err.message);
    }
  };

  const clearAllHistory = async () => {
    if (!user?.id) {return;}

    try {
      setError(null);
      const { error } = await supabase
        .from("calculation_history")
        .delete()
        .eq("user_id", user.id);

      if (error) {throw error;}
      
      // O realtime vai atualizar automaticamente
    } catch (err: any) {
      console.error("Erro ao limpar histórico:", err);
      setError(err.message);
    }
  };

  return {
    history,
    isLoading,
    error,
    deleteHistoryItem,
    clearAllHistory,
    refreshHistory: loadHistory
  };
};
