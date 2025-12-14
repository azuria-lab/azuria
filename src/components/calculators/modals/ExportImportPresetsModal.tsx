import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Download, History, Upload, X } from 'lucide-react';
import { MaquininhaPreset, useMaquininhaPresets } from '@/hooks/useMaquininhaPresets';
import { ImpostosPreset, useImpostosPresets } from '@/hooks/useImpostosPresets';
import { useToast } from '@/hooks/use-toast';

interface ExportImportPresetsModalProps {
  readonly isOpen: boolean;
  readonly onClose: () => void;
}

interface ExportData {
  version: string;
  exported_at: string;
  maquininha_presets: MaquininhaPreset[];
  impostos_presets: ImpostosPreset[];
}

export default function ExportImportPresetsModal({
  isOpen,
  onClose,
}: ExportImportPresetsModalProps) {
  const { toast } = useToast();
  const { presets: maquininhaPresets, savePreset: saveMaquininhaPreset } = useMaquininhaPresets();
  const { presets: impostosPresets, savePreset: saveImpostosPreset } = useImpostosPresets();
  const [importData, setImportData] = useState('');

  const handleExport = () => {
    const exportData: ExportData = {
      version: '1.0',
      exported_at: new Date().toISOString(),
      maquininha_presets: maquininhaPresets,
      impostos_presets: impostosPresets,
    };

    const json = JSON.stringify(exportData, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = `azuria_presets_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);

    toast({
      title: 'Presets exportados!',
      description: `${maquininhaPresets.length + impostosPresets.length} presets exportados com sucesso.`,
    });
  };

  const handleImport = () => {
    try {
      const data: ExportData = JSON.parse(importData);

      if (!data.version || !data.maquininha_presets || !data.impostos_presets) {
        throw new Error('Formato inválido');
      }

      let importados = 0;

      // Importar presets de maquininha
      for (const preset of data.maquininha_presets) {
        const novoPreset = {
          ...preset,
          id: Date.now().toString() + Math.random().toString(36).substring(2, 9),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
        saveMaquininhaPreset(novoPreset);
        importados++;
      }

      // Importar presets de impostos
      for (const preset of data.impostos_presets) {
        const novoPreset = {
          ...preset,
          id: Date.now().toString() + Math.random().toString(36).substring(2, 9),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
        saveImpostosPreset(novoPreset);
        importados++;
      }

      toast({
        title: 'Presets importados!',
        description: `${importados} presets importados com sucesso.`,
      });

      setImportData('');
    } catch {
      toast({
        title: 'Erro na importação',
        description: 'O arquivo JSON é inválido. Verifique o formato.',
        variant: 'destructive',
      });
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {return;}

    const content = await file.text();
    setImportData(content);
  };

  const totalPresets = maquininhaPresets.length + impostosPresets.length;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            Exportar / Importar Presets
          </DialogTitle>
          <p className="text-sm text-muted-foreground">
            Faça backup dos seus presets ou restaure de um arquivo.
          </p>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Status atual */}
          <div className="p-4 bg-muted rounded-lg">
            <div className="text-sm text-muted-foreground">Presets salvos:</div>
            <div className="text-2xl font-bold">{totalPresets}</div>
            <div className="text-xs text-muted-foreground mt-1">
              {maquininhaPresets.length} maquininha • {impostosPresets.length} impostos
            </div>
          </div>

          {/* Exportar */}
          <div className="space-y-2">
            <Label>Exportar presets</Label>
            <Button
              onClick={handleExport}
              className="w-full"
              disabled={totalPresets === 0}
            >
              <Download className="h-4 w-4 mr-2" />
              Baixar backup JSON
            </Button>
            {totalPresets === 0 && (
              <p className="text-xs text-muted-foreground">
                Você não tem presets para exportar.
              </p>
            )}
          </div>

          {/* Importar */}
          <div className="space-y-2">
            <Label>Importar presets</Label>
            <div className="space-y-2">
              <div className="flex gap-2">
                <Input
                  type="file"
                  accept=".json"
                  onChange={handleFileUpload}
                  className="flex-1"
                />
              </div>
              <textarea
                value={importData}
                onChange={(e) => setImportData(e.target.value)}
                placeholder="Ou cole o JSON aqui..."
                className="w-full h-24 p-2 text-xs font-mono border rounded-md resize-none"
              />
              <Button
                onClick={handleImport}
                variant="outline"
                className="w-full"
                disabled={!importData}
              >
                <Upload className="h-4 w-4 mr-2" />
                Importar presets
              </Button>
            </div>
          </div>

          {/* Aviso */}
          <div className="text-xs text-muted-foreground p-3 bg-yellow-50 dark:bg-yellow-950/30 rounded border border-yellow-200 dark:border-yellow-800">
            ⚠️ A importação adiciona os presets aos existentes. Presets duplicados podem ser criados.
          </div>
        </div>

        {/* Ações */}
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
