import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { logger } from "@/services/logger";

export interface BusinessSettingsState {
  defaultMargin: number;
  defaultTax: number;
  defaultCardFee: number;
  defaultShipping: number;
  includeShippingDefault: boolean;
  isLoading: boolean;
  error: string | null;
}

const defaultSettings: Omit<BusinessSettingsState, "isLoading" | "error"> = {
  defaultMargin: 30, // 30%
  defaultTax: 4, // CORRIGIDO: 4% (era 7%)
  defaultCardFee: 3.15, // CORRIGIDO: 3,15% (era 3%)
  defaultShipping: 0,
  includeShippingDefault: false
};

export function useBusinessSettings(userId?: string) {
  const { toast } = useToast();
  const [settings, setSettings] = useState<BusinessSettingsState>({
    ...defaultSettings,
    isLoading: false,
    error: null
  });

  // Fetch business settings for the user
  const fetchSettings = useCallback(async () => {
    if (!userId) {
      // Set default values when no userId is provided
      setSettings({
        ...defaultSettings,
        isLoading: false,
        error: null
      });
      return;
    }
    
    try {
      setSettings(prev => ({ ...prev, isLoading: true, error: null }));
      
      const { data, error } = await supabase
        .from("business_settings")
        .select("*")
        .eq("user_id", userId)
        .single();
      
      if (error) {
        // If no settings found, create default settings
        if (error.code === "PGRST116") {
          return await createDefaultSettings(userId);
        }
        throw error;
      }
      
      setSettings({
        defaultMargin: data.default_margin ?? defaultSettings.defaultMargin,
        defaultTax: data.default_tax ?? defaultSettings.defaultTax,
        defaultCardFee: data.default_card_fee ?? defaultSettings.defaultCardFee,
        defaultShipping: data.default_shipping ?? defaultSettings.defaultShipping,
        includeShippingDefault: data.include_shipping_default ?? defaultSettings.includeShippingDefault,
        isLoading: false,
        error: null
      });
      
    } catch (err) {
      logger.error("Erro ao buscar configurações:", err);
      // Em caso de erro, usar configurações padrão
      setSettings({
        ...defaultSettings,
        isLoading: false,
        error: null
      });
    }
  }, [userId]);
  
  // Create default settings for a new user
  const createDefaultSettings = async (userId: string) => {
    try {
      const { error } = await supabase
        .from("business_settings")
        .insert({
          user_id: userId,
          default_margin: defaultSettings.defaultMargin,
          default_tax: defaultSettings.defaultTax,
          default_card_fee: defaultSettings.defaultCardFee,
          default_shipping: defaultSettings.defaultShipping,
          include_shipping_default: defaultSettings.includeShippingDefault,
        });
      
      if (error) {throw error;}
      
      setSettings({
        ...defaultSettings,
        isLoading: false,
        error: null
      });
      
      return defaultSettings;
    } catch (err) {
      logger.error("Erro ao criar configurações:", err);
      // Em caso de erro, usar configurações padrão
      setSettings({
        ...defaultSettings,
        isLoading: false,
        error: null
      });
      return defaultSettings;
    }
  };
  
  // Update business settings
  const updateSettings = async (newSettings: Partial<Omit<BusinessSettingsState, "isLoading" | "error">>) => {
    if (!userId) {return false;}
    
  try {
      setSettings(prev => ({ ...prev, isLoading: true, error: null }));
      
      const updateData = {
        default_margin: newSettings.defaultMargin,
        default_tax: newSettings.defaultTax,
        default_card_fee: newSettings.defaultCardFee,
        default_shipping: newSettings.defaultShipping,
        include_shipping_default: newSettings.includeShippingDefault,
        updated_at: new Date().toISOString()
      };
      
      // Remove undefined values
      Object.keys(updateData).forEach(key => {
        if (updateData[key as keyof typeof updateData] === undefined) {
          delete updateData[key as keyof typeof updateData];
        }
      });
      
      const { error } = await supabase
        .from("business_settings")
        .update(updateData)
        .eq("user_id", userId);
      
      if (error) {throw error;}
      
      setSettings(prev => ({ 
        ...prev, 
        ...Object.fromEntries(
          Object.entries(newSettings).filter(([_, v]) => v !== undefined)
        ),
        isLoading: false
      }));
      
      toast({
        title: "Configurações atualizadas",
        description: "Suas configurações de negócio foram atualizadas com sucesso."
      });
      
      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      logger.error("Erro ao atualizar configurações:", message);
      setSettings(prev => ({ 
        ...prev, 
        isLoading: false, 
        error: message || "Erro ao atualizar configurações" 
      }));
      
      toast({
        title: "Erro ao atualizar",
        description: message || "Não foi possível salvar suas configurações.",
        variant: "destructive"
      });
      
      return false;
    }
  };
  
  // Load settings when userId changes
  useEffect(() => {
    fetchSettings();
  }, [userId, fetchSettings]);
  
  return {
    ...settings,
    updateSettings,
    fetchSettings
  };
}
