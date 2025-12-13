/**
 * =====================================================
 * INVOICE OCR MODAL
 * =====================================================
 * Modal para upload e extração automática de dados de Notas Fiscais
 * =====================================================
 */

import { useState } from 'react';
import { AlertCircle, Camera, CheckCircle2, FileUp, Loader2, X } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import invoiceOCREngine, { type InvoiceData } from '@/azuria_ai/engines/invoiceOCREngine';

interface InvoiceOCRModalProps {
  readonly trigger?: React.ReactNode;
  readonly onExtractedData?: (data: InvoiceData) => void;
}

export function InvoiceOCRModal({ trigger, onExtractedData }: Readonly<InvoiceOCRModalProps>) {
  const [open, setOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<InvoiceData | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) {return;}

    // Validar tipo
    const validTypes = ['image/png', 'image/jpeg', 'image/jpg', 'application/pdf'];
    if (!validTypes.includes(selectedFile.type)) {
      setError('Tipo de arquivo inválido. Use PNG, JPG ou PDF.');
      return;
    }

    // Validar tamanho (10MB)
    if (selectedFile.size > 10 * 1024 * 1024) {
      setError('Arquivo muito grande. Máximo: 10MB.');
      return;
    }

    setFile(selectedFile);
    setError(null);
    setResult(null);

    // Gerar preview (apenas para imagens)
    if (selectedFile.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(selectedFile);
    } else {
      setPreview(null);
    }
  };

  const handleUpload = async () => {
    if (!file) {return;}

    try {
      setProcessing(true);
      setProgress(0);
      setError(null);

      // Simular progresso
      const progressInterval = setInterval(() => {
        setProgress((prev) => Math.min(prev + 10, 90));
      }, 300);

      // Processar nota fiscal
      const ocrResult = await invoiceOCREngine.processInvoice(file);

      clearInterval(progressInterval);
      setProgress(100);

      if (!ocrResult.success || !ocrResult.data) {
        setError(ocrResult.error || 'Erro ao processar nota fiscal');
        return;
      }

      setResult(ocrResult.data);

      // Callback com dados extraídos
      if (onExtractedData) {
        onExtractedData(ocrResult.data);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    } finally {
      setProcessing(false);
    }
  };

  const resetState = () => {
    setFile(null);
    setPreview(null);
    setProgress(0);
    setResult(null);
    setError(null);
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 90) {return 'text-green-600';}
    if (confidence >= 70) {return 'text-yellow-600';}
    return 'text-red-600';
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline">
            <Camera className="mr-2 h-4 w-4" />
            Importar Nota Fiscal
          </Button>
        )}
      </DialogTrigger>

      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileUp className="h-5 w-5" />
            Extrair Dados da Nota Fiscal
          </DialogTitle>
          <DialogDescription>
            Faça upload de uma foto ou PDF da nota fiscal para extração automática dos dados
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          {/* Upload Area */}
          {!file && (
            <div className="border-2 border-dashed rounded-lg p-8 text-center">
              <FileUp className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-sm text-muted-foreground mb-2">
                Arraste uma foto ou clique para selecionar
              </p>
              <p className="text-xs text-muted-foreground mb-4">
                PNG, JPG ou PDF • Máximo 10MB
              </p>
              <label htmlFor="file-upload">
                <Button variant="outline" asChild>
                  <span>Selecionar Arquivo</span>
                </Button>
                <input
                  id="file-upload"
                  type="file"
                  accept="image/png,image/jpeg,image/jpg,application/pdf"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>
            </div>
          )}

          {/* Preview */}
          {file && !result && (
            <div className="space-y-4">
              <Card className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="text-sm font-medium">{file.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={resetState}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>

                {preview && (
                  <img
                    src={preview}
                    alt="Preview"
                    className="w-full max-h-64 object-contain rounded-lg border"
                  />
                )}
              </Card>

              {processing && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>Processando nota fiscal...</span>
                    <span className="font-medium">{progress}%</span>
                  </div>
                  <Progress value={progress} />
                </div>
              )}

              {!processing && (
                <Button className="w-full" onClick={handleUpload}>
                  <Loader2 className="mr-2 h-4 w-4" />
                  Extrair Dados
                </Button>
              )}
            </div>
          )}

          {/* Error */}
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Result */}
          {result && (
            <div className="space-y-4">
              <Alert>
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <AlertDescription>
                  Nota fiscal extraída com sucesso!
                </AlertDescription>
              </Alert>

              {/* Confiança */}
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Confiança da Extração:</span>
                <Badge variant="outline" className={getConfidenceColor(result.confidence)}>
                  {result.confidence}%
                </Badge>
              </div>

              {/* Dados Extraídos */}
              <Card className="p-4 space-y-3">
                <div>
                  <p className="text-xs text-muted-foreground">Fornecedor</p>
                  <p className="text-sm font-medium">{result.supplierName}</p>
                  <p className="text-xs text-muted-foreground">{result.supplierCnpj}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-muted-foreground">Número NF</p>
                    <p className="text-sm font-medium">{result.invoiceNumber}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Data</p>
                    <p className="text-sm font-medium">
                      {new Date(result.invoiceDate).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                </div>

                <div>
                  <p className="text-xs text-muted-foreground mb-2">Itens ({result.items.length})</p>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {result.items.map((item, idx) => (
                      <div key={`${item.description}-${item.unitPrice}-${idx}`} className="text-xs border-l-2 border-primary pl-2">
                        <p className="font-medium">{item.description}</p>
                        <p className="text-muted-foreground">
                          {item.quantity}x R$ {item.unitPrice.toFixed(2)} = R$ {item.totalPrice.toFixed(2)}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-3 border-t">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-bold">Total:</span>
                    <span className="text-lg font-bold text-primary">
                      R$ {result.totalAmount.toFixed(2)}
                    </span>
                  </div>
                </div>
              </Card>

              {/* Actions */}
              <div className="flex gap-2">
                <Button className="flex-1" onClick={() => {
                  setOpen(false);
                  resetState();
                }}>
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                  Usar Dados
                </Button>
                <Button variant="outline" onClick={resetState}>
                  Nova Nota
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
