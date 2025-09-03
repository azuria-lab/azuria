
import { useCallback, useState } from "react";
import { toast } from "@/components/ui/use-toast";

interface MarketplaceProduct {
  title: string;
  price: number;
  rating: number;
  reviews: number;
  seller: string;
  url: string;
  imageUrl?: string;
}

interface MarketplaceAPIResponse {
  products: MarketplaceProduct[];
  avgPrice: number;
  minPrice: number;
  maxPrice: number;
  totalResults: number;
}

export const useMarketplaceAPI = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState<MarketplaceAPIResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const searchProducts = useCallback(async (query: string, marketplace: string = "all") => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Simulação de API real - em produção, conectaria com APIs dos marketplaces
      // Por questões de CORS e limitações das APIs, simulamos dados realistas
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simula delay da API
      
      const mockData = generateMockMarketplaceData(query, marketplace);
      setData(mockData);
      
      toast.success(`Encontrados ${mockData.totalResults} produtos para "${query}"`);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Erro ao buscar produtos";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getSuggestedPrice = useCallback((cost: number, targetMargin: number): number => {
    if (!data) {return 0;}
    
    const marketPrice = data.avgPrice;
    const costBasedPrice = cost * (1 + targetMargin / 100);
    
    // Estratégia inteligente: 5% abaixo da média do mercado ou preço baseado em custo
    const competitivePrice = marketPrice * 0.95;
    
    return Math.max(costBasedPrice, competitivePrice);
  }, [data]);

  return {
    searchProducts,
    getSuggestedPrice,
    isLoading,
    data,
    error
  };
};

// Função para gerar dados mock realistas
function generateMockMarketplaceData(query: string, marketplace: string): MarketplaceAPIResponse {
  const basePrice = Math.random() * 200 + 50; // R$ 50-250
  const variation = 0.3; // 30% de variação
  
  const products: MarketplaceProduct[] = Array.from({ length: 12 }, (_, i) => {
    const priceVariation = (Math.random() - 0.5) * variation;
    const price = basePrice * (1 + priceVariation);
    
    return {
      title: `${query} - Modelo ${i + 1}`,
      price: Math.round(price * 100) / 100,
      rating: Math.round((Math.random() * 2 + 3) * 10) / 10, // 3.0-5.0
      reviews: Math.floor(Math.random() * 500 + 10),
      seller: `Loja ${String.fromCharCode(65 + i)}`,
      url: `https://example.com/produto-${i + 1}`,
      imageUrl: `https://images.unsplash.com/400x300/?sig=${i}`
    };
  });

  const prices = products.map(p => p.price);
  
  return {
    products,
    avgPrice: Math.round((prices.reduce((a, b) => a + b, 0) / prices.length) * 100) / 100,
    minPrice: Math.round(Math.min(...prices) * 100) / 100,
    maxPrice: Math.round(Math.max(...prices) * 100) / 100,
    totalResults: Math.floor(Math.random() * 500 + 100)
  };
}
