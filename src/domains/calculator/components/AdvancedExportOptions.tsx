
import React from "react";
import { Download, FileSpreadsheet, QrCode, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip } from "@/components/ui/TutorialTooltip";

interface ExportData {
  sellingPrice: number;
  cost: number;
  margin: number;
  tax: number;
  marketplaceFee: number;
  shipping?: number;
  productName: string;
}

interface AdvancedExportOptionsProps {
  data: ExportData;
  onExportPdf: () => void;
  onExportCsv: () => void;
  onShare: () => void;
  onQrCodeShare?: () => void;
}

export default function AdvancedExportOptions({ 
  data, 
  onExportPdf, 
  onExportCsv, 
  onShare,
  onQrCodeShare
}: AdvancedExportOptionsProps) {
  return (
    <div className="flex flex-wrap gap-2 mt-4">
      <Tooltip 
        title="Exportar como PDF"
        content="Exporte os detalhes do seu cálculo em formato PDF"
      >
        <Button 
          variant="outline" 
          size="sm"
          className="flex items-center gap-2"
          onClick={onExportPdf}
        >
          <Download className="h-4 w-4" /> Exportar PDF
        </Button>
      </Tooltip>
      
      <Tooltip 
        title="Exportar como CSV"
        content="Exporte os detalhes do seu cálculo em formato CSV para Excel"
      >
        <Button 
          variant="outline" 
          size="sm"
          className="flex items-center gap-2"
          onClick={onExportCsv}
        >
          <FileSpreadsheet className="h-4 w-4" /> Exportar CSV
        </Button>
      </Tooltip>
      
      <Tooltip 
        title="Compartilhar Cálculo"
        content="Compartilhe este cálculo com colegas por WhatsApp ou email"
      >
        <Button 
          variant="outline" 
          size="sm"
          className="flex items-center gap-2"
          onClick={onShare}
        >
          <Share2 className="h-4 w-4" /> Compartilhar
        </Button>
      </Tooltip>
      
      {onQrCodeShare && (
        <Tooltip 
          title="Gerar QR Code"
          content="Gere um QR code para compartilhar este cálculo"
        >
          <Button 
            variant="outline" 
            size="sm"
            className="flex items-center gap-2"
            onClick={onQrCodeShare}
          >
            <QrCode className="h-4 w-4" /> QR Code
          </Button>
        </Tooltip>
      )}
    </div>
  );
}
