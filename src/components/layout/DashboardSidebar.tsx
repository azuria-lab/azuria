import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  BarChart3,
  Brain,
  Calculator,
  ChevronRight,
  FileText,
  Flag,
  Gauge,
  Gavel,
  History,
  Home,
  MoreHorizontal,
  Package2,
  Plus,
  Puzzle,
  Scale,
  Search as SearchIcon,
  Settings,
  ShoppingBag,
  Thermometer,
  Users,
  Workflow,
  X,
  Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useProStatus } from "@/shared/hooks/useProStatus";
import { Button } from "@/components/ui/button";
import { useAuthContext } from "@/domains/auth";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";

interface SidebarItem {
  title: string;
  url: string;
  icon: React.ElementType;
  badge?: string;
  items?: {
    title: string;
    url: string;
    icon?: React.ElementType;
  }[];
}

interface SidebarGroupData {
  label: string;
  items: SidebarItem[];
}

const dashboardMenuGroups: SidebarGroupData[] = [];

// Helper to find items that should be expanded based on current path
const findActiveParentItems = (groups: SidebarGroupData[], currentPath: string): string[] => {
  return groups.flatMap(group => 
    group.items
      .filter(item => item.items?.some(subItem => currentPath === subItem.url))
      .map(item => item.url)
  );
};

// Helper to check if a URL belongs to a top-level item (no sub-items)
const isTopLevelItem = (groups: SidebarGroupData[], url: string): boolean => {
  return groups.some(group => 
    group.items.some(item => item.url === url && !item.items)
  );
};

export default function DashboardSidebar() {
  const location = useLocation();
  const { isPro } = useProStatus();
  const auth = useAuthContext();
  const userProfile = auth?.userProfile;
  const { toggleSidebar, state } = useSidebar();
  
  // Mapeamento de nomes de ícones para componentes
  const iconMap: Record<string, React.ElementType> = {
    Home,
    BarChart3,
    Calculator,
    Gauge,
    Scale,
    Gavel,
    Zap,
    Package2,
    Thermometer,
    Workflow,
    Brain,
    FileText,
    ShoppingBag,
    History,
    Puzzle,
    Users,
    Settings,
    Flag,
  };

  // Mapeamento de URLs para ícones corretos (para migração)
  const urlToIconMap: Record<string, string> = {
    "/calculadora-rapida": "Gauge",
    "/calculadora-avancada": "Calculator",
    "/calculadora-tributaria": "Scale",
    "/calculadora-licitacao": "Gavel",
    "/marketplace": "ShoppingBag",
    "/azuria-ia": "Brain",
    "/dashboard": "Home",
    "/analytics": "BarChart3",
    "/templates": "FileText",
    "/calculadora-lotes": "Package2",
    "/analise-sensibilidade": "Thermometer",
    "/historico": "History",
    "/integracoes": "Puzzle",
    "/api": "Puzzle",
    "/colaboracao": "Users",
    "/cenarios": "BarChart3",
    "/importacao": "FileText",
    "/automacoes": "Workflow",
  };

  // Atalhos favoritos (salvos no localStorage)
  const [favoriteShortcuts, setFavoriteShortcuts] = useState<Array<{ title: string; url: string; iconName: string }>>(() => {
    const saved = localStorage.getItem('azuria-favorite-shortcuts');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        let needsUpdate = false;
        
        // Migrar ícones antigos para novos
        const migrated = parsed.map((item: Record<string, unknown>) => {
          const itemUrl = typeof item.url === 'string' ? item.url : '';
          const itemIconName = typeof item.iconName === 'string' ? item.iconName : undefined;
          
          // Se for formato antigo (com icon como objeto), converter
          if (item.icon && typeof item.icon !== 'string') {
            needsUpdate = true;
            const iconName = Object.keys(iconMap).find(
              key => iconMap[key] === item.icon
            ) || (itemUrl && urlToIconMap[itemUrl]) || 'Flag';
            return { title: item.title, url: itemUrl, iconName };
          }
          
          // Migrar ícones antigos baseado na URL
          const correctIcon = itemUrl ? urlToIconMap[itemUrl] : undefined;
          if (correctIcon && itemIconName !== correctIcon) {
            needsUpdate = true;
            return { ...item, iconName: correctIcon };
          }
          
          return item;
        });
        
        // Salvar versão migrada se houver mudanças
        if (needsUpdate) {
          localStorage.setItem('azuria-favorite-shortcuts', JSON.stringify(migrated));
        }
        
        return migrated;
      } catch {
        return [];
      }
    }
    // Atalhos padrão
    return [
      { title: "Calculadora Rápida", url: "/calculadora-rapida", iconName: "Gauge" },
      { title: "Calculadora Avançada", url: "/calculadora-avancada", iconName: "Calculator" },
      { title: "Marketplace", url: "/marketplace", iconName: "ShoppingBag" },
          { title: "Azuria AI", url: "/azuria-ia", iconName: "Brain" },
    ];
  });
  
  // Auto-expand items that have active sub-items
  const getInitialExpandedItems = React.useCallback(() => {
    return findActiveParentItems(dashboardMenuGroups, location.pathname);
  }, [location.pathname]);

  const [expandedItems, setExpandedItems] = React.useState<string[]>(getInitialExpandedItems);

  // Update expanded items when location changes
  React.useEffect(() => {
    const newExpanded = getInitialExpandedItems();
    setExpandedItems((prev) => {
      // Keep manually expanded items, add auto-expanded ones
      const manualExpanded = prev.filter((url) => isTopLevelItem(dashboardMenuGroups, url));
      return [...new Set([...manualExpanded, ...newExpanded])];
    });
  }, [location.pathname, getInitialExpandedItems]);

  const toggleExpanded = (url: string) => {
    setExpandedItems((prev) =>
      prev.includes(url) ? prev.filter((item) => item !== url) : [...prev, url]
    );
  };

  const isActive = (url: string) => {
    if (url === "/dashboard") {
      return location.pathname === "/dashboard";
    }
    return location.pathname.startsWith(url);
  };

  const isItemActive = (item: SidebarItem) => {
    if (item.items) {
      return item.items.some((subItem) => location.pathname === subItem.url);
    }
    return isActive(item.url);
  };

  const { toast } = useToast();
  const [isAddShortcutOpen, setIsAddShortcutOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [companyLogo, setCompanyLogo] = useState<string | null>(null);
  const [companyName, setCompanyName] = useState<string | null>(null);

  // Lista de todos os itens disponíveis para adicionar como atalho
  const getAllAvailableItems = () => {
    // Lista fixa de todas as funcionalidades disponíveis no projeto
    const allItems = [
      { title: "Dashboard", url: "/dashboard", iconName: "Home", icon: Home },
      { title: "Analytics", url: "/analytics", iconName: "BarChart3", icon: BarChart3 },
      { title: "Templates", url: "/templates", iconName: "FileText", icon: FileText },
      { title: "Calculadora Rápida", url: "/calculadora-rapida", iconName: "Gauge", icon: Gauge },
      { title: "Calculadora Avançada", url: "/calculadora-avancada", iconName: "Calculator", icon: Calculator },
      { title: "Calculadora Tributária", url: "/calculadora-tributaria", iconName: "Scale", icon: Scale },
      { title: "Calculadora de Licitações", url: "/calculadora-licitacao", iconName: "Gavel", icon: Gavel },
      { title: "Calculadora de Lotes", url: "/calculadora-lotes", iconName: "Package2", icon: Package2 },
      { title: "Análise de Sensibilidade", url: "/analise-sensibilidade", iconName: "Thermometer", icon: Thermometer },
      { title: "Azuria AI", url: "/azuria-ia", iconName: "Brain", icon: Brain },
      { title: "Marketplaces", url: "/marketplace", iconName: "ShoppingBag", icon: ShoppingBag },
      { title: "Comparador de Marketplaces", url: "/comparador-marketplaces", iconName: "ShoppingBag", icon: ShoppingBag },
      { title: "Licitações", url: "/dashboard-licitacoes", iconName: "Gavel", icon: Gavel },
      { title: "Documentos", url: "/documentos", iconName: "FileText", icon: FileText },
      { title: "Inteligência de Dados", url: "/inteligencia-dados", iconName: "BarChart3", icon: BarChart3 },
      { title: "Métricas de Preços", url: "/metricas-precos", iconName: "BarChart3", icon: BarChart3 },
      { title: "Análise de Rentabilidade", url: "/analise-rentabilidade", iconName: "BarChart3", icon: BarChart3 },
      { title: "Relatórios", url: "/relatorios", iconName: "FileText", icon: FileText },
      { title: "Histórico", url: "/historico", iconName: "History", icon: History },
      { title: "Integrações", url: "/integracoes", iconName: "Puzzle", icon: Puzzle },
      { title: "API", url: "/api", iconName: "Puzzle", icon: Puzzle },
      { title: "Colaboração", url: "/colaboracao", iconName: "Users", icon: Users },
      { title: "Cenários", url: "/cenarios", iconName: "BarChart3", icon: BarChart3 },
      { title: "Importação", url: "/importacao", iconName: "FileText", icon: FileText },
      { title: "Automações", url: "/automacoes", iconName: "Workflow", icon: Workflow },
    ];
    
    return allItems;
  };

  const availableItems = getAllAvailableItems();
  
  // Filtrar itens que já estão nos favoritos
  const favoriteUrls = favoriteShortcuts.map((s: { url: string }) => s.url);
  const itemsToShow = availableItems.filter(
    (item) => !favoriteUrls.includes(item.url) && item.url !== "/dashboard"
  );

  // Filtrar por busca
  const filteredItems = itemsToShow.filter((item) =>
    item.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddShortcut = (item: { title: string; url: string; iconName: string }) => {
    const newShortcuts = [...favoriteShortcuts, { title: item.title, url: item.url, iconName: item.iconName }];
    setFavoriteShortcuts(newShortcuts);
    localStorage.setItem('azuria-favorite-shortcuts', JSON.stringify(newShortcuts));
    
    toast({
      title: "Atalho adicionado",
      description: `${item.title} foi adicionado aos seus atalhos favoritos.`,
    });
    
    setIsAddShortcutOpen(false);
    setSearchQuery("");
  };

  const handleRemoveShortcut = (url: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    const newShortcuts = favoriteShortcuts.filter((s: { url: string }) => s.url !== url);
    setFavoriteShortcuts(newShortcuts);
    localStorage.setItem('azuria-favorite-shortcuts', JSON.stringify(newShortcuts));
    
    toast({
      title: "Atalho removido",
      description: "O atalho foi removido dos seus favoritos.",
    });
  };

  // Buscar logo e nome da empresa
  useEffect(() => {
    const fetchCompanyData = async () => {
      if (!userProfile?.id) {return;}

      try {
        const { data, error } = await supabase
          .from("company_data")
          .select("*")
          .eq("user_id", userProfile.id)
          .maybeSingle();

        if (error) {
          // Ignorar erro se não houver dados (PGRST116 = no rows returned)
          if (error.code !== 'PGRST116') {
            // eslint-disable-next-line no-console
            console.error("Erro ao buscar dados da empresa:", error);
          }
          return;
        }

        if (data?.data) {
          const companyData = data.data as { logoUrl?: string; nome?: string; nomeFantasia?: string };
          if (companyData.logoUrl) {
            setCompanyLogo(companyData.logoUrl);
          }
          if (companyData.nomeFantasia || companyData.nome) {
            setCompanyName(companyData.nomeFantasia || companyData.nome || null);
          }
        }
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error("Erro ao buscar dados da empresa:", error);
      }
    };

    fetchCompanyData();
  }, [userProfile?.id]);

  return (
    <>
    <Sidebar>
      <SidebarHeader className="border-b border-sidebar-border">
          <div className="flex items-center justify-between px-4 py-3">
            <div className="flex items-center gap-2 flex-1">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
            <img 
                  src={companyLogo || "/images/azuria-logo-official.png"} 
                  alt={companyName || "Azuria"} 
                  className="h-8 w-8 object-contain"
                  onError={(e) => {
                    // Fallback para logo do Azuria se a logo da empresa não carregar
                    const target = e.target as HTMLImageElement;
                    if (target.src !== `${window.location.origin}/images/azuria-logo-official.png`) {
                      target.src = "/images/azuria-logo-official.png";
                    }
                  }}
            />
          </div>
          <div className="flex flex-col">
                <span className="text-sm font-semibold">{companyName || "Azuria"}</span>
                {userProfile?.email && (
                  <span className="text-xs text-muted-foreground truncate max-w-[140px]">
                    {userProfile.email}
                  </span>
                )}
          </div>
            </div>
            {/* Botão de ocultar menu - 3 riscos horizontais (só aparece quando menu está aberto) */}
            {state === "expanded" && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={toggleSidebar}
                    >
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Ocultar menu</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
        </div>
      </SidebarHeader>
      <SidebarContent>
        {/* Atalhos Favoritos - CÍRCULO VERDE CLARO */}
        <SidebarGroup>
          <div className="flex items-center justify-between px-2 mb-2">
            <SidebarGroupLabel>Atalhos favoritos</SidebarGroupLabel>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 text-green-600 hover:text-green-700 hover:bg-green-50"
              onClick={() => setIsAddShortcutOpen(true)}
              title="Adicionar atalho"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          <SidebarGroupContent>
            <SidebarMenu>
              {favoriteShortcuts.map((shortcut, index) => {
                const Icon = iconMap[shortcut.iconName] || Flag;
                const isShortcutActive = location.pathname === shortcut.url;
                return (
                  <SidebarMenuItem key={`${shortcut.url}-${index}`}>
                    <SidebarMenuButton asChild isActive={isShortcutActive}>
                      <Link to={shortcut.url} className="flex items-center gap-2 group/item">
                        <Icon className="h-4 w-4" />
                        <span className="flex-1">{shortcut.title}</span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-5 w-5 opacity-0 group-hover/item:opacity-100 transition-opacity"
                          onClick={(e) => handleRemoveShortcut(shortcut.url, e)}
                          title="Remover atalho"
                        >
                          <X className="h-3 w-3 text-muted-foreground hover:text-destructive" />
                        </Button>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {dashboardMenuGroups.map((group) => (
          <SidebarGroup key={group.label}>
            <SidebarGroupLabel>{group.label}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => {
                  const hasSubItems = item.items && item.items.length > 0;
                  const isExpanded = expandedItems.includes(item.url);
                  const itemIsActive = isItemActive(item);

                  // Hide Colaboração if not PRO
                  if (item.url === "/colaboracao" && !isPro) {
                    return null;
                  }

                  return (
                    <SidebarMenuItem key={item.url}>
                      {hasSubItems ? (
                        <>
                          <SidebarMenuButton
                            onClick={() => toggleExpanded(item.url)}
                            isActive={itemIsActive}
                          >
                            <item.icon className="h-4 w-4" />
                            <span>{item.title}</span>
                            <ChevronRight
                              className={cn(
                                "ml-auto h-4 w-4 transition-transform",
                                isExpanded && "rotate-90"
                              )}
                            />
                          </SidebarMenuButton>
                          {isExpanded && (
                            <SidebarMenuSub>
                              {item.items?.map((subItem) => {
                                const SubIcon = subItem.icon || Calculator;
                                const isSubActive = location.pathname === subItem.url;
                                return (
                                  <SidebarMenuSubItem key={subItem.url}>
                                    <SidebarMenuSubButton asChild isActive={isSubActive}>
                                      <Link to={subItem.url}>
                                        <SubIcon className="h-4 w-4" />
                                        <span>{subItem.title}</span>
                                      </Link>
                                    </SidebarMenuSubButton>
                                  </SidebarMenuSubItem>
                                );
                              })}
                            </SidebarMenuSub>
                          )}
                        </>
                      ) : (
                        <SidebarMenuButton asChild isActive={itemIsActive}>
                          <Link to={item.url}>
                            <item.icon className="h-4 w-4" />
                            <span>{item.title}</span>
                            {item.badge && (
                              <SidebarMenuBadge>{item.badge}</SidebarMenuBadge>
                            )}
                          </Link>
                        </SidebarMenuButton>
                      )}
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
      <SidebarFooter className="border-t border-sidebar-border p-4">
        <div className="text-xs text-muted-foreground text-center">
          © 2025 Azuria. Todos os direitos reservados.
        </div>
      </SidebarFooter>
    </Sidebar>
    
    {/* Botão para expandir menu quando oculto - aparece abaixo do header */}
    {state === "collapsed" && (
      <div className="fixed top-16 left-0 z-10 h-12 w-12 flex items-center justify-center bg-sidebar border-r border-sidebar-border">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={toggleSidebar}
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Expandir menu</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    )}

    {/* Modal para adicionar atalho favorito */}
    <Dialog open={isAddShortcutOpen} onOpenChange={setIsAddShortcutOpen}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Adicionar atalho favorito</DialogTitle>
          <DialogDescription>
            Selecione uma funcionalidade para adicionar aos seus atalhos favoritos
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Campo de busca */}
          <div className="relative">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar funcionalidade..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>

          {/* Lista de itens disponíveis */}
          <div className="max-h-[400px] overflow-y-auto space-y-1">
            {filteredItems.length === 0 ? (
              <div className="text-center py-8 text-sm text-muted-foreground">
                {searchQuery ? "Nenhum resultado encontrado" : "Todos os itens já estão nos favoritos"}
              </div>
            ) : (
              filteredItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Button
                    key={item.url}
                    variant="ghost"
                    className="w-full justify-start gap-2 h-auto py-3"
                    onClick={() => handleAddShortcut({ title: item.title, url: item.url, iconName: item.iconName })}
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                    <span className="text-left flex-1">{item.title}</span>
                    <Plus className="h-4 w-4 text-green-600" />
                  </Button>
                );
              })
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
    </>
  );
}
