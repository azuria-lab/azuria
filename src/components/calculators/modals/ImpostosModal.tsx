import React, { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertCircle, FileText, Save, X } from 'lucide-react';
import { useAnalyticsTracking } from '@/hooks/useAnalytics';
import { useImpostosPresets } from '@/hooks/useImpostosPresets';
import { useUserPlan } from '@/hooks/useUserPlan';
import { useTaxasHistorico } from '@/hooks/useTaxasHistorico';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface ImpostosModalProps {
  readonly isOpen: boolean;
  readonly onClose: () => void;
  readonly valorVenda: number;
  readonly onSave: (impostosPercentual: number) => void;
}

const estadosBrasileiros = [
  'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA',
  'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN',
  'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO',
];

const icmsPadrao: Record<string, number> = {
  AC: 17, AL: 18, AP: 18, AM: 18, BA: 18, CE: 18, DF: 18, ES: 17,
  GO: 17, MA: 18, MT: 17, MS: 17, MG: 18, PA: 17, PB: 18, PR: 18,
  PE: 18, PI: 18, RJ: 18, RN: 18, RS: 18, RO: 17.5, RR: 17,
  SC: 17, SP: 18, SE: 18, TO: 18,
};

export default function ImpostosModal({ isOpen, onClose, valorVenda, onSave }: ImpostosModalProps) {
  const { trackEvent } = useAnalyticsTracking();
  const { presets, savePreset, canSavePresets } = useImpostosPresets();
  const _isFreePlan = useUserPlan().isFreePlan;
  const { adicionarRegistro } = useTaxasHistorico();
  const { toast } = useToast();

  const [tipoOperacao, setTipoOperacao] = useState<'interna' | 'interestadual'>('interna');
  const [ufOrigem, setUfOrigem] = useState('SP');
  const [ufDestino, setUfDestino] = useState('SP');
  const [icms, setIcms] = useState(icmsPadrao.SP);
  const [pis, setPis] = useState(1.65);
  const [cofins, setCofins] = useState(7.6);
  const [presetNome, setPresetNome] = useState('');
  const [showPresetInput, setShowPresetInput] = useState(false);

  useEffect(() => {
    if (isOpen) {
      trackEvent('modal_impostos_opened', {
        origin: 'calculadora-rapida',
        valor_venda: valorVenda,
      });
    }
  }, [isOpen, valorVenda, trackEvent]);

  useEffect(() => {
    if (tipoOperacao === 'interna') {
      setIcms(icmsPadrao[ufOrigem] || 18);
    } else {
      // Interestadual: usar alíquota interestadual (simplificado)
      setIcms(12); // Alíquota interestadual padrão
    }
  }, [tipoOperacao, ufOrigem]);

  const percentualTotal = icms + pis + cofins;
  const impostosEstimados = (valorVenda * percentualTotal) / 100;
  const valorRecebido = valorVenda - impostosEstimados;

  const handleSalvar = () => {
    trackEvent('modal_impostos_saved', {
      icms,
      pis,
      cofins,
      percentual_total: percentualTotal,
    });

    // Registrar no histórico
    adicionarRegistro({
      tipo: 'impostos',
      valor_venda: valorVenda,
      taxa_aplicada: percentualTotal,
      valor_recebido: valorRecebido,
      detalhes: { icms, pis, cofins, ufOrigem, tipoOperacao },
    });

    toast({
      title: 'Impostos aplicados!',
      description: `Impostos de ${percentualTotal.toFixed(2)}% aplicados com sucesso.`,
    });

    onSave(percentualTotal);
    onClose();
  };

  const handleSalvarPreset = () => {
    if (!canSavePresets) {
      return;
    }

    const preset = {
      id: Date.now().toString(),
      nome: presetNome || `${ufOrigem} - ${tipoOperacao}`,
      origemUF: ufOrigem,
      destinoUF: ufDestino,
      tipoOperacao,
      icms,
      pis,
      cofins,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    savePreset(preset);
    
    trackEvent('impostos_preset_saved', {
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
    trackEvent('modal_cancelled', { type: 'impostos' });
    onClose();
  };

  const handlePresetSelect = (presetId: string) => {
    const preset = presets.find((p) => p.id === presetId);
    if (preset) {
      setTipoOperacao(preset.tipoOperacao);
      setUfOrigem(preset.origemUF);
      setUfDestino(preset.destinoUF);
      setIcms(preset.icms);
      setPis(preset.pis);
      setCofins(preset.cofins);
      
      trackEvent('preset_selected', {
        preset_id: presetId,
        type: 'impostos',
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleCancel}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Impostos
          </DialogTitle>
          <p className="text-sm text-muted-foreground">
            Estimativa rápida de impostos aplicados.
          </p>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Esta é uma estimativa simplificada. Consulte um contador para valores exatos.
            </AlertDescription>
          </Alert>

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

          {/* Tipo de Operação */}
          <div>
            <Label>Operação</Label>
            <Select
              value={tipoOperacao}
              onValueChange={(value: 'interna' | 'interestadual') => setTipoOperacao(value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="interna">Venda Interna</SelectItem>
                <SelectItem value="interestadual">Venda Interestadual</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* UF Origem */}
          <div>
            <Label>UF Origem</Label>
            <Select value={ufOrigem} onValueChange={setUfOrigem}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {estadosBrasileiros.map((uf) => (
                  <SelectItem key={uf} value={uf}>
                    {uf}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* UF Destino (apenas interestadual) */}
          {tipoOperacao === 'interestadual' && (
            <div>
              <Label>UF Destino</Label>
              <Select value={ufDestino} onValueChange={setUfDestino}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {estadosBrasileiros.map((uf) => (
                    <SelectItem key={uf} value={uf}>
                      {uf}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* ICMS */}
          <div>
            <Label>ICMS (%)</Label>
            <Input
              type="number"
              min="0"
              max="100"
              step="0.01"
              value={icms}
              onChange={(e) => setIcms(Math.max(0, Math.min(100, Number(e.target.value) || 0)))}
            />
          </div>

          {/* PIS e COFINS */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>PIS (%)</Label>
              <Input
                type="number"
                min="0"
                max="100"
                step="0.01"
                value={pis}
                onChange={(e) => setPis(Math.max(0, Math.min(100, Number(e.target.value) || 0)))}
              />
            </div>
            <div>
              <Label>COFINS (%)</Label>
              <Input
                type="number"
                min="0"
                max="100"
                step="0.01"
                value={cofins}
                onChange={(e) => setCofins(Math.max(0, Math.min(100, Number(e.target.value) || 0)))}
              />
            </div>
          </div>

          {/* Resultado */}
          <div className="p-4 bg-muted rounded-lg space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Impostos estimados:</span>
              <span className="text-lg font-bold text-red-600">
                R$ {impostosEstimados.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Percentual total:</span>
              <span className="text-lg font-bold">
                {percentualTotal.toFixed(2)}%
              </span>
            </div>
            <div className="flex justify-between items-center pt-2 border-t">
              <span className="text-sm text-muted-foreground">Você recebe:</span>
              <span className="text-lg font-bold text-green-600">
                R$ {valorRecebido.toFixed(2)}
              </span>
            </div>
          </div>

          {/* Salvar como preset */}
          {showPresetInput && canSavePresets && (
            <div className="space-y-2">
              <Label>Nome do preset</Label>
              <div className="flex gap-2">
                <Input
                  value={presetNome}
                  onChange={(e) => setPresetNome(e.target.value)}
                  placeholder="Ex: SP Simples Nacional"
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
