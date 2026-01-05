import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuthContext } from "@/domains/auth";

export type HistoryCategory = 
  | "calculos" 
  | "templates" 
  | "produtos" 
  | "configuracoes" 
  | "equipes"
  | "empresa"
  | "marketplace";

export type HistoryAction = "criado" | "modificado" | "calculado" | "excluido";

export interface ProjectHistoryItem {
  id: string;
  category: HistoryCategory;
  action: HistoryAction;
  title: string;
  description: string;
  timestamp: Date;
  metadata?: Record<string, unknown>;
  resourceId?: string;
  resourceType?: string;
}

export interface DateFilterValue {
  from: Date;
  to: Date;
}

export const useProjectHistory = () => {
  const { user } = useAuthContext();
  const [history, setHistory] = useState<ProjectHistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<HistoryCategory | "todos">("todos");
  const [dateFilter, setDateFilter] = useState<DateFilterValue | null>(null);

  const loadHistory = useCallback(async () => {
    if (!user?.id) {return;}

    try {
      setIsLoading(true);
      setError(null);

      const allItems: ProjectHistoryItem[] = [];

      // 1. Histórico de Cálculos
      let calcQuery = supabase
        .from("calculation_history")
        .select("*")
        .eq("user_id", user.id);
      
      if (dateFilter) {
        calcQuery = calcQuery
          .gte("date", dateFilter.from.toISOString())
          .lte("date", dateFilter.to.toISOString());
      }
      
      const { data: calculations, error: calcError } = await calcQuery
        .order("date", { ascending: false })
        .limit(50);


      if (!calcError && calculations && calculations.length > 0) {
        calculations.forEach((calc) => {
          allItems.push({
            id: `calc-${calc.id}`,
            category: "calculos",
            action: "calculado",
            title: "Cálculo de Preço",
            description: `Custo: ${calc.cost} | Margem: ${calc.margin}% | ${calc.tax ? `Imposto: ${calc.tax}` : ""}`,
            timestamp: new Date(calc.date),
            metadata: { calculation: calc },
            resourceId: calc.id,
            resourceType: "calculation",
          });
        });
      }

      // 2. Histórico de Cálculos Avançados
      let advCalcQuery = supabase
        .from("advanced_calculation_history")
        .select("*")
        .eq("user_id", user.id);
      
      if (dateFilter) {
        advCalcQuery = advCalcQuery
          .gte("created_at", dateFilter.from.toISOString())
          .lte("created_at", dateFilter.to.toISOString());
      }
      
      const { data: advancedCalcs, error: advCalcError } = await advCalcQuery
        .order("created_at", { ascending: false })
        .limit(50);


      if (!advCalcError && advancedCalcs && advancedCalcs.length > 0) {
        advancedCalcs.forEach((calc) => {
          allItems.push({
            id: `adv-calc-${calc.id}`,
            category: "calculos",
            action: "calculado",
            title: "Cálculo Avançado",
            description: `Produto: ${calc.marketplace_id} | Preço sugerido: R$ ${calc.suggested_price?.toFixed(2)} | Margem: ${calc.total_margin?.toFixed(2)}%`,
            timestamp: new Date(calc.created_at),
            metadata: { calculation: calc },
            resourceId: calc.id,
            resourceType: "advanced_calculation",
          });
        });
      }

      // 3. Templates (criados e modificados)
      let templatesQuery = supabase
        .from("calculation_templates")
        .select("*")
        .eq("created_by", user.id);
      
      if (dateFilter) {
        templatesQuery = templatesQuery
          .gte("created_at", dateFilter.from.toISOString())
          .lte("created_at", dateFilter.to.toISOString());
      }
      
      const { data: templates, error: templatesError } = await templatesQuery
        .order("created_at", { ascending: false })
        .limit(50);


      if (!templatesError && templates && templates.length > 0) {
        templates.forEach((template) => {
          // Item de criação
          allItems.push({
            id: `template-created-${template.id}`,
            category: "templates",
            action: "criado",
            title: `Template: ${template.name}`,
            description: template.description || "Sem descrição",
            timestamp: new Date(template.created_at),
            metadata: { template },
            resourceId: template.id,
            resourceType: "template",
          });

          // Item de modificação (se houver)
          if (template.updated_at && template.updated_at !== template.created_at) {
            allItems.push({
              id: `template-updated-${template.id}-${template.updated_at}`,
              category: "templates",
              action: "modificado",
              title: `Template atualizado: ${template.name}`,
              description: "Template foi modificado",
              timestamp: new Date(template.updated_at),
              metadata: { template },
              resourceId: template.id,
              resourceType: "template",
            });
          }
        });
      }

      // 4. Produtos (criados e modificados)
      let productsQuery = supabase
        .from("products")
        .select("*")
        .eq("tenant_id", user.id);
      
      if (dateFilter) {
        productsQuery = productsQuery
          .gte("created_at", dateFilter.from.toISOString())
          .lte("created_at", dateFilter.to.toISOString());
      }
      
      const { data: products, error: productsError } = await productsQuery
        .order("created_at", { ascending: false })
        .limit(50);


      if (!productsError && products && products.length > 0) {
        products.forEach((product) => {
          allItems.push({
            id: `product-created-${product.id}`,
            category: "produtos",
            action: "criado",
            title: `Produto: ${product.name}`,
            description: `SKU: ${product.sku || "N/A"} | Preço: R$ ${product.current_price?.toFixed(2)}`,
            timestamp: new Date(product.created_at),
            metadata: { product },
            resourceId: product.id,
            resourceType: "product",
          });

          if (product.updated_at && product.updated_at !== product.created_at) {
            allItems.push({
              id: `product-updated-${product.id}-${product.updated_at}`,
              category: "produtos",
              action: "modificado",
              title: `Produto atualizado: ${product.name}`,
              description: "Produto foi modificado",
              timestamp: new Date(product.updated_at),
              metadata: { product },
              resourceId: product.id,
              resourceType: "product",
            });
          }
        });
      }

      // 5. Configurações de Negócio
      let settingsQuery = supabase
        .from("business_settings")
        .select("*")
        .eq("user_id", user.id);
      
      if (dateFilter) {
        settingsQuery = settingsQuery
          .gte("created_at", dateFilter.from.toISOString())
          .lte("created_at", dateFilter.to.toISOString());
      }
      
      const { data: businessSettings, error: settingsError } = await settingsQuery
        .limit(10);


      if (!settingsError && businessSettings && businessSettings.length > 0) {
        businessSettings.forEach((setting) => {
          if (setting.created_at) {
            allItems.push({
              id: `settings-created-${setting.id}`,
              category: "configuracoes",
              action: "criado",
              title: "Configurações de Negócio",
              description: "Configurações padrão foram definidas",
              timestamp: new Date(setting.created_at),
              metadata: { settings: setting },
              resourceId: setting.id,
              resourceType: "business_settings",
            });
          }

          if (setting.updated_at && setting.updated_at !== setting.created_at) {
            allItems.push({
              id: `settings-updated-${setting.id}-${setting.updated_at}`,
              category: "configuracoes",
              action: "modificado",
              title: "Configurações de Negócio Atualizadas",
              description: "Configurações padrão foram modificadas",
              timestamp: new Date(setting.updated_at),
              metadata: { settings: setting },
              resourceId: setting.id,
              resourceType: "business_settings",
            });
          }
        });
      }

      // 6. Dados da Empresa
      let companyQuery = supabase
        .from("company_data")
        .select("*")
        .eq("user_id", user.id);
      
      if (dateFilter) {
        companyQuery = companyQuery
          .gte("created_at", dateFilter.from.toISOString())
          .lte("created_at", dateFilter.to.toISOString());
      }
      
      const { data: companyData, error: companyError } = await companyQuery
        .limit(10);


      if (!companyError && companyData && companyData.length > 0) {
        companyData.forEach((company) => {
          allItems.push({
            id: `company-created-${company.id}`,
            category: "empresa",
            action: "criado",
            title: "Dados da Empresa",
            description: "Dados da empresa foram cadastrados",
            timestamp: new Date(company.created_at),
            metadata: { company },
            resourceId: company.id,
            resourceType: "company_data",
          });

          if (company.updated_at && company.updated_at !== company.created_at) {
            allItems.push({
              id: `company-updated-${company.id}-${company.updated_at}`,
              category: "empresa",
              action: "modificado",
              title: "Dados da Empresa Atualizados",
              description: "Dados da empresa foram modificados",
              timestamp: new Date(company.updated_at),
              metadata: { company },
              resourceId: company.id,
              resourceType: "company_data",
            });
          }
        });
      }

      // 7. Equipes
      let teamsQuery = supabase
        .from("teams")
        .select("*")
        .eq("owner_id", user.id);
      
      if (dateFilter) {
        teamsQuery = teamsQuery
          .gte("created_at", dateFilter.from.toISOString())
          .lte("created_at", dateFilter.to.toISOString());
      }
      
      const { data: teams, error: teamsError } = await teamsQuery
        .order("created_at", { ascending: false })
        .limit(20);


      if (!teamsError && teams && teams.length > 0) {
        teams.forEach((team) => {
          allItems.push({
            id: `team-created-${team.id}`,
            category: "equipes",
            action: "criado",
            title: `Equipe: ${team.name}`,
            description: "Equipe foi criada",
            timestamp: new Date(team.created_at),
            metadata: { team },
            resourceId: team.id,
            resourceType: "team",
          });

          if (team.updated_at && team.updated_at !== team.created_at) {
            allItems.push({
              id: `team-updated-${team.id}-${team.updated_at}`,
              category: "equipes",
              action: "modificado",
              title: `Equipe atualizada: ${team.name}`,
              description: "Equipe foi modificada",
              timestamp: new Date(team.updated_at),
              metadata: { team },
              resourceId: team.id,
              resourceType: "team",
            });
          }
        });
      }

      // Ordenar por timestamp (mais recente primeiro)
      // O filtro de data já foi aplicado nas queries do Supabase acima
      allItems.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

      setHistory(allItems.slice(0, 200)); // Limitar a 200 itens mais recentes
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erro ao carregar histórico";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, [user?.id, dateFilter]);

  useEffect(() => {
    if (user?.id) {
      loadHistory();
    }
  }, [user?.id, loadHistory]);

  const filteredHistory = selectedCategory === "todos" 
    ? history 
    : history.filter(item => item.category === selectedCategory);

  return {
    history: filteredHistory,
    allHistory: history,
    isLoading,
    error,
    selectedCategory,
    setSelectedCategory,
    dateFilter,
    setDateFilter,
    refreshHistory: loadHistory,
  };
};
