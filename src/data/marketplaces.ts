export interface Marketplace {
  id: string;
  name: string;
  category: 'nacional' | 'internacional';
  region: string;
  status: 'integrated' | 'planned' | 'requested';
  logo?: string;
  description: string;
  website: string;
  popularityBrazil?: 'high' | 'medium' | 'low';
  fee: number; // Taxa percentual do marketplace
}

export const marketplaces: Marketplace[] = [
  // =========== JÁ INTEGRADOS ===========
  {
    id: "mercado-livre",
    name: "Mercado Livre",
    category: "nacional",
    region: "América Latina",
    status: "integrated",
    description: "Maior marketplace da América Latina",
    website: "https://mercadolivre.com.br",
    popularityBrazil: "high",
    fee: 11.0
  },
  {
    id: "amazon",
    name: "Amazon",
    category: "internacional", 
    region: "Global",
    status: "integrated",
    description: "Maior marketplace mundial",
    website: "https://amazon.com.br",
    popularityBrazil: "high",
    fee: 15.0
  },
  {
    id: "shopee",
    name: "Shopee",
    category: "internacional",
    region: "Sudeste Asiático/Brasil",
    status: "integrated", 
    description: "Marketplace asiático em expansão no Brasil",
    website: "https://shopee.com.br",
    popularityBrazil: "medium",
    fee: 7.5
  },

  // =========== BRASILEIROS/NACIONAIS - PRIORIDADE ALTA ===========
  {
    id: "magazine-luiza",
    name: "Magazine Luiza",
    category: "nacional",
    region: "Brasil",
    status: "planned",
    description: "Marketplace do Magalu, um dos maiores do Brasil",
    website: "https://magazineluiza.com.br",
    popularityBrazil: "high",
    fee: 12.0
  },
  {
    id: "americanas",
    name: "Americanas",
    category: "nacional", 
    region: "Brasil",
    status: "planned",
    description: "Tradicional varejista brasileiro com marketplace",
    website: "https://americanas.com.br",
    popularityBrazil: "high",
    fee: 13.0
  },
  {
    id: "casas-bahia",
    name: "Casas Bahia",
    category: "nacional",
    region: "Brasil", 
    status: "planned",
    description: "Marketplace do grupo Via Varejo",
    website: "https://casasbahia.com.br",
    popularityBrazil: "high",
    fee: 12.5
  },
  {
    id: "extra",
    name: "Extra",
    category: "nacional",
    region: "Brasil",
    status: "planned", 
    description: "Marketplace do grupo Pão de Açúcar",
    website: "https://extra.com.br",
    popularityBrazil: "medium",
    fee: 11.5
  },
  {
    id: "submarino",
    name: "Submarino",
    category: "nacional",
    region: "Brasil",
    status: "planned",
    description: "Marketplace tradicional brasileiro",
    website: "https://submarino.com.br", 
    popularityBrazil: "medium",
    fee: 12.0
  },
  {
    id: "carrefour",
    name: "Carrefour",
    category: "nacional",
    region: "Brasil",
    status: "planned",
    description: "Marketplace do Carrefour Brasil",
    website: "https://carrefour.com.br",
    popularityBrazil: "medium",
    fee: 10.0
  },

  // =========== ESPECIALIZADOS BRASILEIROS ===========
  {
    id: "netshoes",
    name: "Netshoes",
    category: "nacional",
    region: "Brasil",
    status: "planned",
    description: "Especializado em artigos esportivos",
    website: "https://netshoes.com.br",
    popularityBrazil: "medium",
    fee: 14.0
  },
  {
    id: "dafiti",
    name: "Dafiti",
    category: "nacional", 
    region: "Brasil",
    status: "planned",
    description: "Especializado em moda e lifestyle",
    website: "https://dafiti.com.br",
    popularityBrazil: "medium",
    fee: 13.5
  },
  {
    id: "zattini",
    name: "Zattini",
    category: "nacional",
    region: "Brasil",
    status: "planned",
    description: "Marketplace de moda do grupo Netshoes",
    website: "https://zattini.com.br",
    popularityBrazil: "medium",
    fee: 14.0
  },
  {
    id: "kanui",
    name: "Kanui",
    category: "nacional",
    region: "Brasil", 
    status: "planned",
    description: "Especializado em moda esportiva",
    website: "https://kanui.com.br",
    popularityBrazil: "low",
    fee: 13.0
  },

  // =========== INTERNACIONAIS - AMÉRICA LATINA ===========
  {
    id: "falabella",
    name: "Falabella",
    category: "internacional",
    region: "Chile/Colômbia",
    status: "requested",
    description: "Grande varejista sul-americano",
    website: "https://falabella.com",
    popularityBrazil: "low",
    fee: 16.0
  },
  {
    id: "linio",
    name: "Linio",
    category: "internacional",
    region: "México/América Latina",
    status: "requested", 
    description: "Marketplace latino-americano",
    website: "https://linio.com",
    popularityBrazil: "low",
    fee: 15.5
  },

  // =========== INTERNACIONAIS - GLOBAIS ===========
  {
    id: "ebay",
    name: "eBay",
    category: "internacional",
    region: "Global",
    status: "requested",
    description: "Marketplace de leilões e vendas globais",
    website: "https://ebay.com",
    popularityBrazil: "low",
    fee: 12.5
  },
  {
    id: "wish",
    name: "Wish",
    category: "internacional",
    region: "Global", 
    status: "requested",
    description: "Marketplace de produtos baratos",
    website: "https://wish.com",
    popularityBrazil: "low",
    fee: 10.0
  },
  {
    id: "aliexpress",
    name: "AliExpress", 
    category: "internacional",
    region: "China/Global",
    status: "requested",
    description: "Marketplace chinês do grupo Alibaba",
    website: "https://aliexpress.com",
    popularityBrazil: "medium",
    fee: 8.0
  },
  {
    id: "etsy",
    name: "Etsy",
    category: "internacional",
    region: "Global",
    status: "requested",
    description: "Marketplace de produtos artesanais e vintage",
    website: "https://etsy.com",
    popularityBrazil: "low",
    fee: 6.5
  },

  // =========== ESPECIALIZADOS INTERNACIONAIS ===========
  {
    id: "walmart",
    name: "Walmart Marketplace",
    category: "internacional", 
    region: "EUA/Global",
    status: "requested",
    description: "Marketplace do gigante varejista americano",
    website: "https://marketplace.walmart.com",
    popularityBrazil: "low",
    fee: 15.0
  },
  {
    id: "facebook",
    name: "Facebook Marketplace",
    category: "internacional",
    region: "Global",
    status: "requested",
    description: "Marketplace integrado ao Facebook",
    website: "https://facebook.com/marketplace",
    popularityBrazil: "medium",
    fee: 5.0
  },
  {
    id: "instagram",
    name: "Instagram Shopping",
    category: "internacional",
    region: "Global", 
    status: "requested",
    description: "Vendas através do Instagram",
    website: "https://business.instagram.com/shopping",
    popularityBrazil: "medium",
    fee: 5.0
  },

  // =========== B2B MARKETPLACES ===========
  {
    id: "alibaba",
    name: "Alibaba",
    category: "internacional",
    region: "China/Global",
    status: "requested",
    description: "Maior marketplace B2B mundial",
    website: "https://alibaba.com", 
    popularityBrazil: "medium",
    fee: 3.0
  },
  {
    id: "sieve",
    name: "Sieve", 
    category: "nacional",
    region: "Brasil",
    status: "requested",
    description: "Marketplace B2B brasileiro",
    website: "https://sieve.com.br",
    popularityBrazil: "low",
    fee: 4.0
  }
];

// Função helper para filtrar marketplaces
export const getMarketplacesByStatus = (status: Marketplace['status']) => {
  return marketplaces.filter(mp => mp.status === status);
};

export const getMarketplacesByCategory = (category: Marketplace['category']) => {
  return marketplaces.filter(mp => mp.category === category);
};

export const getMarketplacesByPopularity = (popularity: Marketplace['popularityBrazil']) => {
  return marketplaces.filter(mp => mp.popularityBrazil === popularity);
};

// Estatísticas
export const marketplaceStats = {
  total: marketplaces.length,
  integrated: getMarketplacesByStatus('integrated').length,
  planned: getMarketplacesByStatus('planned').length, 
  requested: getMarketplacesByStatus('requested').length,
  national: getMarketplacesByCategory('nacional').length,
  international: getMarketplacesByCategory('internacional').length,
  highPriority: getMarketplacesByPopularity('high').length
};