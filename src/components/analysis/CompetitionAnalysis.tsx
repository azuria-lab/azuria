
import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import CompetitorsList from "./CompetitorsList";
import CompetitorsChart from "./CompetitorsChart";
import SearchForm from "./SearchForm";
import { Info } from "lucide-react";

// Dados mockados para simulação
import { CompetitorMock, mockCompetitors } from "./mockData";

interface CompetitionAnalysisProps {
  isPro: boolean;
  onFreeUsage: () => void;
}

export default function CompetitionAnalysis({ isPro, onFreeUsage }: CompetitionAnalysisProps) {
  const [searchPerformed, setSearchPerformed] = useState(false);
  const [competitors, setCompetitors] = useState<{
    id: string;
    store: string;
    price: number;
    marketplace: string;
    productUrl: string;
    productType: "Original" | "Similar" | "Genérico";
    isCheapest?: boolean;
    isRecommended?: boolean;
  }[]>([]);
  const [summaryData, setSummaryData] = useState<{
    lowestPrice: number;
    highestPrice: number;
    averagePrice: number;
    suggestedPrice: number;
  } | null>(null);
  
  const handleSearch = (_searchData: {
    productName: string;
    brand: string;
    model: string;
    productCode: string;
    gtin: string;
  }) => {
    // Aqui futuramente será feita a chamada à API
    // Por enquanto, vamos usar os dados mock
  setCompetitors([...mockCompetitors] as CompetitorMock[]);
    
    // Calcular dados de resumo
    const prices = mockCompetitors.map(item => item.price);
    const lowestPrice = Math.min(...prices);
    const highestPrice = Math.max(...prices);
    const averagePrice = prices.reduce((a, b) => a + b, 0) / prices.length;
    
    // Calcular preço sugerido (média + 10% de margem)
    const suggestedPrice = averagePrice * 1.1;
    
    setSummaryData({
      lowestPrice,
      highestPrice,
      averagePrice,
      suggestedPrice
    });
    
    setSearchPerformed(true);
    
    // Se não for PRO, registrar uso gratuito
    if (!isPro) {
      onFreeUsage();
    }
  };
  
  return (
    <div className="space-y-6">
      {/* Formulário de pesquisa */}
      <Card className="overflow-hidden">
        <CardContent className="pt-6">
          <SearchForm onSearch={handleSearch} />
          <div className="mt-3 flex items-center text-sm text-gray-500">
            <Info size={14} className="mr-2" />
            <p>Para resultados mais precisos, utilize o GTIN/EAN do produto. Esse código é único e ajuda a identificar originais e similares corretamente.</p>
          </div>
        </CardContent>
      </Card>
      
      {/* Resultados da pesquisa */}
      {searchPerformed && (
        <>
          {/* Resumo da análise */}
          <Card className="bg-gradient-to-r from-brand-50 to-brand-100 border-none shadow-md">
            <CardContent className="pt-6">
              <h2 className="text-xl font-semibold mb-4">Resumo da Análise</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white p-4 rounded-lg shadow-sm">
                  <div className="text-sm text-gray-500 mb-1">Preço mais baixo</div>
                  <div className="text-2xl font-bold text-red-500">R$ {summaryData?.lowestPrice.toFixed(2)}</div>
                </div>
                
                <div className="bg-white p-4 rounded-lg shadow-sm">
                  <div className="text-sm text-gray-500 mb-1">Preço mais alto</div>
                  <div className="text-2xl font-bold text-blue-600">R$ {summaryData?.highestPrice.toFixed(2)}</div>
                </div>
                
                <div className="bg-white p-4 rounded-lg shadow-sm">
                  <div className="text-sm text-gray-500 mb-1">Preço médio</div>
                  <div className="text-2xl font-bold text-gray-700">R$ {summaryData?.averagePrice.toFixed(2)}</div>
                </div>
                
                <div className="bg-white p-4 rounded-lg shadow-sm relative overflow-hidden">
                  <div className="absolute -top-1 -right-1 w-16 h-16">
                    <div className="absolute transform rotate-45 bg-green-500 text-white text-xs font-semibold py-1 right-[-40px] top-[12px] w-[120px] text-center">
                      Sugerido
                    </div>
                  </div>
                  <div className="text-sm text-gray-500 mb-1">Preço sugerido</div>
                  <div className="text-2xl font-bold text-green-600">R$ {summaryData?.suggestedPrice.toFixed(2)}</div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Gráfico de comparação */}
          <Card>
            <CardContent className="pt-6">
              <h2 className="text-xl font-semibold mb-4">Comparação de Preços</h2>
              <CompetitorsChart competitors={competitors} />
            </CardContent>
          </Card>
          
          {/* Lista de concorrentes */}
          <Card>
            <CardContent className="pt-6">
              <h2 className="text-xl font-semibold mb-4">Principais Concorrentes</h2>
              <CompetitorsList competitors={competitors} />
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
