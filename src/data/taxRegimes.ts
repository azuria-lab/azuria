/**
 * Tax Regimes Data for Brazil (2025)
 * Simples Nacional, MEI, Lucro Presumido, Lucro Real
 * 
 * Note: Zero fractions (e.g., 4.0, 71.60) are intentionally preserved
 * for clarity and alignment with official tax tables.
 */

 

// Simples Nacional - Anexos e Faixas
export interface SimplesNacionalFaixa {
  faixa: number;
  revenueFrom: number;
  revenueTo: number;
  aliquota: number;
  deducao: number;
}

export interface SimplesNacionalAnexo {
  id: string;
  name: string;
  description: string;
  icon: string;
  activities: string[];
  faixas: SimplesNacionalFaixa[];
  impostos: {
    irpj: boolean;
    csll: boolean;
    cofins: boolean;
    pis: boolean;
    cpp: boolean;
    icms: boolean;
    iss: boolean;
    ipi: boolean;
  };
}

// Anexo I - Comércio
export const ANEXO_I: SimplesNacionalAnexo = {
  id: 'anexo_1',
  name: 'Anexo I - Comércio',
  description: 'Atividades de comércio em geral',
  icon: '🛒',
  activities: [
    'Comércio varejista',
    'Comércio atacadista',
    'Revenda de mercadorias',
  ],
  faixas: [
    { faixa: 1, revenueFrom: 0, revenueTo: 180000, aliquota: 4.0, deducao: 0 },
    { faixa: 2, revenueFrom: 180000, revenueTo: 360000, aliquota: 7.3, deducao: 5940 },
    { faixa: 3, revenueFrom: 360000, revenueTo: 720000, aliquota: 9.5, deducao: 13860 },
    { faixa: 4, revenueFrom: 720000, revenueTo: 1800000, aliquota: 10.7, deducao: 22500 },
    { faixa: 5, revenueFrom: 1800000, revenueTo: 3600000, aliquota: 14.3, deducao: 87300 },
    { faixa: 6, revenueFrom: 3600000, revenueTo: 4800000, aliquota: 19.0, deducao: 378000 },
  ],
  impostos: {
    irpj: true,
    csll: true,
    cofins: true,
    pis: true,
    cpp: true,
    icms: true,
    iss: false,
    ipi: false,
  },
};

// Anexo II - Indústria
export const ANEXO_II: SimplesNacionalAnexo = {
  id: 'anexo_2',
  name: 'Anexo II - Indústria',
  description: 'Atividades industriais e equiparadas',
  icon: '🏭',
  activities: [
    'Fabricação de produtos',
    'Industrialização',
    'Transformação de matéria-prima',
  ],
  faixas: [
    { faixa: 1, revenueFrom: 0, revenueTo: 180000, aliquota: 4.5, deducao: 0 },
    { faixa: 2, revenueFrom: 180000, revenueTo: 360000, aliquota: 7.8, deducao: 5940 },
    { faixa: 3, revenueFrom: 360000, revenueTo: 720000, aliquota: 10.0, deducao: 13860 },
    { faixa: 4, revenueFrom: 720000, revenueTo: 1800000, aliquota: 11.2, deducao: 22500 },
    { faixa: 5, revenueFrom: 1800000, revenueTo: 3600000, aliquota: 14.7, deducao: 85500 },
    { faixa: 6, revenueFrom: 3600000, revenueTo: 4800000, aliquota: 30.0, deducao: 720000 },
  ],
  impostos: {
    irpj: true,
    csll: true,
    cofins: true,
    pis: true,
    cpp: true,
    icms: true,
    iss: false,
    ipi: true,
  },
};

// Anexo III - Serviços (com ISS)
export const ANEXO_III: SimplesNacionalAnexo = {
  id: 'anexo_3',
  name: 'Anexo III - Serviços',
  description: 'Prestação de serviços com ISS',
  icon: '🔧',
  activities: [
    'Serviços de instalação',
    'Serviços de reparos',
    'Agências de viagens',
    'Escritórios de contabilidade',
  ],
  faixas: [
    { faixa: 1, revenueFrom: 0, revenueTo: 180000, aliquota: 6.0, deducao: 0 },
    { faixa: 2, revenueFrom: 180000, revenueTo: 360000, aliquota: 11.2, deducao: 9360 },
    { faixa: 3, revenueFrom: 360000, revenueTo: 720000, aliquota: 13.5, deducao: 17640 },
    { faixa: 4, revenueFrom: 720000, revenueTo: 1800000, aliquota: 16.0, deducao: 35640 },
    { faixa: 5, revenueFrom: 1800000, revenueTo: 3600000, aliquota: 21.0, deducao: 125640 },
    { faixa: 6, revenueFrom: 3600000, revenueTo: 4800000, aliquota: 33.0, deducao: 648000 },
  ],
  impostos: {
    irpj: true,
    csll: true,
    cofins: true,
    pis: true,
    cpp: true,
    icms: false,
    iss: true,
    ipi: false,
  },
};

// Anexo IV - Serviços (tributação específica)
export const ANEXO_IV: SimplesNacionalAnexo = {
  id: 'anexo_4',
  name: 'Anexo IV - Serviços Específicos',
  description: 'Serviços de construção civil, vigilância, limpeza',
  icon: '🏗️',
  activities: [
    'Construção civil',
    'Serviços de vigilância',
    'Serviços de limpeza',
    'Obras e reformas',
  ],
  faixas: [
    { faixa: 1, revenueFrom: 0, revenueTo: 180000, aliquota: 4.5, deducao: 0 },
    { faixa: 2, revenueFrom: 180000, revenueTo: 360000, aliquota: 9.0, deducao: 8100 },
    { faixa: 3, revenueFrom: 360000, revenueTo: 720000, aliquota: 10.2, deducao: 12420 },
    { faixa: 4, revenueFrom: 720000, revenueTo: 1800000, aliquota: 14.0, deducao: 39780 },
    { faixa: 5, revenueFrom: 1800000, revenueTo: 3600000, aliquota: 22.0, deducao: 183780 },
    { faixa: 6, revenueFrom: 3600000, revenueTo: 4800000, aliquota: 33.0, deducao: 828000 },
  ],
  impostos: {
    irpj: true,
    csll: true,
    cofins: true,
    pis: true,
    cpp: false,
    icms: false,
    iss: true,
    ipi: false,
  },
};

// Anexo V - Serviços (intelectuais, técnicos)
export const ANEXO_V: SimplesNacionalAnexo = {
  id: 'anexo_5',
  name: 'Anexo V - Serviços Intelectuais',
  description: 'Serviços de advocacia, engenharia, consultoria, medicina',
  icon: '💼',
  activities: [
    'Advocacia',
    'Engenharia',
    'Medicina',
    'Odontologia',
    'Consultoria',
    'Publicidade',
    'Jornalismo',
    'Tecnologia',
  ],
  faixas: [
    { faixa: 1, revenueFrom: 0, revenueTo: 180000, aliquota: 15.5, deducao: 0 },
    { faixa: 2, revenueFrom: 180000, revenueTo: 360000, aliquota: 18.0, deducao: 4500 },
    { faixa: 3, revenueFrom: 360000, revenueTo: 720000, aliquota: 19.5, deducao: 9900 },
    { faixa: 4, revenueFrom: 720000, revenueTo: 1800000, aliquota: 20.5, deducao: 17100 },
    { faixa: 5, revenueFrom: 1800000, revenueTo: 3600000, aliquota: 23.0, deducao: 62100 },
    { faixa: 6, revenueFrom: 3600000, revenueTo: 4800000, aliquota: 30.5, deducao: 540000 },
  ],
  impostos: {
    irpj: true,
    csll: true,
    cofins: true,
    pis: true,
    cpp: true,
    icms: false,
    iss: true,
    ipi: false,
  },
};

export const SIMPLES_NACIONAL_ANEXOS = [
  ANEXO_I,
  ANEXO_II,
  ANEXO_III,
  ANEXO_IV,
  ANEXO_V,
];

// MEI - Microempreendedor Individual
export interface MEIData {
  id: string;
  name: string;
  description: string;
  icon: string;
  revenueLimit: number;
  monthlyTax: {
    comercio: number;
    servicos: number;
    comercioServicos: number;
  };
  benefits: string[];
}

export const MEI_DATA: MEIData = {
  id: 'mei',
  name: 'MEI - Microempreendedor Individual',
  description: 'Para faturamento até R$ 81.000,00/ano',
  icon: '👤',
  revenueLimit: 81000,
  monthlyTax: {
    comercio: 71.60,      // INSS (5%) + ICMS (R$ 1,00)
    servicos: 75.60,      // INSS (5%) + ISS (R$ 5,00)
    comercioServicos: 76.60, // INSS (5%) + ICMS (R$ 1,00) + ISS (R$ 5,00)
  },
  benefits: [
    'Aposentadoria por idade',
    'Aposentadoria por invalidez',
    'Auxílio-doença',
    'Salário-maternidade',
    'Pensão por morte',
  ],
};

// Lucro Presumido
export interface LucroPresumidoData {
  id: string;
  name: string;
  description: string;
  icon: string;
  revenueLimit: number;
  presumedProfitMargin: {
    comercio: number;
    servicos: number;
    industria: number;
  };
  taxes: {
    irpj: number;
    irpjAdditional: number; // Adicional sobre lucro > 20k/mês
    csll: number;
    pis: number;
    cofins: number;
  };
}

export const LUCRO_PRESUMIDO_DATA: LucroPresumidoData = {
  id: 'lucro_presumido',
  name: 'Lucro Presumido',
  description: 'Para faturamento até R$ 78 milhões/ano',
  icon: '📊',
  revenueLimit: 78000000,
  presumedProfitMargin: {
    comercio: 8,    // 8% da receita bruta
    servicos: 32,   // 32% da receita bruta
    industria: 8,   // 8% da receita bruta
  },
  taxes: {
    irpj: 15,              // 15% sobre lucro presumido
    irpjAdditional: 10,    // 10% sobre lucro > R$ 20.000/mês
    csll: 9,               // 9% sobre lucro presumido
    pis: 0.65,             // 0,65% sobre receita bruta
    cofins: 3.0,           // 3% sobre receita bruta
  },
};

// Lucro Real
export interface LucroRealData {
  id: string;
  name: string;
  description: string;
  icon: string;
  mandatoryFor: string[];
  taxes: {
    irpj: number;
    irpjAdditional: number;
    csll: number;
    pis: number;
    cofins: number;
  };
}

export const LUCRO_REAL_DATA: LucroRealData = {
  id: 'lucro_real',
  name: 'Lucro Real',
  description: 'Tributação sobre lucro contábil efetivo',
  icon: '📈',
  mandatoryFor: [
    'Receita bruta > R$ 78 milhões/ano',
    'Instituições financeiras',
    'Factoring',
    'Empresas com lucros no exterior',
  ],
  taxes: {
    irpj: 15,
    irpjAdditional: 10,
    csll: 9,
    pis: 1.65,
    cofins: 7.6,
  },
};

// Business Types
export interface BusinessType {
  id: string;
  name: string;
  icon: string;
  description: string;
  recommendedRegimes: string[];
}

export const BUSINESS_TYPES: BusinessType[] = [
  {
    id: 'comercio',
    name: 'Comércio',
    icon: '🛒',
    description: 'Compra e venda de mercadorias',
    recommendedRegimes: ['mei', 'anexo_1', 'lucro_presumido'],
  },
  {
    id: 'industria',
    name: 'Indústria',
    icon: '🏭',
    description: 'Fabricação e transformação de produtos',
    recommendedRegimes: ['anexo_2', 'lucro_presumido', 'lucro_real'],
  },
  {
    id: 'servicos',
    name: 'Serviços',
    icon: '🔧',
    description: 'Prestação de serviços em geral',
    recommendedRegimes: ['mei', 'anexo_3', 'anexo_4', 'lucro_presumido'],
  },
  {
    id: 'servicos_intelectuais',
    name: 'Serviços Intelectuais',
    icon: '💼',
    description: 'Consultoria, tecnologia, advocacia, medicina',
    recommendedRegimes: ['anexo_5', 'lucro_presumido'],
  },
];

// Helper function to get anexo by ID
export const getAnexoById = (id: string): SimplesNacionalAnexo | null => {
  return SIMPLES_NACIONAL_ANEXOS.find(anexo => anexo.id === id) || null;
};

// Helper function to get business type by ID
export const getBusinessTypeById = (id: string): BusinessType | null => {
  return BUSINESS_TYPES.find(type => type.id === id) || null;
};
