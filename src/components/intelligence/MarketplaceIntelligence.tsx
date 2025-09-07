
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ExternalLink, Search, Star, Target, TrendingUp } from "lucide-react";
import { useMarketplaceAPI } from "@/hooks/useMarketplaceAPI";
import LoadingState from "@/components/calculators/LoadingState";

interface MarketplaceIntelligenceProps {
  productName?: string;
  onPriceSuggestion?: (price: number) => void;
}

export default function MarketplaceIntelligence({ 
  productName = "", 
  onPriceSuggestion 
}: MarketplaceIntelligenceProps) {
  const [searchQuery, setSearchQuery] = useState(productName);
  const { searchProducts, getSuggestedPrice, isLoading, data, error } = useMarketplaceAPI();

  const handleSearch = () => {
    if (searchQuery.trim()) {
      searchProducts(searchQuery.trim());
    }
  };

  const handleUseSuggestion = () => {
    if (data && onPriceSuggestion) {
      const suggestedPrice = getSuggestedPrice(100, 30); // Exemplo com custo R$100 e margem 30%
      onPriceSuggestion(suggestedPrice);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-brand-600" />
          Marketplace Intelligence
        </CardTitle>
        <p className="text-sm text-gray-600">
          Analise a concorrência em tempo real e obtenha sugestões de preço inteligentes
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Search Section */}
        <div className="flex gap-2">
          <Input
            placeholder="Digite o nome do produto..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
          />
          <Button onClick={handleSearch} disabled={isLoading}>
            <Search className="h-4 w-4 mr-2" />
            Pesquisar
          </Button>
        </div>

        {isLoading && <LoadingState message="Analisando concorrência..." />}

        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}

        {data && (
          <div className="space-y-4">
            {/* Market Summary */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                <p className="text-xs text-blue-600 font-medium">Preço Médio</p>
                <p className="text-lg font-bold text-blue-700">R$ {data.avgPrice}</p>
              </div>
              <div className="bg-green-50 p-3 rounded-lg border border-green-200">
                <p className="text-xs text-green-600 font-medium">Menor Preço</p>
                <p className="text-lg font-bold text-green-700">R$ {data.minPrice}</p>
              </div>
              <div className="bg-orange-50 p-3 rounded-lg border border-orange-200">
                <p className="text-xs text-orange-600 font-medium">Maior Preço</p>
                <p className="text-lg font-bold text-orange-700">R$ {data.maxPrice}</p>
              </div>
              <div className="bg-purple-50 p-3 rounded-lg border border-purple-200">
                <p className="text-xs text-purple-600 font-medium">Produtos</p>
                <p className="text-lg font-bold text-purple-700">{data.totalResults}</p>
              </div>
            </div>

            {/* Price Suggestion */}
            <div className="bg-gradient-to-r from-brand-50 to-brand-100 p-4 rounded-lg border border-brand-200">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold flex items-center gap-2">
                    <Target className="h-4 w-4 text-brand-600" />
                    Sugestão Inteligente
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Preço competitivo baseado na análise de mercado
                  </p>
                  <p className="text-2xl font-bold text-brand-700 mt-2">
                    R$ {getSuggestedPrice(100, 30).toFixed(2)}
                  </p>
                </div>
                {onPriceSuggestion && (
                  <Button onClick={handleUseSuggestion} className="bg-brand-600 hover:bg-brand-700">
                    Usar Sugestão
                  </Button>
                )}
              </div>
            </div>

            {/* Top Products */}
            <div>
              <h3 className="font-semibold mb-3">Produtos Encontrados</h3>
              <div className="grid gap-3 max-h-96 overflow-y-auto">
                {data.products.slice(0, 6).map((product, index) => (
                  <div key={index} className="flex items-center gap-3 p-3 border rounded-lg hover:bg-gray-50">
                    <div className="w-12 h-12 bg-gray-200 rounded flex-shrink-0 flex items-center justify-center">
                      <span className="text-xs text-gray-500">IMG</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{product.title}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="flex items-center gap-1">
                          <Star className="h-3 w-3 text-yellow-500 fill-current" />
                          <span className="text-xs text-gray-600">{product.rating}</span>
                        </div>
                        <span className="text-xs text-gray-500">({product.reviews} avaliações)</span>
                      </div>
                      <p className="text-xs text-gray-500">{product.seller}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-lg">R$ {product.price}</p>
                      <Button variant="ghost" size="sm" className="h-6 px-2">
                        <ExternalLink className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
