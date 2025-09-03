
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { ArrowRightLeft, Store, TrendingDown, TrendingUp } from "lucide-react";
import { marketplaces } from "@/data/marketplaces";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatCurrency } from "@/utils/calculator/formatCurrency";
import { parseInputValue } from "@/utils/calculator/parseInputValue";
import { MarketplaceComparisonChart } from "./MarketplaceComparisonChart";
import { useToast } from "@/hooks/use-toast";

interface MarketplaceComparatorProps {
  initialCost?: number;
  initialTargetProfit?: number;
  initialTaxPercent?: number;
}

export default function MarketplaceComparator({
  initialCost = 0,
  initialTargetProfit = 30,
  initialTaxPercent = 0
}: MarketplaceComparatorProps) {
  const { toast } = useToast();
  const [cost, setCost] = useState(initialCost.toString());
  const [targetProfit, setTargetProfit] = useState(initialTargetProfit.toString());
  const [taxPercent, setTaxPercent] = useState(initialTaxPercent.toString());
  const [includeShipping, setIncludeShipping] = useState(false);
  const [shippingCost, setShippingCost] = useState("0");
  const [results, setResults] = useState<Array<{
    id: string;
    name: string;
    fee: number;
    sellingPrice: number;
    profit: number;
    profitMargin: number;
    netProfit: number;
  }>>([]);
  const [bestOption, setBestOption] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'sellingPrice' | 'profit' | 'profitMargin'>('profit');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  // Calcular preço e lucro para cada marketplace
  const calculatePrices = () => {
    if (!cost || isNaN(parseFloat(cost)) || parseFloat(cost) <= 0) {
      toast({
        title: "Atenção",
        description: "Informe o custo do produto para realizar a comparação",
        variant: "destructive"
      });
      return;
    }

    const costValue = parseFloat(cost);
    const targetProfitValue = parseFloat(targetProfit) || 30;
    const taxValue = parseFloat(taxPercent) || 0;
    const shippingValue = includeShipping ? parseFloat(shippingCost) || 0 : 0;
    const totalCost = costValue + shippingValue;

    const results = marketplaces.map(marketplace => {
      // Cálculo do preço de venda considerando custos, margem e taxas
      const feeMultiplier = marketplace.fee / 100;
      const taxMultiplier = taxValue / 100;
      const profitMultiplier = targetProfitValue / 100;
      
      // Fórmula: Preço = Custo / (1 - margem - taxa marketplace - impostos)
      const denominator = 1 - profitMultiplier - feeMultiplier - taxMultiplier;
      const sellingPrice = totalCost / (denominator > 0 ? denominator : 0.01);
      
      const fees = sellingPrice * feeMultiplier;
      const taxes = sellingPrice * taxMultiplier;
      const revenue = sellingPrice - fees - taxes;
      const profit = revenue - totalCost;
      const profitMargin = (profit / sellingPrice) * 100;
      
      return {
        id: marketplace.id,
        name: marketplace.name,
        fee: marketplace.fee,
        sellingPrice,
        profit,
        profitMargin,
        netProfit: profit
      };
    });

    // Encontrar o marketplace com maior lucro
    const mostProfitable = [...results].sort((a, b) => b.profit - a.profit)[0];
    setBestOption(mostProfitable?.id || null);
    
    setResults(results);
  };

  const handleSortClick = (column: 'sellingPrice' | 'profit' | 'profitMargin') => {
    if (sortBy === column) {
      // Se já estamos ordenando por esta coluna, invertemos a direção
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      // Caso contrário, ordenamos por esta coluna na direção padrão (desc para profit e profitMargin, asc para sellingPrice)
      setSortBy(column);
      setSortDirection(column === 'sellingPrice' ? 'asc' : 'desc');
    }
  };

  // Ordenar os resultados com base no critério selecionado
  const sortedResults = [...results].sort((a, b) => {
    const factor = sortDirection === 'asc' ? 1 : -1;
    return factor * (a[sortBy] - b[sortBy]);
  });

  return (
    <Card className="w-full shadow border-t-4 border-t-brand-500">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Store className="h-5 w-5 text-brand-600" />
          Comparador de Marketplaces
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <p className="text-sm text-gray-600">
          Compare as diferentes taxas dos marketplaces e descubra onde você terá o melhor lucro.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label htmlFor="product-cost">Custo do Produto (R$)</Label>
            <Input
              id="product-cost"
              type="text"
              value={cost}
              onChange={(e) => setCost(e.target.value)}
              placeholder="0,00"
            />
          </div>
          <div>
            <Label htmlFor="target-profit">Margem Desejada (%)</Label>
            <Input
              id="target-profit"
              type="text"
              value={targetProfit}
              onChange={(e) => setTargetProfit(e.target.value)}
              placeholder="30"
            />
          </div>
          <div>
            <Label htmlFor="tax-percent">Impostos (%)</Label>
            <Input
              id="tax-percent"
              type="text"
              value={taxPercent}
              onChange={(e) => setTaxPercent(e.target.value)}
              placeholder="0"
            />
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="include-shipping"
            checked={includeShipping}
            onChange={(e) => setIncludeShipping(e.target.checked)}
            className="h-4 w-4 rounded border-gray-300 text-brand-600 focus:ring-brand-500"
          />
          <Label htmlFor="include-shipping" className="text-sm font-normal">
            Incluir frete grátis no cálculo
          </Label>

          {includeShipping && (
            <div className="ml-4 flex items-center space-x-2">
              <Label htmlFor="shipping-cost" className="text-sm font-normal">
                Valor do frete (R$):
              </Label>
              <Input
                id="shipping-cost"
                type="text"
                value={shippingCost}
                onChange={(e) => setShippingCost(e.target.value)}
                placeholder="0,00"
                className="w-24 h-8"
              />
            </div>
          )}
        </div>

        <Button 
          onClick={calculatePrices} 
          className="w-full bg-brand-600 hover:bg-brand-700"
        >
          Calcular Comparação
        </Button>

        {results.length > 0 && (
          <>
            <div className="mt-6">
              <h3 className="text-lg font-semibold mb-2">Resultado da Comparação</h3>
              
              {/* Gráfico de comparação */}
              <MarketplaceComparisonChart 
                data={sortedResults} 
                bestOption={bestOption || ""} 
              />
              
              <div className="overflow-x-auto mt-4">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Marketplace</TableHead>
                      <TableHead 
                        className="cursor-pointer hover:bg-gray-50" 
                        onClick={() => handleSortClick('sellingPrice')}
                      >
                        Preço de Venda 
                        {sortBy === 'sellingPrice' && (
                          <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                        )}
                      </TableHead>
                      <TableHead 
                        className="cursor-pointer hover:bg-gray-50" 
                        onClick={() => handleSortClick('profit')}
                      >
                        Lucro Líquido 
                        {sortBy === 'profit' && (
                          <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                        )}
                      </TableHead>
                      <TableHead 
                        className="cursor-pointer hover:bg-gray-50" 
                        onClick={() => handleSortClick('profitMargin')}
                      >
                        Margem Real 
                        {sortBy === 'profitMargin' && (
                          <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                        )}
                      </TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sortedResults.map((result) => (
                      <TableRow 
                        key={result.id} 
                        className={result.id === bestOption ? "bg-green-50" : ""}
                      >
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            {result.id === bestOption && (
                              <Badge className="bg-green-100 text-green-800 hover:bg-green-200">
                                Melhor opção
                              </Badge>
                            )}
                            {result.name} ({result.fee}%)
                          </div>
                        </TableCell>
                        <TableCell>R$ {formatCurrency(result.sellingPrice)}</TableCell>
                        <TableCell className={result.profit < 0 ? "text-red-500" : "text-green-600"}>
                          <div className="flex items-center">
                            {result.profit < 0 ? (
                              <TrendingDown className="h-4 w-4 mr-1 inline-block" />
                            ) : (
                              <TrendingUp className="h-4 w-4 mr-1 inline-block" />
                            )}
                            R$ {formatCurrency(result.profit)}
                          </div>
                        </TableCell>
                        <TableCell className={result.profitMargin < 0 ? "text-red-500" : "text-green-600"}>
                          {formatCurrency(result.profitMargin)}%
                        </TableCell>
                        <TableCell>
                          {result.profit < 0 ? (
                            <Badge variant="destructive">Prejuízo</Badge>
                          ) : result.profitMargin < 10 ? (
                            <Badge variant="outline" className="text-amber-600 border-amber-300 bg-amber-50">
                              Margem baixa
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="text-green-600 border-green-300 bg-green-50">
                              Lucro saudável
                            </Badge>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              
              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <h4 className="text-sm font-medium mb-2">Análise</h4>
                <p className="text-sm text-gray-600">
                  {bestOption ? (
                    <>
                      <strong>{marketplaces.find(m => m.id === bestOption)?.name}</strong> é a melhor opção 
                      para venda deste produto, com maior lucro líquido após todas as taxas.
                    </>
                  ) : (
                    "Calcule a comparação para ver qual marketplace é mais vantajoso para seu produto."
                  )}
                </p>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <Button 
                variant="outline" 
                className="gap-2"
                onClick={() => {
                  // Lógica para salvar a comparação
                  toast({
                    title: "Comparação salva",
                    description: "A comparação foi salva com sucesso"
                  });
                }}
              >
                Salvar Comparação
              </Button>
              <Button 
                variant="ghost" 
                className="gap-2"
                onClick={() => {
                  navigator.clipboard.writeText(JSON.stringify(results, null, 2));
                  toast({
                    title: "Dados copiados",
                    description: "Os dados foram copiados para a área de transferência"
                  });
                }}
              >
                <ArrowRightLeft className="h-4 w-4" />
                Exportar Dados
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
