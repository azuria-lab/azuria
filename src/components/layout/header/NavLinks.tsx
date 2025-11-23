
import { useMemo } from 'react';
import { BarChart3, Brain, Calculator, FileText, Gavel, History, Home, Puzzle, ShoppingBag, Users } from 'lucide-react';


export const navLinks = [
  { 
    to: "/", 
    label: "Início",
    path: "/",
    icon: <Home className="h-4 w-4" />,
    dataOnboarding: "home-button"
  },
  { 
    to: "/calculadora-simples", 
    label: "Calculadora",
    path: "/calculadora-simples",
    icon: <Calculator className="h-4 w-4" />,
    dataOnboarding: "calculator-button",
    subLinks: [
      {
        to: "/calculadora-simples",
        label: "Calculadora Básica",
        description: "Cálculo rápido de preços"
      },
      {
        to: "/calculadora-avancada",
        label: "Calculadora Avançada",
        description: "Análise detalhada de margens"
      },
      {
        to: "/calculadora-tributaria",
        label: "Calculadora Tributária",
        description: "Simples Nacional, Lucro Presumido e Real"
      },
      {
        to: "/calculadora-licitacao",
        label: "Calculadora de Licitação",
        description: "Cálculo de viabilidade para editais"
      }
    ]
  },
  { 
    to: "/templates", 
    label: "Templates",
    path: "/templates",
    icon: <FileText className="h-4 w-4" />,
    badge: "Novo",
    dataOnboarding: "templates-button"
  },
  { 
    to: "/azuria-ia", 
    label: "Azuria IA", 
    badge: "Beta",
    path: "/azuria-ia",
    icon: <Brain className="h-4 w-4" />,
    dataOnboarding: "azuria-ai-button"
  },
  { 
    to: "/dashboard-licitacoes", 
    label: "Licitação",
    path: "/dashboard-licitacoes",
    icon: <Gavel className="h-4 w-4" />,
    badge: "Novo",
    dataOnboarding: "bidding-button"
  },
  { 
    to: "/marketplace", 
    label: "Marketplace",
    path: "/marketplace",
    icon: <ShoppingBag className="h-4 w-4" />
  },
  { 
    to: "/analytics", 
    label: "Analytics",
    path: "/analytics",
    icon: <BarChart3 className="h-4 w-4" />,
    dataOnboarding: "analytics-button"
  },
  { 
    to: "/historico", 
    label: "Histórico",
    path: "/historico",
    icon: <History className="h-4 w-4" />
  },
  { 
    to: "/colaboracao", 
    label: "Colaboração",
    path: "/colaboracao",
    icon: <Users className="h-4 w-4" />,
    badge: "Novo"
  },
  { 
    to: "/integracoes", 
    label: "Integrações",
    path: "/integracoes",
    icon: <Puzzle className="h-4 w-4" />
  }
];

export const useFilteredNavLinks = (_isAuthenticated: boolean, _isPro: boolean) => {
  return useMemo(() => navLinks, []);
};
