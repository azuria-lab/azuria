import React, { useState } from "react";
import { motion } from "framer-motion";
import Layout from "@/components/layout/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Award, 
  BarChart3, 
  Filter, 
  Package,
  RefreshCw,
  Search,
  
  Star,
  Target,
  TrendingUp,
  
} from "lucide-react";
import { useAuth } from "@/hooks/auth";
import { useRealMarketplaceData } from "@/hooks/useRealMarketplaceData";
import { formatCurrency } from "@/utils/calculator/formatCurrency";
import CompetitiveAnalysisPanel from "@/components/marketplace/CompetitiveAnalysisPanel";
import MarketplaceInsights from "@/components/marketplace/MarketplaceInsights";
import { logger } from "@/services/logger";

export default function MarketplacePage() {
  const { isPro } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const { products, isLoading, error, searchProducts, refreshData } = useRealMarketplaceData();
  
  // Dados simulados para análise competitiva
  const competitiveData = {
    myPrice: 1299.90,
    marketAverage: 1349.90,
    marketMin: 1199.90,
    marketMax: 1499.90,
    competitors: 45,
    marketPosition: 'competitive' as const,
    priceGap: -50.00,
    recommendation: "Seu preço está competitivo. Considere aumentar 3-5% para melhorar margem mantendo competitividade."
  };

  // Removed unused marketplaceStats mock to satisfy no-unused-vars

  const handleSearch = () => {
    searchProducts(searchTerm);
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case "up":
        return <TrendingUp className="h-4 w-4 text-green-500" />;
      case "down":
        return <TrendingUp className="h-4 w-4 text-red-500 rotate-180" />;
      default:
        return <div className="h-4 w-4 bg-gray-400 rounded-full" />;
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case "up":
        return "text-green-600";
      case "down":
        return "text-red-600";
      default:
        return "text-gray-600";
    }
  };

  return (
    <Layout>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="container mx-auto py-6 px-4"
      >
        <div className="mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-800 mb-2">
                Marketplace Intelligence
              </h1>
              <p className="text-gray-600">
                Monitore preços de produtos similares em tempo real e tome decisões estratégicas de precificação.
              </p>
            </div>
            <Button
              onClick={refreshData}
              variant="outline"
              className="gap-2"
              disabled={isLoading}
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              Atualizar
            </Button>
          </div>
        </div>

        {/* Tabs de Funcionalidades */}
        <Tabs defaultValue="search" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="search" className="flex items-center gap-2">
              <Search className="h-4 w-4" />
              Buscar Produtos
            </TabsTrigger>
            <TabsTrigger value="analysis" className="flex items-center gap-2">
              <Target className="h-4 w-4" />
              Análise Competitiva
            </TabsTrigger>
            <TabsTrigger value="insights" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Insights
            </TabsTrigger>
          </TabsList>

          {/* Aba de Busca */}
          <TabsContent value="search" className="space-y-6">
            {/* Search and Filters */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      placeholder="Buscar produtos no marketplace..."
                      className="pl-10"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                    />
                  </div>
                  <Button variant="outline" className="gap-2">
                    <Filter className="h-4 w-4" />
                    Filtros
                  </Button>
                  <Button 
                    className="bg-brand-600 hover:bg-brand-700"
                    onClick={handleSearch}
                    disabled={isLoading}
                  >
                    {isLoading ? 'Buscando...' : 'Buscar Preços'}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Products List */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-5 w-5 text-brand-600" />
                  Produtos {searchTerm ? `(${products.length} encontrados)` : 'Populares'}
                </CardTitle>
                <CardDescription>
                  {searchTerm 
                    ? `Resultados para "${searchTerm}"`
                    : 'Produtos mais buscados e suas variações de preço no mercado'
                  }
                </CardDescription>
              </CardHeader>
              <CardContent>
                {/* ... keep existing code (error handling, loading, empty states, and products list) */}
                {error && (
                  <div className="text-center py-8 text-red-600">
                    <p>Erro ao carregar dados: {error}</p>
                    <Button onClick={refreshData} variant="outline" className="mt-4">
                      Tentar novamente
                    </Button>
                  </div>
                )}

                {isLoading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Carregando produtos...</p>
                  </div>
                ) : products.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    {searchTerm ? (
                      <>
                        <Search className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>Nenhum produto encontrado para "{searchTerm}"</p>
                        <p className="text-sm">Tente uma busca diferente ou verifique a ortografia.</p>
                      </>
                    ) : (
                      <>
                        <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>Nenhum produto disponível no momento.</p>
                      </>
                    )}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {products.map((product) => (
                      <motion.div
                        key={product.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: parseInt(product.id) * 0.1 }}
                        className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <h3 className="font-semibold text-lg mb-1">{product.name}</h3>
                            <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
                              <Badge variant="outline">{product.category}</Badge>
                              <div className="flex items-center gap-1">
                                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                                <span>{product.rating}</span>
                              </div>
                              <span>{product.sellers} vendedores</span>
                            </div>
                            <div className="flex items-center gap-6">
                              <div>
                                <span className="text-sm text-gray-500">Preço médio:</span>
                                <p className="text-lg font-bold text-brand-600">
                                  R$ {formatCurrency(product.avgPrice)}
                                </p>
                              </div>
                              <div>
                                <span className="text-sm text-gray-500">Variação:</span>
                                <p className="text-sm">
                                  R$ {formatCurrency(product.minPrice)} - R$ {formatCurrency(product.maxPrice)}
                                </p>
                              </div>
                            </div>
                          </div>
                          <div className="flex flex-col items-end gap-2">
                            <div className={`flex items-center gap-1 ${getTrendColor(product.trend)}`}>
                              {getTrendIcon(product.trend)}
                              <span className="text-sm font-medium">
                                {product.trend === "up" ? "Em alta" : product.trend === "down" ? "Em queda" : "Estável"}
                              </span>
                            </div>
                            <Button size="sm" variant="outline">
                              Ver Detalhes
                            </Button>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Aba de Análise Competitiva */}
          <TabsContent value="analysis" className="space-y-6">
            <CompetitiveAnalysisPanel 
              data={competitiveData}
              onPriceAdjust={(newPrice) => logger.info('Ajustar preço para:', newPrice)}
            />
          </TabsContent>

          {/* Aba de Insights */}
          <TabsContent value="insights" className="space-y-6">
            <MarketplaceInsights />
          </TabsContent>
        </Tabs>

        {!isPro && (
          <Card className="mt-6 bg-gradient-to-r from-brand-500 to-blue-600 text-white">
            <CardContent className="pt-6">
              <div className="text-center">
                <h3 className="text-xl font-bold mb-2">Upgrade para PRO</h3>
                <p className="mb-4 opacity-90">
                  Acesse dados históricos, alertas de preço e análises avançadas de mercado.
                </p>
                <Button className="bg-white text-brand-600 hover:bg-gray-100">
                  Fazer Upgrade
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </motion.div>
    </Layout>
  );
}
