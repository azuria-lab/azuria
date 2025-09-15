
import { supabase } from "@/integrations/supabase/client";
import { CalculationHistory, CalculationResult } from "@/types/simpleCalculator";
import { Json } from "@/integrations/supabase/types";
import { TablesInsert } from "@/types/supabase";

/**
 * Supabase-related operations for calculation history
 */
export const useSupabaseHistory = (userId: string | undefined) => {
  // Get history from Supabase
  const getSupabaseHistory = async (): Promise<CalculationHistory[]> => {
    if (!userId) {return [];}
    
    const { data, error } = await supabase
      .from("calculation_history")
      .select("*")
      .eq("user_id", userId)
      .order("date", { ascending: false })
      .limit(50);

    if (error) {throw error;}

    // Convert to application format - ensuring correct types
    return (data || []).map(item => ({
      id: item.id,
      date: new Date(item.date),
      cost: String(item.cost), // Convert to string as expected by CalculationHistory
      margin: Number(item.margin),
      tax: item.tax || "",
      cardFee: item.card_fee || "",
      shipping: item.shipping || "",
      otherCosts: item.other_costs || "",
      includeShipping: item.include_shipping || false,
      result: item.result as unknown as CalculationResult
    }));
  };

  // Save calculation to Supabase
  const saveToSupabase = async (
    cost: string,
    margin: number,
    tax: string,
    cardFee: string,
    shipping: string,
    otherCosts: string,
    includeShipping: boolean,
    result: CalculationResult
  ): Promise<boolean> => {
    if (!userId) {return false;}
    
    // Type assertion for Json compatibility
    const resultAsJson = result as unknown as Json;

    const calculation: TablesInsert<"calculation_history"> = {
      user_id: userId,
      cost: cost, // Keep as string to match DB schema
      margin: margin,
      tax,
      card_fee: cardFee,
      shipping,
      other_costs: otherCosts,
      include_shipping: includeShipping,
      result: resultAsJson,
      date: new Date().toISOString()
    };

    const { error } = await supabase
      .from("calculation_history")
      .insert(calculation);

    if (error) {throw error;}
    return true;
  };

  // Delete item from Supabase
  const deleteSupabaseItem = async (id: string): Promise<boolean> => {
    if (!userId) {return false;}

    const { error } = await supabase
      .from("calculation_history")
      .delete()
      .eq("id", id);

    if (error) {throw error;}
    return true;
  };

  // Clear all history from Supabase for this user
  const clearSupabaseHistory = async (): Promise<boolean> => {
    if (!userId) {return false;}

    const { error } = await supabase
      .from("calculation_history")
      .delete()
      .eq("user_id", userId);

    if (error) {throw error;}
    return true;
  };

  return {
    getSupabaseHistory,
    saveToSupabase,
    deleteSupabaseItem,
    clearSupabaseHistory
  };
};
