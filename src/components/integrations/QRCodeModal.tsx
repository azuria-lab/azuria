
import { useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Download, Smartphone } from "lucide-react";

interface QRCodeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  text: string;
  title?: string;
}

export default function QRCodeModal({ 
  open, 
  onOpenChange, 
  text, 
  title = "QR Code" 
}: QRCodeModalProps) {
  const [size, setSize] = useState(250);

  const handleDownload = () => {
    const canvas = document.getElementById('qr-code-canvas') as HTMLCanvasElement;
    if (!canvas) {return;}

    // Criar um canvas temporário com margem
    const tempCanvas = document.createElement('canvas');
    const padding = 20;
    tempCanvas.width = canvas.width + padding * 2;
    tempCanvas.height = canvas.height + padding * 2;
    
    const ctx = tempCanvas.getContext('2d');
    if (!ctx) {return;}
    
    // Fundo branco
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);
    
    // Desenhar o QR code no centro
    ctx.drawImage(canvas, padding, padding);
    
    // Download
    const dataUrl = tempCanvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.download = `precifica-plus-${new Date().getTime()}.png`;
    link.href = dataUrl;
    link.click();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            Escaneie este QR code com o celular para visualizar os dados do cálculo.
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex flex-col items-center justify-center p-4">
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <QRCodeSVG
              id="qr-code-canvas"
              value={text}
              size={size}
              bgColor="#ffffff"
              fgColor="#000000"
              level="L"
              includeMargin={false}
            />
          </div>
          
          <div className="mt-4 text-sm text-gray-600 text-center max-w-xs">
            <Smartphone className="inline-block mr-1 h-4 w-4" />
            <span>Aproxime a câmera do seu celular para escanear</span>
          </div>
        </div>

        <DialogFooter className="flex flex-col sm:flex-row sm:justify-between gap-2">
          <Button
            variant="outline"
            className="flex items-center gap-2"
            onClick={handleDownload}
          >
            <Download className="h-4 w-4" />
            Baixar QR Code
          </Button>
          
          <Button 
            variant="secondary"
            onClick={() => onOpenChange(false)}
          >
            Fechar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
