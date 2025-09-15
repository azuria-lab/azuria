
import React from "react";
import { 
  BarChart2, 
  Brain, 
  Calculator, 
  ChartBar,
  CircleDollarSign,
  FileUp,
  Package2,
  Search,
  ShoppingBag,
  Thermometer,
  Users,
  Zap
} from "lucide-react";
import { FeatureItem } from "@/components/home/FeatureCard";

// Feature cards for the dashboard
export const features: FeatureItem[] = [
  {
    title: "Calculadora Simples",
    description: "Cálculo rápido de preços de venda para seus produtos",
    icon: <Calculator className="w-10 h-10 text-brand-600" />,
    link: "/calculadora-simples",
    available: true
  },
  {
    title: "Lote Inteligente + IA",
    description: "Precificação em lote com IA, análise competitiva e cenários",
    icon: <div className="relative">
      <Package2 className="w-10 h-10 text-brand-600" />
      <Zap className="w-4 h-4 text-yellow-500 absolute -top-1 -right-1" />
    </div>,
    link: "/calculadora-lotes-inteligente",
    available: true
  },
  {
    title: "Calculadora PRO",
    description: "Cálculos avançados com marketplaces e mais detalhes",
    icon: <CircleDollarSign className="w-10 h-10 text-brand-600" />,
    link: "/calculadora-pro",
    available: true
  },
  {
    title: "IA para Preços",
    description: "Inteligência artificial para otimização de preços",
    icon: <Brain className="w-10 h-10 text-brand-600" />,
    link: "/ia",
    available: true
  },
  {
    title: "Análise de Rentabilidade",
    description: "Dashboard com gráficos e métricas por produto/categoria",
    icon: <ChartBar className="w-10 h-10 text-brand-600" />,
    link: "/analise-rentabilidade",
    available: true
  },
  {
    title: "Calculadora de Lotes",
    description: "Estime custos e preços para diferentes quantidades",
    icon: <Package2 className="w-10 h-10 text-brand-600" />,
    link: "/calculadora-lotes",
    available: true
  },
  {
    title: "Cenários de Precificação",
    description: "Simule diferentes margens e condições de vendas",
    icon: <BarChart2 className="w-10 h-10 text-brand-600" />,
    link: "/cenarios",
    available: true
  },
  {
    title: "Importação em Massa",
    description: "Importe e calcule preços para múltiplos produtos",
    icon: <FileUp className="w-10 h-10 text-brand-600" />,
    link: "/importacao",
    available: true
  },
  {
    title: "Análise de Concorrência",
    description: "Compare seus preços com os concorrentes",
    icon: <Users className="w-10 h-10 text-brand-600" />,
    link: "/analise-concorrencia",
    available: true
  },
  {
    title: "Marketplace",
    description: "Consulte preços médios de produtos similares",
    icon: <ShoppingBag className="w-10 h-10 text-brand-600" />,
    link: "/marketplace",
    available: true
  },
  {
    title: "Análise de Sensibilidade",
    description: "Entenda o impacto de diferentes variáveis no preço",
    icon: <Thermometer className="w-10 h-10 text-brand-600" />,
    link: "/analise-sensibilidade",
    available: true
  },
  {
    title: "Preferências",
    description: "Configure seu perfil e preferências de cálculo",
    icon: <Search className="w-10 h-10 text-brand-600" />,
    link: "/configuracoes",
    available: true
  }
];
