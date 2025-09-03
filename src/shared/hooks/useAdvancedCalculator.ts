
// Re-export from new domain location
export { useAdvancedCalculator } from '@/domains/calculator/hooks/useAdvancedCalculator';
export type { TaxRegime, AdvancedCalculationResult } from '@/domains/calculator/types/advanced';

// Legacy exports for backward compatibility
export { marketplaces } from '@/data/marketplaces';
export const taxRegimes = [
  {
    id: "simples_comercio",
    name: "Simples Nacional - Comércio",
    description: "Anexo I - Comércio de produtos e mercadorias",
    category: "simples",
    annexo: "I",
    faturamentoLimite: 4800000,
    rates: { irpj: 0, csll: 0, pis: 0, cofins: 0, icms: 4.0, cpp: 2.75 },
    applicableActivities: ["comércio", "revenda", "varejo"]
  }
];
