
import React from "react";
import { 
  BarChart2, 
  Brain, 
  Calculator, 
  ChartBar,
  CircleDollarSign,
  FileText,
  FileUp,
  Package2,
  ShoppingBag,
  Thermometer,
  Users,
  Zap
} from "lucide-react";
import { FeatureItem } from "@/components/home/FeatureCard";

// Feature cards for the dashboard
export const features: FeatureItem[] = [
  {
    title: "Calculadora Rápida",
    description: "Cálculo rápido de custo, impostos de NF e taxas de maquininha",
    icon: <Calculator className="w-10 h-10 text-brand-600" />,
    link: "/calculadora-rapida",
    available: true
  },
  {
    title: "Calculadora Avançada",
    description: "Análise completa com regimes tributários e custos de marketplace",
    icon: <CircleDollarSign className="w-10 h-10 text-brand-600" />,
    link: "/calculadora-avancada",
    available: true
  },
  {
    title: "Calculadora Tributária",
    description: "Compare regimes tributários brasileiros: Simples, MEI, Lucro Presumido e Real",
    icon: <FileText className="w-10 h-10 text-brand-600" />,
    link: "/calculadora-tributaria",
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
  }
];
