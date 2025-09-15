import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Tooltip } from "@/components/ui/TutorialTooltip";
import { ArrowRight, Info, Thermometer } from "lucide-react";
import { 
  CartesianGrid, 
  Legend, 
  Line, 
  LineChart, 
  Tooltip as RechartsTooltip, 
  ResponsiveContainer, 
  XAxis, 
  YAxis
} from "recharts";
import { formatCurrency } from "@/utils/calculator/formatCurrency";
import { useToast } from "@/hooks/use-toast";

interface SensitivityData {
  cost: number;
  margin: number;
  tax: number;
  shipping: number;
  marketplaceFee: number;
}

interface IndividualVariations {
  cost: Array<{ parameter: string; variation: number; price: number; impact: number }>;
  margin: Array<{ parameter: string; variation: number; price: number; impact: number }>;
  tax: Array<{ parameter: string; variation: number; price: number; impact: number }>;
  shipping: Array<{ parameter: string; variation: number; price: number; impact: number }>;
  marketplaceFee: Array<{ parameter: string; variation: number; price: number; impact: number }>;
}

interface AnalysisResultsShape {
  individualAnalysis: {
    basePrice: number;
    variations: IndividualVariations;
    elasticity: Array<{ parameter: string; elasticity: number }>;
  };
  crossAnalysis: {
    costMargin: Array<Record<string, number | string>>;
    costTax: Array<Record<string, number | string>>;
  };
}

export default function SensitivityAnalysis() {
  const { toast } = useToast();
  
  // Estado para os dados iniciais
  const [baseData, setBaseData] = useState<SensitivityData>({
    cost: 100,
    margin: 30,
    tax: 10,
    shipping: 15,
    marketplaceFee: 12
  });
  
  // Estado para os dados da análise
  const [analysisResults, setAnalysisResults] = useState<AnalysisResultsShape | null>(null);
  const [activeTab, setActiveTab] = useState("individual");
  const [isLoading, setIsLoading] = useState(false);
  
  // Função para calcular o preço base
  const calculateBasePrice = (data: SensitivityData) => {
    const { cost, margin, tax, shipping, marketplaceFee } = data;
    
    // Cálculo simplificado do preço
    const baseCost = cost + shipping;
    const marginAmount = baseCost * (margin / 100);
    const subtotal = baseCost + marginAmount;
    
    // Aplicando impostos e taxas
    const taxAmount = subtotal * (tax / 100);
    const marketplaceAmount = subtotal * (marketplaceFee / 100);
    
    const totalPrice = subtotal + taxAmount + marketplaceAmount;
    return totalPrice;
  };
  
  // Função para gerar os dados para a análise individual
  const generateIndividualAnalysis = () => {
    const basePrice = calculateBasePrice(baseData);
    
    // Gerar variações para cada parâmetro
    const costVariations = Array.from({ length: 9 }, (_, i) => {
      // Variação de -20% a +20%
      const variationPercent = -20 + (i * 5);
      const costVariation = baseData.cost * (1 + variationPercent / 100);
      const priceWithVariation = calculateBasePrice({ ...baseData, cost: costVariation });
      const impact = ((priceWithVariation - basePrice) / basePrice) * 100;
      
      return {
        parameter: "Custo",
        variation: variationPercent,
        price: priceWithVariation,
        impact
      };
    });
    
    const marginVariations = Array.from({ length: 9 }, (_, i) => {
      const variationPercent = -20 + (i * 5);
      const marginVariation = baseData.margin + variationPercent;
      const priceWithVariation = calculateBasePrice({ ...baseData, margin: marginVariation });
      const impact = ((priceWithVariation - basePrice) / basePrice) * 100;
      
      return {
        parameter: "Margem",
        variation: variationPercent,
        price: priceWithVariation,
        impact
      };
    });
    
    const taxVariations = Array.from({ length: 9 }, (_, i) => {
      const variationPercent = -20 + (i * 5);
      const taxVariation = baseData.tax + variationPercent;
      const priceWithVariation = calculateBasePrice({ ...baseData, tax: taxVariation });
      const impact = ((priceWithVariation - basePrice) / basePrice) * 100;
      
      return {
        parameter: "Imposto",
        variation: variationPercent,
        price: priceWithVariation,
        impact
      };
    });
    
    const shippingVariations = Array.from({ length: 9 }, (_, i) => {
      const variationPercent = -20 + (i * 5);
      const shippingVariation = baseData.shipping * (1 + variationPercent / 100);
      const priceWithVariation = calculateBasePrice({ ...baseData, shipping: shippingVariation });
      const impact = ((priceWithVariation - basePrice) / basePrice) * 100;
      
      return {
        parameter: "Frete",
        variation: variationPercent,
        price: priceWithVariation,
        impact
      };
    });
    
    const feeVariations = Array.from({ length: 9 }, (_, i) => {
      const variationPercent = -20 + (i * 5);
      const feeVariation = baseData.marketplaceFee + variationPercent;
      const priceWithVariation = calculateBasePrice({ ...baseData, marketplaceFee: feeVariation });
      const impact = ((priceWithVariation - basePrice) / basePrice) * 100;
      
      return {
        parameter: "Taxa Marketplace",
        variation: variationPercent,
        price: priceWithVariation,
        impact
      };
    });
    
    // Análise de elasticidade
    const elasticityData = [
      { parameter: "Custo", elasticity: Math.abs((costVariations[8].price - costVariations[0].price) / basePrice / 0.4) },
      { parameter: "Margem", elasticity: Math.abs((marginVariations[8].price - marginVariations[0].price) / basePrice / 0.4) },
      { parameter: "Imposto", elasticity: Math.abs((taxVariations[8].price - taxVariations[0].price) / basePrice / 0.4) },
      { parameter: "Frete", elasticity: Math.abs((shippingVariations[8].price - shippingVariations[0].price) / basePrice / 0.4) },
      { parameter: "Taxa Marketplace", elasticity: Math.abs((feeVariations[8].price - feeVariations[0].price) / basePrice / 0.4) }
    ];
    
    // Ordenado por impacto
    elasticityData.sort((a, b) => b.elasticity - a.elasticity);
    
    return {
      basePrice,
      variations: {
        cost: costVariations,
        margin: marginVariations,
        tax: taxVariations,
        shipping: shippingVariations,
        marketplaceFee: feeVariations
      },
      elasticity: elasticityData
    };
  };
  
  // Função para gerar análise cruzada (heatmap)
  const generateCrossAnalysis = () => {
    // Vamos analisar o impacto cruzado de custo vs margem
  type HeatmapRow = { name: string } & { [percent: string]: number | string };
  const costMarginHeatmap: HeatmapRow[] = [];
  const costTaxHeatmap: HeatmapRow[] = [];
    
    // Variação de custo (-20% a +20%)
    for (let i = 0; i < 9; i++) {
      const costPercent = -20 + (i * 5);
      const costVariation = baseData.cost * (1 + costPercent / 100);
      
  const costMarginRow: HeatmapRow = { name: `${costPercent}%` };
  const costTaxRow: HeatmapRow = { name: `${costPercent}%` };
      
      // Variação de margem (-20 a +20 pontos percentuais)
      for (let j = 0; j < 9; j++) {
        const marginPercent = -20 + (j * 5);
        const marginVariation = baseData.margin + marginPercent;
        
        // Preço com variações
        const priceWithVariation = calculateBasePrice({ 
          ...baseData, 
          cost: costVariation,
          margin: marginVariation 
        });
        
        costMarginRow[`${marginPercent}%`] = priceWithVariation;
        
        // Variação de imposto (-10 a +10 pontos percentuais)
        const taxPercent = -20 + (j * 5);
        const taxVariation = baseData.tax + taxPercent;
        
        const priceTaxVariation = calculateBasePrice({
          ...baseData,
          cost: costVariation,
          tax: taxVariation
        });
        
        costTaxRow[`${taxPercent}%`] = priceTaxVariation;
      }
      
      costMarginHeatmap.push(costMarginRow);
      costTaxHeatmap.push(costTaxRow);
    }
    
    return {
      costMargin: costMarginHeatmap,
      costTax: costTaxHeatmap
    };
  };
  
  // Função para realizar a análise
  const performAnalysis = () => {
    setIsLoading(true);
    
    setTimeout(() => {
      const individualAnalysis = generateIndividualAnalysis();
      const crossAnalysis = generateCrossAnalysis();
      
      setAnalysisResults({
        individualAnalysis,
        crossAnalysis
      });
      
      setIsLoading(false);
      toast({
        title: "Análise de sensibilidade concluída",
        description: "Os resultados mostram a influência de cada variável no preço final.",
      });
    }, 1000);
  };
  
  // Handler para atualizar os dados base
  const handleInputChange = (field: keyof SensitivityData) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setBaseData({
      ...baseData,
      [field]: parseFloat(e.target.value) || 0
    });
    
    // Reset dos resultados
    if (analysisResults) {
      setAnalysisResults(null);
    }
  };
  
  return (
    <div className="space-y-6">
      <Card className="border-brand-100">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Thermometer className="h-5 w-5" />
            Configurações da Análise
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mt-2">
            <div>
              <Label htmlFor="cost" className="flex items-center gap-2">
                Custo do Produto (R$)
                <Tooltip content="Custo base do produto">
                  <Info className="h-4 w-4 text-muted-foreground opacity-60" />
                </Tooltip>
              </Label>
              <Input
                id="cost"
                type="number"
                value={baseData.cost}
                onChange={handleInputChange("cost")}
                className="mt-1"
              />
            </div>
            
            <div>
              <Label htmlFor="margin" className="flex items-center gap-2">
                Margem de Lucro (%)
                <Tooltip content="Margem de lucro desejada">
                  <Info className="h-4 w-4 text-muted-foreground opacity-60" />
                </Tooltip>
              </Label>
              <Input
                id="margin"
                type="number"
                value={baseData.margin}
                onChange={handleInputChange("margin")}
                className="mt-1"
              />
            </div>
            
            <div>
              <Label htmlFor="tax" className="flex items-center gap-2">
                Imposto (%)
                <Tooltip content="Percentual de impostos">
                  <Info className="h-4 w-4 text-muted-foreground opacity-60" />
                </Tooltip>
              </Label>
              <Input
                id="tax"
                type="number"
                value={baseData.tax}
                onChange={handleInputChange("tax")}
                className="mt-1"
              />
            </div>
            
            <div>
              <Label htmlFor="shipping" className="flex items-center gap-2">
                Frete (R$)
                <Tooltip content="Custo de frete por unidade">
                  <Info className="h-4 w-4 text-muted-foreground opacity-60" />
                </Tooltip>
              </Label>
              <Input
                id="shipping"
                type="number"
                value={baseData.shipping}
                onChange={handleInputChange("shipping")}
                className="mt-1"
              />
            </div>
            
            <div>
              <Label htmlFor="marketplaceFee" className="flex items-center gap-2">
                Taxa Marketplace (%)
                <Tooltip content="Taxa cobrada pelo canal de venda">
                  <Info className="h-4 w-4 text-muted-foreground opacity-60" />
                </Tooltip>
              </Label>
              <Input
                id="marketplaceFee"
                type="number"
                value={baseData.marketplaceFee}
                onChange={handleInputChange("marketplaceFee")}
                className="mt-1"
              />
            </div>
          </div>
          
          <Button
            onClick={performAnalysis}
            className="mt-6 bg-brand-600 hover:bg-brand-700 gap-2"
            size="lg"
            disabled={isLoading}
          >
            {isLoading ? "Analisando..." : "Realizar Análise de Sensibilidade"}
            <ArrowRight className="h-5 w-5" />
          </Button>
        </CardContent>
      </Card>
      
      {analysisResults && (
        <div className="space-y-6">
          <Card className="border-brand-100">
            <CardHeader>
              <CardTitle>Preço Base: R$ {formatCurrency(analysisResults.individualAnalysis.basePrice)}</CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="mb-6">
                  <TabsTrigger value="individual">Análise Individual</TabsTrigger>
                  <TabsTrigger value="comparative">Comparativo</TabsTrigger>
                  <TabsTrigger value="cross">Análise Cruzada</TabsTrigger>
                </TabsList>
                
                {/* Análise Individual */}
                <TabsContent value="individual" className="space-y-6">
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart
                        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis 
                          dataKey="variation" 
                          type="number" 
                          domain={[-20, 20]}
                          ticks={[-20, -15, -10, -5, 0, 5, 10, 15, 20]}
                          label={{ value: 'Variação (%)', position: 'insideBottomRight', offset: -5 }}
                        />
                        <YAxis 
                          label={{ value: 'Preço (R$)', angle: -90, position: 'insideLeft' }} 
                          domain={['auto', 'auto']}
                        />
                        <RechartsTooltip formatter={(value: number) => `R$ ${formatCurrency(value)}`} />
                        <Legend />
                        <Line 
                          name="Custo" 
                          data={analysisResults.individualAnalysis.variations.cost}
                          dataKey="price" 
                          stroke="#3182CE" 
                          strokeWidth={2}
                          dot={{ strokeWidth: 2 }}
                        />
                        <Line 
                          name="Margem" 
                          data={analysisResults.individualAnalysis.variations.margin}
                          dataKey="price" 
                          stroke="#38A169" 
                          strokeWidth={2}
                          dot={{ strokeWidth: 2 }}
                        />
                        <Line 
                          name="Imposto" 
                          data={analysisResults.individualAnalysis.variations.tax}
                          dataKey="price" 
                          stroke="#E53E3E" 
                          strokeWidth={2}
                          dot={{ strokeWidth: 2 }}
                        />
                        <Line 
                          name="Frete" 
                          data={analysisResults.individualAnalysis.variations.shipping}
                          dataKey="price" 
                          stroke="#D69E2E" 
                          strokeWidth={2}
                          dot={{ strokeWidth: 2 }}
                        />
                        <Line 
                          name="Taxa Marketplace" 
                          data={analysisResults.individualAnalysis.variations.marketplaceFee}
                          dataKey="price" 
                          stroke="#805AD5" 
                          strokeWidth={2}
                          dot={{ strokeWidth: 2 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                  
                  <div className="overflow-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-3 px-4">Parâmetro</th>
                          <th className="text-right py-3 px-4">Elasticidade</th>
                          <th className="text-left py-3 px-4">Impacto</th>
                        </tr>
                      </thead>
                      <tbody>
                        {analysisResults.individualAnalysis.elasticity.map((item, i: number) => (
                          <tr key={i} className="border-b border-gray-100">
                            <td className="py-3 px-4">{item.parameter}</td>
                            <td className="text-right py-3 px-4">{formatCurrency(item.elasticity)}</td>
                            <td className="py-3 px-4">
                              <div className="w-full bg-gray-200 rounded-full h-2.5">
                                <div 
                                  className="bg-brand-600 h-2.5 rounded-full" 
                                  style={{ width: `${Math.min(100, item.elasticity * 10)}%` }}
                                ></div>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </TabsContent>
                
                {/* Análise Comparativa */}
                <TabsContent value="comparative">
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart
                        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis 
                          dataKey="variation" 
                          type="number" 
                          domain={[-20, 20]}
                          ticks={[-20, -15, -10, -5, 0, 5, 10, 15, 20]}
                          label={{ value: 'Variação (%)', position: 'insideBottomRight', offset: -5 }}
                        />
                        <YAxis 
                          label={{ value: 'Impacto no Preço (%)', angle: -90, position: 'insideLeft' }} 
                          domain={['auto', 'auto']}
                        />
                        <RechartsTooltip formatter={(value: number) => `${formatCurrency(value)}%`} />
                        <Legend />
                        <Line 
                          name="Custo" 
                          data={analysisResults.individualAnalysis.variations.cost}
                          dataKey="impact" 
                          stroke="#3182CE" 
                          strokeWidth={2}
                          dot={{ strokeWidth: 2 }}
                        />
                        <Line 
                          name="Margem" 
                          data={analysisResults.individualAnalysis.variations.margin}
                          dataKey="impact" 
                          stroke="#38A169" 
                          strokeWidth={2}
                          dot={{ strokeWidth: 2 }}
                        />
                        <Line 
                          name="Imposto" 
                          data={analysisResults.individualAnalysis.variations.tax}
                          dataKey="impact" 
                          stroke="#E53E3E" 
                          strokeWidth={2}
                          dot={{ strokeWidth: 2 }}
                        />
                        <Line 
                          name="Frete" 
                          data={analysisResults.individualAnalysis.variations.shipping}
                          dataKey="impact" 
                          stroke="#D69E2E" 
                          strokeWidth={2}
                          dot={{ strokeWidth: 2 }}
                        />
                        <Line 
                          name="Taxa Marketplace" 
                          data={analysisResults.individualAnalysis.variations.marketplaceFee}
                          dataKey="impact" 
                          stroke="#805AD5" 
                          strokeWidth={2}
                          dot={{ strokeWidth: 2 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </TabsContent>
                
                {/* Análise Cruzada */}
                <TabsContent value="cross">
                  <p className="mb-4">Análise do impacto cruzado de Custo x Margem no preço final:</p>
                  <div className="h-80">
                    {/* Acrescentar visualização de heat map quando componente estiver disponível */}
                    <div className="border rounded p-6 h-full flex items-center justify-center">
                      <p className="text-center text-gray-500">
                        Análise cruzada mostra como diferentes combinações de variáveis afetam o preço final.
                        <br /><br />
                        A versão atual não suporta visualização de mapa de calor.
                      </p>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
          
          {/* Insights da análise */}
          <Card className="border-brand-100">
            <CardHeader>
              <CardTitle>Insights da Análise</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 border rounded-lg bg-brand-50 border-brand-100">
                  <h3 className="font-medium mb-2">Variável de maior impacto:</h3>
                  <p className="text-gray-700">
                    <strong>{analysisResults.individualAnalysis.elasticity[0].parameter}</strong> - 
                    Este parâmetro tem o maior impacto no preço final, com elasticidade de {formatCurrency(analysisResults.individualAnalysis.elasticity[0].elasticity)}.
                    Priorize negociações e otimizações nesta área para maximizar sua margem de lucro.
                  </p>
                </div>
                
                <div className="p-4 border rounded-lg bg-blue-50 border-blue-100">
                  <h3 className="font-medium mb-2">Recomendações de ajuste:</h3>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>Negociar redução de {analysisResults.individualAnalysis.elasticity[0].parameter.toLowerCase()} pode ser até {formatCurrency(analysisResults.individualAnalysis.elasticity[0].elasticity / analysisResults.individualAnalysis.elasticity[1].elasticity)} vezes mais efetivo que ajustar {analysisResults.individualAnalysis.elasticity[1].parameter.toLowerCase()}.</li>
                    <li>Uma redução de 10% em {analysisResults.individualAnalysis.elasticity[0].parameter.toLowerCase()} permitiria reduzir o preço em aproximadamente {formatCurrency(analysisResults.individualAnalysis.elasticity[0].elasticity * 10)}% mantendo a mesma margem.</li>
                    <li>Considere alternativas para {analysisResults.individualAnalysis.elasticity[0].parameter.toLowerCase() === "Custo" ? "fornecimento" : "redução"} de {analysisResults.individualAnalysis.elasticity[0].parameter.toLowerCase()}.</li>
                  </ul>
                </div>
                
                <div className="p-4 border rounded-lg bg-green-50 border-green-100">
                  <h3 className="font-medium mb-2">Faixa de preço competitivo:</h3>
                  <p className="text-gray-700">
                    Com base na análise, o preço pode variar entre R$ {formatCurrency(analysisResults.individualAnalysis.basePrice * 0.85)} e 
                    R$ {formatCurrency(analysisResults.individualAnalysis.basePrice * 1.15)} mantendo uma margem aceitável.
                    Recomendamos um preço alvo de R$ {formatCurrency(analysisResults.individualAnalysis.basePrice)}.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
