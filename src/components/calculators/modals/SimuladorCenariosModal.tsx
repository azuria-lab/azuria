import React, { useCallback, useMemo, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calculator, TrendingUp, X } from 'lucide-react';
import { useAnalyticsTracking } from '@/hooks/useAnalytics';

interface SimuladorCenariosModalProps {
  readonly isOpen: boolean;
  readonly onClose: () => void;
  readonly valorVenda: number;
}

interface Cenario {
  parcelas: number;
  taxa: number;
  valorRecebido: number;
  perda: number;
}

const taxasPorParcela: Record<number, number> = {
  0: 1.99, // débito
  1: 2.49,
  2: 3.99,
  3: 4.99,
  4: 5.99,
  5: 6.99,
  6: 7.99,
  7: 8.49,
  8: 8.99,
  9: 9.49,
  10: 9.99,
  11: 10.49,
  12: 10.99,
};

export default function SimuladorCenariosModal({
  isOpen,
  onClose,
  valorVenda: valorVendaInicial,
}: SimuladorCenariosModalProps) {
  const { trackEvent } = useAnalyticsTracking();
  const [valorVenda, setValorVenda] = useState(valorVendaInicial || 100);
  const [cenario1Parcelas, setCenario1Parcelas] = useState(1);
  const [cenario2Parcelas, setCenario2Parcelas] = useState(6);

  const calcularCenario = useCallback((parcelas: number): Cenario => {
    const taxa = taxasPorParcela[parcelas] || 0;
    const valorRecebido = valorVenda * (1 - taxa / 100);
    const perda = valorVenda - valorRecebido;
    return { parcelas, taxa, valorRecebido, perda };
  }, [valorVenda]);

  const cenario1 = useMemo(() => calcularCenario(cenario1Parcelas), [calcularCenario, cenario1Parcelas]);
  const cenario2 = useMemo(() => calcularCenario(cenario2Parcelas), [calcularCenario, cenario2Parcelas]);

  const diferencaValor = cenario1.valorRecebido - cenario2.valorRecebido;
  const diferencaPercentual = cenario1.taxa - cenario2.taxa;
  
  // Determinar melhor cenário sem nested ternary
  let melhorCenario = 0;
  if (diferencaValor > 0) {
    melhorCenario = 1;
  } else if (diferencaValor < 0) {
    melhorCenario = 2;
  }

  // Projeção mensal e anual
  const [vendasMensais, setVendasMensais] = useState(100);
  
  const projecaoMensal1 = cenario1.valorRecebido * vendasMensais;
  const projecaoMensal2 = cenario2.valorRecebido * vendasMensais;
  const projecaoAnual1 = projecaoMensal1 * 12;
  const projecaoAnual2 = projecaoMensal2 * 12;
  const economiaAnual = Math.abs(projecaoAnual1 - projecaoAnual2);

  const handleClose = () => {
    trackEvent('simulador_cenarios_closed', {
      cenario1_parcelas: cenario1Parcelas,
      cenario2_parcelas: cenario2Parcelas,
      valor_venda: valorVenda,
    });
    onClose();
  };

  const formatParcelas = (p: number) => (p === 0 ? 'Débito' : `${p}x`);

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Simulador de Cenários
          </DialogTitle>
          <p className="text-sm text-muted-foreground">
            Compare diferentes opções de parcelamento.
          </p>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Configuração base */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Valor por venda</Label>
              <Input
                type="number"
                min="0"
                step="0.01"
                value={valorVenda}
                onChange={(e) => setValorVenda(Number(e.target.value) || 0)}
              />
            </div>
            <div>
              <Label>Vendas por mês</Label>
              <Input
                type="number"
                min="1"
                value={vendasMensais}
                onChange={(e) => setVendasMensais(Number(e.target.value) || 1)}
              />
            </div>
          </div>

          {/* Seleção de cenários */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 border rounded-lg space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-blue-500" />
                <Label className="font-medium">Cenário A</Label>
              </div>
              <Select
                value={cenario1Parcelas.toString()}
                onValueChange={(value) => setCenario1Parcelas(Number(value))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">Débito</SelectItem>
                  {Array.from({ length: 12 }, (_, i) => i + 1).map((p) => (
                    <SelectItem key={p} value={p.toString()}>
                      {p}x
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="text-sm space-y-1">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Taxa:</span>
                  <span>{cenario1.taxa.toFixed(2)}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Você recebe:</span>
                  <span className="font-bold text-green-600">
                    R$ {cenario1.valorRecebido.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

            <div className="p-4 border rounded-lg space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-orange-500" />
                <Label className="font-medium">Cenário B</Label>
              </div>
              <Select
                value={cenario2Parcelas.toString()}
                onValueChange={(value) => setCenario2Parcelas(Number(value))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">Débito</SelectItem>
                  {Array.from({ length: 12 }, (_, i) => i + 1).map((p) => (
                    <SelectItem key={p} value={p.toString()}>
                      {p}x
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="text-sm space-y-1">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Taxa:</span>
                  <span>{cenario2.taxa.toFixed(2)}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Você recebe:</span>
                  <span className="font-bold text-green-600">
                    R$ {cenario2.valorRecebido.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Resultado da comparação */}
          {(() => {
            let bgClass = 'bg-muted border-muted';
            if (melhorCenario === 1) {
              bgClass = 'bg-blue-50 border-blue-300 dark:bg-blue-950/30 dark:border-blue-700';
            } else if (melhorCenario === 2) {
              bgClass = 'bg-orange-50 border-orange-300 dark:bg-orange-950/30 dark:border-orange-700';
            }
            return (
              <div className={`p-4 rounded-lg border-2 ${bgClass}`}>
                <div className="text-center space-y-2">
                  {melhorCenario === 0 ? (
                    <span className="text-muted-foreground">Ambos os cenários são equivalentes.</span>
                  ) : (
                    <>
                      <div className="flex items-center justify-center gap-2">
                        <TrendingUp className="h-5 w-5 text-green-600" />
                        <span className="font-medium">
                          {formatParcelas(melhorCenario === 1 ? cenario1Parcelas : cenario2Parcelas)} é a melhor opção!
                        </span>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Você recebe <span className="font-bold text-green-600">R$ {Math.abs(diferencaValor).toFixed(2)}</span> a mais por venda
                        <br />
                        ({Math.abs(diferencaPercentual).toFixed(2)}% menos de taxa)
                      </div>
                    </>
                  )}
                </div>
              </div>
            );
          })()}

          {/* Projeção */}
          <div className="space-y-3">
            <Label className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Projeção com {vendasMensais} vendas/mês
            </Label>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-muted rounded-lg">
                <div className="text-xs text-muted-foreground mb-1">
                  {formatParcelas(cenario1Parcelas)} - Mensal
                </div>
                <div className="text-lg font-bold">
                  R$ {projecaoMensal1.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  Anual: R$ {projecaoAnual1.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </div>
              </div>
              <div className="p-3 bg-muted rounded-lg">
                <div className="text-xs text-muted-foreground mb-1">
                  {formatParcelas(cenario2Parcelas)} - Mensal
                </div>
                <div className="text-lg font-bold">
                  R$ {projecaoMensal2.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  Anual: R$ {projecaoAnual2.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </div>
              </div>
            </div>
            
            {economiaAnual > 0 && (
              <div className="p-3 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30 rounded-lg border border-green-200 dark:border-green-800 text-center">
                <span className="text-sm">Economia anual potencial: </span>
                <span className="text-lg font-bold text-green-600">
                  R$ {economiaAnual.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Ações */}
        <div className="flex justify-end gap-2">
          <Button variant="ghost" onClick={handleClose}>
            <X className="h-4 w-4 mr-2" />
            Fechar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
