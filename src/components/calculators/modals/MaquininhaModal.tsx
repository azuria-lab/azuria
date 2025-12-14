import React, { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CreditCard, Save, X } from 'lucide-react';
import { useAnalyticsTracking } from '@/hooks/useAnalytics';
import { useMaquininhaPresets } from '@/hooks/useMaquininhaPresets';
import { useUserPlan } from '@/hooks/useUserPlan';
import { useTaxasHistorico } from '@/hooks/useTaxasHistorico';
import { useToast } from '@/hooks/use-toast';

interface MaquininhaModalProps {
  readonly isOpen: boolean;
  readonly onClose: () => void;
  readonly valorVenda: number;
  readonly onSave: (taxaPercentual: number) => void;
}

interface TaxasPorParcela {
  [parcela: number]: number;
}

const bandeirasTaxasPadrao: Record<string, TaxasPorParcela> = {
  visa: {
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
  },
  mastercard: {
    0: 1.99,
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
  },
  elo: {
    0: 1.99,
    1: 2.59,
    2: 4.19,
    3: 5.19,
    4: 6.19,
    5: 7.19,
    6: 8.19,
    7: 8.69,
    8: 9.19,
    9: 9.69,
    10: 10.19,
    11: 10.69,
    12: 11.19,
  },
  outro: {
    0: 2.19,
    1: 2.99,
    2: 4.49,
    3: 5.49,
    4: 6.49,
    5: 7.49,
    6: 8.49,
    7: 8.99,
    8: 9.49,
    9: 9.99,
    10: 10.49,
    11: 10.99,
    12: 11.49,
  },
};

export default function MaquininhaModal({ isOpen, onClose, valorVenda, onSave }: MaquininhaModalProps) {
  const { trackEvent } = useAnalyticsTracking();
  const { presets, savePreset, canSavePresets } = useMaquininhaPresets();
  const _isFreePlan = useUserPlan().isFreePlan;
  const { adicionarRegistro } = useTaxasHistorico();
  const { toast } = useToast();

  const [bandeira, setBandeira] = useState('visa');
  const [parcelas, setParcelas] = useState(1);
  const [taxas, setTaxas] = useState<TaxasPorParcela>({ ...bandeirasTaxasPadrao.visa });
  const [presetNome, setPresetNome] = useState('');
  const [showPresetInput, setShowPresetInput] = useState(false);

  useEffect(() => {
    if (isOpen) {
      trackEvent('modal_maquininha_opened', {
        origin: 'calculadora-rapida',
        valor_venda: valorVenda,
      });
    }
  }, [isOpen, valorVenda, trackEvent]);

  useEffect(() => {
    setTaxas({ ...bandeirasTaxasPadrao[bandeira] });
  }, [bandeira]);

  const taxaAtual = taxas[parcelas] || 0;
  const valorRecebido = valorVenda * (1 - taxaAtual / 100);
  const clientePaga = valorVenda;

  const handleTaxaChange = (parcela: number, valor: string) => {
    const novoValor = Math.max(0, Math.min(100, Number(valor) || 0));
    setTaxas((prev) => ({ ...prev, [parcela]: novoValor }));
  };

  const handleSalvar = () => {
    trackEvent('modal_maquininha_saved', {
      tax_percent: taxaAtual,
      parcelas,
      bandeira,
    });

    // Registrar no histórico
    adicionarRegistro({
      tipo: 'maquininha',
      valor_venda: valorVenda,
      taxa_aplicada: taxaAtual,
      valor_recebido: valorRecebido,
      detalhes: { bandeira, parcelas },
    });

    const parcelasLabel = parcelas === 0 ? 'débito' : `${parcelas}x`;
    toast({
      title: 'Taxa aplicada!',
      description: `Taxa de ${taxaAtual.toFixed(2)}% (${bandeira}, ${parcelasLabel}) aplicada com sucesso.`,
    });

    onSave(taxaAtual);
    onClose();
  };

  const handleSalvarPreset = () => {
    if (!canSavePresets) {
      return;
    }

    const preset = {
      id: Date.now().toString(),
      nome: presetNome || `${bandeira} - ${parcelas}x`,
      maquininha_fornecedor: 'manual',
      bandeira,
      parcelas_default: parcelas,
      taxas_por_parcela: taxas,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    savePreset(preset);
    
    trackEvent('maquininha_preset_saved', {
      preset_id: preset.id,
    });

    toast({
      title: 'Preset salvo!',
      description: `"${preset.nome}" salvo com sucesso.`,
    });

    setShowPresetInput(false);
    setPresetNome('');
  };

  const handleCancel = () => {
    trackEvent('modal_cancelled', { type: 'maquininha' });
    onClose();
  };

  const handlePresetSelect = (presetId: string) => {
    const preset = presets.find((p) => p.id === presetId);
    if (preset) {
      setBandeira(preset.bandeira);
      setParcelas(preset.parcelas_default);
      setTaxas(preset.taxas_por_parcela);
      
      trackEvent('preset_selected', {
        preset_id: presetId,
        type: 'maquininha',
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleCancel}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Maquininha
          </DialogTitle>
          <p className="text-sm text-muted-foreground">
            Configure a taxa por bandeira e parcelas.
          </p>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Valor da Venda */}
          <div>
            <Label>Valor da venda</Label>
            <Input
              type="text"
              value={`R$ ${valorVenda.toFixed(2)}`}
              disabled
              className="bg-muted"
            />
          </div>

          {/* Presets salvos */}
          {presets.length > 0 && (
            <div>
              <Label>Presets salvos</Label>
              <Select onValueChange={handlePresetSelect}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um preset" />
                </SelectTrigger>
                <SelectContent>
                  {presets.map((preset) => (
                    <SelectItem key={preset.id} value={preset.id}>
                      {preset.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Resumo financeiro */}
          <div className="grid grid-cols-2 gap-4 p-4 bg-muted rounded-lg">
            <div>
              <p className="text-sm text-muted-foreground">Seu cliente paga:</p>
              <p className="text-lg font-bold">R$ {clientePaga.toFixed(2)}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Você recebe:</p>
              <p className="text-lg font-bold text-green-600">
                R$ {valorRecebido.toFixed(2)}
              </p>
            </div>
          </div>

          <div className="text-sm text-muted-foreground text-center">
            Taxa aplicada: {taxaAtual.toFixed(2)}%
          </div>

          {/* Bandeira */}
          <div>
            <Label>Bandeira</Label>
            <div className="grid grid-cols-4 gap-2 mt-2">
              {['visa', 'mastercard', 'elo', 'outro'].map((b) => (
                <Button
                  key={b}
                  type="button"
                  variant={bandeira === b ? 'default' : 'outline'}
                  onClick={() => setBandeira(b)}
                  className="capitalize"
                >
                  {b}
                </Button>
              ))}
            </div>
          </div>

          {/* Parcelas */}
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

          {/* Tabela de taxas */}
          <div>
            <Label>Taxas por parcela</Label>
            <div className="mt-2 max-h-[200px] overflow-y-auto border rounded-lg">
              <table className="w-full text-sm">
                <thead className="bg-muted sticky top-0">
                  <tr>
                    <th className="p-2 text-left">Parcelas</th>
                    <th className="p-2 text-right">Taxa (%)</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-t">
                    <td className="p-2">Débito</td>
                    <td className="p-2 text-right">
                      <Input
                        type="number"
                        min="0"
                        max="100"
                        step="0.01"
                        value={taxas[0] || 0}
                        onChange={(e) => handleTaxaChange(0, e.target.value)}
                        className="h-8 text-right"
                      />
                    </td>
                  </tr>
                  {Array.from({ length: 12 }, (_, i) => i + 1).map((p) => (
                    <tr key={p} className="border-t">
                      <td className="p-2">{p}x</td>
                      <td className="p-2 text-right">
                        <Input
                          type="number"
                          min="0"
                          max="100"
                          step="0.01"
                          value={taxas[p] || 0}
                          onChange={(e) => handleTaxaChange(p, e.target.value)}
                          className="h-8 text-right"
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Observação */}
          <div className="text-xs text-muted-foreground p-3 bg-muted rounded">
            Taxas salvas ficam disponíveis neste dispositivo.
          </div>

          {/* Salvar como preset */}
          {showPresetInput && canSavePresets && (
            <div className="space-y-2">
              <Label>Nome do preset</Label>
              <div className="flex gap-2">
                <Input
                  value={presetNome}
                  onChange={(e) => setPresetNome(e.target.value)}
                  placeholder="Ex: Stone Visa"
                />
                <Button onClick={handleSalvarPreset} size="sm">
                  <Save className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Ações */}
        <div className="flex flex-col gap-2">
          <Button onClick={handleSalvar} className="w-full">
            Salvar
          </Button>

          {canSavePresets ? (
            <Button
              variant="outline"
              onClick={() => setShowPresetInput(!showPresetInput)}
              className="w-full"
            >
              {showPresetInput ? 'Cancelar preset' : 'Salvar como preset'}
            </Button>
          ) : (
            <Button variant="outline" disabled className="w-full">
              Salvar preset (disponível no Plano Iniciante)
            </Button>
          )}

          <Button variant="ghost" onClick={handleCancel} className="w-full">
            <X className="h-4 w-4 mr-2" />
            Cancelar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
