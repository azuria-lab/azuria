import React from "react";
import { Link, useLocation } from "react-router-dom";
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
} from "@/components/ui/sidebar";
import {
  BarChart3,
  Brain,
  Calculator,
  ChevronRight,
  FileCheck,
  FileText,
  Gavel,
  History,
  Home,
  Puzzle,
  Settings,
  ShoppingBag,
  TrendingUp,
  Users,
  Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useProStatus } from "@/shared/hooks/useProStatus";

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

const dashboardMenuGroups: SidebarGroupData[] = [
  {
    label: "Visão Geral",
    items: [
      {
        title: "Dashboard",
        url: "/dashboard",
        icon: Home,
      },
      {
        title: "Analytics",
        url: "/analytics",
        icon: BarChart3,
      },
    ],
  },
  {
    label: "Precificação & Ferramentas",
    items: [
      {
        title: "Calculadoras",
        url: "/calculadoras",
        icon: Calculator,
        items: [
          {
            title: "Calculadora Rápida",
            url: "/calculadora-rapida",
            icon: Calculator,
          },
          {
            title: "Calculadora Avançada",
            url: "/calculadora-avancada",
            icon: TrendingUp,
          },
          {
            title: "Calculadora Tributária",
            url: "/calculadora-tributaria",
            icon: FileCheck,
          },
          {
            title: "Calculadora de Licitação",
            url: "/calculadora-licitacao",
            icon: Gavel,
          },
          {
            title: "Calculadora de Lotes",
            url: "/calculadora-lotes",
            icon: Zap,
          },
          {
            title: "Análise de Sensibilidade",
            url: "/analise-sensibilidade",
            icon: BarChart3,
          },
        ],
      },
      {
        title: "IA de Precificação",
        url: "/azuria-ia",
        icon: Brain,
        badge: "Beta",
      },
      {
        title: "Templates",
        url: "/templates",
        icon: FileText,
      },
    ],
  },
  {
    label: "Gestão de Vendas",
    items: [
      {
        title: "Marketplaces",
        url: "/marketplace",
        icon: ShoppingBag,
      },
      {
        title: "Licitações",
        url: "/dashboard-licitacoes",
        icon: Gavel,
      },
      {
        title: "Histórico",
        url: "/historico",
        icon: History,
      },
    ],
  },
  {
    label: "Sistema",
    items: [
      {
        title: "Integrações",
        url: "/integracoes",
        icon: Puzzle,
      },
      {
        title: "Colaboração",
        url: "/colaboracao",
        icon: Users,
        badge: "Novo",
      },
      {
        title: "Configurações",
        url: "/configuracoes",
        icon: Settings,
      },
    ],
  },
];

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

  return (
    <Sidebar>
      <SidebarHeader className="border-b border-sidebar-border">
        <div className="flex items-center gap-2 px-4 py-3">
          <div className="flex h-24 w-24 items-center justify-center">
            <img 
              src="/images/azuria-logo-official.png" 
              alt="Azuria" 
              className="h-full w-full object-contain"
            />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-semibold">Azuria</span>
            <span className="text-xs text-muted-foreground">Dashboard</span>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
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
          © 2024 Azuria. Todos os direitos reservados.
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
