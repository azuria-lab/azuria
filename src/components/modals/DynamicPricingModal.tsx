/**
 * =====================================================
 * DYNAMIC PRICING MODAL
 * =====================================================
 * Modal para configurar e aplicar precificação dinâmica
 * =====================================================
 */

import { useState } from 'react';
import { CheckCircle2, Loader2, Sliders, Target, TrendingUp, Zap } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Alert, AlertDescription } from '@/components/ui/alert';
import dynamicPricingEngine, { type OptimizationResult, type PriceSimulation } from '@/azuria_ai/engines/dynamicPricingEngine';

interface DynamicPricingModalProps {
  readonly trigger?: React.ReactNode;
  readonly product?: {
    id?: string;
    name: string;
    currentPrice: number;
    cost: number;
  };
  readonly onOptimized?: (newPrice: number) => void;
}

export function DynamicPricingModal({ trigger, product, onOptimized }: DynamicPricingModalProps) {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<'config' | 'simulation' | 'result'>('config');
  
  // Config
  const [strategy, setStrategy] = useState<string>('competitive');
  const [objective, setObjective] = useState<'revenue' | 'margin' | 'volume' | 'balanced'>('balanced');
  const [priceRange, setPriceRange] = useState<[number, number]>([
    product ? product.currentPrice * 0.8 : 50,
    product ? product.currentPrice * 1.2 : 150,
  ]);
  
  // Simulation state
  const [simulation, setSimulation] = useState<PriceSimulation | null>(null);
  const [optimizationResult, setOptimizationResult] = useState<OptimizationResult | null>(null);

  const handleSimulate = async () => {
    if (!product) {return;}

    try {
      setStep('simulation');

      // Executar simulação
      const sim = await dynamicPricingEngine.simulatePriceChange(
        product.name,
        product.currentPrice,
        product.cost,
        {
          min: priceRange[0],
          max: priceRange[1],
          step: (priceRange[1] - priceRange[0]) / 10,
        }
      );

      setSimulation(sim);

      // Otimizar preço
      const opt = await dynamicPricingEngine.optimizePrice(
        {
          name: product.name,
          currentPrice: product.currentPrice,
          cost: product.cost,
          avgSales: 100, // Mock - pegar dados reais
        },
        objective
      );

      setOptimizationResult(opt);
      setStep('result');
    } catch (error) {
      // eslint-disable-next-line no-console -- Error logging
      console.error('Erro na simulação:', error);
      setStep('config');
    }
  };

  const handleApplyPrice = () => {
    if (optimizationResult && onOptimized) {
      onOptimized(optimizationResult.optimalPrice);
      setOpen(false);
      resetState();
    }
  };

  const resetState = () => {
    setStep('config');
    setSimulation(null);
    setOptimizationResult(null);
  };

  const getStrategyLabel = (s: string) => {
    const labels: Record<string, string> = {
      aggressive: 'Agressiva (volume máximo)',
      competitive: 'Competitiva (equilibrado)',
      premium: 'Premium (margem máxima)',
      value: 'Valor (melhor custo-benefício)',
      dynamic: 'Dinâmica (adapta ao contexto)',
    };
    return labels[s] || s;
  };

  const getObjectiveLabel = (o: string) => {
    const labels: Record<string, string> = {
      revenue: 'Maximizar Receita',
      margin: 'Maximizar Margem',
      volume: 'Maximizar Volume',
      balanced: 'Equilibrado',
    };
    return labels[o] || o;
  };

  const getImpactColor = (impact: string) => {
    const colors: Record<string, string> = {
      revenue_max: 'text-green-600',
      margin_max: 'text-blue-600',
      volume_max: 'text-purple-600',
      balanced: 'text-yellow-600',
    };
    return colors[impact] || 'text-gray-600';
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button>
            <Zap className="mr-2 h-4 w-4" />
            Precificação Dinâmica
          </Button>
        )}
      </DialogTrigger>

      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-primary" />
            Precificação Dinâmica Inteligente
          </DialogTitle>
          <DialogDescription>
            Configure parâmetros e deixe a IA otimizar o preço automaticamente
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          {/* Step 1: Config */}
          {step === 'config' && (
            <>
              {product && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Produto</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div>
                      <p className="text-sm font-medium">{product.name}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Preço Atual</p>
                        <p className="font-bold">R$ {product.currentPrice.toFixed(2)}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Custo</p>
                        <p className="font-bold">R$ {product.cost.toFixed(2)}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              <div className="space-y-4">
                {/* Estratégia */}
                <div className="space-y-2">
                  <Label>Estratégia de Precificação</Label>
                  <Select value={strategy} onValueChange={setStrategy}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {['aggressive', 'competitive', 'premium', 'value', 'dynamic'].map((s) => (
                        <SelectItem key={s} value={s}>
                          {getStrategyLabel(s)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    {strategy === 'aggressive' && 'Foca em volume, menor preço possível mantendo margem mínima'}
                    {strategy === 'competitive' && 'Equilibra preço e margem baseado na concorrência'}
                    {strategy === 'premium' && 'Maximiza margem, posicionamento de valor'}
                    {strategy === 'value' && 'Melhor relação custo-benefício para o cliente'}
                    {strategy === 'dynamic' && 'Ajusta automaticamente baseado em múltiplos fatores'}
                  </p>
                </div>

                {/* Objetivo */}
                <div className="space-y-2">
                  <Label>Objetivo de Otimização</Label>
                  <Select value={objective} onValueChange={(v) => setObjective(v as typeof objective)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {(['revenue', 'margin', 'volume', 'balanced'] as const).map((o) => (
                        <SelectItem key={o} value={o}>
                          {getObjectiveLabel(o)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Range de Preço */}
                <div className="space-y-2">
                  <Label>Faixa de Simulação</Label>
                  <div className="flex items-center gap-4">
                    <Input
                      type="number"
                      value={priceRange[0]}
                      onChange={(e) => setPriceRange([Number.parseFloat(e.target.value), priceRange[1]])}
                      className="w-24"
                    />
                    <Slider
                      value={priceRange}
                      onValueChange={(v) => setPriceRange(v as [number, number])}
                      min={product ? product.cost : 10}
                      max={product ? product.currentPrice * 2 : 200}
                      step={1}
                      className="flex-1"
                    />
                    <Input
                      type="number"
                      value={priceRange[1]}
                      onChange={(e) => setPriceRange([priceRange[0], Number.parseFloat(e.target.value)])}
                      className="w-24"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Simular preços de R$ {priceRange[0].toFixed(2)} até R$ {priceRange[1].toFixed(2)}
                  </p>
                </div>
              </div>

              <Button className="w-full" onClick={handleSimulate} disabled={!product}>
                <Target className="mr-2 h-4 w-4" />
                Simular e Otimizar
              </Button>
            </>
          )}

          {/* Step 2: Simulating */}
          {step === 'simulation' && (
            <div className="text-center py-8 space-y-4">
              <Loader2 className="h-12 w-12 animate-spin mx-auto text-primary" />
              <div>
                <p className="text-lg font-semibold">Analisando Cenários...</p>
                <p className="text-sm text-muted-foreground">
                  Simulando {Math.floor((priceRange[1] - priceRange[0]) / 1) + 1} cenários de preço
                </p>
              </div>
            </div>
          )}

          {/* Step 3: Result */}
          {step === 'result' && optimizationResult && simulation && (
            <div className="space-y-4">
              <Alert>
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <AlertDescription>
                  Análise completa! Preço otimizado calculado com {(optimizationResult.confidence * 100).toFixed(0)}% de confiança
                </AlertDescription>
              </Alert>

              {/* Preço Recomendado */}
              <Card className="border-primary">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>Preço Otimizado</span>
                    <Badge variant="outline" className={getImpactColor(simulation.estimatedImpact)}>
                      {simulation.estimatedImpact}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground">De R$ {product?.currentPrice.toFixed(2)}</p>
                    <TrendingUp className="h-6 w-6 mx-auto my-2 text-primary" />
                    <p className="text-4xl font-bold text-primary">
                      R$ {optimizationResult.optimalPrice.toFixed(2)}
                    </p>
                    <p className="text-sm text-muted-foreground mt-2">
                      {((optimizationResult.optimalPrice - (product?.currentPrice || 0)) / (product?.currentPrice || 1) * 100).toFixed(1)}% 
                      {optimizationResult.optimalPrice > (product?.currentPrice || 0) ? ' acima' : ' abaixo'}
                    </p>
                  </div>

                  {/* Impacto Estimado */}
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <p className="text-2xl font-bold text-green-600">
                        R$ {optimizationResult.expectedRevenue.toFixed(0)}
                      </p>
                      <p className="text-xs text-muted-foreground">Receita Estimada</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-blue-600">
                        {optimizationResult.expectedMargin.toFixed(1)}%
                      </p>
                      <p className="text-xs text-muted-foreground">Margem</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-purple-600">
                        {optimizationResult.expectedVolume}
                      </p>
                      <p className="text-xs text-muted-foreground">Volume/mês</p>
                    </div>
                  </div>

                  {/* Raciocínio */}
                  <div className="p-3 bg-muted rounded-lg">
                    <p className="text-xs font-medium mb-1">Análise da IA:</p>
                    <p className="text-sm text-muted-foreground">{optimizationResult.reasoning}</p>
                  </div>
                </CardContent>
              </Card>

              {/* Cenários Simulados */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Cenários Simulados</CardTitle>
                  <CardDescription>
                    {simulation.scenarios.length} cenários analisados
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {simulation.scenarios.map((scenario) => (
                      <div
                        key={scenario.price}
                        className={`flex items-center justify-between p-2 rounded ${
                          optimizationResult && Math.abs(scenario.price - optimizationResult.optimalPrice) < 1
                            ? 'bg-primary/10 border border-primary'
                            : 'bg-muted'
                        }`}
                      >
                        <span className="text-sm font-medium">R$ {scenario.price.toFixed(2)}</span>
                        <div className="flex items-center gap-4 text-xs">
                          <span>{scenario.estimatedSales} vendas</span>
                          <span>R$ {scenario.estimatedRevenue.toFixed(0)}</span>
                          <span className="text-green-600">{scenario.margin.toFixed(1)}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Actions */}
              <div className="flex gap-2">
                <Button className="flex-1" onClick={handleApplyPrice}>
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                  Aplicar Preço
                </Button>
                <Button variant="outline" onClick={resetState}>
                  <Sliders className="mr-2 h-4 w-4" />
                  Nova Simulação
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
