
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Facebook, Instagram, MessageSquare, QrCode, Share2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import QRCodeModal from "./QRCodeModal";

export default function SharingOptions() {
  const { toast } = useToast();
  const [calculationData, setCalculationData] = useState({
    productName: "",
    cost: "",
    sellingPrice: "",
    profit: "",
    marketplaceFee: "",
    tax: "",
  });
  
  const [qrCodeOpen, setQrCodeOpen] = useState(false);
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setCalculationData(prev => ({ ...prev, [name]: value }));
  };
  
  // Função para gerar o texto de compartilhamento
  const generateShareText = () => {
    return `
*Calculadora Azuria*
${calculationData.productName ? `Produto: ${calculationData.productName}\n` : ''}
${calculationData.cost ? `Custo: R$ ${calculationData.cost.replace(".", ",")}\n` : ''}
${calculationData.sellingPrice ? `Preço de venda: R$ ${calculationData.sellingPrice.replace(".", ",")}\n` : ''}
${calculationData.profit ? `Lucro: R$ ${calculationData.profit.replace(".", ",")}\n` : ''}
${calculationData.marketplaceFee ? `Taxa marketplace: ${calculationData.marketplaceFee}%\n` : ''}
${calculationData.tax ? `Imposto: ${calculationData.tax}%\n` : ''}
    `.trim();
  };
  
  // Função para compartilhar via WhatsApp
  const shareViaWhatsApp = () => {
    const text = encodeURIComponent(generateShareText());
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };
  
  // Função para compartilhar com API nativa
  const shareNative = () => {
    if (navigator.share) {
      navigator.share({
        title: 'Cálculo Azuria',
        text: generateShareText()
      }).catch(() => {
        // Fallback: copiar para área de transferência
        navigator.clipboard.writeText(generateShareText());
        toast({
          title: "Texto copiado",
          description: "O texto foi copiado para a área de transferência"
        });
      });
    } else {
      // Fallback para navegadores sem suporte à API Share
      navigator.clipboard.writeText(generateShareText());
      toast({
        title: "Texto copiado",
        description: "O texto foi copiado para a área de transferência"
      });
    }
  };
  
  // Compartilhar via Facebook
  const shareViaFacebook = () => {
    const url = encodeURIComponent(window.location.href);
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`, '_blank');
  };
  
  // Compartilhar via Instagram (redireciona para DM)
  const shareViaInstagram = () => {
    toast({
      title: "Instagram",
      description: "O compartilhamento direto para Instagram não é suportado. Copie o texto e compartilhe manualmente."
    });
    navigator.clipboard.writeText(generateShareText());
  };

  // Compartilhar via QR Code
  const shareViaQRCode = () => {
    setQrCodeOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="productName">Nome do Produto</Label>
          <Input 
            id="productName"
            name="productName"
            placeholder="Camiseta Básica"
            value={calculationData.productName}
            onChange={handleInputChange}
          />
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="cost">Custo (R$)</Label>
            <Input 
              id="cost"
              name="cost"
              placeholder="29,90"
              value={calculationData.cost}
              onChange={handleInputChange}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="sellingPrice">Preço de Venda (R$)</Label>
            <Input 
              id="sellingPrice"
              name="sellingPrice"
              placeholder="59,90"
              value={calculationData.sellingPrice}
              onChange={handleInputChange}
            />
          </div>
        </div>
        
        <div className="grid grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="profit">Lucro (R$)</Label>
            <Input 
              id="profit"
              name="profit"
              placeholder="20,00"
              value={calculationData.profit}
              onChange={handleInputChange}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="marketplaceFee">Taxa Marketplace (%)</Label>
            <Input 
              id="marketplaceFee"
              name="marketplaceFee"
              placeholder="15"
              value={calculationData.marketplaceFee}
              onChange={handleInputChange}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="tax">Imposto (%)</Label>
            <Input 
              id="tax"
              name="tax"
              placeholder="7"
              value={calculationData.tax}
              onChange={handleInputChange}
            />
          </div>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="previewText">Prévia</Label>
          <Textarea 
            id="previewText" 
            className="h-32 bg-gray-50"
            value={generateShareText()}
            readOnly
          />
        </div>
      </div>
      
      <div className="space-y-2">
        <Label>Compartilhar via:</Label>
        <div className="flex flex-wrap gap-3">
          <Button
            onClick={shareViaWhatsApp}
            variant="outline"
            className="flex items-center gap-2 bg-green-50 text-green-700 hover:bg-green-100"
          >
            <MessageSquare className="h-4 w-4" />
            WhatsApp
          </Button>
          
          <Button
            onClick={shareViaFacebook}
            variant="outline"
            className="flex items-center gap-2 bg-blue-50 text-blue-700 hover:bg-blue-100"
          >
            <Facebook className="h-4 w-4" />
            Facebook
          </Button>
          
          <Button
            onClick={shareViaInstagram}
            variant="outline"
            className="flex items-center gap-2 bg-pink-50 text-pink-700 hover:bg-pink-100"
          >
            <Instagram className="h-4 w-4" />
            Instagram
          </Button>
          
          <Button
            onClick={shareViaQRCode}
            variant="outline"
            className="flex items-center gap-2 bg-gray-50 text-gray-700 hover:bg-gray-100"
          >
            <QrCode className="h-4 w-4" />
            QR Code
          </Button>
          
          <Button
            onClick={shareNative}
            variant="default"
            className="flex items-center gap-2"
          >
            <Share2 className="h-4 w-4" />
            Compartilhar
          </Button>
        </div>
      </div>
      
      <QRCodeModal 
        open={qrCodeOpen}
        onOpenChange={setQrCodeOpen}
        text={generateShareText()}
        title="Compartilhar via QR Code"
      />
    </div>
  );
}
