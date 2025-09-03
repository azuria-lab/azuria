import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { AlertTriangle, Minus, Plus, Target, TrendingDown, TrendingUp } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";

interface Competitor {
  id: string;
  name: string;
  price: number;
  marketShare?: number;
  features?: string[];
}

interface CompetitiveAnalysis {
  myPrice: number;
  competitors: Competitor[];
  positioning: "premium" | "competitive" | "budget";
  recommendations: string[];
  priceGap: {
    highest: number;
    lowest: number;
    average: number;
  };
}

const CompetitivePricingCalculator = () => {
  const [myPrice, setMyPrice] = useState<string>("");
  const [competitors, setCompetitors] = useState<Competitor[]>([]);
  const [newCompetitor, setNewCompetitor] = useState({ name: "", price: "" });
  const [analysis, setAnalysis] = useState<CompetitiveAnalysis | null>(null);
  const { toast } = useToast();

  const addCompetitor = () => {
    if (!newCompetitor.name || !newCompetitor.price) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha o nome e preço do concorrente.",
        variant: "destructive",
      });
      return;
    }

    const competitor: Competitor = {
      id: Date.now().toString(),
      name: newCompetitor.name,
      price: parseFloat(newCompetitor.price.replace(",", ".")),
    };

    setCompetitors([...competitors, competitor]);
    setNewCompetitor({ name: "", price: "" });
    
    toast({
      title: "Concorrente adicionado",
      description: `${competitor.name} foi adicionado à análise.`,
    });
  };

  const removeCompetitor = (id: string) => {
    setCompetitors(competitors.filter(comp => comp.id !== id));
  };

  const analyzeCompetition = () => {
    if (!myPrice || competitors.length === 0) {
      toast({
        title: "Dados insuficientes",
        description: "Informe seu preço e adicione pelo menos um concorrente.",
        variant: "destructive",
      });
      return;
    }

    const myPriceNum = parseFloat(myPrice.replace(",", "."));
    const competitorPrices = competitors.map(c => c.price);
    
    const highest = Math.max(...competitorPrices);
    const lowest = Math.min(...competitorPrices);
    const average = competitorPrices.reduce((sum, price) => sum + price, 0) / competitorPrices.length;

    // Determinar posicionamento
    let positioning: "premium" | "competitive" | "budget";
    if (myPriceNum > average * 1.2) {
      positioning = "premium";
    } else if (myPriceNum < average * 0.8) {
      positioning = "budget";
    } else {
      positioning = "competitive";
    }

    // Gerar recomendações
    const recommendations: string[] = [];
    
    if (myPriceNum > highest) {
      recommendations.push("Seu preço está acima de todos os concorrentes. Considere justificar o valor premium com diferenciais únicos.");
    } else if (myPriceNum < lowest) {
      recommendations.push("Seu preço está abaixo de todos os concorrentes. Pode haver oportunidade de aumentar a margem.");
    }

    if (positioning === "premium") {
      recommendations.push("Posicionamento premium: Foque em qualidade, exclusividade e atendimento diferenciado.");
    } else if (positioning === "budget") {
      recommendations.push("Posicionamento econômico: Enfatize custo-benefício e acessibilidade.");
    } else {
      recommendations.push("Posicionamento competitivo: Mantenha equilíbrio entre preço e valor oferecido.");
    }

    const priceDifference = ((myPriceNum - average) / average) * 100;
    if (Math.abs(priceDifference) > 50) {
      recommendations.push("Grande diferença em relação à média do mercado. Revise sua estratégia de precificação.");
    }

    setAnalysis({
      myPrice: myPriceNum,
      competitors,
      positioning,
      recommendations,
      priceGap: {
        highest,
        lowest,
        average,
      },
    });

    toast({
      title: "Análise concluída",
      description: "Análise competitiva gerada com sucesso!",
    });
  };

  const resetAnalysis = () => {
    setMyPrice("");
    setCompetitors([]);
    setAnalysis(null);
    setNewCompetitor({ name: "", price: "" });
  };

  const getPositioningColor = (positioning: string) => {
    switch (positioning) {
      case "premium": return "bg-purple-100 text-purple-800 border-purple-200";
      case "competitive": return "bg-green-100 text-green-800 border-green-200";
      case "budget": return "bg-blue-100 text-blue-800 border-blue-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-primary" />
            Calculadora de Competitividade
          </CardTitle>
          <CardDescription>
            Analise seu posicionamento no mercado comparando com a concorrência
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Input Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Meu Preço */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Seu Preço</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="myPrice">Preço do seu produto (R$)</Label>
              <Input
                id="myPrice"
                type="text"
                value={myPrice}
                onChange={(e) => setMyPrice(e.target.value)}
                placeholder="0,00"
                className="text-lg font-medium"
              />
            </div>
            
            <Button 
              onClick={analyzeCompetition}
              disabled={!myPrice || competitors.length === 0}
              className="w-full"
            >
              <Target className="w-4 h-4 mr-2" />
              Analisar Competitividade
            </Button>
            
            <Button 
              onClick={resetAnalysis}
              variant="outline"
              className="w-full"
            >
              Limpar Análise
            </Button>
          </CardContent>
        </Card>

        {/* Adicionar Concorrentes */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Concorrentes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label>Nome do Concorrente</Label>
                <Input
                  value={newCompetitor.name}
                  onChange={(e) => setNewCompetitor({...newCompetitor, name: e.target.value})}
                  placeholder="Ex: Concorrente A"
                />
              </div>
              <div>
                <Label>Preço (R$)</Label>
                <Input
                  value={newCompetitor.price}
                  onChange={(e) => setNewCompetitor({...newCompetitor, price: e.target.value})}
                  placeholder="0,00"
                />
              </div>
            </div>
            
            <Button onClick={addCompetitor} className="w-full" variant="outline">
              <Plus className="w-4 h-4 mr-2" />
              Adicionar Concorrente
            </Button>

            {/* Lista de Concorrentes */}
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {competitors.map((competitor) => (
                <div key={competitor.id} className="flex items-center justify-between p-2 bg-muted rounded-md">
                  <div>
                    <span className="font-medium">{competitor.name}</span>
                    <span className="ml-2 text-muted-foreground">
                      {formatCurrency(competitor.price)}
                    </span>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => removeCompetitor(competitor.id)}
                  >
                    <Minus className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Análise Results */}
      {analysis && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-green-600" />
                Análise Competitiva
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Posicionamento */}
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">Posicionamento no Mercado</h3>
                  <p className="text-sm text-muted-foreground">
                    Baseado na comparação com {analysis.competitors.length} concorrentes
                  </p>
                </div>
                <Badge className={getPositioningColor(analysis.positioning)}>
                  {analysis.positioning === "premium" && "Premium"}
                  {analysis.positioning === "competitive" && "Competitivo"}
                  {analysis.positioning === "budget" && "Econômico"}
                </Badge>
              </div>

              <Separator />

              {/* Métricas de Preço */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-3 bg-primary/5 rounded-lg">
                  <p className="text-sm text-muted-foreground">Seu Preço</p>
                  <p className="text-lg font-bold text-primary">
                    {formatCurrency(analysis.myPrice)}
                  </p>
                </div>
                <div className="text-center p-3 bg-muted/50 rounded-lg">
                  <p className="text-sm text-muted-foreground">Média do Mercado</p>
                  <p className="text-lg font-bold">
                    {formatCurrency(analysis.priceGap.average)}
                  </p>
                </div>
                <div className="text-center p-3 bg-green-50 rounded-lg">
                  <p className="text-sm text-muted-foreground">Menor Preço</p>
                  <p className="text-lg font-bold text-green-600">
                    {formatCurrency(analysis.priceGap.lowest)}
                  </p>
                </div>
                <div className="text-center p-3 bg-red-50 rounded-lg">
                  <p className="text-sm text-muted-foreground">Maior Preço</p>
                  <p className="text-lg font-bold text-red-600">
                    {formatCurrency(analysis.priceGap.highest)}
                  </p>
                </div>
              </div>

              <Separator />

              {/* Diferença Percentual */}
              <div className="text-center p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg">
                <h3 className="font-medium mb-2">Diferença em relação à média</h3>
                <div className="flex items-center justify-center gap-2">
                  {analysis.myPrice > analysis.priceGap.average ? (
                    <>
                      <TrendingUp className="h-5 w-5 text-red-500" />
                      <span className="text-xl font-bold text-red-500">
                        +{(((analysis.myPrice - analysis.priceGap.average) / analysis.priceGap.average) * 100).toFixed(1)}%
                      </span>
                    </>
                  ) : (
                    <>
                      <TrendingDown className="h-5 w-5 text-green-500" />
                      <span className="text-xl font-bold text-green-500">
                        {(((analysis.myPrice - analysis.priceGap.average) / analysis.priceGap.average) * 100).toFixed(1)}%
                      </span>
                    </>
                  )}
                </div>
              </div>

              <Separator />

              {/* Recomendações */}
              <div>
                <h3 className="font-medium mb-3 flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-orange-500" />
                  Recomendações Estratégicas
                </h3>
                <div className="space-y-2">
                  {analysis.recommendations.map((recommendation, index) => (
                    <div key={index} className="p-3 bg-orange-50 border-l-4 border-orange-200 rounded-r-md">
                      <p className="text-sm">{recommendation}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Tabela de Concorrentes */}
              <div>
                <h3 className="font-medium mb-3">Comparativo Detalhado</h3>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-2">Concorrente</th>
                        <th className="text-right p-2">Preço</th>
                        <th className="text-right p-2">Diferença</th>
                        <th className="text-center p-2">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b bg-primary/5">
                        <td className="p-2 font-medium">Seu Produto</td>
                        <td className="p-2 text-right font-bold">
                          {formatCurrency(analysis.myPrice)}
                        </td>
                        <td className="p-2 text-right">-</td>
                        <td className="p-2 text-center">
                          <Badge variant="default">Você</Badge>
                        </td>
                      </tr>
                      {analysis.competitors
                        .sort((a, b) => a.price - b.price)
                        .map((competitor) => {
                          const difference = analysis.myPrice - competitor.price;
                          const percentDiff = (difference / competitor.price) * 100;
                          return (
                            <tr key={competitor.id} className="border-b">
                              <td className="p-2">{competitor.name}</td>
                              <td className="p-2 text-right">
                                {formatCurrency(competitor.price)}
                              </td>
                              <td className={`p-2 text-right ${difference > 0 ? 'text-red-500' : 'text-green-500'}`}>
                                {difference > 0 ? '+' : ''}{formatCurrency(Math.abs(difference))}
                                <span className="text-xs ml-1">
                                  ({percentDiff > 0 ? '+' : ''}{percentDiff.toFixed(1)}%)
                                </span>
                              </td>
                              <td className="p-2 text-center">
                                <Badge variant={difference > 0 ? "destructive" : "default"}>
                                  {difference > 0 ? "Mais caro" : "Mais barato"}
                                </Badge>
                              </td>
                            </tr>
                          );
                        })}
                    </tbody>
                  </table>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
};

export default CompetitivePricingCalculator;