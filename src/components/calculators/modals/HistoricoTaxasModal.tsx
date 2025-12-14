import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { History, Trash2, X } from 'lucide-react';
import { useTaxasHistorico } from '@/hooks/useTaxasHistorico';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface HistoricoTaxasModalProps {
  readonly isOpen: boolean;
  readonly onClose: () => void;
}

export default function HistoricoTaxasModal({
  isOpen,
  onClose,
}: HistoricoTaxasModalProps) {
  const { historico, limparHistorico, getEstatisticas } = useTaxasHistorico();
  const stats = getEstatisticas();

  const formatTipo = (tipo: string) => (tipo === 'maquininha' ? '💳' : '📄');

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            Histórico de Taxas Aplicadas
          </DialogTitle>
          <p className="text-sm text-muted-foreground">
            Registro das últimas configurações de taxas utilizadas.
          </p>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Estatísticas */}
          <div className="grid grid-cols-3 gap-4">
            <div className="p-3 bg-muted rounded-lg text-center">
              <div className="text-xs text-muted-foreground">Total aplicações</div>
              <div className="text-xl font-bold">{stats.totalRegistros}</div>
            </div>
            <div className="p-3 bg-muted rounded-lg text-center">
              <div className="text-xs text-muted-foreground">Taxa média</div>
              <div className="text-xl font-bold">{stats.mediaTaxa.toFixed(2)}%</div>
            </div>
            <div className="p-3 bg-red-50 dark:bg-red-950/30 rounded-lg text-center">
              <div className="text-xs text-muted-foreground">Total em taxas</div>
              <div className="text-xl font-bold text-red-600">
                R$ {stats.totalTaxasPagas.toFixed(2)}
              </div>
            </div>
          </div>

          {/* Médias por tipo */}
          {stats.totalRegistros > 0 && (
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-blue-50 dark:bg-blue-950/30 rounded-lg">
                <div className="flex items-center gap-2 mb-1">
                  <span>💳</span>
                  <span className="text-xs text-muted-foreground">Maquininha</span>
                </div>
                <div className="font-bold">{stats.mediaTaxaMaquininha.toFixed(2)}% média</div>
              </div>
              <div className="p-3 bg-green-50 dark:bg-green-950/30 rounded-lg">
                <div className="flex items-center gap-2 mb-1">
                  <span>📄</span>
                  <span className="text-xs text-muted-foreground">Impostos</span>
                </div>
                <div className="font-bold">{stats.mediaTaxaImpostos.toFixed(2)}% média</div>
              </div>
            </div>
          )}

          {/* Lista de histórico */}
          <div className="border rounded-lg overflow-hidden">
            <div className="max-h-[300px] overflow-y-auto">
              {historico.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground">
                  <History className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>Nenhum registro ainda.</p>
                  <p className="text-xs">Use os modais de Maquininha ou Impostos para começar.</p>
                </div>
              ) : (
                <table className="w-full text-sm">
                  <thead className="bg-muted sticky top-0">
                    <tr>
                      <th className="p-2 text-left">Tipo</th>
                      <th className="p-2 text-right">Valor</th>
                      <th className="p-2 text-right">Taxa</th>
                      <th className="p-2 text-right">Recebido</th>
                      <th className="p-2 text-right">Quando</th>
                    </tr>
                  </thead>
                  <tbody>
                    {historico.map((item) => (
                      <tr key={item.id} className="border-t hover:bg-muted/50">
                        <td className="p-2">
                          <span title={item.tipo}>{formatTipo(item.tipo)}</span>
                        </td>
                        <td className="p-2 text-right">
                          R$ {item.valor_venda.toFixed(2)}
                        </td>
                        <td className="p-2 text-right text-red-600">
                          {item.taxa_aplicada.toFixed(2)}%
                        </td>
                        <td className="p-2 text-right text-green-600 font-medium">
                          R$ {item.valor_recebido.toFixed(2)}
                        </td>
                        <td className="p-2 text-right text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(item.created_at), {
                            addSuffix: true,
                            locale: ptBR,
                          })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>

          {/* Ações */}
          {historico.length > 0 && (
            <Button
              variant="outline"
              onClick={limparHistorico}
              className="w-full text-red-600 hover:text-red-700"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Limpar histórico
            </Button>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-2">
          <Button variant="ghost" onClick={onClose}>
            <X className="h-4 w-4 mr-2" />
            Fechar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
