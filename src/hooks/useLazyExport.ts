/**
 * Lazy PDF Export Hook
 * Loads jsPDF and autoTable only when needed (388KB → lazy loaded)
 */

import { useCallback, useState } from 'react';
import { useToast } from '@/components/ui/use-toast';

export function useLazyPDFExport() {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const exportToPDF = useCallback(async (
    data: unknown,
    filename: string = 'relatorio.pdf'
  ) => {
    setIsLoading(true);
    
    try {
      // Lazy load jsPDF only when export is triggered
      const [{ default: jsPDF }] = await Promise.all([
        import('jspdf'),
        import('jspdf-autotable')
      ]);

      // Create PDF
      const doc = new jsPDF();
      
      // Add content (example - customize as needed)
      doc.text('Relatório Azuria', 14, 20);
      
      // Add table if data is array
      if (Array.isArray(data) && 'autoTable' in doc) {
        (doc as unknown as { autoTable: (options: Record<string, unknown>) => void }).autoTable({
          head: [Object.keys(data[0] || {})],
          body: data.map(row => Object.values(row)),
          startY: 30,
        });
      }
      
      // Save PDF
      doc.save(filename);
      
      toast({
        title: "PDF exportado com sucesso!",
        description: `Arquivo ${filename} foi baixado.`,
      });
    } catch (_error) {
      toast({
        title: "Erro ao exportar PDF",
        description: "Erro inesperado ao gerar o PDF.",
        variant: "destructive",
      });
      throw _error;
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  return { exportToPDF, isLoading };
}

/**
 * Lazy Screenshot Hook
 * Loads html2canvas only when needed (201KB → lazy loaded)
 */

export function useLazyScreenshot() {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const captureScreenshot = useCallback(async (
    elementId: string,
    filename: string = 'screenshot.png'
  ) => {
    setIsLoading(true);
    
    try {
      // Lazy load html2canvas only when capture is triggered
      const html2canvas = (await import('html2canvas')).default;
      
      const element = document.getElementById(elementId);
      if (!element) {
        throw new Error('Element not found');
      }
      
      const canvas = await html2canvas(element, {
        scale: 2,
        logging: false,
        useCORS: true,
      });
      
      // Convert to blob and download
      canvas.toBlob((blob) => {
        if (blob) {
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = filename;
          link.click();
          URL.revokeObjectURL(url);
          
          toast({
            title: "Screenshot capturado!",
            description: `Arquivo ${filename} foi baixado.`,
          });
        }
      });
    } catch (_error) {
      toast({
        title: "Erro ao capturar screenshot",
        description: "Erro inesperado ao capturar a imagem.",
        variant: "destructive",
      });
      throw _error;
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  return { captureScreenshot, isLoading };
}
