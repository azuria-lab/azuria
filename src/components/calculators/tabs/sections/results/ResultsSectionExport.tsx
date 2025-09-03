
import React, { useState } from "react";
import { Download, QrCode, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip } from "@/components/ui/TutorialTooltip";
import AdvancedExportOptions from "@/components/calculators/AdvancedExportOptions";
import QRCodeModal from "@/components/integrations/QRCodeModal";

interface ExportData {
  sellingPrice: number;
  cost: number;
  margin: number;
  tax: number;
  marketplaceFee: number;
  shipping?: number;
  productName: string;
}

interface ResultsSectionExportProps {
  data: ExportData;
  onExportPdf: () => void;
  onExportCsv: () => void;
  onShare: () => void;
}

export default function ResultsSectionExport({
  data,
  onExportPdf,
  onExportCsv,
  onShare
}: ResultsSectionExportProps) {
  const [qrCodeOpen, setQrCodeOpen] = useState(false);
  
  const generateShareText = () => {
    return `
*Calculadora Precifica+*
${data.productName ? `Produto: ${data.productName}\n` : ''}
Custo: R$ ${data.cost.toFixed(2).replace('.', ',')}
Preço de venda: R$ ${data.sellingPrice.toFixed(2).replace('.', ',')}
Margem: ${data.margin.toFixed(2).replace('.', ',')}%
Imposto: ${data.tax.toFixed(2).replace('.', ',')}%
${data.marketplaceFee > 0 ? `Taxa marketplace: ${data.marketplaceFee.toFixed(2).replace('.', ',')}%\n` : ''}
${data.shipping ? `Frete: R$ ${data.shipping.toFixed(2).replace('.', ',')}\n` : ''}
    `.trim();
  };
  
  return (
    <>
      <AdvancedExportOptions 
        data={data}
        onExportPdf={onExportPdf}
        onExportCsv={onExportCsv}
        onShare={onShare}
        onQrCodeShare={() => setQrCodeOpen(true)}
      />
      
      <QRCodeModal 
        open={qrCodeOpen}
        onOpenChange={setQrCodeOpen}
        text={generateShareText()}
        title="Compartilhar via QR Code"
      />
    </>
  );
}
