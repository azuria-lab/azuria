import React, { useEffect, useRef, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Check, ChevronDown, ChevronLeft, ChevronRight, CreditCard, MoreHorizontal, Save, X } from 'lucide-react';
import { useAnalyticsTracking } from '@/hooks/useAnalytics';
import { useMaquininhaPresets } from '@/hooks/useMaquininhaPresets';
import { useUserPlan } from '@/hooks/useUserPlan';
import { useTaxasHistorico } from '@/hooks/useTaxasHistorico';
import { useToast } from '@/hooks/use-toast';
import { logger } from '@/services/logger';

interface MaquininhaModalProps {
  readonly isOpen: boolean;
  readonly onClose: () => void;
  readonly valorVenda: number;
  readonly onSave: (taxaPercentual: number) => void;
}

interface TaxasPorParcela {
  [parcela: number]: number;
}

interface BandeiraConfig {
  id: string;
  nome: string;
  logoUrl: string;
}

const BANDEIRAS: BandeiraConfig[] = [
  {
    id: 'visa',
    nome: 'Visa',
    // Logo oficial simples em SVG
    logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/5/5e/Visa_Inc._logo.svg',
  },
  {
    id: 'mastercard',
    nome: 'Mastercard',
    logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/0/0c/Mastercard_logo.png',
  },
  {
    id: 'elo',
    nome: 'Elo',
    logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/8/89/Bandeira_elo.svg',
  },
  {
    id: 'outro',
    nome: 'Outras bandeiras',
    logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/3/30/Credit_card_font_awesome.svg',
  },
];

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
  const { presets, savePreset, deletePreset, canSavePresets } = useMaquininhaPresets();
  const _isFreePlan = useUserPlan().isFreePlan;
  const { adicionarRegistro } = useTaxasHistorico();
  const { toast } = useToast();

  const [bandeira, setBandeira] = useState('visa');
  const [parcelas, setParcelas] = useState(1);
  const [taxas, setTaxas] = useState<TaxasPorParcela>({ ...bandeirasTaxasPadrao.visa });
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

  const handleSalvarPreset = async () => {
    if (!canSavePresets) {
      return;
    }

    const presetId = editingPresetId ?? Date.now().toString();

    const preset = {
      id: presetId,
      nome: presetNome || `${bandeira} - ${parcelas}x`,
      maquininha_fornecedor: 'manual',
      bandeira,
      parcelas_default: parcelas,
      taxas_por_parcela: taxas,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    try {
      const saved = await savePreset(preset);
      
      if (saved) {
        trackEvent('maquininha_preset_saved', {
          preset_id: preset.id,
        });

        toast({
          title: 'Operadora salva',
          description: `"${preset.nome}" salva com sucesso.`,
        });

        setShowPresetInput(false);
        setPresetNome('');
        setEditingPresetId(null);
        setSelectedPresetId(presetId);
      }
    } catch (error) {
      logger.error('Erro ao salvar operadora:', error);
      toast({
        title: 'Erro ao salvar',
        description: 'Não foi possível salvar a operadora. Tente novamente.',
        variant: 'destructive',
      });
    }
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
      setSelectedPresetId(presetId);
      setEditingPresetId(null);
      setShowPresetInput(false);
      
      trackEvent('preset_selected', {
        preset_id: presetId,
        type: 'maquininha',
      });
    }
  };

  return (
    <TooltipProvider>
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

          {/* Operadora (sempre visível) */}
          <div>
            <Label>Operadora</Label>
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
                          ? "Nenhuma Operadora cadastrada" 
                          : "Selecione uma Operadora"}
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
                                setBandeira(preset.bandeira);
                                setParcelas(preset.parcelas_default);
                                setTaxas(preset.taxas_por_parcela);
                                setPresetNome(preset.nome);
                                setEditingPresetId(preset.id);
                                setShowPresetInput(true);
                                setSelectedPresetId(preset.id);
                                setSelectOpen(false);
                                // Scroll para área de edição após um pequeno delay para garantir que o estado foi atualizado
                                setTimeout(() => {
                                  if (editAreaRef.current) {
                                    // Encontrar o DialogContent que é o container scrollável
                                    const dialogContent = editAreaRef.current.closest('[class*="overflow-y-auto"]') as HTMLElement;
                                    if (dialogContent) {
                                      const elementRect = editAreaRef.current.getBoundingClientRect();
                                      const containerRect = dialogContent.getBoundingClientRect();
                                      const scrollTop = dialogContent.scrollTop;
                                      const elementTop = elementRect.top - containerRect.top + scrollTop;
                                      const containerHeight = containerRect.height;
                                      const elementHeight = elementRect.height;
                                      // Centralizar o elemento no container
                                      const scrollPosition = elementTop - (containerHeight / 2) + (elementHeight / 2);
                                      dialogContent.scrollTo({ top: Math.max(0, scrollPosition), behavior: 'smooth' });
                                    } else {
                                      // Fallback: usar scrollIntoView com center
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

          {/* Resumo financeiro - apenas valor recebido */}
          <div className="p-4 bg-muted rounded-lg">
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Você recebe</p>
              <p className="text-xl font-bold text-green-600">
                R$ {valorRecebido.toFixed(2)}
              </p>
            </div>
          </div>

          <div className="text-sm text-muted-foreground text-center">
            Taxa aplicada: {taxaAtual.toFixed(2)}%
          </div>

          {/* Bandeira */}
          <div>
            <Label className="text-sm font-medium text-muted-foreground">Bandeira</Label>
            <div className="mt-2 flex items-center justify-between gap-3">
              {/* Anterior */}
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="h-[30px] w-[30px] rounded-full bg-muted shadow-sm border"
                onClick={() => {
                  const currentIndex = BANDEIRAS.findIndex((b) => b.id === bandeira);
                  const newIndex = (currentIndex - 1 + BANDEIRAS.length) % BANDEIRAS.length;
                  setBandeira(BANDEIRAS[newIndex]?.id ?? 'visa');
                }}
              >
                <ChevronLeft className="h-5 w-5" />
              </Button>

              {/* Logo da bandeira */}
              <div className="flex-1 flex items-center justify-center">
                {(() => {
                  const current = BANDEIRAS.find((b) => b.id === bandeira) ?? BANDEIRAS[0];
                  return (
                    <div className="flex flex-col items-center gap-1">
                      <div className="h-4 flex items-center justify-center">
                        <img
                          src={current.logoUrl}
                          alt={current.nome}
                          className="max-h-full max-w-[72px] object-contain"
                        />
                      </div>
                      <span className="text-[11px] text-muted-foreground leading-none">
                        {current.nome}
                      </span>
                    </div>
                  );
                })()}
              </div>

              {/* Próxima */}
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="h-[30px] w-[30px] rounded-full bg-muted shadow-sm border"
                onClick={() => {
                  const currentIndex = BANDEIRAS.findIndex((b) => b.id === bandeira);
                  const newIndex = (currentIndex + 1) % BANDEIRAS.length;
                  setBandeira(BANDEIRAS[newIndex]?.id ?? 'visa');
                }}
              >
                <ChevronRight className="h-5 w-5" />
              </Button>
            </div>
          </div>

          {/* Parcelas - seleção com setas, mantendo tabela de taxas abaixo */}
          <div>
            <Label className="text-sm font-medium text-muted-foreground">Parcelas</Label>
            <div className="mt-2 flex items-center justify-between gap-3">
              {/* Anterior */}
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="h-[30px] w-[30px] rounded-full bg-muted shadow-sm border"
                onClick={() => {
                  const options = Array.from({ length: 13 }, (_, i) => i); // 0 = débito, 1-12 crédito
                  const currentIndex = options.indexOf(parcelas);
                  const newIndex = (currentIndex - 1 + options.length) % options.length;
                  setParcelas(options[newIndex]);
                }}
              >
                <ChevronLeft className="h-5 w-5" />
              </Button>

              {/* Texto central com tipo de pagamento e taxa */}
              <div className="flex-1 text-center">
                <p className="text-sm font-semibold text-foreground">
                  {parcelas === 0 ? 'Débito' : `Crédito ${parcelas}x`}
                </p>
                <p className="text-xs text-muted-foreground">
                  {taxaAtual.toFixed(2)}%
                </p>
              </div>

              {/* Próxima */}
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="h-[30px] w-[30px] rounded-full bg-muted shadow-sm border"
                onClick={() => {
                  const options = Array.from({ length: 13 }, (_, i) => i);
                  const currentIndex = options.indexOf(parcelas);
                  const newIndex = (currentIndex + 1) % options.length;
                  setParcelas(options[newIndex]);
                }}
              >
                <ChevronRight className="h-5 w-5" />
              </Button>
            </div>
          </div>

          {/* Incluir Operadora */}
          {showPresetInput && canSavePresets && (
            <div ref={editAreaRef} className="space-y-4">
              <div className="space-y-2">
                <Label>Nome da Operadora</Label>
                <div className="flex gap-2">
                  <Input
                    value={presetNome}
                    onChange={(e) => setPresetNome(e.target.value)}
                    placeholder="Ex: InfinitePay Visa 1x"
                  />
                  <Button onClick={handleSalvarPreset} size="sm">
                    <Save className="h-4 w-4" />
                  </Button>
                </div>
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
              {showPresetInput ? 'Cancelar Operadora' : 'Incluir Operadora'}
            </Button>
          ) : (
            <Button variant="outline" disabled className="w-full">
              Incluir Operadora (disponível no Plano Iniciante)
            </Button>
          )}

          <Button variant="ghost" onClick={handleCancel} className="w-full">
            <X className="h-4 w-4 mr-2" />
            Cancelar
          </Button>
        </div>
      </DialogContent>

      {/* Diálogo de confirmação de exclusão */}
      <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir Operadora</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir esta operadora? Esta ação não pode ser desfeita.
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
                      title: 'Operadora excluída',
                      description: 'A operadora foi removida com sucesso.',
                    });
                    setDeleteConfirmOpen(false);
                    setPresetToDelete(null);
                  } catch (error) {
                    logger.error('Erro ao excluir operadora:', error);
                    toast({
                      title: 'Erro ao excluir',
                      description: 'Não foi possível excluir a operadora. Tente novamente.',
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
        </Dialog>
      </TooltipProvider>
  );
}
