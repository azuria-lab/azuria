
import { useMemo } from 'react';
import { BarChart3, Brain, Calculator, FileText, Home, Puzzle, ShoppingBag, Target, Users, Zap } from 'lucide-react';

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
        description: "🏛️ Calcule preços para licitações públicas e privadas"
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
    to: "/calculadora-lotes-inteligente", 
    label: "Lote IA", 
    badge: "Novo",
    path: "/calculadora-lotes-inteligente",
    icon: <Zap className="h-4 w-4" />,
    dataOnboarding: "ai-batch-button"
  },
  { 
    to: "/ia", 
    label: "IA Preços", 
    badge: "Pro",
    path: "/ia",
    icon: <Brain className="h-4 w-4" />,
    dataOnboarding: "ai-pricing-button"
  },
  { 
    to: "/analise-concorrencia", 
    label: "Competitividade",
    path: "/analise-concorrencia",
    icon: <Target className="h-4 w-4" />,
    badge: "Novo",
    dataOnboarding: "competition-button"
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
    to: "/dashboard-licitacoes", 
    label: "Licitações",
    path: "/dashboard-licitacoes",
    icon: <FileText className="h-4 w-4" />,
    badge: "Novo"
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
