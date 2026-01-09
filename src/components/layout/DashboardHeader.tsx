import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { useSidebar } from "@/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import UserProfileButton from "@/components/auth/UserProfileButton";
import SmartNotificationCenter from "@/components/notifications/SmartNotificationCenter";
import { useAuthContext } from "@/domains/auth";
import {
  BarChart3,
  Brain,
  Calculator,
  ChevronDown,
  FileText,
  Gauge,
  Gavel,
  HelpCircle,
  Home,
  Package2,
  Puzzle,
  Scale,
  Search,
  Settings,
  ShoppingBag,
  Thermometer,
} from "lucide-react";

export default function DashboardHeader() {
  const authContext = useAuthContext();
  const userProfile = authContext?.userProfile;
  const navigate = useNavigate();
  const [searchOpen, setSearchOpen] = useState(false);
  const { state: _state } = useSidebar();

  // Menu de funcionalidades
  const functionalMenus = [
    {
      label: "Precificação",
      items: [
        { label: "Calculadora Rápida", icon: Gauge, path: "/calculadora-rapida" },
        { label: "Calculadora Avançada", icon: Calculator, path: "/calculadora-avancada" },
        { label: "Calculadora Tributária", icon: Scale, path: "/calculadora-tributaria" },
        { label: "Calculadora de Licitações", icon: Gavel, path: "/calculadora-licitacao" },
        { label: "Calculadora de Lotes", icon: Package2, path: "/calculadora-lotes" },
        { label: "Análise de Sensibilidade", icon: Thermometer, path: "/analise-sensibilidade" },
      ],
    },
  ];

  // Itens de busca rápida
  const searchItems = [
    { label: "Dashboard", path: "/dashboard", icon: Home },
    { label: "Calculadora Rápida", path: "/calculadora-rapida", icon: Gauge },
    { label: "Azuria AI", path: "/azuria-ia", icon: Brain },
    { label: "Sistema Cognitivo", path: "/sistema-cognitivo", icon: Brain },
    { label: "Analytics", path: "/analytics", icon: BarChart3 },
    { label: "Marketplaces", path: "/marketplace", icon: ShoppingBag },
    { label: "Configurações", path: "/configuracoes", icon: Settings },
  ];

  return (
    <>
      <header className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-3 border-b bg-background px-4">
        {/* Botão Voltar para Início com Logo - CÍRCULO VERMELHO */}
        <Link to="/dashboard" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
          <div className="h-16 w-16 flex items-center justify-center">
            <img
              src="/images/azuria-logo-official.png"
              alt="Azuria"
              className="h-full w-full object-contain"
            />
          </div>
        </Link>

      <Separator orientation="vertical" className="h-6" />

        {/* Menu de Funcionalidades - CÍRCULO AMARELO */}
        <div className="flex items-center gap-1">
          {/* Meu Negócio - Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="h-9 px-3 text-sm font-medium hover:bg-accent"
              >
                Meu Negócio
                <ChevronDown className="ml-1 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-56">
              <DropdownMenuLabel>Meu Negócio</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <DropdownMenuItem
                  onClick={() => navigate("/produtos")}
                  className="cursor-pointer"
                >
                  <Package2 className="mr-2 h-4 w-4" />
                  Produtos
                </DropdownMenuItem>
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
          
          {/* Precificação - Dropdown */}
          {functionalMenus.map((menu) => (
            <DropdownMenu key={menu.label}>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="h-9 px-3 text-sm font-medium hover:bg-accent"
                >
                  {menu.label}
                  <ChevronDown className="ml-1 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-56">
                <DropdownMenuLabel>{menu.label}</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                  {menu.items.map((item) => {
                    const Icon = item.icon;
                    return (
                      <DropdownMenuItem
                        key={item.path}
                        onClick={() => navigate(item.path)}
                        className="cursor-pointer"
                      >
                        <Icon className="mr-2 h-4 w-4" />
                        {item.label}
                      </DropdownMenuItem>
                    );
                  })}
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          ))}
          
          {/* Templates - Botão único */}
          <Button
            variant="ghost"
            className="h-9 px-3 text-sm font-medium hover:bg-accent"
            onClick={() => navigate("/templates")}
          >
            <FileText className="mr-2 h-4 w-4" />
            Templates
          </Button>

          {/* Marketplaces - Botão único */}
          <Button
            variant="ghost"
            className="h-9 px-3 text-sm font-medium hover:bg-accent"
            onClick={() => navigate("/marketplace")}
          >
            <ShoppingBag className="mr-2 h-4 w-4" />
            Marketplaces
          </Button>

          {/* Licitações - Botão único */}
          <Button
            variant="ghost"
            className="h-9 px-3 text-sm font-medium hover:bg-accent"
            onClick={() => navigate("/dashboard-licitacoes")}
          >
            <Gavel className="mr-2 h-4 w-4" />
            Licitações
          </Button>

          {/* Azuria AI - Botão único */}
          <Button
            variant="ghost"
            className="h-9 px-3 text-sm font-medium hover:bg-accent"
            onClick={() => navigate("/azuria-ia")}
          >
            <Brain className="mr-2 h-4 w-4" />
            Azuria AI
          </Button>
        </div>

        <div className="flex-1" />

        {/* Barra de Pesquisa Rápida - CÍRCULO ROXO - À direita */}
        <Button
          variant="outline"
          className="relative h-9 w-full max-w-sm justify-start text-sm text-muted-foreground sm:pr-12"
          onClick={() => setSearchOpen(true)}
        >
          <Search className="mr-2 h-4 w-4" />
          <span>Pesquisar</span>
          <kbd className="pointer-events-none absolute right-1.5 top-1.5 hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex">
            <span className="text-xs">⌘</span>K
          </kbd>
        </Button>

        {/* Botões do Header Direito - CÍRCULO VERDE ESCURO */}
        <div className="flex items-center gap-1">
          {/* Integrações */}
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9"
            onClick={() => navigate("/integracoes")}
            title="Integrações"
          >
            <Puzzle className="h-5 w-5" />
          </Button>

          {/* Notificações */}
        {userProfile && <SmartNotificationCenter />}

          {/* Ticket e Ajuda */}
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9"
            onClick={() => navigate("/ajuda")}
            title="Ticket e Ajuda"
          >
            <HelpCircle className="h-5 w-5" />
          </Button>

          {/* Meu Perfil */}
        {userProfile && <UserProfileButton />}
      </div>
    </header>

      {/* Command Dialog para Pesquisa Rápida */}
      <CommandDialog open={searchOpen} onOpenChange={setSearchOpen}>
        <CommandInput placeholder="Pesquisar funcionalidades..." />
        <CommandList>
          <CommandEmpty>Nenhum resultado encontrado.</CommandEmpty>
          <CommandGroup heading="Navegação Rápida">
            {searchItems.map((item) => {
              const Icon = item.icon;
              return (
                <CommandItem
                  key={item.path}
                  onSelect={() => {
                    navigate(item.path);
                    setSearchOpen(false);
                  }}
                  className="cursor-pointer"
                >
                  <Icon className="mr-2 h-4 w-4" />
                  {item.label}
                </CommandItem>
              );
            })}
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  );
}

