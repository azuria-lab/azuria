/**
 * Hook para buscar dados agregados de todas as funcionalidades do Azuria
 * 
 * Este hook consolida informações de:
 * - Cálculos (básicos e avançados)
 * - Marketplace (templates, produtos monitorados, alertas)
 * - Equipes/Colaboração
 * - Automação
 * - Documentos/Licitações
 * - Analytics/Métricas
 * - IA
 * - Subscriptions
 */

import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuthContext } from "@/domains/auth";
import { logger } from "@/services/logger";

export interface AllFeaturesData {
  // Cálculos
  calculations: {
    basic: number;
    advanced: number;
    templates: number;
    total: number;
  };
  
  // Marketplace
  marketplace: {
    templates: number;
    monitoredProducts: number;
    priceAlerts: number;
    priceSuggestions: number;
    activeIntegrations: number;
  };
  
  // Equipes/Colaboração
  collaboration: {
    teams: number;
    teamMembers: number;
    sharedCalculations: number;
    pendingApprovals: number;
    comments: number;
  };
  
  // Automação
  automation: {
    activeRules: number;
    totalExecutions: number;
    alerts: number;
    workflows: number;
  };
  
  // Documentos/Licitações
  documents: {
    total: number;
    valid: number;
    expiring: number;
    expired: number;
  };
  
  bidding: {
    editais: number;
    alerts: number;
    portals: number;
  };
  
  // Analytics/Métricas
  analytics: {
    businessMetrics: number;
    salesRecords: number;
    productPerformance: number;
  };
  
  // IA
  ai: {
    totalInteractions: number;
    suggestions: number;
    behaviorPatterns: number;
  };
  
  // Subscriptions
  subscription: {
    plan: string;
    status: string;
    usage: {
      calculationsToday: number;
      calculationsThisMonth: number;
      aiQueries: number;
    };
  };
  
  isLoading: boolean;
  error: string | null;
}

export function useAllFeaturesData() {
  const { user } = useAuthContext();
  const [data, setData] = useState<AllFeaturesData>({
    calculations: { basic: 0, advanced: 0, templates: 0, total: 0 },
    marketplace: { templates: 0, monitoredProducts: 0, priceAlerts: 0, priceSuggestions: 0, activeIntegrations: 0 },
    collaboration: { teams: 0, teamMembers: 0, sharedCalculations: 0, pendingApprovals: 0, comments: 0 },
    automation: { activeRules: 0, totalExecutions: 0, alerts: 0, workflows: 0 },
    documents: { total: 0, valid: 0, expiring: 0, expired: 0 },
    bidding: { editais: 0, alerts: 0, portals: 0 },
    analytics: { businessMetrics: 0, salesRecords: 0, productPerformance: 0 },
    ai: { totalInteractions: 0, suggestions: 0, behaviorPatterns: 0 },
    subscription: { plan: 'free', status: 'inactive', usage: { calculationsToday: 0, calculationsThisMonth: 0, aiQueries: 0 } },
    isLoading: true,
    error: null,
  });

  const fetchAllData = useCallback(async () => {
    if (!user?.id) {
      setData(prev => ({ ...prev, isLoading: false }));
      return;
    }

    try {
      setData(prev => ({ ...prev, isLoading: true, error: null }));

      // Buscar dados de cálculos
      const [basicCalcs, advancedCalcs, templates] = await Promise.allSettled([
        supabase
          .from("calculation_history")
          .select("id", { count: "exact", head: true })
          .eq("user_id", user.id),
        supabase
          .from("advanced_calculation_history")
          .select("id", { count: "exact", head: true })
          .eq("user_id", user.id),
        supabase
          .from("calculation_templates")
          .select("id", { count: "exact", head: true })
          .or(`is_public.eq.true,created_by.eq.${user.id}`),
      ]);

      // Buscar dados de marketplace
      const [marketplaceTemplates, monitoredProducts, priceAlerts, priceSuggestions, marketplacePlatforms] = await Promise.allSettled([
        supabase
          .from("user_marketplace_templates")
          .select("id", { count: "exact", head: true })
          .eq("user_id", user.id),
        supabase
          .from("monitored_products")
          .select("id", { count: "exact", head: true })
          .eq("user_id", user.id)
          .eq("monitor_enabled", true),
        supabase
          .from("price_alerts")
          .select("id", { count: "exact", head: true })
          .eq("user_id", user.id)
          .eq("is_read", false),
        supabase
          .from("price_suggestions")
          .select("id", { count: "exact", head: true })
          .eq("user_id", user.id)
          .eq("status", "pending"),
        supabase
          .from("marketplace_platforms")
          .select("id", { count: "exact", head: true })
          .eq("status", "ACTIVE"),
      ]);

      // Buscar dados de colaboração
      const [teams, teamMembers, sharedCalcs, approvals, comments] = await Promise.allSettled([
        supabase
          .from("teams")
          .select("id", { count: "exact", head: true })
          .eq("owner_id", user.id),
        supabase
          .from("team_members")
          .select("id", { count: "exact", head: true })
          .eq("user_id", user.id),
        supabase
          .from("calculation_shares")
          .select("id", { count: "exact", head: true })
          .or(`shared_by.eq.${user.id},shared_with.eq.${user.id}`),
        supabase
          .from("calculation_approvals")
          .select("id", { count: "exact", head: true })
          .eq("approver_id", user.id)
          .eq("status", "pending"),
        supabase
          .from("calculation_comments")
          .select("id", { count: "exact", head: true })
          .eq("user_id", user.id),
      ]);

      // Buscar dados de automação
      const [automationRules, automationExecutions, automationAlerts, automationWorkflows] = await Promise.allSettled([
        supabase
          .from("automation_rules")
          .select("id", { count: "exact", head: true })
          .eq("user_id", user.id)
          .eq("is_active", true),
        supabase
          .from("automation_executions")
          .select("id", { count: "exact", head: true })
          .eq("user_id", user.id),
        supabase
          .from("automation_alerts")
          .select("id", { count: "exact", head: true })
          .eq("user_id", user.id)
          .eq("is_read", false),
        supabase
          .from("automation_workflows")
          .select("id", { count: "exact", head: true })
          .eq("user_id", user.id)
          .eq("is_active", true),
      ]);

      // Buscar dados de documentos
      const [documents] = await Promise.allSettled([
        supabase
          .from("documentos")
          .select("id, status", { count: "exact" })
          .eq("user_id", user.id),
      ]);

      // Buscar dados de licitações
      const [editais, biddingAlerts, portals] = await Promise.allSettled([
        supabase
          .from("detected_editais")
          .select("id", { count: "exact", head: true }),
        supabase
          .from("alerts")
          .select("id", { count: "exact", head: true })
          .eq("user_id", user.id)
          .eq("read", false),
        supabase
          .from("portals")
          .select("id", { count: "exact", head: true })
          .eq("enabled", true),
      ]);

      // Buscar dados de analytics
      const [businessMetrics, salesData, productPerformance] = await Promise.allSettled([
        supabase
          .from("business_metrics")
          .select("id", { count: "exact", head: true })
          .eq("user_id", user.id),
        supabase
          .from("sales_data")
          .select("id", { count: "exact", head: true })
          .eq("user_id", user.id),
        supabase
          .from("product_performance")
          .select("id", { count: "exact", head: true })
          .eq("user_id", user.id),
      ]);

      // Buscar dados de IA
      const [aiLogs, aiSuggestions, behaviorPatterns] = await Promise.allSettled([
        supabase
          .from("ai_logs")
          .select("id", { count: "exact", head: true })
          .eq("user_id", user.id),
        supabase
          .from("user_suggestions")
          .select("id", { count: "exact", head: true })
          .eq("user_id", user.id)
          .eq("status", "pending"),
        supabase
          .from("user_behavior_patterns")
          .select("id", { count: "exact", head: true })
          .eq("user_id", user.id),
      ]);

      // Buscar dados de subscription
      const [subscription, usageTracking] = await Promise.allSettled([
        supabase
          .from("subscriptions")
          .select("plan_id, status")
          .eq("user_id", user.id)
          .single(),
        supabase
          .from("usage_tracking")
          .select("calculations_today, calculations_this_month, ai_queries_this_month")
          .eq("user_id", user.id)
          .single(),
      ]);

      // Processar documentos
      const docsData = documents.status === 'fulfilled' ? (documents.value.data || []) : [];
      const validDocs = docsData.filter((d: { status?: string }) => d.status === "valido").length;
      const expiringDocs = docsData.filter((d: { status?: string }) => d.status === "proximo_vencimento").length;
      const expiredDocs = docsData.filter((d: { status?: string }) => d.status === "vencido").length;

      setData({
        calculations: {
          basic: basicCalcs.status === 'fulfilled' ? (basicCalcs.value.count || 0) : 0,
          advanced: advancedCalcs.status === 'fulfilled' ? (advancedCalcs.value.count || 0) : 0,
          templates: templates.status === 'fulfilled' ? (templates.value.count || 0) : 0,
          total: (basicCalcs.status === 'fulfilled' ? (basicCalcs.value.count || 0) : 0) + (advancedCalcs.status === 'fulfilled' ? (advancedCalcs.value.count || 0) : 0),
        },
        marketplace: {
          templates: marketplaceTemplates.status === 'fulfilled' ? (marketplaceTemplates.value.count || 0) : 0,
          monitoredProducts: monitoredProducts.status === 'fulfilled' ? (monitoredProducts.value.count || 0) : 0,
          priceAlerts: priceAlerts.status === 'fulfilled' ? (priceAlerts.value.count || 0) : 0,
          priceSuggestions: priceSuggestions.status === 'fulfilled' ? (priceSuggestions.value.count || 0) : 0,
          activeIntegrations: marketplacePlatforms.status === 'fulfilled' ? (marketplacePlatforms.value.count || 0) : 0,
        },
        collaboration: {
          teams: teams.status === 'fulfilled' ? (teams.value.count || 0) : 0,
          teamMembers: teamMembers.status === 'fulfilled' ? (teamMembers.value.count || 0) : 0,
          sharedCalculations: sharedCalcs.status === 'fulfilled' ? (sharedCalcs.value.count || 0) : 0,
          pendingApprovals: approvals.status === 'fulfilled' ? (approvals.value.count || 0) : 0,
          comments: comments.status === 'fulfilled' ? (comments.value.count || 0) : 0,
        },
        automation: {
          activeRules: automationRules.status === 'fulfilled' ? (automationRules.value.count || 0) : 0,
          totalExecutions: automationExecutions.status === 'fulfilled' ? (automationExecutions.value.count || 0) : 0,
          alerts: automationAlerts.status === 'fulfilled' ? (automationAlerts.value.count || 0) : 0,
          workflows: automationWorkflows.status === 'fulfilled' ? (automationWorkflows.value.count || 0) : 0,
        },
        documents: {
          total: documents.status === 'fulfilled' ? (documents.value.count || 0) : 0,
          valid: validDocs,
          expiring: expiringDocs,
          expired: expiredDocs,
        },
        bidding: {
          editais: editais.status === 'fulfilled' ? (editais.value.count || 0) : 0,
          alerts: biddingAlerts.status === 'fulfilled' ? (biddingAlerts.value.count || 0) : 0,
          portals: portals.status === 'fulfilled' ? (portals.value.count || 0) : 0,
        },
        analytics: {
          businessMetrics: businessMetrics.status === 'fulfilled' ? (businessMetrics.value.count || 0) : 0,
          salesRecords: salesData.status === 'fulfilled' ? (salesData.value.count || 0) : 0,
          productPerformance: productPerformance.status === 'fulfilled' ? (productPerformance.value.count || 0) : 0,
        },
        ai: {
          totalInteractions: aiLogs.status === 'fulfilled' ? (aiLogs.value.count || 0) : 0,
          suggestions: aiSuggestions.status === 'fulfilled' ? (aiSuggestions.value.count || 0) : 0,
          behaviorPatterns: behaviorPatterns.status === 'fulfilled' ? (behaviorPatterns.value.count || 0) : 0,
        },
        subscription: {
          plan: subscription.status === 'fulfilled' && subscription.value.data ? subscription.value.data.plan_id : "free",
          status: subscription.status === 'fulfilled' && subscription.value.data ? subscription.value.data.status : "inactive",
          usage: {
            calculationsToday: usageTracking.status === 'fulfilled' && usageTracking.value.data ? (usageTracking.value.data.calculations_today || 0) : 0,
            calculationsThisMonth: usageTracking.status === 'fulfilled' && usageTracking.value.data ? (usageTracking.value.data.calculations_this_month || 0) : 0,
            aiQueries: usageTracking.status === 'fulfilled' && usageTracking.value.data ? (usageTracking.value.data.ai_queries_this_month || 0) : 0,
          },
        },
        isLoading: false,
        error: null,
      });

      logger.info("📊 Dados de todas as funcionalidades carregados", {
        calculations: (basicCalcs.status === 'fulfilled' ? (basicCalcs.value.count || 0) : 0) + (advancedCalcs.status === 'fulfilled' ? (advancedCalcs.value.count || 0) : 0),
        marketplace: monitoredProducts.status === 'fulfilled' ? (monitoredProducts.value.count || 0) : 0,
        collaboration: teams.status === 'fulfilled' ? (teams.value.count || 0) : 0,
      });
    } catch (error) {
      logger.error("❌ Erro ao buscar dados de todas as funcionalidades:", error);
      setData(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : "Erro desconhecido",
      }));
    }
  }, [user?.id]);

  useEffect(() => {
    fetchAllData();
    
    // Atualizar a cada 5 minutos
    const interval = setInterval(fetchAllData, 5 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, [fetchAllData]);

  return {
    ...data,
    refetch: fetchAllData,
  };
}

