
import React, { useState } from "react";
import { Download, ExternalLink, QrCode, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip } from "@/components/ui/TutorialTooltip";
import QRCodeModal from "@/components/integrations/QRCodeModal";

interface ProResultActionsProps {
  onExportPdf: () => void;
  onShare: () => void;
  onGoToIntegrations?: () => void;
  shareText?: string;
}

export function ProResultActions({
  onExportPdf,
  onShare,
  onGoToIntegrations,
  shareText = ""
}: ProResultActionsProps) {
  const [qrCodeOpen, setQrCodeOpen] = useState(false);
  
  return (
    <>
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
        
        {shareText && (
          <Tooltip 
            title="Gerar QR Code"
            content="Gere um QR code para compartilhar este cálculo"
          >
            <Button 
              variant="outline" 
              size="sm"
              className="flex items-center gap-2"
              onClick={() => setQrCodeOpen(true)}
            >
              <QrCode className="h-4 w-4" /> QR Code
            </Button>
          </Tooltip>
        )}
        
        {onGoToIntegrations && (
          <Tooltip 
            title="Mais Opções de Integração"
            content="Vá para as opções completas de integração e exportação"
          >
            <Button 
              variant="outline" 
              size="sm"
              className="flex items-center gap-2"
              onClick={onGoToIntegrations}
            >
              <ExternalLink className="h-4 w-4" /> Mais Opções
            </Button>
          </Tooltip>
        )}
      </div>
      
      {shareText && (
        <QRCodeModal 
          open={qrCodeOpen}
          onOpenChange={setQrCodeOpen}
          text={shareText}
          title="Compartilhar via QR Code"
        />
      )}
    </>
  );
}
