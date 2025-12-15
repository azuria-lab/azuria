import React, { useEffect, useRef, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { AlertCircle, Check, ChevronDown, FileText, MoreHorizontal, Save, X } from 'lucide-react';
import { useAnalyticsTracking } from '@/hooks/useAnalytics';
import { useImpostosPresets } from '@/hooks/useImpostosPresets';
import { useUserPlan } from '@/hooks/useUserPlan';
import { useTaxasHistorico } from '@/hooks/useTaxasHistorico';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { logger } from '@/services/logger';

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
  const { presets, savePreset, deletePreset, canSavePresets } = useImpostosPresets();
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
  const [selectedPresetId, setSelectedPresetId] = useState<string | null>(null);
  const [editingPresetId, setEditingPresetId] = useState<string | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [presetToDelete, setPresetToDelete] = useState<string | null>(null);
  const [selectOpen, setSelectOpen] = useState(false);
  const editAreaRef = useRef<HTMLDivElement>(null);

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

  const handleSalvarPreset = async () => {
    if (!canSavePresets) {
      return;
    }

    const presetId = editingPresetId ?? Date.now().toString();

    const preset = {
      id: presetId,
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

    try {
      const saved = await savePreset(preset);
      
      if (saved) {
        trackEvent('impostos_preset_saved', {
          preset_id: preset.id,
        });

        toast({
          title: 'Configuração salva',
          description: `"${preset.nome}" salva com sucesso.`,
        });

        setShowPresetInput(false);
        setPresetNome('');
        setEditingPresetId(null);
        setSelectedPresetId(presetId);
      }
    } catch (error) {
      logger.error('Erro ao salvar configuração:', error);
      toast({
        title: 'Erro ao salvar',
        description: 'Não foi possível salvar a configuração. Tente novamente.',
        variant: 'destructive',
      });
    }
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
      setSelectedPresetId(presetId);
      setEditingPresetId(null);
      setShowPresetInput(false);
      
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

          {/* Configuração (sempre visível) */}
          <div>
            <Label>Configuração</Label>
            <Popover open={selectOpen} onOpenChange={setSelectOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  disabled={presets.length === 0}
                  className="w-full justify-between h-10"
                >
                  <div className="flex items-center gap-2">
                    {selectedPresetId && (
                      <Check className="h-4 w-4 text-green-600 shrink-0" />
                    )}
                    <span className={selectedPresetId ? "" : "text-muted-foreground"}>
                      {selectedPresetId 
                        ? presets.find(p => p.id === selectedPresetId)?.nome 
                        : presets.length === 0 
                          ? "Nenhuma Configuração cadastrada" 
                          : "Selecione uma Configuração"}
                    </span>
                  </div>
                  <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-1 min-w-[300px]" align="start">
                <div className="max-h-96 overflow-auto">
                  {presets.map((preset) => (
                    <div
                      key={preset.id}
                      className="group/item relative flex items-center rounded-sm px-2 py-1.5 text-sm cursor-pointer hover:bg-accent hover:text-accent-foreground"
                      onClick={(e) => {
                        const target = e.target as HTMLElement;
                        if (!target.closest('button')) {
                          handlePresetSelect(preset.id);
                          setSelectOpen(false);
                        }
                      }}
                    >
                      <span className="flex-1 pr-20">{preset.nome}</span>
                      <div 
                        className="absolute right-4 top-1/2 -translate-y-1/2 flex gap-2 opacity-0 group-hover/item:opacity-100 transition-opacity pointer-events-auto z-10"
                        onClick={(e) => e.stopPropagation()}
                        onPointerDown={(e) => e.stopPropagation()}
                      >
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onPointerDown={(e) => {
                                e.stopPropagation();
                                e.preventDefault();
                              }}
                              onClick={(e) => {
                                e.stopPropagation();
                                e.preventDefault();
                                // Carregar dados do preset para edição
                                setTipoOperacao(preset.tipoOperacao);
                                setUfOrigem(preset.origemUF);
                                setUfDestino(preset.destinoUF);
                                setIcms(preset.icms);
                                setPis(preset.pis);
                                setCofins(preset.cofins);
                                setPresetNome(preset.nome);
                                setEditingPresetId(preset.id);
                                setShowPresetInput(true);
                                setSelectedPresetId(preset.id);
                                setSelectOpen(false);
                                // Scroll para área de edição
                                setTimeout(() => {
                                  if (editAreaRef.current) {
                                    const dialogContent = editAreaRef.current.closest('[class*="overflow-y-auto"]') as HTMLElement;
                                    if (dialogContent) {
                                      const elementRect = editAreaRef.current.getBoundingClientRect();
                                      const containerRect = dialogContent.getBoundingClientRect();
                                      const scrollTop = dialogContent.scrollTop;
                                      const elementTop = elementRect.top - containerRect.top + scrollTop;
                                      const containerHeight = containerRect.height;
                                      const elementHeight = elementRect.height;
                                      const scrollPosition = elementTop - (containerHeight / 2) + (elementHeight / 2);
                                      dialogContent.scrollTo({ top: Math.max(0, scrollPosition), behavior: 'smooth' });
                                    } else {
                                      editAreaRef.current.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'nearest' });
                                    }
                                  }
                                }, 200);
                              }}
                            >
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent side="left" className="z-[9999]">
                            <p>Editar</p>
                          </TooltipContent>
                        </Tooltip>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-red-600 hover:bg-red-50"
                              onPointerDown={(e) => {
                                e.stopPropagation();
                                e.preventDefault();
                              }}
                              onClick={(e) => {
                                e.stopPropagation();
                                e.preventDefault();
                                setPresetToDelete(preset.id);
                                setDeleteConfirmOpen(true);
                                setSelectOpen(false);
                              }}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent side="left" className="z-[9999]">
                            <p>Excluir</p>
                          </TooltipContent>
                        </Tooltip>
                      </div>
                    </div>
                  ))}
                </div>
              </PopoverContent>
            </Popover>
          </div>

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
              <span className="text-xl font-semibold tracking-tight text-red-600">
                R$ {impostosEstimados.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Percentual total:</span>
              <span className="text-xl font-semibold tracking-tight">
                {percentualTotal.toFixed(2)}%
              </span>
            </div>
            <div className="flex justify-between items-center pt-2 border-t">
              <span className="text-sm text-muted-foreground">Você recebe:</span>
              <span className="text-xl font-semibold tracking-tight text-green-600">
                R$ {valorRecebido.toFixed(2)}
              </span>
            </div>
          </div>

          {/* Incluir Configuração */}
          {showPresetInput && canSavePresets && (
            <div ref={editAreaRef} className="space-y-2">
              <Label>Nome da Configuração</Label>
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
              onClick={() => {
                setShowPresetInput(!showPresetInput);
                if (!showPresetInput) {
                  setPresetNome('');
                  setEditingPresetId(null);
                }
              }}
              className="w-full"
            >
              {showPresetInput ? 'Cancelar Configuração' : 'Incluir Configuração'}
            </Button>
          ) : (
            <Button variant="outline" disabled className="w-full">
              Incluir Configuração (disponível no Plano Iniciante)
            </Button>
          )}

          <Button variant="ghost" onClick={handleCancel} className="w-full">
            <X className="h-4 w-4 mr-2" />
            Cancelar
          </Button>
        </div>

        {/* Diálogo de confirmação de exclusão */}
        <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Excluir Configuração</AlertDialogTitle>
              <AlertDialogDescription>
                Tem certeza que deseja excluir esta configuração? Esta ação não pode ser desfeita.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => {
                setDeleteConfirmOpen(false);
                setPresetToDelete(null);
              }}>
                Cancelar
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={async () => {
                  if (presetToDelete) {
                    try {
                      await deletePreset(presetToDelete);
                      if (selectedPresetId === presetToDelete) {
                        setSelectedPresetId(null);
                      }
                      if (editingPresetId === presetToDelete) {
                        setEditingPresetId(null);
                        setShowPresetInput(false);
                        setPresetNome('');
                      }
                      toast({
                        title: 'Configuração excluída',
                        description: 'A configuração foi removida com sucesso.',
                      });
                      setDeleteConfirmOpen(false);
                      setPresetToDelete(null);
                    } catch (error) {
                      logger.error('Erro ao excluir configuração:', error);
                      toast({
                        title: 'Erro ao excluir',
                        description: 'Não foi possível excluir a configuração. Tente novamente.',
                        variant: 'destructive',
                      });
                    }
                  }
                }}
                className="bg-red-600 hover:bg-red-700"
              >
                Excluir
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </DialogContent>
    </Dialog>
  );
}
