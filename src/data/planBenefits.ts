export interface PlanBenefit {
  id: string;
  name: string;
  description: string;
  price: string;
  period: string;
  features: string[];
  limitations?: string[];
  popular?: boolean;
  color: string;
  ctaText: string;
  ctaLink: string;
}

export const planBenefits: PlanBenefit[] = [
  {
    id: "free",
    name: "FREE",
    description: "Perfeito para começar e testar a ferramenta",
    price: "Grátis",
    period: "para sempre",
    features: [
      "Calculadora rápida de preços",
      "Até 10 cálculos por dia",
      "Impostos básicos (Simples Nacional)",
      "Taxas de marketplace principais",
      "Histórico de 7 dias",
      "Suporte por email"
    ],
    limitations: [
      "Limitado a 10 cálculos por dia",
      "Sem análise de concorrentes",
      "Sem templates avançados",
      "Histórico limitado"
    ],
    popular: false,
    color: "gray",
    ctaText: "Começar Grátis",
    ctaLink: "/calculadora-rapida"
  },
  {
    id: "pro",
    name: "PRO",
    description: "Para lojistas sérios que querem maximizar lucros",
    price: "R$ 29,90",
    period: "/mês",
    features: [
      "Tudo do FREE +",
      "Cálculos ILIMITADOS",
      "Calculadora PRO com IA",
      "Análise de concorrentes automática",
      "Templates de marketplace premium",
      "Simulador de cenários",
      "Histórico completo e relatórios",
      "Exportação de dados (PDF/Excel)",
      "Alertas de preço automáticos",
      "Suporte prioritário"
    ],
    popular: true,
    color: "brand",
    ctaText: "Começar Trial Grátis",
    ctaLink: "/planos"
  },
  {
    id: "premium",
    name: "PREMIUM",
    description: "Para equipes e empresas com múltiplos produtos",
    price: "R$ 79,90",
    period: "/mês",
    features: [
      "Tudo do PRO +",
      "Automação completa de preços",
      "API para integrações",
      "Analytics avançadas com BI",
      "Equipes colaborativas (até 5 usuários)",
      "Templates personalizados ilimitados",
      "Relatórios customizados",
      "Integração com ERPs",
      "Consultoria em precificação",
      "Suporte dedicado 24/7"
    ],
    popular: false,
    color: "purple",
    ctaText: "Assinar Agora",
    ctaLink: "/planos"
  }
];

export const freeVsProComparison = {
  title: "Por que fazer upgrade para PRO?",
  subtitle: "Veja o que você ganha ao evoluir seu plano",
  comparisons: [
    {
      feature: "Cálculos por dia",
      free: "10 cálculos",
      pro: "ILIMITADOS",
      highlight: true
    },
    {
      feature: "Análise de concorrentes",
      free: "❌ Não disponível",
      pro: "✅ Automática em tempo real",
      highlight: true
    },
    {
      feature: "Simulador de cenários",
      free: "❌ Não disponível",
      pro: "✅ Múltiplos cenários",
      highlight: false
    },
    {
      feature: "Templates premium",
      free: "❌ Apenas básicos",
      pro: "✅ Todos os marketplaces",
      highlight: false
    },
    {
      feature: "Histórico",
      free: "7 dias",
      pro: "Completo + Relatórios",
      highlight: false
    },
    {
      feature: "Suporte",
      free: "Email (48h)",
      pro: "Prioritário (2h)",
      highlight: false
    }
  ]
};

export const planFAQ = [
  {
    question: "Posso cancelar a qualquer momento?",
    answer: "Sim! Você pode cancelar sua assinatura a qualquer momento sem taxas ou penalidades. Terá acesso aos recursos até o final do período pago."
  },
  {
    question: "Como funciona o trial gratuito de 7 dias?",
    answer: "Durante 7 dias você tem acesso completo ao plano PRO. Não cobramos nada no cartão durante o trial. Após 7 dias, se não cancelar, a cobrança será iniciada."
  },
  {
    question: "Posso mudar de plano depois?",
    answer: "Claro! Você pode fazer upgrade ou downgrade do seu plano a qualquer momento. As mudanças são aplicadas imediatamente."
  },
  {
    question: "Os dados da calculadora FREE são mantidos no PRO?",
    answer: "Sim! Todos os seus cálculos e configurações são mantidos quando você faz upgrade para o PRO."
  },
  {
    question: "Há desconto para pagamento anual?",
    answer: "Sim! Pagando anualmente você economiza 20% (2 meses grátis). PRO sai por R$ 287,00/ano ao invés de R$ 358,80."
  }
];
