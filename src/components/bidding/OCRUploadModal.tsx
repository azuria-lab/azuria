/**
 * @fileoverview OCR Upload Modal - Componente para upload e extração de editais
 * 
 * Integra o multimodalEngine para extrair dados automaticamente de PDFs/imagens
 * de editais e preencher os campos da calculadora.
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
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  AlertCircle, 
  CheckCircle2, 
  FileText, 
  FileUp, 
  Image,
  Loader2,
  Sparkles,
  XCircle
} from 'lucide-react';
import multimodalEngine, { type EditalExtraction, type OCRResult } from '@/azuria_ai/engines/multimodalEngine';

interface OCRUploadModalProps {
  readonly onExtractedData: (data: EditalExtraction) => void;
  readonly trigger?: React.ReactNode;
}

export function OCRUploadModal({ onExtractedData, trigger }: Readonly<OCRUploadModalProps>) {
  const [open, setOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<OCRResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setResult(null);
      setError(null);
    }
  };

  const handleUpload = async () => {
    if (!file) {return;}

    setProcessing(true);
    setProgress(0);
    setError(null);

    try {
      // Simular progresso
      const progressInterval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 300);

      // Processar documento
      const ocrResult = await multimodalEngine.processDocument(file);
      
      clearInterval(progressInterval);
      setProgress(100);
      setResult(ocrResult);

      // Se é um edital, extrair campos estruturados
      if (ocrResult.documentType === 'edital') {
        const editalData = await multimodalEngine.extractEdital(file);
        
        // Notificar componente pai
        onExtractedData(editalData);
        
        // Fechar modal após sucesso
        setTimeout(() => {
          setOpen(false);
          resetState();
        }, 2000);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao processar documento');
      setProgress(0);
    } finally {
      setProcessing(false);
    }
  };

  const resetState = () => {
    setFile(null);
    setResult(null);
    setError(null);
    setProgress(0);
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) {return 'text-green-600';}
    if (confidence >= 0.6) {return 'text-yellow-600';}
    return 'text-red-600';
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" className="gap-2">
            <FileUp className="h-4 w-4" />
            Importar Edital (OCR)
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-brand-600" />
            Importar Edital com IA
          </DialogTitle>
          <DialogDescription>
            Faça upload de um PDF ou imagem do edital. Nossa IA extrairá automaticamente
            todos os campos necessários para preencher a calculadora.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Upload Area */}
          {!result && (
            <div className="space-y-4">
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-brand-500 transition-colors">
                <input
                  type="file"
                  accept=".pdf,.png,.jpg,.jpeg"
                  onChange={handleFileChange}
                  className="hidden"
                  id="edital-upload"
                  disabled={processing}
                />
                <label
                  htmlFor="edital-upload"
                  className="cursor-pointer flex flex-col items-center gap-4"
                >
                  {file ? (
                    <>
                      {file.type.includes('pdf') ? (
                        <FileText className="h-16 w-16 text-brand-600" />
                      ) : (
                        <Image className="h-16 w-16 text-brand-600" />
                      )}
                      <div>
                        <p className="font-semibold">{file.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {(file.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                    </>
                  ) : (
                    <>
                      <FileUp className="h-16 w-16 text-gray-400" />
                      <div>
                        <p className="font-semibold">Clique para fazer upload</p>
                        <p className="text-sm text-muted-foreground">
                          PDF, PNG ou JPG (máx. 10MB)
                        </p>
                      </div>
                    </>
                  )}
                </label>
              </div>

              {file && !processing && (
                <Button
                  onClick={handleUpload}
                  className="w-full gap-2"
                  size="lg"
                >
                  <Sparkles className="h-4 w-4" />
                  Extrair Dados com IA
                </Button>
              )}
            </div>
          )}

          {/* Processing */}
          {processing && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              <div className="flex items-center gap-3">
                <Loader2 className="h-5 w-5 animate-spin text-brand-600" />
                <span className="font-medium">Processando documento...</span>
              </div>
              <Progress value={progress} className="h-2" />
              <p className="text-sm text-muted-foreground">
                {progress < 30 && 'Analisando estrutura do documento...'}
                {progress >= 30 && progress < 60 && 'Extraindo texto com OCR...'}
                {progress >= 60 && progress < 90 && 'Identificando campos do edital...'}
                {progress >= 90 && 'Finalizando...'}
              </p>
            </motion.div>
          )}

          {/* Success Result */}
          <AnimatePresence>
            {result && !error && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="space-y-4"
              >
                <Alert className="border-green-200 bg-green-50">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-green-800">
                    Documento processado com sucesso! Dados extraídos e preenchidos na calculadora.
                  </AlertDescription>
                </Alert>

                <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Tipo de Documento:</span>
                    <Badge>{result.documentType}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Confiança da Extração:</span>
                    <span className={`font-bold ${getConfidenceColor(result.confidence)}`}>
                      {(result.confidence * 100).toFixed(0)}%
                    </span>
                  </div>
                  {result.fields && (
                    <div className="pt-2 border-t">
                      <p className="text-sm font-medium mb-2">Campos Extraídos:</p>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        {result.fields.slice(0, 6).map((field) => (
                          <div key={field.name} className="flex items-start gap-2">
                            <CheckCircle2 className="h-3 w-3 text-green-600 mt-0.5 flex-shrink-0" />
                            <span className="text-muted-foreground truncate">
                              {field.name}: {typeof field.value === 'object' && field.value !== null 
                                ? JSON.stringify(field.value).slice(0, 30) 
                                : String(field.value).slice(0, 30)}...
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Error */}
          {error && (
            <Alert variant="destructive">
              <XCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Info */}
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="text-xs">
              <strong>Dica:</strong> Para melhores resultados, use documentos com boa qualidade
              de imagem e texto legível. O sistema identifica automaticamente campos como
              número do edital, órgão, objeto, valor estimado, itens e prazos.
            </AlertDescription>
          </Alert>
        </div>
      </DialogContent>
    </Dialog>
  );
}
