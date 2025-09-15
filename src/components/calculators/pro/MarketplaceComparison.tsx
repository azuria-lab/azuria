import { useCallback, useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowUpDown, Store, Target, TrendingDown, TrendingUp } from 'lucide-react';
import { MARKETPLACE_TEMPLATES, type MarketplaceTemplate } from '@/types/marketplaceTemplates';

interface ComparisonResult {
  template: MarketplaceTemplate;
  sellingPrice: number;
  profit: number;
  profitMargin: number;
  totalFees: number;
  ranking: number;
}

interface MarketplaceComparisonProps {
  productCost: number;
  targetProfit: number;
  taxRate: number;
  onResultSelect: (template: MarketplaceTemplate, sellingPrice: number) => void;
}

export default function MarketplaceComparison({
  productCost,
  targetProfit,
  taxRate,
  onResultSelect
}: MarketplaceComparisonProps) {
  const [selectedTemplates, setSelectedTemplates] = useState<string[]>([
    'mercado-livre', 'shopee', 'amazon', 'magalu'
  ]);
  const [comparisonResults, setComparisonResults] = useState<ComparisonResult[]>([]);
  const [sortBy, setSortBy] = useState<'profit' | 'margin' | 'fees'>('profit');

  const calculateComparisons = useCallback(() => {
    const results: ComparisonResult[] = [];

    selectedTemplates.forEach(templateId => {
      const template = MARKETPLACE_TEMPLATES.find(t => t.id === templateId);
      if (!template) {return;}

      // Calcular taxas totais do marketplace
      const marketplaceFees = 
        template.defaultValues.commission +
        template.defaultValues.paymentFee +
        (template.defaultValues.advertisingFee || 0) +
        (template.defaultValues.fulfillmentFee || 0) +
        (template.defaultValues.storageFee || 0) +
        (template.defaultValues.shippingFee || 0) +
        (template.defaultValues.cashbackFee || 0);

      // Calcular preço de venda necessário
      const totalCostBase = productCost;
      const targetProfitAmount = (targetProfit / 100) * totalCostBase;
      const basePrice = totalCostBase + targetProfitAmount;
      
      // Aplicar taxas (marketplace + impostos)
      const totalTaxRate = (marketplaceFees + taxRate) / 100;
      const sellingPrice = basePrice / (1 - totalTaxRate);
      
      // Calcular lucro real
      const totalFeesAmount = sellingPrice * totalTaxRate;
      const realProfit = sellingPrice - totalCostBase - totalFeesAmount;
      const realProfitMargin = (realProfit / sellingPrice) * 100;

      results.push({
        template,
        sellingPrice,
        profit: realProfit,
        profitMargin: realProfitMargin,
        totalFees: totalFeesAmount,
        ranking: 0
      });
    });

    // Ordenar e rankear
    const sortedResults = results.sort((a, b) => {
      switch (sortBy) {
        case 'profit':
          return b.profit - a.profit;
        case 'margin':
          return b.profitMargin - a.profitMargin;
        case 'fees':
          return a.totalFees - b.totalFees;
        default:
          return b.profit - a.profit;
      }
    });

    // Aplicar ranking
    sortedResults.forEach((result, index) => {
      result.ranking = index + 1;
    });

    setComparisonResults(sortedResults);
  }, [productCost, targetProfit, taxRate, selectedTemplates, sortBy]);

  useEffect(() => {
    if (productCost > 0) {
      calculateComparisons();
    }
  }, [calculateComparisons, productCost]);

  const toggleTemplate = (templateId: string) => {
    setSelectedTemplates(prev => 
      prev.includes(templateId)
        ? prev.filter(id => id !== templateId)
        : [...prev, templateId]
    );
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const getRankingColor = (ranking: number) => {
    switch (ranking) {
      case 1: return 'bg-amber-100 text-amber-800 border-amber-300';
      case 2: return 'bg-gray-100 text-gray-800 border-gray-300';
      case 3: return 'bg-orange-100 text-orange-800 border-orange-300';
      default: return 'bg-muted';
    }
  };

  const getRankingIcon = (ranking: number) => {
    switch (ranking) {
      case 1: return '🥇';
      case 2: return '🥈';
      case 3: return '🥉';
      default: return '📊';
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ArrowUpDown className="h-5 w-5" />
            Comparação de Marketplaces
          </CardTitle>
          <CardDescription>
            Compare diferentes marketplaces side-by-side para encontrar a melhor opção
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Seletor de Templates */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Marketplaces para Comparar</label>
            <div className="flex flex-wrap gap-2">
              {MARKETPLACE_TEMPLATES.map((template) => (
                <Button
                  key={template.id}
                  variant={selectedTemplates.includes(template.id) ? "default" : "outline"}
                  size="sm"
                  onClick={() => toggleTemplate(template.id)}
                  className="h-8"
                >
                  <Store className="h-3 w-3 mr-1" />
                  {template.name}
                </Button>
              ))}
            </div>
          </div>

          {/* Ordenação */}
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium">Ordenar por:</label>
            <Select value={sortBy} onValueChange={(value: 'profit' | 'margin' | 'fees') => setSortBy(value)}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="profit">Maior Lucro</SelectItem>
                <SelectItem value="margin">Maior Margem</SelectItem>
                <SelectItem value="fees">Menores Taxas</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Resultados da Comparação */}
      <div className="grid gap-4">
        {comparisonResults.map((result) => (
          <Card 
            key={result.template.id}
            className={`relative transition-all hover:shadow-md ${
              result.ranking === 1 ? 'ring-2 ring-amber-300' : ''
            }`}
          >
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Badge 
                    variant="outline" 
                    className={`text-lg px-3 py-1 ${getRankingColor(result.ranking)}`}
                  >
                    {getRankingIcon(result.ranking)} #{result.ranking}
                  </Badge>
                  <div>
                    <CardTitle className="text-lg">{result.template.name}</CardTitle>
                    <CardDescription>{result.template.description}</CardDescription>
                  </div>
                </div>
                <Button 
                  variant="outline"
                  onClick={() => onResultSelect(result.template, result.sellingPrice)}
                >
                  <Target className="h-4 w-4 mr-1" />
                  Usar este
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-3 bg-muted rounded-lg">
                  <div className="text-sm font-medium text-muted-foreground">Preço de Venda</div>
                  <div className="text-lg font-bold">{formatCurrency(result.sellingPrice)}</div>
                </div>
                <div className="text-center p-3 bg-muted rounded-lg">
                  <div className="text-sm font-medium text-muted-foreground">Lucro Líquido</div>
                  <div className="text-lg font-bold text-green-600 flex items-center justify-center gap-1">
                    <TrendingUp className="h-4 w-4" />
                    {formatCurrency(result.profit)}
                  </div>
                </div>
                <div className="text-center p-3 bg-muted rounded-lg">
                  <div className="text-sm font-medium text-muted-foreground">Margem</div>
                  <div className="text-lg font-bold text-blue-600">
                    {result.profitMargin.toFixed(1)}%
                  </div>
                </div>
                <div className="text-center p-3 bg-muted rounded-lg">
                  <div className="text-sm font-medium text-muted-foreground">Total de Taxas</div>
                  <div className="text-lg font-bold text-red-600 flex items-center justify-center gap-1">
                    <TrendingDown className="h-4 w-4" />
                    {formatCurrency(result.totalFees)}
                  </div>
                </div>
              </div>

              {/* Breakdown das taxas */}
              <div className="mt-4 p-3 bg-muted/50 rounded-lg">
                <div className="text-sm font-medium mb-2">Breakdown de Taxas:</div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                  <div>Comissão: {result.template.defaultValues.commission}%</div>
                  <div>Pagamento: {result.template.defaultValues.paymentFee}%</div>
                  {result.template.defaultValues.advertisingFee && (
                    <div>Publicidade: {result.template.defaultValues.advertisingFee}%</div>
                  )}
                  {result.template.defaultValues.fulfillmentFee && (
                    <div>Fulfillment: {result.template.defaultValues.fulfillmentFee}%</div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {comparisonResults.length === 0 && selectedTemplates.length > 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <Store className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">
              Insira o custo do produto para ver a comparação
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}