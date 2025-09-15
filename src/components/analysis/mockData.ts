export interface CompetitorMock {
  id: string;
  store: string;
  price: number;
  marketplace: string;
  productUrl: string;
  productType: "Original" | "Similar" | "Genérico";
  isCheapest?: boolean;
  isRecommended?: boolean;
}

export const mockCompetitors: CompetitorMock[] = [
  {
    id: "1",
    store: "TopEletro Store",
    price: 24.90,
    marketplace: "Mercado Livre",
    productUrl: "https://www.mercadolivre.com.br/produto-exemplo",
    productType: "Original",
    isCheapest: true
  },
  {
    id: "2",
    store: "Rei das Peças",
    price: 29.50,
    marketplace: "Shopee",
    productUrl: "https://www.shopee.com.br/produto-exemplo",
    productType: "Original"
  },
  {
    id: "3",
    store: "Loja do Reparador",
    price: 27.90,
    marketplace: "Amazon",
    productUrl: "https://www.amazon.com.br/produto-exemplo",
    productType: "Original",
    isRecommended: true
  },
  {
    id: "4",
    store: "Peças & Cia",
    price: 21.50,
    marketplace: "Mercado Livre",
    productUrl: "https://www.mercadolivre.com.br/produto-exemplo-2",
    productType: "Similar"
  },
  {
    id: "5",
    store: "Casa dos Componentes",
    price: 19.90,
    marketplace: "Shopee",
    productUrl: "https://www.shopee.com.br/produto-exemplo-2",
    productType: "Genérico"
  }
];
