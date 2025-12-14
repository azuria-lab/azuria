import React, { useMemo, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BarChart3, TrendingDown, X } from 'lucide-react';
import { useAnalyticsTracking } from '@/hooks/useAnalytics';

interface ComparadorMaquininhasModalProps {
  readonly isOpen: boolean;
  readonly onClose: () => void;
  readonly valorVenda: number;
}

interface TaxasPorParcela {
  [parcela: number]: number;
}

interface Maquininha {
  id: string;
  nome: string;
  taxas: TaxasPorParcela;
  cor: string;
}

const maquininhasPadrao: Maquininha[] = [
  {
    id: 'stone',
    nome: 'Stone',
    cor: 'bg-green-500',
    taxas: {
      0: 1.39, 1: 1.99, 2: 3.49, 3: 4.49, 4: 5.49, 5: 6.49, 6: 7.49,
      7: 7.99, 8: 8.49, 9: 8.99, 10: 9.49, 11: 9.99, 12: 10.49,
    },
  },
  {
    id: 'pagseguro',
    nome: 'PagSeguro',
    cor: 'bg-yellow-500',
    taxas: {
      0: 1.99, 1: 2.99, 2: 4.49, 3: 5.49, 4: 6.49, 5: 7.49, 6: 8.49,
      7: 8.99, 8: 9.49, 9: 9.99, 10: 10.49, 11: 10.99, 12: 11.49,
    },
  },
  {
    id: 'mercadopago',
    nome: 'Mercado Pago',
    cor: 'bg-blue-500',
    taxas: {
      0: 1.49, 1: 4.74, 2: 5.99, 3: 7.49, 4: 8.99, 5: 10.49, 6: 11.99,
      7: 12.49, 8: 12.99, 9: 13.49, 10: 13.99, 11: 14.49, 12: 14.99,
    },
  },
  {
    id: 'cielo',
    nome: 'Cielo',
    cor: 'bg-orange-500',
    taxas: {
      0: 1.89, 1: 2.89, 2: 4.29, 3: 5.29, 4: 6.29, 5: 7.29, 6: 8.29,
      7: 8.79, 8: 9.29, 9: 9.79, 10: 10.29, 11: 10.79, 12: 11.29,
    },
  },
];

export default function ComparadorMaquininhasModal({
  isOpen,
  onClose,
  valorVenda: valorVendaInicial,
}: ComparadorMaquininhasModalProps) {
  const { trackEvent } = useAnalyticsTracking();
  const [valorVenda, setValorVenda] = useState(valorVendaInicial || 100);
  const [parcelas, setParcelas] = useState(1);
  const [maquininhasSelecionadas, setMaquininhasSelecionadas] = useState<string[]>([
    'stone',
    'pagseguro',
    'mercadopago',
  ]);

  const comparacao = useMemo(() => {
    return maquininhasPadrao
      .filter((m) => maquininhasSelecionadas.includes(m.id))
      .map((maquininha) => {
        const taxa = maquininha.taxas[parcelas] || 0;
        const valorRecebido = valorVenda * (1 - taxa / 100);
        const taxaReais = valorVenda - valorRecebido;

        return {
          ...maquininha,
          taxa,
          valorRecebido,
          taxaReais,
        };
      })
      .sort((a, b) => b.valorRecebido - a.valorRecebido);
  }, [valorVenda, parcelas, maquininhasSelecionadas]);

  const melhorOpcao = comparacao[0];
  const piorOpcao = comparacao.at(-1);
  const diferencaMaxima = melhorOpcao && piorOpcao 
    ? melhorOpcao.valorRecebido - piorOpcao.valorRecebido 
    : 0;

  const toggleMaquininha = (id: string) => {
    setMaquininhasSelecionadas((prev) =>
      prev.includes(id)
        ? prev.filter((m) => m !== id)
        : [...prev, id]
    );
  };

  const handleClose = () => {
    trackEvent('comparador_maquininhas_closed', {
      valor_venda: valorVenda,
      parcelas,
    });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Comparador de Maquininhas
          </DialogTitle>
          <p className="text-sm text-muted-foreground">
            Compare as taxas de diferentes maquininhas lado a lado.
          </p>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Configurações */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Valor da venda</Label>
              <Input
                type="number"
                min="0"
                step="0.01"
                value={valorVenda}
                onChange={(e) => setValorVenda(Number(e.target.value) || 0)}
              />
            </div>
            <div>
              <Label>Parcelas</Label>
              <Select
                value={parcelas.toString()}
                onValueChange={(value) => setParcelas(Number(value))}
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
            </div>
          </div>

          {/* Seletor de maquininhas */}
          <div>
            <Label>Maquininhas para comparar</Label>
            <div className="flex flex-wrap gap-2 mt-2">
              {maquininhasPadrao.map((m) => (
                <Button
                  key={m.id}
                  variant={maquininhasSelecionadas.includes(m.id) ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => toggleMaquininha(m.id)}
                  className="text-xs"
                >
                  <span className={`w-2 h-2 rounded-full ${m.cor} mr-2`} />
                  {m.nome}
                </Button>
              ))}
            </div>
          </div>

          {/* Diferença máxima */}
          {diferencaMaxima > 0 && (
            <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30 rounded-lg border border-green-200 dark:border-green-800">
              <div className="flex items-center gap-2">
                <TrendingDown className="h-5 w-5 text-green-600" />
                <span className="text-sm font-medium">Economia potencial:</span>
                <span className="text-lg font-bold text-green-600">
                  R$ {diferencaMaxima.toFixed(2)}
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Diferença entre a melhor e a pior opção selecionada.
              </p>
            </div>
          )}

          {/* Tabela comparativa */}
          <div className="border rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-muted">
                <tr>
                  <th className="p-3 text-left font-medium">Maquininha</th>
                  <th className="p-3 text-right font-medium">Taxa</th>
                  <th className="p-3 text-right font-medium">Desconto</th>
                  <th className="p-3 text-right font-medium">Você recebe</th>
                </tr>
              </thead>
              <tbody>
                {comparacao.map((item, index) => (
                  <tr
                    key={item.id}
                    className={`border-t ${index === 0 ? 'bg-green-50 dark:bg-green-950/20' : ''}`}
                  >
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <span className={`w-3 h-3 rounded-full ${item.cor}`} />
                        <span className="font-medium">{item.nome}</span>
                        {index === 0 && (
                          <span className="text-xs bg-green-500 text-white px-2 py-0.5 rounded">
                            Melhor
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="p-3 text-right">{item.taxa.toFixed(2)}%</td>
                    <td className="p-3 text-right text-red-600">
                      -R$ {item.taxaReais.toFixed(2)}
                    </td>
                    <td className="p-3 text-right font-bold text-green-600">
                      R$ {item.valorRecebido.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Gráfico visual simplificado */}
          <div className="space-y-2">
            <Label>Comparação visual</Label>
            {comparacao.map((item) => {
              const percentualMax = melhorOpcao ? (item.valorRecebido / valorVenda) * 100 : 0;
              return (
                <div key={item.id} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span>{item.nome}</span>
                    <span>R$ {item.valorRecebido.toFixed(2)}</span>
                  </div>
                  <div className="h-4 bg-muted rounded-full overflow-hidden">
                    <div
                      className={`h-full ${item.cor} transition-all duration-300`}
                      style={{ width: `${percentualMax}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Observação */}
          <div className="text-xs text-muted-foreground p-3 bg-muted rounded">
            * Taxas podem variar conforme seu plano e volume de vendas. Consulte cada operadora.
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
