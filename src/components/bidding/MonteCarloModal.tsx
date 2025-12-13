/**
 * @fileoverview Monte Carlo Simulation Modal - Análise de risco probabilística
 * 
 * Permite simular cenários de custos variáveis usando Monte Carlo
 * para avaliar riscos e otimizar margem de lucro.
 */

import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Slider } from '@/components/ui/slider';
import {
  AlertCircle,
  BarChart3,
  Info,
  Loader2,
  Sparkles,
  Target,
  TrendingUp,
} from 'lucide-react';
import whatIfSimulator, { type MonteCarloResult } from '@/azuria_ai/engines/whatIfSimulator';
import { formatCurrency } from '@/services/bidding/biddingCalculations';

/**
 * Tipos de distribuição para simulação Monte Carlo
 */
type DistributionType = 'normal' | 'uniform' | 'triangular';

interface MonteCarloModalProps {
  readonly baseCost: number;
  readonly targetMargin: number;
  readonly onOptimizedMargin?: (margin: number) => void;
  readonly trigger?: React.ReactNode;
}

export function MonteCarloModal({
  baseCost,
  targetMargin,
  onOptimizedMargin,
  trigger,
}: MonteCarloModalProps) {
  const [open, setOpen] = useState(false);
  const [simulating, setSimulating] = useState(false);
  const [result, setResult] = useState<MonteCarloResult | null>(null);
  
  // Parâmetros de simulação
  const [costVariation, setCostVariation] = useState(5); // %
  const [iterations, setIterations] = useState(1000);
  const [distribution, setDistribution] = useState<DistributionType>('normal');

  // Helper function for distribution params
  const getDistributionParams = (dist: DistributionType, base: number, variation: number) => {
    if (dist === 'normal') {
      return {
        mean: base,
        stdDev: base * (variation / 100),
      };
    }
    if (dist === 'uniform') {
      return {
        min: base * (1 - variation / 100),
        max: base * (1 + variation / 100),
      };
    }
    return {
      min: base * (1 - variation / 100),
      mode: base,
      max: base * (1 + variation / 100),
    };
  };

  const handleSimulate = async () => {
    setSimulating(true);

    try {
      // Executar Monte Carlo
      const simulation = await whatIfSimulator.runMonteCarloSimulation(
        [
          {
            name: 'custo',
            baseValue: baseCost,
            distribution,
            params: getDistributionParams(distribution, baseCost, costVariation),
          },
        ],
        (values) => values.custo * (1 + targetMargin / 100),
        {
          iterations,
          confidenceLevels: [0.68, 0.95, 0.99],
        }
      );

      setResult(simulation);

      // Otimizar margem baseado na simulação (opcional)
      if (onOptimizedMargin && import.meta.env.DEV) {
        // Função de otimização disponível mas não utilizada neste contexto
      }
    } catch (err) {
      if (import.meta.env.DEV) {
        // eslint-disable-next-line no-console
        console.error('Erro na simulação:', err);
      }
    } finally {
      setSimulating(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" className="gap-2">
            <TrendingUp className="h-4 w-4" />
            Simular Cenários
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-brand-600" />
            Simulação Monte Carlo
          </DialogTitle>
          <DialogDescription>
            Analise probabilidades e riscos executando {iterations.toLocaleString()} simulações
            com variações de custo. Identifique o preço ideal com base em intervalos de confiança.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Parameters */}
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              {/* Cost Variation */}
              <div className="space-y-2">
                <Label>Variação de Custo: ±{costVariation}%</Label>
                <Slider
                  value={[costVariation]}
                  onValueChange={([value]) => setCostVariation(value)}
                  min={1}
                  max={20}
                  step={1}
                  disabled={simulating}
                />
                <p className="text-xs text-muted-foreground">
                  Custo pode variar entre{' '}
                  {formatCurrency(baseCost * (1 - costVariation / 100))} e{' '}
                  {formatCurrency(baseCost * (1 + costVariation / 100))}
                </p>
              </div>

              {/* Distribution Type */}
              <div className="space-y-2">
                <Label>Tipo de Distribuição</Label>
                <Select
                  value={distribution}
                  onValueChange={(value: 'normal' | 'uniform' | 'triangular') => setDistribution(value)}
                  disabled={simulating}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="normal">Normal (Gaussiana)</SelectItem>
                    <SelectItem value="uniform">Uniforme</SelectItem>
                    <SelectItem value="triangular">Triangular</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  {distribution === 'normal' &&
                    'Valores próximos da média são mais prováveis'}
                  {distribution === 'uniform' && 'Todos os valores têm mesma probabilidade'}
                  {distribution === 'triangular' && 'Valor médio é o mais provável'}
                </p>
              </div>
            </div>

            {/* Iterations */}
            <div className="space-y-2">
              <Label>Número de Iterações</Label>
              <div className="flex gap-2">
                {[1000, 5000, 10000].map((iter) => (
                  <Button
                    key={iter}
                    variant={iterations === iter ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setIterations(iter)}
                    disabled={simulating}
                  >
                    {iter.toLocaleString()}
                  </Button>
                ))}
              </div>
            </div>

            {/* Simulate Button */}
            <Button
              onClick={handleSimulate}
              disabled={simulating}
              className="w-full gap-2"
              size="lg"
            >
              {simulating ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Simulando {iterations.toLocaleString()} cenários...
                </>
              ) : (
                <>
                  <BarChart3 className="h-4 w-4" />
                  Executar Simulação
                </>
              )}
            </Button>
          </div>

          {/* Results */}
          <AnimatePresence>
            {result && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-6"
              >
                <Separator />

                {/* Statistics */}
                <div className="space-y-4">
                  <h3 className="font-semibold flex items-center gap-2">
                    <Target className="h-5 w-5 text-brand-600" />
                    Estatísticas do Preço Final
                  </h3>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-xs text-muted-foreground mb-1">Média</p>
                      <p className="text-lg font-bold">{formatCurrency(result.stats.mean)}</p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-xs text-muted-foreground mb-1">Mediana</p>
                      <p className="text-lg font-bold">{formatCurrency(result.stats.median)}</p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-xs text-muted-foreground mb-1">Mínimo</p>
                      <p className="text-lg font-bold text-green-600">
                        {formatCurrency(result.stats.min)}
                      </p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-xs text-muted-foreground mb-1">Máximo</p>
                      <p className="text-lg font-bold text-red-600">
                        {formatCurrency(result.stats.max)}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Confidence Intervals */}
                <div className="space-y-3">
                  <h4 className="font-semibold text-sm">Intervalos de Confiança</h4>
                  
                  {Object.entries(result.confidenceIntervals).map(([level, interval]) => {
                    const percentage = level.replace('%', '');
                    return (
                      <div
                        key={level}
                        className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-4"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <Badge variant="outline" className="bg-white">
                            {level} de confiança
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {percentage === '68' && 'Provável (1 desvio padrão)'}
                            {percentage === '95' && 'Muito provável (2 desvios)'}
                            {percentage === '99' && 'Quase certo (3 desvios)'}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">
                            {formatCurrency(interval.lower)}
                          </span>
                          <span className="text-xs text-muted-foreground">até</span>
                          <span className="text-sm font-medium">
                            {formatCurrency(interval.upper)}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Percentiles */}
                <div className="space-y-3">
                  <h4 className="font-semibold text-sm">Percentis</h4>
                  <div className="grid grid-cols-5 gap-2">
                    {Object.entries(result.percentiles).map(([percentile, value]) => (
                      <div key={percentile} className="bg-gray-50 rounded p-3 text-center">
                        <p className="text-xs text-muted-foreground mb-1">{percentile}</p>
                        <p className="text-sm font-semibold">
                          {formatCurrency(value)}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Insights */}
                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertDescription className="text-sm">
                    <strong>Interpretação:</strong> Com {iterations.toLocaleString()} simulações,
                    há 95% de chance do preço final estar entre{' '}
                    <strong>{formatCurrency(result.confidenceIntervals['95%'].lower)}</strong> e{' '}
                    <strong>{formatCurrency(result.confidenceIntervals['95%'].upper)}</strong>.
                    Use esse intervalo para avaliar riscos e ajustar sua proposta.
                  </AlertDescription>
                </Alert>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Info Box */}
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="text-xs">
              <strong>Sobre Monte Carlo:</strong> Método estatístico que simula milhares de
              cenários possíveis para estimar probabilidades. Ideal para licitações com custos
              incertos (materiais, logística, câmbio).
            </AlertDescription>
          </Alert>
        </div>
      </DialogContent>
    </Dialog>
  );
}
